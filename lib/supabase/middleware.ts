import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes (permite /assinar sem login para link do cliente)
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/assinar')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin: apenas o e-mail definido em ADMIN_EMAIL pode acessar /admin/*
  const pathname = request.nextUrl.pathname
  if (user && pathname.startsWith('/admin')) {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    const userEmail = user.email?.toLowerCase()
    if (!adminEmail || userEmail !== adminEmail) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Multi-tenant: dashboard exige empresa selecionada (cookie current_empresa_id)
  if (
    user &&
    pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/dashboard/configuracoes/empresa') &&
    !request.cookies.get('current_empresa_id')?.value
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/selecionar-empresa'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

