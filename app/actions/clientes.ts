"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { revalidatePath } from "next/cache";
import { 
  validarIdentificadores, 
  limparCpfCnpj, 
  normalizarEmail,
  validarCpfCnpj,
  validarEmail
} from "@/lib/validators";

// Listar todos os clientes com estatísticas
export async function getClientes() {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome");
  
  if (error) return { success: false, error: error.message };
  
  const clientesComStats = await Promise.all(
    (clientes || []).map(async (cliente) => {
      const { count: totalFestas } = await supabase
        .from("festas")
        .select("*", { count: "exact", head: true })
        .eq("cliente_id", cliente.id)
        .eq("empresa_id", empresaId);
      
      const { data: festas } = await supabase
        .from("festas")
        .select("id, data, orcamentos(total)")
        .eq("cliente_id", cliente.id)
        .eq("empresa_id", empresaId)
        .order("data", { ascending: false });
      
      const valorTotal = festas?.reduce((acc, festa: any) => 
        acc + (festa.orcamentos?.[0]?.total || 0), 0
      ) || 0;
      
      const ultimaFesta = festas?.[0]?.data || null;
      
      const hoje = new Date().toISOString().split('T')[0];
      const { data: proximaFesta } = await supabase
        .from("festas")
        .select("data")
        .eq("cliente_id", cliente.id)
        .eq("empresa_id", empresaId)
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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
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
    .eq("empresa_id", empresaId)
    .single();
  
  if (error) return { success: false, error: error.message };
  
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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const validacao = validarIdentificadores({
    email: data.email,
    cpf_cnpj: data.cpf_cnpj,
  });
  
  if (!validacao.valido) {
    return { success: false, error: validacao.erro };
  }

  let emailNormalizado = null;
  if (data.email && data.email.trim()) {
    emailNormalizado = normalizarEmail(data.email);
    
    const { data: existenteEmail } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .eq('email', emailNormalizado)
      .single();

    if (existenteEmail) {
      return {
        success: false,
        error: `Email já cadastrado para: ${existenteEmail.nome}`
      };
    }
  }

  let cpfCnpjLimpo = null;
  if (data.cpf_cnpj && data.cpf_cnpj.trim()) {
    cpfCnpjLimpo = limparCpfCnpj(data.cpf_cnpj);
    
    const { data: existenteCpf } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .eq('cpf_cnpj', cpfCnpjLimpo)
      .single();

    if (existenteCpf) {
      const validacaoCpf = validarCpfCnpj(cpfCnpjLimpo);
      const tipo = validacaoCpf.tipo || 'CPF/CNPJ';
      return {
        success: false,
        error: `${tipo} já cadastrado para: ${existenteCpf.nome}`
      };
    }
  }
  
  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert([{
      empresa_id: empresaId,
      nome: data.nome,
      email: emailNormalizado,
      telefone: data.telefone,
      whatsapp: data.whatsapp || null,
      cpf_cnpj: cpfCnpjLimpo,
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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
  let emailNormalizado = null;
  if (data.email && data.email.trim()) {
    const validacaoEmail = validarEmail(data.email);
    if (!validacaoEmail.valido) {
      return { success: false, error: validacaoEmail.erro };
    }
    
    emailNormalizado = normalizarEmail(data.email);
    
    const { data: existenteEmail } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .eq('email', emailNormalizado)
      .neq('id', id)
      .single();

    if (existenteEmail) {
      return {
        success: false,
        error: `Email já cadastrado para: ${existenteEmail.nome}`
      };
    }
  }

  let cpfCnpjLimpo = null;
  if (data.cpf_cnpj && data.cpf_cnpj.trim()) {
    const validacaoCpf = validarCpfCnpj(data.cpf_cnpj);
    if (!validacaoCpf.valido) {
      return { success: false, error: validacaoCpf.erro || 'CPF/CNPJ inválido' };
    }
    
    cpfCnpjLimpo = limparCpfCnpj(data.cpf_cnpj);
    
    const { data: existenteCpf } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .eq('cpf_cnpj', cpfCnpjLimpo)
      .neq('id', id)
      .single();

    if (existenteCpf) {
      const tipo = validarCpfCnpj(cpfCnpjLimpo).tipo || 'CPF/CNPJ';
      return {
        success: false,
        error: `${tipo} já cadastrado para: ${existenteCpf.nome}`
      };
    }
  }
  
  const { error } = await supabase
    .from("clientes")
    .update({
      nome: data.nome,
      email: emailNormalizado,
      telefone: data.telefone,
      whatsapp: data.whatsapp || null,
      cpf_cnpj: cpfCnpjLimpo,
      endereco: data.endereco || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep || null,
      data_nascimento: data.data_nascimento || null,
      observacoes: data.observacoes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("empresa_id", empresaId);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

// Desativar/Ativar cliente
export async function toggleClienteStatus(id: string, ativo: boolean) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
  const { error } = await supabase
    .from("clientes")
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", empresaId);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

// Excluir cliente
export async function deleteCliente(id: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
  const { count } = await supabase
    .from("festas")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", id)
    .eq("empresa_id", empresaId);
  
  if (count && count > 0) {
    return { 
      success: false, 
      error: "Este cliente possui festas vinculadas. Desative-o ao invés de excluir." 
    };
  }
  
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresaId);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

// Buscar clientes (para autocomplete)
export async function searchClientes(query: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };
  
  if (!query || query.trim() === "") {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone, email, cpf_cnpj")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
  
  const cpfCnpjLimpo = limparCpfCnpj(query);
  
  let orConditions = [`nome.ilike.%${query}%`, `telefone.ilike.%${query}%`];
  
  if (cpfCnpjLimpo.length >= 3) {
    orConditions.push(`cpf_cnpj.ilike.%${cpfCnpjLimpo}%`);
  }
  
  if (query.includes('@')) {
    orConditions.push(`email.ilike.%${query}%`);
  }
  
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, cpf_cnpj")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .or(orConditions.join(','))
    .order("nome")
    .limit(10);
  
  if (error) return { success: false, error: error.message };
  
  return { success: true, data };
}

// Buscar ou criar cliente (usado no wizard de festa)
export async function buscarOuCriarCliente(data: { 
  nome: string; 
  telefone: string; 
  email?: string;
  cpf_cnpj?: string;
  observacoes?: string;
}) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  if (data.cpf_cnpj && data.cpf_cnpj.trim()) {
    const cpfCnpjLimpo = limparCpfCnpj(data.cpf_cnpj);

    if (cpfCnpjLimpo) {
      const { data: clientePorCpf } = await supabase
        .from('clientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('cpf_cnpj', cpfCnpjLimpo)
        .single();

      if (clientePorCpf) {
        return { success: true, data: clientePorCpf, criado: false };
      }
    }
  }

  if (data.email && data.email.trim()) {
    const emailNormalizado = normalizarEmail(data.email);

    const { data: clientePorEmail } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('email', emailNormalizado)
      .single();

    if (clientePorEmail) {
      return { success: true, data: clientePorEmail, criado: false };
    }
  }

  const { data: clientePorTelefone } = await supabase
    .from('clientes')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('telefone', data.telefone)
    .single();

  if (clientePorTelefone) {
    const updates: any = {};
    
    if (!clientePorTelefone.email && data.email) {
      updates.email = normalizarEmail(data.email);
    }
    
    if (!clientePorTelefone.cpf_cnpj && data.cpf_cnpj) {
      updates.cpf_cnpj = limparCpfCnpj(data.cpf_cnpj);
    }
    
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      await supabase
        .from('clientes')
        .update(updates)
        .eq('id', clientePorTelefone.id)
        .eq('empresa_id', empresaId);
      
      const { data: clienteAtualizado } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clientePorTelefone.id)
        .single();
      
      return { success: true, data: clienteAtualizado || clientePorTelefone, criado: false };
    }
    
    return { success: true, data: clientePorTelefone, criado: false };
  }
  
  const dadosCliente: any = {
    empresa_id: empresaId,
    nome: data.nome,
    telefone: data.telefone,
    observacoes: data.observacoes || null,
  };
  
  if (data.email && data.email.trim()) {
    dadosCliente.email = normalizarEmail(data.email);
  }
  
  if (data.cpf_cnpj && data.cpf_cnpj.trim()) {
    dadosCliente.cpf_cnpj = limparCpfCnpj(data.cpf_cnpj);
  }
  
  const { data: novoCliente, error } = await supabase
    .from("clientes")
    .insert([dadosCliente])
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/clientes");
  return { success: true, data: novoCliente, criado: true };
}
