"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { revalidatePath } from "next/cache";

export async function excluirOrcamento(orcamentoId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: orcamento, error: selectError } = await supabase
    .from("orcamentos")
    .select("festa_id")
    .eq("id", orcamentoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !orcamento) {
    return { success: false, error: selectError?.message ?? "Orçamento não encontrado" };
  }

  const festaId = orcamento.festa_id;

  const { error: deleteError } = await supabase
    .from("orcamentos")
    .delete()
    .eq("id", orcamentoId)
    .eq("empresa_id", empresaId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  await supabase
    .from("contratos")
    .update({ status: "cancelado" })
    .eq("festa_id", festaId)
    .eq("empresa_id", empresaId);

  revalidatePath("/dashboard/orcamentos");
  revalidatePath("/dashboard/contratos");
  return { success: true };
}
