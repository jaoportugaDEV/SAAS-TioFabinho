"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Download, FileText, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { listarDespesasGerais, excluirDespesaGeral } from "@/app/actions/despesas";
import { AdicionarDespesaDialog } from "@/components/financeiro/adicionar-despesa-dialog";
import { gerarPDFDespesas, gerarPDFFestas, gerarPDFFreelancers } from "@/lib/pdf-generator";
import { DespesaGeral } from "@/types";

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

export default function FinanceiroPage() {
  const [stats, setStats] = useState({
    totalReceitas: 0,
    totalDespesasFreelancers: 0,
    totalDespesasGerais: 0,
    lucro: 0,
    festasDoMes: 0,
  });
  const [despesasGerais, setDespesasGerais] = useState<DespesaGeral[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  
  // Filtro de mês/ano
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, [mesAtual, anoAtual]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const mes = String(mesAtual).padStart(2, "0");
      const startDate = `${anoAtual}-${mes}-01`;
      const lastDay = new Date(anoAtual, mesAtual, 0).getDate();
      const endDate = `${anoAtual}-${mes}-${lastDay}`;

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

      // Carregar despesas de freelancers
      let totalDespesasFreelancers = 0;
      if (festasIds.length > 0) {
        const { data: pagamentos, error: pagamentosError } = await supabase
          .from("pagamentos_freelancers")
          .select("valor")
          .in("festa_id", festasIds);

        if (pagamentosError) throw pagamentosError;
        totalDespesasFreelancers = pagamentos?.reduce((acc, p) => acc + Number(p.valor), 0) || 0;
      }

      // Carregar despesas gerais
      const resultDespesas = await listarDespesasGerais(String(mesAtual), String(anoAtual));
      const despesas = resultDespesas.success ? resultDespesas.data : [];
      setDespesasGerais(despesas);
      const totalDespesasGerais = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

      const totalDespesas = totalDespesasFreelancers + totalDespesasGerais;

      setStats({
        totalReceitas,
        totalDespesasFreelancers,
        totalDespesasGerais,
        lucro: totalReceitas - totalDespesas,
        festasDoMes: festas?.length || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirDespesa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;

    const result = await excluirDespesaGeral(id);
    if (result.success) {
      loadStats();
    } else {
      alert("Erro ao excluir despesa. Tente novamente.");
    }
  };

  const handleGerarPDFDespesas = async () => {
    setGerandoPDF(true);
    try {
      const mes = String(mesAtual).padStart(2, "0");
      const startDate = `${anoAtual}-${mes}-01`;
      const lastDay = new Date(anoAtual, mesAtual, 0).getDate();
      const endDate = `${anoAtual}-${mes}-${lastDay}`;

      // Buscar festas do mês
      const { data: festas } = await supabase
        .from("festas")
        .select("id, titulo, data")
        .gte("data", startDate)
        .lte("data", endDate);

      const festasIds = festas?.map((f) => f.id) || [];

      // Buscar despesas de freelancers
      let despesasFreelancers: any[] = [];
      if (festasIds.length > 0) {
        const { data: pagamentos } = await supabase
          .from("pagamentos_freelancers")
          .select(`
            valor,
            data_pagamento,
            festa_id,
            freelancer:freelancers(nome)
          `)
          .in("festa_id", festasIds);

        despesasFreelancers = (pagamentos || []).map((p: any) => ({
          nome: p.freelancer?.nome || "Freelancer",
          valor: Number(p.valor),
          data: p.data_pagamento,
          festa: festas?.find((f) => f.id === p.festa_id)?.titulo || "Festa",
        }));
      }

      await gerarPDFDespesas(mesAtual, anoAtual, despesasFreelancers, despesasGerais);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleGerarPDFFestas = async () => {
    setGerandoPDF(true);
    try {
      const mes = String(mesAtual).padStart(2, "0");
      const startDate = `${anoAtual}-${mes}-01`;
      const lastDay = new Date(anoAtual, mesAtual, 0).getDate();
      const endDate = `${anoAtual}-${mes}-${lastDay}`;

      // Buscar festas do mês com orçamentos
      const { data: festas } = await supabase
        .from("festas")
        .select(`
          titulo,
          data,
          cliente_nome,
          status,
          orcamentos(total)
        `)
        .gte("data", startDate)
        .lte("data", endDate);

      const festasDados = (festas || []).map((f: any) => ({
        titulo: f.titulo,
        data: f.data,
        cliente: f.cliente_nome,
        valor: f.orcamentos?.[0]?.total || 0,
        status: f.status === "concluida" ? "Concluída" : f.status === "confirmada" ? "Confirmada" : "Planejamento",
      }));

      await gerarPDFFestas(mesAtual, anoAtual, festasDados);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleGerarPDFFreelancers = async () => {
    setGerandoPDF(true);
    try {
      const mes = String(mesAtual).padStart(2, "0");
      const startDate = `${anoAtual}-${mes}-01`;
      const lastDay = new Date(anoAtual, mesAtual, 0).getDate();
      const endDate = `${anoAtual}-${mes}-${lastDay}`;

      // Buscar festas do mês
      const { data: festas } = await supabase
        .from("festas")
        .select("id, titulo, data")
        .gte("data", startDate)
        .lte("data", endDate);

      const festasIds = festas?.map((f) => f.id) || [];

      // Buscar pagamentos de freelancers
      let pagamentos: any[] = [];
      if (festasIds.length > 0) {
        const { data: pags } = await supabase
          .from("pagamentos_freelancers")
          .select(`
            valor,
            data_pagamento,
            festa_id,
            freelancer:freelancers(nome, funcao)
          `)
          .in("festa_id", festasIds);

        pagamentos = (pags || []).map((p: any) => ({
          nome: p.freelancer?.nome || "Freelancer",
          funcao: funcaoLabels[p.freelancer?.funcao] || p.freelancer?.funcao || "Outros",
          valor: Number(p.valor),
          data: p.data_pagamento,
          festa: festas?.find((f) => f.id === p.festa_id)?.titulo || "Festa",
        }));
      }

      await gerarPDFFreelancers(mesAtual, anoAtual, pagamentos);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <span>Financeiro</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Acompanhe receitas, despesas e lucros
          </p>
        </div>

        {/* Filtro de Mês/Ano */}
        <div className="flex gap-2">
          <select
            value={mesAtual}
            onChange={(e) => setMesAtual(Number(e.target.value))}
            className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {meses.map((mes, index) => (
              <option key={index} value={index + 1}>
                {mes}
              </option>
            ))}
          </select>
          <select
            value={anoAtual}
            onChange={(e) => setAnoAtual(Number(e.target.value))}
            className="w-20 sm:w-24 text-xs sm:text-sm px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2024, 2025, 2026, 2027].map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Receitas
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-green-600 truncate">
              {formatCurrency(stats.totalReceitas)}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {stats.festasDoMes} festa(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Desp. Freel.
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-orange-600 truncate">
              {formatCurrency(stats.totalDespesasFreelancers)}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              Freelancers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Desp. Gerais
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-red-600 truncate">
              {formatCurrency(stats.totalDespesasGerais)}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {despesasGerais.length} despesa(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Lucro
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-primary truncate">
              {formatCurrency(stats.lucro)}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {stats.lucro >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Download de PDFs */}
      <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Relatórios Mensais em PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button
              onClick={handleGerarPDFDespesas}
              disabled={gerandoPDF}
              className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold text-center">Relatório de Despesas</span>
              <span className="text-xs opacity-90 hidden sm:inline">Freelancers + Gerais</span>
            </Button>

            <Button
              onClick={handleGerarPDFFestas}
              disabled={gerandoPDF}
              className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold text-center">Relatório de Festas</span>
              <span className="text-xs opacity-90 hidden sm:inline">Eventos realizados</span>
            </Button>

            <Button
              onClick={handleGerarPDFFreelancers}
              disabled={gerandoPDF}
              className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold text-center">Relatório de Freelancers</span>
              <span className="text-xs opacity-90 hidden sm:inline">Pagamentos realizados</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center">
            Os relatórios contêm apenas informações do mês selecionado
          </p>
        </CardContent>
      </Card>

      {/* Despesas Gerais */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Despesas Gerais do Mês</CardTitle>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 w-full sm:w-auto text-sm">
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {despesasGerais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma despesa geral cadastrada neste mês</p>
              <p className="text-sm mt-1">Clique em "Nova Despesa" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {despesasGerais.map((despesa) => (
                <div
                  key={despesa.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-gray-900 break-words">{despesa.descricao}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(despesa.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-bold text-base sm:text-lg text-red-600 whitespace-nowrap">
                      {formatCurrency(despesa.valor)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExcluirDespesa(despesa.id)}
                      className="text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
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
              <span className="text-gray-700">Total de Despesas</span>
              <span className="font-bold text-lg text-red-600">
                {formatCurrency(stats.totalDespesasFreelancers + stats.totalDespesasGerais)}
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
          registrados. Use os filtros de mês/ano para visualizar períodos diferentes e gere
          relatórios em PDF para arquivar ou compartilhar informações.
        </p>
      </div>

      {/* Dialog de Adicionar Despesa */}
      <AdicionarDespesaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadStats}
      />
    </div>
  );
}
