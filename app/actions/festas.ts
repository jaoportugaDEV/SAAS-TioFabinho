"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { resolveValorAcordado } from "@/lib/freelancers/valor-acordado";
import { StatusFesta } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Atualizar status da festa
export async function updateFestaStatus(festaId: string, status: StatusFesta) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { error } = await supabase
    .from("festas")
    .update({ status })
    .eq("id", festaId)
    .eq("empresa_id", empresaId);

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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: lastItem } = await supabase
    .from("checklist")
    .select("ordem")
    .eq("festa_id", festaId)
    .eq("empresa_id", empresaId)
    .order("ordem", { ascending: false })
    .limit(1)
    .single();

  const novaOrdem = lastItem ? lastItem.ordem + 1 : 0;

  const { error } = await supabase
    .from("checklist")
    .insert({
      festa_id: festaId,
      empresa_id: empresaId,
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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { error } = await supabase
    .from("checklist")
    .update({ concluido })
    .eq("id", itemId)
    .eq("empresa_id", empresaId);

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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { error } = await supabase
    .from("checklist")
    .delete()
    .eq("id", itemId)
    .eq("empresa_id", empresaId);

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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // festa_freelancers não tem empresa_id; validar a festa da empresa antes de inserir
  const { data: festa, error: festaError } = await supabase
    .from("festas")
    .select("id")
    .eq("id", festaId)
    .eq("empresa_id", empresaId)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Festa não encontrada na empresa atual" };
  }

  const { data: freelancer, error: freelancerError } = await supabase
    .from("freelancers")
    .select("funcao, bonus_fixo, valor_padrao")
    .eq("id", freelancerId)
    .eq("empresa_id", empresaId)
    .single();

  if (freelancerError) {
    console.error("Erro ao buscar freelancer:", freelancerError);
    return { success: false, error: freelancerError.message };
  }

  const { data: valorFuncao, error: valorError } = await supabase
    .from("valores_funcoes")
    .select("valor")
    .eq("funcao", freelancer.funcao)
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (valorError) {
    console.error("Erro ao buscar valor da função:", valorError);
  }

  const bonusFixo = freelancer.bonus_fixo || 0;
  const valorAcordado = resolveValorAcordado(freelancer.valor_padrao, valorFuncao?.valor);

  const { data, error } = await supabase
    .from("festa_freelancers")
    .insert({
      festa_id: festaId,
      freelancer_id: freelancerId,
      valor_acordado: valorAcordado,
      valor_bonus: bonusFixo,
      motivo_bonus: bonusFixo > 0 ? "Bonificação fixa do freelancer" : null,
      status_pagamento: 'pendente',
    })
    .select(`
      *,
      freelancer:freelancers(*)
    `)
    .single();

  if (error) {
    console.error("Erro ao adicionar freelancer:", error);
    return { success: false, error: error.message };
  }

  const { data: freelancersStatus, error: statusError } = await supabase
    .from("festa_freelancers")
    .select("status_pagamento")
    .eq("festa_id", festaId);

  if (statusError) {
    console.error("Erro ao recalcular status de pagamento:", statusError);
    return { success: false, error: statusError.message };
  }

  const todosPagos = (freelancersStatus ?? []).every((f) => f.status_pagamento === "pago");
  const algumPago = (freelancersStatus ?? []).some((f) => f.status_pagamento === "pago");
  const statusGeral: "pendente" | "parcial" | "pago" = todosPagos
    ? "pago"
    : algumPago
      ? "parcial"
      : "pendente";

  const { error: updateStatusError } = await supabase
    .from("festas")
    .update({ status_pagamento_freelancers: statusGeral })
    .eq("id", festaId)
    .eq("empresa_id", empresaId);

  if (updateStatusError) {
    console.error("Erro ao atualizar status de pagamento da festa:", updateStatusError);
    return { success: false, error: updateStatusError.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  return { success: true, data };
}

// Remover freelancer da festa
export async function removeFreelancerFromFesta(festaId: string, freelancerId: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // festa_freelancers não tem empresa_id; segurança via RLS da festas pai
  // Verificar que a festa pertence à empresa antes de remover
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
    .delete()
    .eq("festa_id", festaId)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao remover freelancer:", error);
    return { success: false, error: error.message };
  }

  const { data: freelancersStatus, error: statusError } = await supabase
    .from("festa_freelancers")
    .select("status_pagamento")
    .eq("festa_id", festaId);

  if (statusError) {
    console.error("Erro ao recalcular status de pagamento:", statusError);
    return { success: false, error: statusError.message };
  }

  let statusGeral: "pendente" | "parcial" | "pago" = "pago";
  if (freelancersStatus && freelancersStatus.length > 0) {
    const todosPagos = freelancersStatus.every((f) => f.status_pagamento === "pago");
    const algumPago = freelancersStatus.some((f) => f.status_pagamento === "pago");
    statusGeral = todosPagos ? "pago" : algumPago ? "parcial" : "pendente";
  }

  const { error: updateStatusError } = await supabase
    .from("festas")
    .update({ status_pagamento_freelancers: statusGeral })
    .eq("id", festaId)
    .eq("empresa_id", empresaId);

  if (updateStatusError) {
    console.error("Erro ao atualizar status de pagamento da festa:", updateStatusError);
    return { success: false, error: updateStatusError.message };
  }

  revalidatePath(`/dashboard/festas/${festaId}`);
  revalidatePath("/dashboard/pagamentos");
  return { success: true };
}

// Atualizar status de confirmação do freelancer na festa
export async function updateFreelancerConfirmacao(
  festaId: string,
  freelancerId: string,
  status: "pendente" | "confirmado"
) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

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
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { error } = await supabase
    .from("festas")
    .delete()
    .eq("id", festaId)
    .eq("empresa_id", empresaId);

  if (error) {
    console.error("Erro ao excluir festa:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/festas");
  return { success: true };
}

// Sincronizar bonus_fixo de um freelancer em todas as festas pendentes
export async function sincronizarBonusFixoFreelancer(freelancerId: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: freelancer, error: freelancerError } = await supabase
    .from("freelancers")
    .select("bonus_fixo, nome")
    .eq("id", freelancerId)
    .eq("empresa_id", empresaId)
    .single();

  if (freelancerError || !freelancer) {
    console.error("Erro ao buscar freelancer:", freelancerError);
    return { success: false, error: "Freelancer não encontrado" };
  }

  const bonusFixo = freelancer.bonus_fixo || 0;

  // festa_freelancers não tem empresa_id: filtrar via join com festas da empresa
  // A RLS garante que festa_freelancers retorna apenas os da empresa,
  // mas para segurança extra filtramos pelas festas da empresa
  const { data: festasEmpresa } = await supabase
    .from("festas")
    .select("id")
    .eq("empresa_id", empresaId);

  const festaIds = (festasEmpresa || []).map((f: any) => f.id);

  if (festaIds.length > 0) {
    const { error: updateError } = await supabase
      .from("festa_freelancers")
      .update({
        valor_bonus: bonusFixo,
        motivo_bonus: bonusFixo > 0 ? "Bonificação fixa do freelancer" : null,
      })
      .eq("freelancer_id", freelancerId)
      .eq("status_pagamento", "pendente")
      .in("festa_id", festaIds);

    if (updateError) {
      console.error("Erro ao sincronizar bônus:", updateError);
      return { success: false, error: updateError.message };
    }
  }

  revalidatePath("/dashboard/pagamentos");
  revalidatePath("/dashboard/festas");
  revalidatePath("/dashboard/financeiro");

  return {
    success: true,
    message: bonusFixo > 0
      ? `Bônus de R$ ${bonusFixo.toFixed(2)} aplicado em todos os pagamentos pendentes de ${freelancer.nome}`
      : `Bônus removido de todos os pagamentos pendentes de ${freelancer.nome}`
  };
}

// Buscar festas futuras de um freelancer
export async function getFestasFuturasFreelancer(freelancerId: string) {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  // Buscar festas da empresa onde o freelancer está escalado
  const { data, error } = await supabase
    .from("festa_freelancers")
    .select(`
      festa_id,
      festas:festa_id (
        id,
        titulo,
        data,
        horario,
        local,
        empresa_id
      )
    `)
    .eq("freelancer_id", freelancerId);

  if (error) {
    console.error("Erro ao buscar festas do freelancer:", error);
    return { success: false, error: error.message };
  }

  const festas = (data || [])
    .map((item: any) => item.festas)
    .filter((festa: any) => festa !== null && festa.empresa_id === empresaId)
    .sort((a: any, b: any) => {
      const dateA = new Date(`${a.data}T${a.horario || "00:00"}`);
      const dateB = new Date(`${b.data}T${b.horario || "00:00"}`);
      return dateA.getTime() - dateB.getTime();
    });

  return { success: true, data: festas };
}
