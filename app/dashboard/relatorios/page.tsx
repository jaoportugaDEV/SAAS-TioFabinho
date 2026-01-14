"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserCircle, PartyPopper, Calendar as CalendarIcon } from "lucide-react";
import { RankingCard } from "@/components/relatorios/ranking-card";
import { RankingTable } from "@/components/relatorios/ranking-table";
import { MesDestaqueCard } from "@/components/relatorios/mes-destaque-card";
import {
  getTotalFestasPeriodo,
  getRankingClientes,
  getRankingFreelancers,
  getMesMaiorDemanda,
  getTotalClientesPeriodo,
  getTotalFreelancersPeriodo,
} from "@/app/actions/relatorios";
import { RankingCliente, RankingFreelancer, MesMaiorDemanda } from "@/types";

type TipoPeriodo = "mes" | "ano";

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("mes");
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  const [totalFestas, setTotalFestas] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [mesMaiorDemanda, setMesMaiorDemanda] = useState<MesMaiorDemanda | null>(null);

  const [rankingClientes, setRankingClientes] = useState<RankingCliente[]>([]);
  const [rankingFreelancers, setRankingFreelancers] = useState<RankingFreelancer[]>([]);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    loadDados();
  }, [tipoPeriodo, mesAtual, anoAtual]);

  const loadDados = async () => {
    setLoading(true);

    try {
      let dataInicio: string;
      let dataFim: string;

      if (tipoPeriodo === "mes") {
        // Período de um mês específico
        const mes = String(mesAtual).padStart(2, "0");
        dataInicio = `${anoAtual}-${mes}-01`;
        const lastDay = new Date(anoAtual, mesAtual, 0).getDate();
        dataFim = `${anoAtual}-${mes}-${lastDay}`;
      } else {
        // Período de um ano inteiro
        dataInicio = `${anoAtual}-01-01`;
        dataFim = `${anoAtual}-12-31`;
      }

      // Buscar dados em paralelo
      const [
        resultFestas,
        resultClientes,
        resultFreelancers,
        resultRankingClientes,
        resultRankingFreelancers,
      ] = await Promise.all([
        getTotalFestasPeriodo(dataInicio, dataFim),
        getTotalClientesPeriodo(dataInicio, dataFim),
        getTotalFreelancersPeriodo(dataInicio, dataFim),
        getRankingClientes(dataInicio, dataFim),
        getRankingFreelancers(dataInicio, dataFim),
      ]);

      setTotalFestas(resultFestas.total);
      setTotalClientes(resultClientes.total);
      setTotalFreelancers(resultFreelancers.total);
      setRankingClientes(resultRankingClientes.data);
      setRankingFreelancers(resultRankingFreelancers.data);

      // Se for ano, buscar mês com maior demanda
      if (tipoPeriodo === "ano") {
        const resultMesMaior = await getMesMaiorDemanda(anoAtual);
        setMesMaiorDemanda(resultMesMaior.data);
      } else {
        setMesMaiorDemanda(null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodoTexto = () => {
    if (tipoPeriodo === "mes") {
      return `${meses[mesAtual - 1]} de ${anoAtual}`;
    }
    return `Ano ${anoAtual}`;
  };

  const top5Clientes = rankingClientes.slice(0, 5);
  const top5Freelancers = rankingFreelancers.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
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
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <span>Relatórios</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Estatísticas e rankings do negócio
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Tipo de Período */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setTipoPeriodo("mes")}
                  variant={tipoPeriodo === "mes" ? "default" : "outline"}
                  className="flex-1 text-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Mês
                </Button>
                <Button
                  onClick={() => setTipoPeriodo("ano")}
                  variant={tipoPeriodo === "ano" ? "default" : "outline"}
                  className="flex-1 text-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Ano
                </Button>
              </div>

              {/* Seleção de Mês/Ano */}
              <div className="flex gap-2">
                {tipoPeriodo === "mes" && (
                  <select
                    value={mesAtual}
                    onChange={(e) => setMesAtual(Number(e.target.value))}
                    className="flex-1 text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={anoAtual}
                  onChange={(e) => setAnoAtual(Number(e.target.value))}
                  className={`${tipoPeriodo === "mes" ? "w-24" : "flex-1"} text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  {[2024, 2025, 2026, 2027].map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-primary">
                  Período: {getPeriodoTexto()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Festas
            </CardTitle>
            <PartyPopper className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold text-primary">{totalFestas}</div>
            <p className="text-xs text-gray-500 mt-1">
              {tipoPeriodo === "mes" ? "no mês" : "no ano"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Atendidos
            </CardTitle>
            <UserCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold text-green-600">{totalClientes}</div>
            <p className="text-xs text-gray-500 mt-1">
              cliente{totalClientes !== 1 ? "s" : ""} único{totalClientes !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">
              Freelancers Ativos
            </CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold text-blue-600">{totalFreelancers}</div>
            <p className="text-xs text-gray-500 mt-1">
              freelancer{totalFreelancers !== 1 ? "s" : ""} trabalharam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mês com Maior Demanda (somente para ano) */}
      {tipoPeriodo === "ano" && mesMaiorDemanda && (
        <MesDestaqueCard mesMaiorDemanda={mesMaiorDemanda} />
      )}

      {/* Ranking de Clientes */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            Ranking de Clientes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Clientes que mais fizeram festas no período
          </p>
        </div>

        {rankingClientes.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">
                Nenhum cliente encontrado neste período
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 5 em Cards */}
            {top5Clientes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🏆 Top 5</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {top5Clientes.map((cliente) => (
                    <RankingCard
                      key={cliente.cliente_id}
                      posicao={cliente.posicao}
                      nome={cliente.cliente_nome}
                      valor={cliente.total_festas}
                      tipo="cliente"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabela Completa */}
            <RankingTable
              dados={rankingClientes}
              tipo="cliente"
              titulo="Ranking Completo de Clientes"
            />
          </>
        )}
      </div>

      {/* Ranking de Freelancers */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Ranking de Freelancers
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Freelancers que mais trabalharam no período
          </p>
        </div>

        {rankingFreelancers.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">
                Nenhum freelancer encontrado neste período
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 5 em Cards */}
            {top5Freelancers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🏆 Top 5</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {top5Freelancers.map((freelancer) => (
                    <RankingCard
                      key={freelancer.freelancer_id}
                      posicao={freelancer.posicao}
                      nome={freelancer.freelancer_nome}
                      valor={freelancer.total_festas}
                      subtitulo={freelancer.funcao}
                      tipo="freelancer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabela Completa */}
            <RankingTable
              dados={rankingFreelancers}
              tipo="freelancer"
              titulo="Ranking Completo de Freelancers"
            />
          </>
        )}
      </div>

      {/* Dica Final */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
        <p className="text-sm text-blue-800">
          Use estes relatórios para reconhecer clientes fiéis, valorizar freelancers dedicados e 
          planejar estratégias para períodos de maior ou menor demanda. Os dados são atualizados 
          automaticamente conforme novas festas são cadastradas.
        </p>
      </div>
    </div>
  );
}
