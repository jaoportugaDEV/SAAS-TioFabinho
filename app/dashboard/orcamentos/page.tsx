"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import { StatsCards } from "@/components/orcamentos/stats-cards";
import { OrcamentosList } from "@/components/orcamentos/orcamentos-list";

interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

interface OrcamentoComFesta {
  id: string;
  festa_id: string;
  itens: ItemOrcamento[];
  desconto: number;
  acrescimo: number;
  total: number;
  status_pagamento: string;
  status_aceite?: string;
  observacoes?: string;
  created_at: string;
  valor_pago_parcelas?: number;
  festa: {
    id: string;
    titulo: string;
    data: string;
    cliente_nome: string;
    cliente_contato: string;
    status: string;
    tema?: string;
    local?: string;
    horario?: string;
  };
}

export default function OrcamentosPage() {
  const { empresaId } = useEmpresa();
  const [orcamentos, setOrcamentos] = useState<OrcamentoComFesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEncerradas, setShowEncerradas] = useState(false);
  const [mesAnoFiltro, setMesAnoFiltro] = useState<string>("todos");
  const supabase = createClient();

  useEffect(() => {
    loadOrcamentos();
  }, []);

  // Reload silencioso: atualiza dados sem mostrar spinner (preserva scroll/foco)
  const reloadSilencioso = async () => {
    if (!empresaId) return;
    try {
      const { data: orcamentosData } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });
      if (!orcamentosData) return;
      if (orcamentosData.length === 0) { setOrcamentos([]); return; }

      const festaIds = orcamentosData.map((o) => o.festa_id);
      const { data: festasData } = await supabase
        .from("festas")
        .select("id, titulo, data, cliente_id, cliente_nome, cliente_contato, status, tema, local, horario")
        .in("id", festaIds);

      const orcamentoIds = orcamentosData.map((o) => o.id);
      const { data: parcelasData } = await supabase
        .from("parcelas_pagamento")
        .select("orcamento_id, valor, status")
        .in("orcamento_id", orcamentoIds);

      const completos = orcamentosData.map((orcamento) => {
        const festa = festasData?.find((f) => f.id === orcamento.festa_id);
        const parcelasOrcamento = parcelasData?.filter((p) => p.orcamento_id === orcamento.id) || [];
        const valorPagoParcelas = parcelasOrcamento
          .filter((p) => p.status === "pago")
          .reduce((acc, p) => acc + Number(p.valor), 0);
        return {
          ...orcamento,
          valor_pago_parcelas: valorPagoParcelas,
          festa: festa || { id: orcamento.festa_id, titulo: "Festa não encontrada", data: "", cliente_nome: "", cliente_contato: "", status: "planejamento", tema: "", local: "" },
        };
      });
      completos.sort((a, b) => {
        if (!a.festa.data) return 1;
        if (!b.festa.data) return -1;
        return new Date(a.festa.data).getTime() - new Date(b.festa.data).getTime();
      });
      setOrcamentos(completos);
    } catch {
      // ignora silenciosamente
    }
  };

  const loadOrcamentos = async () => {
    try {
      setLoading(true);

      if (!empresaId) return;

      // Buscar todos os orçamentos
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (orcamentosError) throw orcamentosError;

      if (!orcamentosData || orcamentosData.length === 0) {
        setOrcamentos([]);
        return;
      }

      // Buscar festas relacionadas
      const festaIds = orcamentosData.map((o) => o.festa_id);
      const { data: festasData, error: festasError } = await supabase
        .from("festas")
        .select("id, titulo, data, cliente_id, cliente_nome, cliente_contato, status, tema, local, horario")
        .in("id", festaIds);

      if (festasError) throw festasError;

      // Buscar clientes das festas que têm cliente_id (para PDF com dados completos)
      const clienteIds = [...new Set((festasData ?? []).map((f) => f.cliente_id).filter(Boolean))] as string[];
      let clientesMap: Map<string, { nome: string; cpf_cnpj?: string | null; email?: string | null; telefone?: string | null; whatsapp?: string | null; endereco?: string | null; cidade?: string | null; estado?: string | null; cep?: string | null }> = new Map();
      if (clienteIds.length > 0) {
        const { data: clientesData } = await supabase
          .from("clientes")
          .select("id, nome, cpf_cnpj, email, telefone, whatsapp, endereco, cidade, estado, cep")
          .eq("empresa_id", empresaId)
          .in("id", clienteIds);
        if (clientesData) {
          clientesData.forEach((c) => clientesMap.set(c.id, c));
        }
      }

      // Buscar parcelas de todos os orçamentos
      const orcamentoIds = orcamentosData.map((o) => o.id);
      const { data: parcelasData, error: parcelasError } = await supabase
        .from("parcelas_pagamento")
        .select("orcamento_id, valor, status")
        .in("orcamento_id", orcamentoIds);

      if (parcelasError) console.error("Erro ao buscar parcelas:", parcelasError);

      // Combinar dados
      const orcamentosCompletos = orcamentosData.map((orcamento) => {
        const festa = festasData?.find((f) => f.id === orcamento.festa_id);
        const cliente = festa?.cliente_id ? clientesMap.get(festa.cliente_id) : undefined;
        // Calcular valor pago real (incluindo parcelas)
        const parcelasOrcamento = parcelasData?.filter((p) => p.orcamento_id === orcamento.id) || [];
        const valorPagoParcelas = parcelasOrcamento
          .filter((p) => p.status === "pago")
          .reduce((acc, p) => acc + Number(p.valor), 0);
        
        return {
          ...orcamento,
          valor_pago_parcelas: valorPagoParcelas,
          festa: festa || {
            id: orcamento.festa_id,
            titulo: "Festa não encontrada",
            data: "",
            cliente_nome: "",
            cliente_contato: "",
            status: "planejamento",
            tema: "",
            local: "",
          },
          cliente,
        };
      });

      // Ordenar por data da festa (mais próximas primeiro)
      orcamentosCompletos.sort((a, b) => {
        if (!a.festa.data) return 1;
        if (!b.festa.data) return -1;
        return new Date(a.festa.data).getTime() - new Date(b.festa.data).getTime();
      });

      setOrcamentos(orcamentosCompletos);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar orçamentos baseado no estado showEncerradas
  let orcamentosFiltrados = showEncerradas
    ? orcamentos
    : orcamentos.filter(
        (o) => o.festa.status !== "encerrada" && o.festa.status !== "encerrada_pendente"
      );

  // Filtrar por mês/ano
  if (mesAnoFiltro !== "todos") {
    orcamentosFiltrados = orcamentosFiltrados.filter((o) => {
      if (!o.festa.data) return false;
      const dataFesta = new Date(o.festa.data + "T00:00:00");
      const mesAno = `${dataFesta.getFullYear()}-${String(dataFesta.getMonth() + 1).padStart(2, "0")}`;
      return mesAno === mesAnoFiltro;
    });
  }

  // Contar quantas festas encerradas existem
  const quantidadeEncerradas = orcamentos.filter(
    (o) => o.festa.status === "encerrada" || o.festa.status === "encerrada_pendente"
  ).length;

  // Calcular estatísticas considerando parcelas pagas (excluir orçamentos recusados)
  const stats = orcamentosFiltrados.reduce(
    (acc, orcamento) => {
      if ((orcamento.status_aceite ?? "aguardando") === "recusado") return acc;

      const total = Number(orcamento.total);
      const valorPagoParcelas = Number(orcamento.valor_pago_parcelas || 0);

      acc.totalGeral += total;

      if (orcamento.status_pagamento === "pago_total") {
        // Orçamento pago integralmente
        acc.totalPago += total;
      } else if (orcamento.status_pagamento === "pago_parcial") {
        // Orçamento com parcelas pagas
        acc.totalPago += valorPagoParcelas;
        acc.totalParcial += total - valorPagoParcelas;
      } else if (orcamento.status_pagamento === "pendente") {
        // Se tem parcelas pagas mesmo marcado como pendente
        if (valorPagoParcelas > 0) {
          acc.totalPago += valorPagoParcelas;
          acc.totalPendente += total - valorPagoParcelas;
        } else {
          acc.totalPendente += total;
        }
      }

      return acc;
    },
    { totalGeral: 0, totalPago: 0, totalPendente: 0, totalParcial: 0 }
  );

  // Gerar lista de meses/anos disponíveis
  const mesesDisponiveis = Array.from(
    new Set(
      orcamentos
        .filter((o) => o.festa.data)
        .map((o) => {
          const data = new Date(o.festa.data + "T00:00:00");
          return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
        })
    )
  ).sort((a, b) => b.localeCompare(a)); // Mais recentes primeiro

  const formatMesAno = (mesAno: string) => {
    const [ano, mes] = mesAno.split("-");
    const mesesNomes = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${mesesNomes[parseInt(mes) - 1]} ${ano}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            Orçamentos
          </h1>
          <p className="text-gray-500 mt-1">
            Dashboard financeiro e gestão de orçamentos
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Orçamentos
        </h1>
        <p className="text-gray-500 mt-1">
          Dashboard financeiro e gestão de orçamentos
        </p>
      </div>

      {/* Filtro por Mês/Ano */}
      {mesesDisponiveis.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <label htmlFor="filtro-mes" className="block text-sm font-medium text-gray-700 mb-2">
            📅 Filtrar por Mês
          </label>
          <select
            id="filtro-mes"
            value={mesAnoFiltro}
            onChange={(e) => setMesAnoFiltro(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos os Meses</option>
            {mesesDisponiveis.map((mesAno) => (
              <option key={mesAno} value={mesAno}>
                {formatMesAno(mesAno)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <StatsCards
        totalGeral={stats.totalGeral}
        totalPago={stats.totalPago}
        totalPendente={stats.totalPendente}
        totalParcial={stats.totalParcial}
        quantidadeTotal={orcamentosFiltrados.length}
      />

      {/* Lista de Orçamentos */}
      <OrcamentosList 
        orcamentos={orcamentosFiltrados}
        showEncerradas={showEncerradas}
        onToggleEncerradas={setShowEncerradas}
        quantidadeEncerradas={quantidadeEncerradas}
        onOrcamentoExcluido={loadOrcamentos}
        onOrcamentoAtualizado={reloadSilencioso}
      />
    </div>
  );
}
