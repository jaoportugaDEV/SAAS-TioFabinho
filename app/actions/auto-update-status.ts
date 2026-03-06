"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";

/**
 * Atualiza automaticamente o status das festas baseado em tempo e pagamentos:
 * - planejamento/confirmada → acontecendo (quando a festa começa)
 * - acontecendo → encerrada/encerrada_pendente (quando a festa termina)
 * - Considera duração de 4.5 horas (ou duracao_horas customizada)
 */
export async function autoUpdateFestaStatus() {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  try {
    const { data: festas, error: fetchError } = await supabase
      .from("festas")
      .select("id, data, horario, duracao_horas, status, status_pagamento_freelancers, status_pagamento_cliente")
      .eq("empresa_id", empresaId)
      .in("status", ["planejamento", "confirmada", "acontecendo"]);

    if (fetchError) {
      console.error("Erro ao buscar festas:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!festas || festas.length === 0) {
      return { success: true, updated: 0 };
    }

    const now = new Date();
    let updatedCount = 0;

    for (const festa of festas) {
      const duracaoHoras = festa.duracao_horas || 4.5;

      let dataInicio: Date;
      if (festa.horario) {
        dataInicio = new Date(`${festa.data}T${festa.horario}`);
      } else {
        dataInicio = new Date(`${festa.data}T12:00:00`);
      }

      const dataTermino = new Date(dataInicio.getTime() + duracaoHoras * 60 * 60 * 1000);

      let novoStatus = festa.status;

      if (now >= dataTermino) {
        if (festa.status !== "encerrada" && festa.status !== "encerrada_pendente") {
          const clientePagou = festa.status_pagamento_cliente === 'pago_total';
          const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';
          novoStatus = (clientePagou && freelancersReceberam) ? 'encerrada' : 'encerrada_pendente';
        }
      } else if (now >= dataInicio && now < dataTermino) {
        if (festa.status === "planejamento" || festa.status === "confirmada") {
          novoStatus = 'acontecendo';
        }
      }

      if (novoStatus !== festa.status) {
        const { error: updateError } = await supabase
          .from("festas")
          .update({ status: novoStatus })
          .eq("id", festa.id)
          .eq("empresa_id", empresaId);

        if (updateError) {
          console.error(`Erro ao atualizar festa ${festa.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error("Erro na atualização automática:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Verifica e atualiza festas de "encerrada_pendente" para "encerrada"
 * quando todos os pagamentos forem completados
 */
export async function checkAndUpdatePagamentosCompletos() {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  try {
    const { data: festas, error: fetchError } = await supabase
      .from("festas")
      .select("id, status_pagamento_freelancers, status_pagamento_cliente")
      .eq("empresa_id", empresaId)
      .eq("status", "encerrada_pendente");

    if (fetchError) {
      console.error("Erro ao buscar festas pendentes:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!festas || festas.length === 0) {
      return { success: true, updated: 0 };
    }

    let updatedCount = 0;

    for (const festa of festas) {
      const clientePagou = festa.status_pagamento_cliente === 'pago_total';
      const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';

      if (clientePagou && freelancersReceberam) {
        const { error: updateError } = await supabase
          .from("festas")
          .update({ status: "encerrada" })
          .eq("id", festa.id)
          .eq("empresa_id", empresaId);

        if (updateError) {
          console.error(`Erro ao atualizar festa ${festa.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error("Erro ao verificar pagamentos completos:", error);
    return { success: false, error: String(error) };
  }
}
