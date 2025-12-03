"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Users, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    festasDoMes: 0,
    freelancersAtivos: 0,
    faturamento: 0,
    proximasFestas: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      // Festas do mês
      const { data: festas } = await supabase
        .from("festas")
        .select("*")
        .gte("data", startDate)
        .lte("data", endDate);

      // Freelancers ativos
      const { data: freelancers } = await supabase
        .from("freelancers")
        .select("id")
        .eq("ativo", true);

      // Faturamento
      let faturamento = 0;
      if (festas && festas.length > 0) {
        const festasIds = festas.map((f) => f.id);
        const { data: orcamentos } = await supabase
          .from("orcamentos")
          .select("total")
          .in("festa_id", festasIds);
        faturamento = orcamentos?.reduce((acc, o) => acc + Number(o.total), 0) || 0;
      }

      // Próximas festas
      const { data: proximasFestas } = await supabase
        .from("festas")
        .select("*")
        .gte("data", now.toISOString().split("T")[0])
        .order("data")
        .limit(5);

      setStats({
        festasDoMes: festas?.length || 0,
        freelancersAtivos: freelancers?.length || 0,
        faturamento,
        proximasFestas: proximasFestas || [],
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
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bem-vinda ao sistema de gestão do Tio Fabinho Buffet
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Festas este Mês
            </CardTitle>
            <PartyPopper className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.festasDoMes}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.festasDoMes === 0 ? "Nenhuma festa cadastrada" : "festa(s) agendada(s)"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Freelancers Ativos
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freelancersAtivos}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.freelancersAtivos === 0 ? "Cadastre sua equipe" : "na equipe"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Faturamento do Mês
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.faturamento)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.faturamento === 0 ? "Aguardando festas" : "em orçamentos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Próximas Festas
            </CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proximasFestas.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.proximasFestas.length === 0 ? "Nenhuma festa agendada" : "agendada(s)"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Festas */}
      {stats.proximasFestas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas Festas</CardTitle>
            <Link href="/dashboard/festas">
              <Button variant="outline" size="sm" className="gap-2">
                Ver Todas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.proximasFestas.map((festa) => (
                <Link
                  key={festa.id}
                  href={`/dashboard/festas/${festa.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{festa.titulo}</p>
                    <p className="text-sm text-gray-600">{festa.cliente_nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(festa.data)}
                      {festa.horario && (
                        <span className="text-primary ml-1">às {festa.horario}</span>
                      )}
                    </p>
                    {festa.tema && (
                      <p className="text-xs text-gray-500">{festa.tema}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de boas-vindas */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
        <CardHeader>
          <CardTitle className="text-xl">🎉 Bem-vinda ao Sistema!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">
            Este é seu sistema completo de gestão de festas. Comece por:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Cadastrar seus <strong>freelancers</strong> (monitores, cozinheiras, fotógrafos)</li>
            <li>Criar suas primeiras <strong>festas</strong></li>
            <li>Gerar <strong>contratos e orçamentos</strong></li>
            <li>Controlar o <strong>financeiro</strong></li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Use o menu lateral para navegar entre as seções.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

