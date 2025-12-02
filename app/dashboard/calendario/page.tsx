"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Festa, Freelancer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function CalendarioPage() {
  const [festas, setFestas] = useState<Festa[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      // Carregar festas do mês selecionado
      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      const { data: festasData, error: festasError } = await supabase
        .from("festas")
        .select("*")
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data");

      if (festasError) throw festasError;

      // Carregar freelancers ativos
      const { data: freelancersData, error: freelancersError } = await supabase
        .from("freelancers")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (freelancersError) throw freelancersError;

      setFestas(festasData || []);
      setFreelancers(freelancersData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const festasPorDia = festas.reduce((acc, festa) => {
    const dia = new Date(festa.data + "T00:00:00").getDate();
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(festa);
    return acc;
  }, {} as Record<number, Festa[]>);

  // Gerar dias do mês
  const [year, month] = selectedMonth.split("-");
  const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
  const firstDayOfMonth = new Date(Number(year), Number(month) - 1, 1).getDay();

  const funcaoLabels: Record<string, string> = {
    monitor: "Monitor",
    cozinheira: "Cozinheira",
    fotografo: "Fotógrafo",
    outros: "Outros",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Calendário
          </h1>
          <p className="text-gray-500 mt-1">
            Visualize festas agendadas e disponibilidade de freelancers
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Dias da semana */}
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                <div
                  key={dia}
                  className="text-center text-sm font-semibold text-gray-600 pb-2"
                >
                  {dia}
                </div>
              ))}

              {/* Espaços vazios antes do primeiro dia */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dia = i + 1;
                const festaDoDia = festasPorDia[dia] || [];
                const hoje = new Date().getDate() === dia &&
                  new Date().getMonth() + 1 === Number(month) &&
                  new Date().getFullYear() === Number(year);

                return (
                  <div
                    key={dia}
                    className={`aspect-square border rounded-lg p-2 ${
                      hoje ? "border-primary border-2 bg-primary/5" : "border-gray-200"
                    } ${festaDoDia.length > 0 ? "bg-blue-50" : ""}`}
                  >
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {dia}
                    </div>
                    {festaDoDia.slice(0, 2).map((festa) => (
                      <Link
                        key={festa.id}
                        href={`/dashboard/festas/${festa.id}`}
                        className="block text-xs bg-primary text-white rounded px-1 py-0.5 mb-1 truncate hover:bg-primary/90"
                      >
                        {festa.titulo}
                      </Link>
                    ))}
                    {festaDoDia.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{festaDoDia.length - 2}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Freelancers Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Freelancers Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {freelancers.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum freelancer ativo</p>
            ) : (
              <div className="space-y-3">
                {freelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="w-10 h-10">
                      {freelancer.foto_url ? (
                        <AvatarImage src={freelancer.foto_url} alt={freelancer.nome} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {freelancer.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {freelancer.nome}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {funcaoLabels[freelancer.funcao]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Festas do Mês */}
      {festas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Festas do Mês ({festas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {festas.map((festa) => (
                <Link
                  key={festa.id}
                  href={`/dashboard/festas/${festa.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{festa.titulo}</p>
                    <p className="text-sm text-gray-600">{festa.cliente_nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(festa.data)}</p>
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
    </div>
  );
}

