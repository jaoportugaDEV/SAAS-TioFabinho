"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Festa } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { autoUpdateFestaStatus } from "@/app/actions/auto-update-status";

export default function CalendarioPage() {
  const [festas, setFestas] = useState<Festa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Atualizar status automaticamente ao carregar o calendário
    autoUpdateFestaStatus().then(() => {
      loadData();
    });
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

      setFestas(festasData || []);
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

  // Ordenar festas do dia selecionado por horário
  const festasDoDiaSelecionado = selectedDay && festasPorDia[selectedDay] 
    ? [...festasPorDia[selectedDay]].sort((a, b) => {
        if (!a.horario) return 1;
        if (!b.horario) return -1;
        return a.horario.localeCompare(b.horario);
      })
    : [];

  const handleDayClick = (dia: number) => {
    if (festasPorDia[dia] && festasPorDia[dia].length > 0) {
      setSelectedDay(dia);
      setDialogOpen(true);
    }
  };

  // Gerar dias do mês
  const [year, month] = selectedMonth.split("-");
  const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
  const firstDayOfMonth = new Date(Number(year), Number(month) - 1, 1).getDay();

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

      <div className="grid grid-cols-1 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                const temFestas = festaDoDia.length > 0;

                return (
                  <div
                    key={dia}
                    className={`aspect-square border rounded-lg p-1.5 sm:p-2 ${
                      hoje ? "border-primary border-2 bg-primary/5" : "border-gray-200"
                    } ${festaDoDia.length > 0 ? "bg-blue-50" : ""} ${
                      temFestas ? "cursor-pointer hover:bg-blue-100 transition-colors" : ""
                    }`}
                    onClick={() => handleDayClick(dia)}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 flex items-center justify-between">
                      <span>{dia}</span>
                      {festaDoDia.length > 0 && (
                        <span className="text-[10px] sm:text-xs bg-primary text-white rounded-full px-1 sm:px-1.5 py-0.5 leading-none">
                          {festaDoDia.length}
                        </span>
                      )}
                    </div>
                    
                    {/* Desktop: Mostra preview das festas */}
                    <div className="hidden sm:block space-y-1">
                      {festaDoDia.slice(0, 2).map((festa) => (
                        <div
                          key={festa.id}
                          className="block text-xs bg-primary text-white rounded px-1 py-0.5 truncate"
                          title={`${festa.titulo}${festa.horario ? ` às ${festa.horario}` : ""}`}
                        >
                          {festa.horario ? `${festa.horario} - ` : ""}{festa.titulo}
                        </div>
                      ))}
                      {festaDoDia.length > 2 && (
                        <div className="text-xs text-primary font-semibold flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Ver todas
                        </div>
                      )}
                    </div>

                    {/* Mobile: Mostra apenas indicadores visuais */}
                    {temFestas && (
                      <div className="sm:hidden flex flex-col items-center justify-center mt-1 space-y-0.5">
                        {festaDoDia.slice(0, 3).map((festa, idx) => (
                          <div
                            key={festa.id}
                            className="w-full h-1 bg-primary rounded-full"
                            style={{ opacity: 1 - (idx * 0.2) }}
                          />
                        ))}
                        <div className="text-[10px] text-primary font-semibold mt-0.5">
                          Tocar
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Festas do Dia */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">
              Festas - {selectedDay} de{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 mt-4">
            {festasDoDiaSelecionado.map((festa) => {
              const statusLabels: Record<string, { label: string; color: string }> = {
                planejamento: { label: "Planejamento", color: "bg-yellow-100 text-yellow-800" },
                confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
                encerrada_pendente: { label: "Encerrada - Pag. Pendente", color: "bg-orange-100 text-orange-800" },
                encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-800" },
                cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
              };

              const statusInfo = statusLabels[festa.status] || statusLabels.planejamento;

              return (
                <Card key={festa.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Horário e Status na mesma linha */}
                        <div className="flex items-center justify-between gap-2">
                          {festa.horario && (
                            <div className="flex items-center gap-2 text-primary">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="font-bold text-base sm:text-lg">{festa.horario}</span>
                            </div>
                          )}
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Título */}
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {festa.titulo}
                        </h3>

                        {/* Cliente */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{festa.cliente_nome}</span>
                        </div>

                        {/* Tema e Local em mobile compacto */}
                        <div className="space-y-1">
                          {festa.tema && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              <span className="font-medium">Tema:</span> {festa.tema}
                            </p>
                          )}

                          {festa.local && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              <span className="font-medium">Local:</span> {festa.local}
                            </p>
                          )}
                        </div>

                        {/* Informações de convidados */}
                        {(festa.estimativa_convidados || festa.quantidade_criancas) && (
                          <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-500">
                            {festa.estimativa_convidados && (
                              <span>
                                <span className="font-medium">Convidados:</span>{" "}
                                {festa.estimativa_convidados}
                              </span>
                            )}
                            {festa.quantidade_criancas && (
                              <span>
                                <span className="font-medium">Crianças:</span>{" "}
                                {festa.quantidade_criancas}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botão Ver Detalhes - Full width no mobile */}
                      <Link
                        href={`/dashboard/festas/${festa.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium w-full sm:w-auto"
                        onClick={() => setDialogOpen(false)}
                      >
                        Ver Detalhes Completos
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Festas do Mês */}
      {festas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Festas do Mês ({festas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...festas]
                .sort((a, b) => {
                  // Ordenar por data e horário (mais próximas primeiro)
                  const dateA = new Date(a.data + (a.horario ? `T${a.horario}` : 'T00:00:00')).getTime();
                  const dateB = new Date(b.data + (b.horario ? `T${b.horario}` : 'T00:00:00')).getTime();
                  return dateA - dateB;
                })
                .map((festa) => {
                  const dataFesta = new Date(festa.data + (festa.horario ? `T${festa.horario}` : 'T23:59:59'));
                  const agora = new Date();
                  const festaPassada = dataFesta < agora;

                  return (
                    <Link
                      key={festa.id}
                      href={`/dashboard/festas/${festa.id}`}
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-all ${
                        festaPassada ? 'opacity-60 bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold ${festaPassada ? 'text-gray-500' : ''}`}>
                            {festa.titulo}
                          </p>
                          {festaPassada && (
                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                              Realizada
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${festaPassada ? 'text-gray-400' : 'text-gray-600'}`}>
                          {festa.cliente_nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${festaPassada ? 'text-gray-500' : ''}`}>
                          {formatDate(festa.data)}
                          {festa.horario && (
                            <span className={`ml-1 ${festaPassada ? 'text-gray-500' : 'text-primary'}`}>
                              às {festa.horario}
                            </span>
                          )}
                        </p>
                        {festa.tema && (
                          <p className="text-xs text-gray-500">{festa.tema}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

