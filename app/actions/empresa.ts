"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { getUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export async function updateEmpresa(data: {
  nome?: string;
  logo_url?: string | null;
  cor_primaria?: string;
  cnpj?: string | null;
  razao_social?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
  locais?: string[];
}) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const user = await getUser();
  const canEditBranding =
    !!process.env.ADMIN_EMAIL &&
    !!user?.email &&
    user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.logo_url !== undefined && canEditBranding) payload.logo_url = data.logo_url;
  if (data.cor_primaria !== undefined && canEditBranding) payload.cor_primaria = data.cor_primaria;
  if (data.cnpj !== undefined) payload.cnpj = data.cnpj;
  if (data.razao_social !== undefined) payload.razao_social = data.razao_social;
  if (data.endereco !== undefined) payload.endereco = data.endereco;
  if (data.cidade !== undefined) payload.cidade = data.cidade;
  if (data.estado !== undefined) payload.estado = data.estado;
  if (data.telefone !== undefined) payload.telefone = data.telefone;
  if (Array.isArray(data.locais)) payload.locais = data.locais;

  const { error } = await supabase.from("empresas").update(payload).eq("id", empresaId);

  if (error) {
    console.error("Erro ao atualizar empresa:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/configuracoes/empresa");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
