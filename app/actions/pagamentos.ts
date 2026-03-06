"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { revalidatePath } from "next/cache";
import { checkAndUpdatePagamentosCompletos } from "./auto-update-status";

// Atualizar valor acordado de um freelancer em uma festa específica
export async function updateValorFreelancerFesta(
  festaId: string,
  freelancerId: string,
  novoValor: number
) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // Confirmar que a festa pertence à empresa
  const { data: festa, error: festaError } = await supabase
    .from("festas")
    .select("id")
    .eq("id", festaId)
    .eq("empresa_id", empresaId)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Festa não encontrada na empresa atual" };
  }

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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // Confirmar que a festa pertence à empresa
  const { data: festa, error: festaError } = await supabase
    .from("festas")
    .select("id")
    .eq("id", festaId)
    .eq("empresa_id", empresaId)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Festa não encontrada na empresa atual" };
  }

  const { data: festaFreelancer, error: fetchError } = await supabase
    .from("festa_freelancers")
    .select("valor_acordado, valor_bonus, motivo_bonus")
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId)
    .single();

  if (fetchError || !festaFreelancer) {
    console.error("Erro ao buscar valor acordado:", fetchError);
    return { success: false, error: fetchError?.message || "Freelancer não encontrado" };
  }

  const valorBase = festaFreelancer.valor_acordado || 0;
  const valorBonus = festaFreelancer.valor_bonus || 0;
  const valorTotal = valorBase + valorBonus;

  if (pago) {
    let observacoes = "Pagamento registrado via sistema";
    if (valorBonus > 0) {
      observacoes = `Pagamento registrado via sistema (Base: R$ ${valorBase.toFixed(2)} + Bônus: R$ ${valorBonus.toFixed(2)})`;
      if (festaFreelancer.motivo_bonus) {
        observacoes += ` - Motivo do bônus: ${festaFreelancer.motivo_bonus}`;
      }
    }

    const { error: pagamentoError } = await supabase
      .from("pagamentos_freelancers")
      .insert({
        empresa_id: empresaId,
        festa_id: festaId,
        freelancer_id: freelancerId,
        valor: valorTotal,
        data_pagamento: new Date().toISOString().split('T')[0],
        observacoes
      });

    if (pagamentoError) {
      console.error("Erro ao criar registro de pagamento:", pagamentoError);
      return { success: false, error: pagamentoError.message };
    }
  } else {
    const { error: deleteError } = await supabase
      .from("pagamentos_freelancers")
      .delete()
      .eq("festa_id", festaId)
      .eq("freelancer_id", freelancerId)
      .eq("empresa_id", empresaId);

    if (deleteError) {
      console.error("Erro ao remover registro de pagamento:", deleteError);
      return { success: false, error: deleteError.message };
    }
  }

  const { error: updateError } = await supabase
    .from("festa_freelancers")
    .update({ status_pagamento: pago ? "pago" : "pendente" })
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (updateError) {
    console.error("Erro ao atualizar status de pagamento:", updateError);
    return { success: false, error: updateError.message };
  }

  await atualizarStatusPagamentoFesta(festaId);

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  revalidatePath("/dashboard/financeiro");
  return { success: true };
}

// Recalcular e atualizar status geral de pagamento da festa
export async function atualizarStatusPagamentoFesta(festaId: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: freelancers, error: fetchError } = await supabase
    .from("festa_freelancers")
    .select("status_pagamento")
    .eq("festa_id", festaId);

  if (fetchError) {
    console.error("Erro ao buscar freelancers:", fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!freelancers || freelancers.length === 0) {
    await supabase
      .from("festas")
      .update({ status_pagamento_freelancers: "pago" })
      .eq("id", festaId)
      .eq("empresa_id", empresaId);
    return { success: true };
  }

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

  const { error: updateError } = await supabase
    .from("festas")
    .update({ status_pagamento_freelancers: statusGeral })
    .eq("id", festaId)
    .eq("empresa_id", empresaId);

  if (updateError) {
    console.error("Erro ao atualizar status geral:", updateError);
    return { success: false, error: updateError.message };
  }

  await checkAndUpdatePagamentosCompletos();

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/festas");
  revalidatePath("/dashboard/pagamentos");
  return { success: true };
}

// Buscar festas com pagamentos pendentes
export async function getFestasPagamentosPendentes() {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada", data: [] };

  const agora = new Date();
  const dataHoje = agora.toISOString().split('T')[0];

  const { data: festas, error } = await supabase
    .from("festas")
    .select(`
      *,
      festa_freelancers (
        id,
        valor_acordado,
        valor_bonus,
        motivo_bonus,
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
    .eq("empresa_id", empresaId)
    .lte("data", dataHoje)
    .in("status_pagamento_freelancers", ["pendente", "parcial"])
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao buscar festas:", error);
    return { success: false, error: error.message, data: [] };
  }

  const festasFiltradas = festas?.filter(festa => {
    if (!festa.horario) {
      return festa.data <= dataHoje;
    }
    
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

// Atualizar bônus de um freelancer em uma festa específica
export async function updateBonusFreelancerFesta(
  festaId: string,
  freelancerId: string,
  valorBonus: number,
  motivoBonus?: string | null
) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  if (valorBonus < 0) {
    return { success: false, error: "O valor do bônus não pode ser negativo" };
  }

  // Confirmar que a festa pertence à empresa
  const { data: festa, error: festaError } = await supabase
    .from("festas")
    .select("id")
    .eq("id", festaId)
    .eq("empresa_id", empresaId)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Festa não encontrada na empresa atual" };
  }

  const { error } = await supabase
    .from("festa_freelancers")
    .update({ 
      valor_bonus: valorBonus,
      motivo_bonus: motivoBonus 
    })
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao atualizar bônus:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  revalidatePath("/dashboard/financeiro");
  return { success: true };
}

// Remover freelancer do pagamento (quando ele cancela a participação)
export async function removerFreelancerDaFesta(
  festaId: string,
  freelancerId: string
) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // Confirmar que a festa pertence à empresa
  const { data: festa, error: festaError } = await supabase
    .from("festas")
    .select("id")
    .eq("id", festaId)
    .eq("empresa_id", empresaId)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Festa não encontrada na empresa atual" };
  }

  const { error: pagamentoError } = await supabase
    .from("pagamentos_freelancers")
    .delete()
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId)
    .eq("empresa_id", empresaId);

  if (pagamentoError) {
    console.error("Erro ao remover pagamento:", pagamentoError);
  }

  const { error: festaFreelancerError } = await supabase
    .from("festa_freelancers")
    .delete()
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (festaFreelancerError) {
    console.error("Erro ao remover freelancer da festa:", festaFreelancerError);
    return { success: false, error: festaFreelancerError.message };
  }

  await atualizarStatusPagamentoFesta(festaId);

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/festas");
  revalidatePath("/dashboard/pagamentos");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/relatorios");
  return { success: true };
}
