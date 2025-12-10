"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAndUpdatePagamentosCompletos } from "./auto-update-status";

// Atualizar valor acordado de um freelancer em uma festa específica
export async function updateValorFreelancerFesta(
  festaId: string,
  freelancerId: string,
  novoValor: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("festa_freelancers")
    .update({ valor_acordado: novoValor })
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao atualizar valor:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  return { success: true };
}

// Marcar pagamento de um freelancer como realizado
export async function marcarPagamentoComoRealizado(
  festaId: string,
  freelancerId: string,
  pago: boolean
) {
  const supabase = await createClient();

  // Buscar o valor acordado do freelancer
  const { data: festaFreelancer, error: fetchError } = await supabase
    .from("festa_freelancers")
    .select("valor_acordado")
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId)
    .single();

  if (fetchError || !festaFreelancer) {
    console.error("Erro ao buscar valor acordado:", fetchError);
    return { success: false, error: fetchError?.message || "Freelancer não encontrado" };
  }

  if (pago) {
    // Marcar como pago: criar registro na tabela pagamentos_freelancers
    const { error: pagamentoError } = await supabase
      .from("pagamentos_freelancers")
      .insert({
        festa_id: festaId,
        freelancer_id: freelancerId,
        valor: festaFreelancer.valor_acordado || 0,
        data_pagamento: new Date().toISOString().split('T')[0], // Data de hoje
        observacoes: "Pagamento registrado via sistema"
      });

    if (pagamentoError) {
      console.error("Erro ao criar registro de pagamento:", pagamentoError);
      return { success: false, error: pagamentoError.message };
    }
  } else {
    // Desmarcar como pago: remover registro da tabela pagamentos_freelancers
    const { error: deleteError } = await supabase
      .from("pagamentos_freelancers")
      .delete()
      .eq("festa_id", festaId)
      .eq("freelancer_id", freelancerId);

    if (deleteError) {
      console.error("Erro ao remover registro de pagamento:", deleteError);
      return { success: false, error: deleteError.message };
    }
  }

  // Atualizar status de pagamento do freelancer na festa
  const { error: updateError } = await supabase
    .from("festa_freelancers")
    .update({ status_pagamento: pago ? "pago" : "pendente" })
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (updateError) {
    console.error("Erro ao atualizar status de pagamento:", updateError);
    return { success: false, error: updateError.message };
  }

  // Recalcular status geral de pagamento da festa
  await atualizarStatusPagamentoFesta(festaId);

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  revalidatePath("/dashboard/financeiro");
  return { success: true };
}

// Recalcular e atualizar status geral de pagamento da festa
export async function atualizarStatusPagamentoFesta(festaId: string) {
  const supabase = await createClient();

  // Buscar todos os freelancers da festa
  const { data: freelancers, error: fetchError } = await supabase
    .from("festa_freelancers")
    .select("status_pagamento")
    .eq("festa_id", festaId);

  if (fetchError) {
    console.error("Erro ao buscar freelancers:", fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!freelancers || freelancers.length === 0) {
    // Se não há freelancers, marca como pago
    await supabase
      .from("festas")
      .update({ status_pagamento_freelancers: "pago" })
      .eq("id", festaId);
    return { success: true };
  }

  // Verificar status dos pagamentos
  const todosPagos = freelancers.every(f => f.status_pagamento === "pago");
  const algumPago = freelancers.some(f => f.status_pagamento === "pago");
  
  let statusGeral: "pendente" | "parcial" | "pago";
  
  if (todosPagos) {
    statusGeral = "pago";
  } else if (algumPago) {
    statusGeral = "parcial";
  } else {
    statusGeral = "pendente";
  }

  // Atualizar status geral da festa
  const { error: updateError } = await supabase
    .from("festas")
    .update({ status_pagamento_freelancers: statusGeral })
    .eq("id", festaId);

  if (updateError) {
    console.error("Erro ao atualizar status geral:", updateError);
    return { success: false, error: updateError.message };
  }

  // Verificar se a festa pode mudar de "encerrada_pendente" para "encerrada"
  await checkAndUpdatePagamentosCompletos();

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/festas");
  revalidatePath("/dashboard/pagamentos");
  return { success: true };
}

// Buscar festas com pagamentos pendentes
export async function getFestasPagamentosPendentes() {
  const supabase = await createClient();

  // Buscar festas que já passaram e têm status de pagamento pendente ou parcial
  const agora = new Date();
  const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD

  const { data: festas, error } = await supabase
    .from("festas")
    .select(`
      *,
      festa_freelancers (
        id,
        valor_acordado,
        status_pagamento,
        freelancer:freelancers (
          id,
          nome,
          foto_url,
          funcao,
          pix,
          whatsapp
        )
      )
    `)
    .lte("data", dataHoje)
    .in("status_pagamento_freelancers", ["pendente", "parcial"])
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao buscar festas:", error);
    return { success: false, error: error.message, data: [] };
  }

  // Filtrar festas que realmente já passaram (considerando horário se disponível)
  const festasFiltradas = festas?.filter(festa => {
    if (!festa.horario) {
      // Se não tem horário, considera apenas a data
      return festa.data <= dataHoje;
    }
    
    // Se tem horário, verifica se data + horário já passou
    const [horas, minutos] = festa.horario.split(':').map(Number);
    const dataFestaCompleta = new Date(festa.data + 'T00:00:00');
    dataFestaCompleta.setHours(horas, minutos, 0, 0);
    
    return dataFestaCompleta <= agora;
  }) || [];

  return { success: true, data: festasFiltradas };
}

// Buscar contador de festas com pagamentos pendentes
export async function getCountPagamentosPendentes() {
  const result = await getFestasPagamentosPendentes();
  
  if (!result.success) {
    return { success: false, count: 0 };
  }

  return { success: true, count: result.data.length };
}

