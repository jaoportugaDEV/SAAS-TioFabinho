"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  observacoes?: string;
  created_at: string;
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
  const [orcamentos, setOrcamentos] = useState<OrcamentoComFesta[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);

      // Buscar todos os orçamentos
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from("orcamentos")
        .select("*")
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
        .select("id, titulo, data, cliente_nome, cliente_contato, status, tema, local, horario")
        .in("id", festaIds);

      if (festasError) throw festasError;

      // Combinar dados
      const orcamentosCompletos = orcamentosData.map((orcamento) => {
        const festa = festasData?.find((f) => f.id === orcamento.festa_id);
        
        return {
          ...orcamento,
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
        };
      });

      setOrcamentos(orcamentosCompletos);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const stats = orcamentos.reduce(
    (acc, orcamento) => {
      const total = Number(orcamento.total);
      acc.totalGeral += total;

      if (orcamento.status_pagamento === "pago_total") {
        acc.totalPago += total;
      } else if (orcamento.status_pagamento === "pago_parcial") {
        acc.totalParcial += total;
      } else if (orcamento.status_pagamento === "pendente") {
        acc.totalPendente += total;
      }

      return acc;
    },
    { totalGeral: 0, totalPago: 0, totalPendente: 0, totalParcial: 0 }
  );

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

      {/* Cards de Estatísticas */}
      <StatsCards
        totalGeral={stats.totalGeral}
        totalPago={stats.totalPago}
        totalPendente={stats.totalPendente}
        totalParcial={stats.totalParcial}
        quantidadeTotal={orcamentos.length}
      />

      {/* Lista de Orçamentos */}
      <OrcamentosList orcamentos={orcamentos} />
    </div>
  );
}

