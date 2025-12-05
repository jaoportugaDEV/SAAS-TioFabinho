"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Atualiza automaticamente o status de festas confirmadas para "encerrada" ou "encerrada_pendente"
 * quando a data/hora da festa já passou, considerando o status dos pagamentos
 */
export async function autoUpdateFestaStatus() {
  const supabase = await createClient();

  try {
    // Buscar todas as festas com status "confirmada"
    const { data: festas, error: fetchError } = await supabase
      .from("festas")
      .select("id, data, horario, status_pagamento_freelancers, status_pagamento_cliente")
      .eq("status", "confirmada");

    if (fetchError) {
      console.error("Erro ao buscar festas:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!festas || festas.length === 0) {
      return { success: true, updated: 0 };
    }

    const now = new Date();
    let updatedCount = 0;

    // Verificar quais festas já passaram e atualizar com status correto
    for (const festa of festas) {
      let dataFesta: Date;

      if (festa.horario) {
        // Se tem horário, criar data completa com horário
        dataFesta = new Date(`${festa.data}T${festa.horario}`);
      } else {
        // Se não tem horário, considerar o final do dia (23:59:59)
        dataFesta = new Date(`${festa.data}T23:59:59`);
      }

      // Se a data/hora da festa já passou
      if (dataFesta < now) {
        // Verificar se todos os pagamentos foram feitos
        const clientePagou = festa.status_pagamento_cliente === 'pago_total';
        const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';

        // Definir status baseado nos pagamentos
        const novoStatus = (clientePagou && freelancersReceberam) ? 'encerrada' : 'encerrada_pendente';

        // Atualizar status da festa
        const { error: updateError } = await supabase
          .from("festas")
          .update({ status: novoStatus })
          .eq("id", festa.id);

        if (updateError) {
          console.error(`Erro ao atualizar festa ${festa.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ ${updatedCount} festas atualizadas para status encerrada/encerrada_pendente`);
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

  try {
    // Buscar festas com status "encerrada_pendente"
    const { data: festas, error: fetchError } = await supabase
      .from("festas")
      .select("id, status_pagamento_freelancers, status_pagamento_cliente")
      .eq("status", "encerrada_pendente");

    if (fetchError) {
      console.error("Erro ao buscar festas pendentes:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!festas || festas.length === 0) {
      return { success: true, updated: 0 };
    }

    let updatedCount = 0;

    // Verificar pagamentos de cada festa
    for (const festa of festas) {
      const clientePagou = festa.status_pagamento_cliente === 'pago_total';
      const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';

      // Se todos os pagamentos foram feitos, atualizar para "encerrada"
      if (clientePagou && freelancersReceberam) {
        const { error: updateError } = await supabase
          .from("festas")
          .update({ status: "encerrada" })
          .eq("id", festa.id);

        if (updateError) {
          console.error(`Erro ao atualizar festa ${festa.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ ${updatedCount} festas atualizadas para status "encerrada" (pagamentos completos)`);
    }

    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error("Erro ao verificar pagamentos completos:", error);
    return { success: false, error: String(error) };
  }
}

