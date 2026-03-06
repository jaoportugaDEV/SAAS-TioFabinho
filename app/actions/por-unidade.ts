"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/server-empresa";

export type StatsPorLocal = {
  local: string;
  festas: number;
  receita: number;
  despesasFreelancers: number;
  lucro: number;
};

export type PorUnidadeResult =
  | { success: true; data: StatsPorLocal[] }
  | { success: false; error: string };

/**
 * Retorna estatísticas por local (unidade): festas, receita, despesas freelancers e lucro no período.
 * Festas com local vazio são agrupadas como "Outros".
 */
export async function getStatsPorUnidade(
  mesOuTodoAno: number,
  ano: number,
  todoAno: boolean
): Promise<PorUnidadeResult> {
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const supabase = await createClient();

  let startDate: string;
  let endDate: string;
  if (todoAno) {
    startDate = `${ano}-01-01`;
    endDate = `${ano}-12-31`;
  } else {
    const mes = String(mesOuTodoAno).padStart(2, "0");
    startDate = `${ano}-${mes}-01`;
    const lastDay = new Date(ano, mesOuTodoAno, 0).getDate();
    endDate = `${ano}-${mes}-${lastDay}`;
  }

  const { data: festas, error: festasError } = await supabase
    .from("festas")
    .select("id, local")
    .eq("empresa_id", empresaId)
    .gte("data", startDate)
    .lte("data", endDate);

  if (festasError) {
    console.error("Erro ao buscar festas por unidade:", festasError);
    return { success: false, error: festasError.message };
  }

  const festasList = festas ?? [];
  if (festasList.length === 0) {
    return { success: true, data: [] };
  }

  const festasPorLocal = new Map<string, string[]>();
  for (const f of festasList) {
    const localKey = (f.local ?? "").trim() || "Outros";
    if (!festasPorLocal.has(localKey)) {
      festasPorLocal.set(localKey, []);
    }
    festasPorLocal.get(localKey)!.push(f.id);
  }

  const festasIds = festasList.map((f) => f.id);

  let orcamentosPorFesta: Map<string, number> = new Map();
  if (festasIds.length > 0) {
    const { data: orcamentos } = await supabase
      .from("orcamentos")
      .select("festa_id, total")
      .in("festa_id", festasIds);
    for (const o of orcamentos ?? []) {
      const atual = orcamentosPorFesta.get(o.festa_id) ?? 0;
      orcamentosPorFesta.set(o.festa_id, atual + Number(o.total));
    }
  }

  let pagamentosPorFesta: Map<string, number> = new Map();
  if (festasIds.length > 0) {
    const { data: pagamentos } = await supabase
      .from("pagamentos_freelancers")
      .select("festa_id, valor")
      .in("festa_id", festasIds);
    for (const p of pagamentos ?? []) {
      const atual = pagamentosPorFesta.get(p.festa_id) ?? 0;
      pagamentosPorFesta.set(p.festa_id, atual + Number(p.valor));
    }
  }

  const result: StatsPorLocal[] = [];
  for (const [local, ids] of festasPorLocal.entries()) {
    let receita = 0;
    let despesasFreelancers = 0;
    for (const fid of ids) {
      receita += orcamentosPorFesta.get(fid) ?? 0;
      despesasFreelancers += pagamentosPorFesta.get(fid) ?? 0;
    }
    result.push({
      local,
      festas: ids.length,
      receita,
      despesasFreelancers,
      lucro: receita - despesasFreelancers,
    });
  }

  return { success: true, data: result };
}
