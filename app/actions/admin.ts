"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/app/actions/auth";
import { VALORES_PADRAO_POR_FUNCAO } from "@/lib/constants";
import { FuncaoFreelancer } from "@/types";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_PASSWORD_LENGTH = 6;

export type CriarEmpresaResult = { success: true } | { success: false; error: string };

export async function criarEmpresaComUsuario(formData: FormData): Promise<CriarEmpresaResult> {
  const user = await getUser();
  if (!user?.email) {
    return { success: false, error: "Não autenticado." };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = user.email.toLowerCase();
  if (!adminEmail || userEmail !== adminEmail) {
    return { success: false, error: "Não autorizado." };
  }

  const nome = (formData.get("nome") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const cidade = (formData.get("cidade") as string)?.trim();
  const estado = (formData.get("estado") as string)?.trim().toUpperCase().slice(0, 2);
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmarSenha = formData.get("confirmarSenha") as string;

  if (!nome) return { success: false, error: "Nome da empresa é obrigatório." };
  if (!slug) return { success: false, error: "Slug é obrigatório." };
  if (!SLUG_REGEX.test(slug)) {
    return { success: false, error: "Slug deve conter apenas letras minúsculas, números e hífens (ex: minha-empresa)." };
  }
  if (!cidade) return { success: false, error: "Cidade é obrigatória." };
  if (!estado) return { success: false, error: "Estado é obrigatório (ex: SP)." };
  if (!email) return { success: false, error: "E-mail do usuário é obrigatório." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "E-mail inválido." };
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  if (password !== confirmarSenha) {
    return { success: false, error: "Senha e confirmação não coincidem." };
  }

  const admin = getAdminClient();

  const { data: existing } = await admin
    .from("empresas")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Já existe uma empresa com este slug. Escolha outro." };
  }

  const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError) {
    const msg = createUserError.message.toLowerCase();
    if (msg.includes("already registered")) {
      return { success: false, error: "Este e-mail já está registado. Use outro ou recupere a senha." };
    }
    return { success: false, error: createUserError.message };
  }

  if (!newUser?.user?.id) {
    return { success: false, error: "Falha ao criar usuário." };
  }

  const { data: newEmpresa, error: insertEmpresaError } = await admin
    .from("empresas")
    .insert({
      nome,
      slug,
      cidade,
      estado,
      ativo: true,
      cor_primaria: "#DC2626",
    })
    .select("id")
    .single();

  if (insertEmpresaError) {
    return { success: false, error: insertEmpresaError.message };
  }

  const empresaId = newEmpresa.id;

  const { error: insertUserEmpresaError } = await admin.from("user_empresas").insert({
    user_id: newUser.user.id,
    empresa_id: empresaId,
    role: "admin",
  });

  if (insertUserEmpresaError) {
    return { success: false, error: insertUserEmpresaError.message };
  }

  // Vincular o admin atual à nova empresa para poder selecioná-la e editar branding
  const { error: insertAdminError } = await admin.from("user_empresas").insert({
    user_id: user.id,
    empresa_id: empresaId,
    role: "admin",
  });
  if (insertAdminError) {
    // Ignorar se já existir (ex.: constraint duplicate)
  }

  const valoresRows = (Object.entries(VALORES_PADRAO_POR_FUNCAO) as [FuncaoFreelancer, number][]).map(
    ([funcao, valor]) => ({ empresa_id: empresaId, funcao, valor })
  );

  const { error: insertValoresError } = await admin.from("valores_funcoes").insert(valoresRows);

  if (insertValoresError) {
    return { success: false, error: insertValoresError.message };
  }

  return { success: true };
}

export type AdicionarAdminResult =
  | { success: true; adicionadas: number }
  | { success: false; error: string };

/** Adiciona o admin atual a todas as empresas onde ainda não está. Assim pode selecionar qualquer empresa e editar logo/cor. */
export async function adicionarAdminATodasEmpresas(): Promise<AdicionarAdminResult> {
  const user = await getUser();
  if (!user?.email) {
    return { success: false, error: "Não autenticado." };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = user.email.toLowerCase();
  if (!adminEmail || userEmail !== adminEmail) {
    return { success: false, error: "Não autorizado." };
  }

  const admin = getAdminClient();

  const { data: existing } = await admin
    .from("user_empresas")
    .select("empresa_id")
    .eq("user_id", user.id);
  const existingIds = new Set((existing ?? []).map((r) => r.empresa_id));

  const { data: empresas, error: fetchError } = await admin.from("empresas").select("id");
  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const toAdd = (empresas ?? []).filter((e) => !existingIds.has(e.id));
  if (toAdd.length === 0) {
    return { success: true, adicionadas: 0 };
  }

  const rows = toAdd.map((e) => ({
    user_id: user.id,
    empresa_id: e.id,
    role: "admin",
  }));

  const { error: insertError } = await admin.from("user_empresas").insert(rows);
  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, adicionadas: rows.length };
}
