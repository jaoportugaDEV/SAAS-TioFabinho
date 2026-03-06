"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_EMPRESA_ID } from "@/lib/server-empresa";

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erro ao fazer logout:", error);
    return { error: error.message };
  }

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_EMPRESA_ID);

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/** Apenas o e-mail definido em ADMIN_EMAIL pode editar logo e cor primária na página Dados da Empresa. */
export async function getCanEditBranding(): Promise<{ canEditBranding: boolean }> {
  const user = await getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = user?.email?.toLowerCase();
  const canEditBranding = !!(adminEmail && userEmail && userEmail === adminEmail);
  return { canEditBranding };
}

/** Chamado após login: busca empresas do usuário e define cookie ou redireciona para seleção. */
export async function afterLoginSetEmpresa(): Promise<{ redirectTo: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { redirectTo: "/login" };

  const { data: userEmpresas } = await supabase
    .from("user_empresas")
    .select("empresa_id")
    .eq("user_id", user.id);

  if (!userEmpresas?.length) return { redirectTo: "/selecionar-empresa" };
  if (userEmpresas.length === 1) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_EMPRESA_ID, userEmpresas[0].empresa_id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return { redirectTo: "/dashboard" };
  }
  return { redirectTo: "/selecionar-empresa" };
}

/** Define a empresa ativa e redireciona para o dashboard. Usado na página de seleção de empresa. */
export async function setCurrentEmpresaAndRedirect(empresaId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_EMPRESA_ID, empresaId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

