"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_EMPRESA_ID } from "@/lib/server-empresa";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { auditLog, getCorrelationId } from "@/lib/audit-log";

const COOKIE_EMPRESA_OPTIONS = {
  path: "/" as const,
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[auth] logout:", error.code);
    return { error: "Falha ao sair. Tente novamente." };
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

/** Verifica rate limit para tentativa de login (chamar antes de signInWithPassword no client). */
export async function checkLoginRateLimit(): Promise<{ allowed: boolean }> {
  const h = await headers();
  const ip = getClientIp(h);
  const allowed = checkRateLimit(`login:${ip}`, 10, 60_000);
  return { allowed };
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
    cookieStore.set(COOKIE_EMPRESA_ID, userEmpresas[0].empresa_id, COOKIE_EMPRESA_OPTIONS);
    const h = await headers();
    auditLog({
      action: "login",
      userId: user.id,
      empresaId: userEmpresas[0].empresa_id,
      correlationId: getCorrelationId(h),
    });
    return { redirectTo: "/dashboard" };
  }
  return { redirectTo: "/selecionar-empresa" };
}

/** Define a empresa ativa e redireciona para o dashboard. Usado na página de seleção de empresa. Valida vínculo usuário↔empresa. */
export async function setCurrentEmpresaAndRedirect(empresaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: vinculo } = await supabase
    .from("user_empresas")
    .select("empresa_id")
    .eq("user_id", user.id)
    .eq("empresa_id", empresaId)
    .single();
  if (!vinculo) {
    redirect("/selecionar-empresa");
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_EMPRESA_ID, empresaId, COOKIE_EMPRESA_OPTIONS);
  const h = await headers();
  auditLog({
    action: "empresa_troca",
    userId: user.id,
    empresaId,
    correlationId: getCorrelationId(h),
  });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

