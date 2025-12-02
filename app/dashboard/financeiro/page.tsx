"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinanceiroPage() {
  const [stats, setStats] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    lucro: 0,
    festasDoMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Obter mês atual
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      // Carregar festas do mês
      const { data: festas, error: festasError } = await supabase
        .from("festas")
        .select("id")
        .gte("data", startDate)
        .lte("data", endDate);

      if (festasError) throw festasError;

      const festasIds = festas?.map((f) => f.id) || [];

      // Carregar orçamentos (receitas)
      let totalReceitas = 0;
      if (festasIds.length > 0) {
        const { data: orcamentos, error: orcamentosError } = await supabase
          .from("orcamentos")
          .select("total")
          .in("festa_id", festasIds);

        if (orcamentosError) throw orcamentosError;
        totalReceitas = orcamentos?.reduce((acc, o) => acc + Number(o.total), 0) || 0;
      }

      // Carregar despesas
      let totalDespesas = 0;
      if (festasIds.length > 0) {
        const { data: pagamentos, error: pagamentosError } = await supabase
          .from("pagamentos_freelancers")
          .select("valor")
          .in("festa_id", festasIds);

        if (pagamentosError) throw pagamentosError;
        totalDespesas = pagamentos?.reduce((acc, p) => acc + Number(p.valor), 0) || 0;
      }

      setStats({
        totalReceitas,
        totalDespesas,
        lucro: totalReceitas - totalDespesas,
        festasDoMes: festas?.length || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" />
          Financeiro
        </h1>
        <p className="text-gray-500 mt-1">
          Acompanhe receitas, despesas e lucros
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalReceitas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.festasDoMes} festa(s) este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas do Mês
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDespesas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pagamentos de freelancers
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Lucro do Mês
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(stats.lucro)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.lucro >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informação adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total de Festas</span>
              <span className="font-bold text-lg">{stats.festasDoMes}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Ticket Médio</span>
              <span className="font-bold text-lg">
                {stats.festasDoMes > 0
                  ? formatCurrency(stats.totalReceitas / stats.festasDoMes)
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Margem de Lucro</span>
              <span className="font-bold text-lg">
                {stats.totalReceitas > 0
                  ? `${((stats.lucro / stats.totalReceitas) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
        <p className="text-sm text-blue-800">
          Os dados financeiros são calculados com base nos orçamentos criados e pagamentos
          registrados. Certifique-se de manter tudo atualizado para ter relatórios precisos.
        </p>
      </div>
    </div>
  );
}

