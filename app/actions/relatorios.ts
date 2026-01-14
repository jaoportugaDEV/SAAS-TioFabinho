"use server";

import { createClient } from "@/lib/supabase/server";
import { RankingCliente, RankingFreelancer, DistribuicaoMensal, MesMaiorDemanda } from "@/types";

// Buscar total de festas no período
export async function getTotalFestasPeriodo(dataInicio: string, dataFim: string) {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("festas")
    .select("*", { count: "exact", head: true })
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao buscar total de festas:", error);
    return { success: false, total: 0 };
  }

  return { success: true, total: count || 0 };
}

// Buscar ranking de clientes por período
export async function getRankingClientes(dataInicio: string, dataFim: string): Promise<{ success: boolean; data: RankingCliente[] }> {
  const supabase = await createClient();

  // Buscar festas do período com cliente
  const { data: festas, error } = await supabase
    .from("festas")
    .select("cliente_id, cliente_nome")
    .gte("data", dataInicio)
    .lte("data", dataFim)
    .not("cliente_id", "is", null);

  if (error) {
    console.error("Erro ao buscar ranking de clientes:", error);
    return { success: false, data: [] };
  }

  // Contar festas por cliente
  const clientesMap = new Map<string, { id: string; nome: string; total: number }>();
  
  festas?.forEach((festa) => {
    const clienteId = festa.cliente_id!;
    const clienteNome = festa.cliente_nome || "Cliente sem nome";
    
    if (clientesMap.has(clienteId)) {
      clientesMap.get(clienteId)!.total++;
    } else {
      clientesMap.set(clienteId, { id: clienteId, nome: clienteNome, total: 1 });
    }
  });

  // Converter para array e ordenar
  const ranking = Array.from(clientesMap.values())
    .sort((a, b) => b.total - a.total)
    .map((cliente, index) => ({
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      total_festas: cliente.total,
      posicao: index + 1,
    }));

  return { success: true, data: ranking };
}

// Buscar ranking de freelancers por período (apenas os que foram pagos)
export async function getRankingFreelancers(dataInicio: string, dataFim: string): Promise<{ success: boolean; data: RankingFreelancer[] }> {
  const supabase = await createClient();

  // Buscar festas do período
  const { data: festas, error: festasError } = await supabase
    .from("festas")
    .select("id")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (festasError) {
    console.error("Erro ao buscar festas:", festasError);
    return { success: false, data: [] };
  }

  if (!festas || festas.length === 0) {
    return { success: true, data: [] };
  }

  const festasIds = festas.map((f) => f.id);

  // Buscar pagamentos de freelancers nessas festas (apenas os que têm pagamento registrado)
  const { data: pagamentos, error: pagamentosError } = await supabase
    .from("pagamentos_freelancers")
    .select(`
      freelancer_id,
      festa_id,
      freelancer:freelancers(nome, funcao)
    `)
    .in("festa_id", festasIds);

  if (pagamentosError) {
    console.error("Erro ao buscar pagamentos dos freelancers:", pagamentosError);
    return { success: false, data: [] };
  }

  // Contar festas por freelancer (apenas festas com pagamento registrado)
  const freelancersMap = new Map<string, { id: string; nome: string; funcao: string; festas: Set<string> }>();

  pagamentos?.forEach((pag: any) => {
    const freelancerId = pag.freelancer_id;
    const festaId = pag.festa_id;
    const freelancerNome = pag.freelancer?.nome || "Freelancer";
    const freelancerFuncao = pag.freelancer?.funcao || "outros";

    if (freelancersMap.has(freelancerId)) {
      freelancersMap.get(freelancerId)!.festas.add(festaId);
    } else {
      freelancersMap.set(freelancerId, {
        id: freelancerId,
        nome: freelancerNome,
        funcao: freelancerFuncao,
        festas: new Set([festaId]),
      });
    }
  });

  // Converter para array e ordenar
  const ranking = Array.from(freelancersMap.values())
    .map((freelancer) => ({
      freelancer_id: freelancer.id,
      freelancer_nome: freelancer.nome,
      funcao: freelancer.funcao as any,
      total_festas: freelancer.festas.size,
      posicao: 0,
    }))
    .sort((a, b) => b.total_festas - a.total_festas)
    .map((freelancer, index) => ({
      ...freelancer,
      posicao: index + 1,
    }));

  return { success: true, data: ranking };
}

// Buscar distribuição de festas por mês do ano
export async function getDistribuicaoFestasAno(ano: number): Promise<{ success: boolean; data: DistribuicaoMensal[] }> {
  const supabase = await createClient();

  const { data: festas, error } = await supabase
    .from("festas")
    .select("data")
    .gte("data", `${ano}-01-01`)
    .lte("data", `${ano}-12-31`);

  if (error) {
    console.error("Erro ao buscar distribuição mensal:", error);
    return { success: false, data: [] };
  }

  const mesesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Inicializar todos os meses com 0
  const distribuicao = mesesNomes.map((nome, index) => ({
    mes: index + 1,
    mes_nome: nome,
    total_festas: 0,
  }));

  // Contar festas por mês
  festas?.forEach((festa) => {
    const mes = new Date(festa.data + "T00:00:00").getMonth(); // 0-11
    distribuicao[mes].total_festas++;
  });

  return { success: true, data: distribuicao };
}

// Buscar mês com maior demanda no ano
export async function getMesMaiorDemanda(ano: number): Promise<{ success: boolean; data: MesMaiorDemanda | null }> {
  const resultDistribuicao = await getDistribuicaoFestasAno(ano);

  if (!resultDistribuicao.success) {
    return { success: false, data: null };
  }

  const distribuicao = resultDistribuicao.data;
  
  // Encontrar mês com mais festas
  const mesMaior = distribuicao.reduce((max, mes) => 
    mes.total_festas > max.total_festas ? mes : max
  , distribuicao[0]);

  // Calcular média mensal
  const totalFestas = distribuicao.reduce((acc, mes) => acc + mes.total_festas, 0);
  const mediaMensal = totalFestas / 12;

  // Calcular percentual acima da média
  const percentualAcimaMedia = mediaMensal > 0 
    ? ((mesMaior.total_festas - mediaMensal) / mediaMensal) * 100
    : 0;

  return {
    success: true,
    data: {
      mes: mesMaior.mes,
      mes_nome: mesMaior.mes_nome,
      total_festas: mesMaior.total_festas,
      percentual_acima_media: Math.round(percentualAcimaMedia),
    },
  };
}

// Buscar total de clientes únicos no período
export async function getTotalClientesPeriodo(dataInicio: string, dataFim: string) {
  const supabase = await createClient();

  const { data: festas, error } = await supabase
    .from("festas")
    .select("cliente_id")
    .gte("data", dataInicio)
    .lte("data", dataFim)
    .not("cliente_id", "is", null);

  if (error) {
    console.error("Erro ao buscar clientes do período:", error);
    return { success: false, total: 0 };
  }

  // Contar clientes únicos
  const clientesUnicos = new Set(festas?.map((f) => f.cliente_id));

  return { success: true, total: clientesUnicos.size };
}

// Buscar total de freelancers únicos no período (apenas os que têm pagamento)
export async function getTotalFreelancersPeriodo(dataInicio: string, dataFim: string) {
  const supabase = await createClient();

  // Buscar festas do período
  const { data: festas, error: festasError } = await supabase
    .from("festas")
    .select("id")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (festasError || !festas || festas.length === 0) {
    return { success: false, total: 0 };
  }

  const festasIds = festas.map((f) => f.id);

  // Buscar pagamentos de freelancers dessas festas
  const { data: pagamentos, error: pagamentosError } = await supabase
    .from("pagamentos_freelancers")
    .select("freelancer_id")
    .in("festa_id", festasIds);

  if (pagamentosError) {
    console.error("Erro ao buscar freelancers do período:", pagamentosError);
    return { success: false, total: 0 };
  }

  // Contar freelancers únicos que têm pagamento
  const freelancersUnicos = new Set(pagamentos?.map((pag) => pag.freelancer_id));

  return { success: true, total: freelancersUnicos.size };
}
