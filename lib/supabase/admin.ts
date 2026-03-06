import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com Service Role Key. Ignora RLS.
 * Usar APENAS em Server Actions do admin (ex: criar empresa + usuário).
 * Nunca expor no browser.
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para o cliente admin.')
  }
  return createClient(url, serviceRoleKey)
}
