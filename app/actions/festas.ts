"use server";

import { createClient } from "@/lib/supabase/server";
import { StatusFesta } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Atualizar status da festa
export async function updateFestaStatus(festaId: string, status: StatusFesta) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festas")
    .update({ status })
    .eq("id", festaId);

  if (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/festas");
  return { success: true };
}

// Adicionar item à checklist
export async function addChecklistItem(festaId: string, tarefa: string) {
  const supabase = await createClient();

  // Buscar a ordem do último item
  const { data: lastItem } = await supabase
    .from("checklist")
    .select("ordem")
    .eq("festa_id", festaId)
    .order("ordem", { ascending: false })
    .limit(1)
    .single();

  const novaOrdem = lastItem ? lastItem.ordem + 1 : 0;

  const { error } = await supabase
    .from("checklist")
    .insert({
      festa_id: festaId,
      tarefa,
      concluido: false,
      ordem: novaOrdem,
    });

  if (error) {
    console.error("Erro ao adicionar item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true };
}

// Atualizar status de conclusão de um item da checklist
export async function updateChecklistItem(itemId: string, concluido: boolean, festaId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist")
    .update({ concluido })
    .eq("id", itemId);

  if (error) {
    console.error("Erro ao atualizar item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true };
}

// Excluir item da checklist
export async function deleteChecklistItem(itemId: string, festaId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Erro ao excluir item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true };
}

// Adicionar freelancer à festa
export async function addFreelancerToFesta(festaId: string, freelancerId: string) {
  const supabase = await createClient();

  // Buscar a função e bonificação fixa do freelancer
  const { data: freelancer, error: freelancerError } = await supabase
    .from("freelancers")
    .select("funcao, bonus_fixo")
    .eq("id", freelancerId)
    .single();

  if (freelancerError) {
    console.error("Erro ao buscar freelancer:", freelancerError);
    return { success: false, error: freelancerError.message };
  }

  // Buscar o valor configurado para essa função
  const { data: valorFuncao, error: valorError } = await supabase
    .from("valores_funcoes")
    .select("valor")
    .eq("funcao", freelancer.funcao)
    .single();

  if (valorError) {
    console.error("Erro ao buscar valor da função:", valorError);
    // Se não encontrar, usa 0 como fallback
  }

  // Aplicar bonificação fixa se existir
  const bonusFixo = freelancer.bonus_fixo || 0;

  // Inserir com o valor da função e bônus fixo
  const { data, error } = await supabase
    .from("festa_freelancers")
    .insert({
      festa_id: festaId,
      freelancer_id: freelancerId,
      valor_acordado: valorFuncao?.valor || 0,
      valor_bonus: bonusFixo,
      motivo_bonus: bonusFixo > 0 ? "Bonificação fixa do freelancer" : null,
      status_pagamento: 'pendente',
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar freelancer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true, data };
}

// Remover freelancer da festa
export async function removeFreelancerFromFesta(festaId: string, freelancerId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festa_freelancers")
    .delete()
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao remover freelancer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true };
}

// Atualizar status de confirmação do freelancer na festa
export async function updateFreelancerConfirmacao(
  festaId: string,
  freelancerId: string,
  status: "pendente" | "confirmado"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festa_freelancers")
    .update({ status_confirmacao: status })
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  return { success: true };
}

// Excluir festa permanentemente
export async function deleteFesta(festaId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festas")
    .delete()
    .eq("id", festaId);

  if (error) {
    console.error("Erro ao excluir festa:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/festas");
  return { success: true };
}

