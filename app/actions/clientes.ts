"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Listar todos os clientes com estatísticas
export async function getClientes() {
  const supabase = await createClient();
  
  // Buscar clientes
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome");
  
  if (error) return { success: false, error: error.message };
  
  // Para cada cliente, buscar estatísticas
  const clientesComStats = await Promise.all(
    (clientes || []).map(async (cliente) => {
      // Contar festas
      const { count: totalFestas } = await supabase
        .from("festas")
        .select("*", { count: "exact", head: true })
        .eq("cliente_id", cliente.id);
      
      // Buscar orçamentos e datas
      const { data: festas } = await supabase
        .from("festas")
        .select("id, data, orcamentos(total)")
        .eq("cliente_id", cliente.id)
        .order("data", { ascending: false });
      
      const valorTotal = festas?.reduce((acc, festa: any) => 
        acc + (festa.orcamentos?.[0]?.total || 0), 0
      ) || 0;
      
      const ultimaFesta = festas?.[0]?.data || null;
      
      // Buscar próxima festa (futura)
      const hoje = new Date().toISOString().split('T')[0];
      const { data: proximaFesta } = await supabase
        .from("festas")
        .select("data")
        .eq("cliente_id", cliente.id)
        .gte("data", hoje)
        .order("data", { ascending: true })
        .limit(1)
        .single();
      
      return {
        ...cliente,
        total_festas: totalFestas || 0,
        valor_total_gasto: valorTotal,
        ultima_festa_data: ultimaFesta,
        proxima_festa_data: proximaFesta?.data || null,
      };
    })
  );
  
  return { success: true, data: clientesComStats };
}

// Buscar cliente por ID com histórico completo
export async function getClienteById(id: string) {
  const supabase = await createClient();
  
  const { data: cliente, error } = await supabase
    .from("clientes")
    .select(`
      *,
      festas (
        id,
        titulo,
        data,
        horario,
        local,
        tema,
        status,
        status_pagamento_cliente,
        orcamentos (total, status_pagamento)
      )
    `)
    .eq("id", id)
    .single();
  
  if (error) return { success: false, error: error.message };
  
  // Ordenar festas por data (mais recente primeiro)
  if (cliente && cliente.festas) {
    cliente.festas.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }
  
  return { success: true, data: cliente };
}

// Criar novo cliente
export async function createCliente(data: any) {
  const supabase = await createClient();
  
  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert([{
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone,
      whatsapp: data.whatsapp || null,
      cpf_cnpj: data.cpf_cnpj || null,
      endereco: data.endereco || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep || null,
      data_nascimento: data.data_nascimento || null,
      observacoes: data.observacoes || null,
    }])
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  return { success: true, data: cliente };
}

// Atualizar cliente
export async function updateCliente(id: string, data: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("clientes")
    .update({
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone,
      whatsapp: data.whatsapp || null,
      cpf_cnpj: data.cpf_cnpj || null,
      endereco: data.endereco || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep || null,
      data_nascimento: data.data_nascimento || null,
      observacoes: data.observacoes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

// Desativar/Ativar cliente
export async function toggleClienteStatus(id: string, ativo: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("clientes")
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

// Excluir cliente
export async function deleteCliente(id: string) {
  const supabase = await createClient();
  
  // Verificar se tem festas vinculadas
  const { count } = await supabase
    .from("festas")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", id);
  
  if (count && count > 0) {
    return { 
      success: false, 
      error: "Este cliente possui festas vinculadas. Desative-o ao invés de excluir." 
    };
  }
  
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

// Buscar clientes (para autocomplete)
export async function searchClientes(query: string) {
  const supabase = await createClient();
  
  if (!query || query.trim() === "") {
    // Se não há query, retornar os 10 clientes mais recentes
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone")
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
  
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone")
    .eq("ativo", true)
    .or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`)
    .order("nome")
    .limit(10);
  
  if (error) return { success: false, error: error.message };
  
  return { success: true, data };
}

// Buscar ou criar cliente (usado no wizard de festa)
export async function buscarOuCriarCliente(data: { nome: string; telefone: string; observacoes?: string }) {
  const supabase = await createClient();
  
  // Primeiro tenta buscar cliente pelo telefone
  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("*")
    .eq("telefone", data.telefone)
    .single();
  
  if (clienteExistente) {
    return { success: true, data: clienteExistente, criado: false };
  }
  
  // Se não existe, cria novo cliente
  const { data: novoCliente, error } = await supabase
    .from("clientes")
    .insert([{
      nome: data.nome,
      telefone: data.telefone,
      observacoes: data.observacoes || null,
    }])
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  return { success: true, data: novoCliente, criado: true };
}
