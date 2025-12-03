"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DespesaGeral } from "@/types";

// Criar nova despesa geral
export async function criarDespesaGeral(
  descricao: string,
  valor: number,
  data: string,
  categoria?: string,
  observacoes?: string
) {
  const supabase = await createClient();

  const { data: despesa, error } = await supabase
    .from("despesas_gerais")
    .insert({
      descricao,
      valor,
      data,
      categoria,
      observacoes,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar despesa geral:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/financeiro");
  return { success: true, data: despesa };
}

// Listar despesas gerais (com filtro opcional de mês)
export async function listarDespesasGerais(mes?: string, ano?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("despesas_gerais")
    .select("*")
    .order("data", { ascending: false });

  // Se mês e ano foram fornecidos, filtrar
  if (mes && ano) {
    const startDate = `${ano}-${mes.padStart(2, "0")}-01`;
    const lastDay = new Date(parseInt(ano), parseInt(mes), 0).getDate();
    const endDate = `${ano}-${mes.padStart(2, "0")}-${lastDay}`;
    
    query = query.gte("data", startDate).lte("data", endDate);
  }

  const { data: despesas, error } = await query;

  if (error) {
    console.error("Erro ao listar despesas gerais:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: despesas as DespesaGeral[] };
}

// Atualizar despesa geral
export async function atualizarDespesaGeral(
  id: string,
  descricao: string,
  valor: number,
  data: string,
  categoria?: string,
  observacoes?: string
) {
  const supabase = await createClient();

  const { data: despesa, error } = await supabase
    .from("despesas_gerais")
    .update({
      descricao,
      valor,
      data,
      categoria,
      observacoes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar despesa geral:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/financeiro");
  return { success: true, data: despesa };
}

// Excluir despesa geral
export async function excluirDespesaGeral(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("despesas_gerais")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir despesa geral:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/financeiro");
  return { success: true };
}

// Obter total de despesas gerais de um mês
export async function getTotalDespesasGeraisMes(mes: string, ano: string) {
  const result = await listarDespesasGerais(mes, ano);
  
  if (!result.success) {
    return { success: false, total: 0 };
  }

  const total = result.data.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
  return { success: true, total };
}

