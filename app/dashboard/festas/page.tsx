"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Festa } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Eye, Wallet, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { autoUpdateFestaStatus } from "@/app/actions/auto-update-status";

// Interface estendida para incluir informações de pagamento
interface FestaComPagamentos extends Festa {
  clientePagou?: boolean;
  freelancersReceberam?: boolean;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  encerrada_pendente: { label: "Encerrada - Pag. Pendente", color: "bg-orange-100 text-orange-800" },
  encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-800" },
};

const statusOrder = ["planejamento", "confirmada", "encerrada_pendente", "encerrada"] as const;

const statusPagamentoLabels: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: "Pagamento Pendente", color: "bg-red-100 text-red-800 border-red-200", icon: Clock },
  parcial: { label: "Pagamento Parcial", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wallet },
  pago: { label: "Pagamento Completo", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
};

export default function FestasPage() {
  const [festas, setFestas] = useState<FestaComPagamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const supabase = createClient();

  useEffect(() => {
    // Atualizar status automaticamente antes de carregar as festas
    autoUpdateFestaStatus().then(() => {
      loadFestas();
    });
  }, []);

  const loadFestas = async () => {
    try {
      const { data, error } = await supabase
        .from("festas")
        .select("*");

      if (error) throw error;
      
      // Para cada festa, verificar o status de pagamentos
      const festasComPagamentos = await Promise.all(
        (data || []).map(async (festa) => {
          let clientePagou = false;
          let freelancersReceberam = false;

          // Verificar pagamento do cliente (orçamento/parcelas)
          const { data: orcamento } = await supabase
            .from("orcamentos")
            .select("status_pagamento")
            .eq("festa_id", festa.id)
            .single();

          if (orcamento) {
            clientePagou = orcamento.status_pagamento === "pago_total";
          }

          // Verificar pagamento dos freelancers
          if (festa.status_pagamento_freelancers) {
            freelancersReceberam = festa.status_pagamento_freelancers === "pago";
          }

          return {
            ...festa,
            clientePagou,
            freelancersReceberam
          };
        })
      );

      // Ordenação customizada:
      // 1. Festas não encerradas (mais próximas primeiro)
      // 2. Festas encerradas com pagamentos pendentes
      // 3. Festas encerradas completas (mais recentes primeiro)
      const festasOrdenadas = festasComPagamentos.sort((a, b) => {
        const isAEncerrada = a.status === "encerrada" || a.status === "encerrada_pendente";
        const isBEncerrada = b.status === "encerrada" || b.status === "encerrada_pendente";
        
        // Se A não está encerrada e B está, A vem primeiro
        if (!isAEncerrada && isBEncerrada) return -1;
        if (isAEncerrada && !isBEncerrada) return 1;
        
        // Ambas não encerradas: ordenar por data (mais próximas primeiro)
        if (!isAEncerrada && !isBEncerrada) {
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        }
        
        // Ambas encerradas: priorizar as com pagamentos pendentes
        const aPendente = !a.clientePagou || !a.freelancersReceberam || a.status === "encerrada_pendente";
        const bPendente = !b.clientePagou || !b.freelancersReceberam || b.status === "encerrada_pendente";
        
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        
        // Mesmo tipo de encerrada: ordenar por data (mais recentes primeiro)
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      setFestas(festasOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar festas:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (festaId: string, currentStatus: string) => {
    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        return;
      }

      const currentIndex = statusOrder.indexOf(currentStatus as any);
      if (currentIndex === -1) {
        console.error("Status atual não encontrado:", currentStatus);
        alert("Erro: Status atual inválido");
        return;
      }

      const nextIndex = (currentIndex + 1) % statusOrder.length;
      const nextStatus = statusOrder[nextIndex];

      console.log("Alterando status de", currentStatus, "para", nextStatus);

      const { data, error } = await supabase
        .from("festas")
        .update({ status: nextStatus })
        .eq("id", festaId)
        .select();

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }

      console.log("Status atualizado com sucesso:", data);

      // Atualiza o estado local
      setFestas(festas.map(f => 
        f.id === festaId ? { ...f, status: nextStatus } : f
      ));
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      alert(`Erro ao atualizar status: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
    }
  };

  const filteredFestas = festas.filter((f) => {
    // Filtro de busca por texto
    const matchesSearch = 
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tema?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = statusFilter === "todos" || f.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando festas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Festas</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Gerencie todas as festas e eventos
          </p>
        </div>
        <Link href="/dashboard/festas/nova" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Nova Festa
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar por título, cliente ou tema..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Badge
          variant={statusFilter === "todos" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "todos" 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "hover:bg-gray-100"
          }`}
          onClick={() => setStatusFilter("todos")}
        >
          Todos
        </Badge>
        <Badge
          variant={statusFilter === "planejamento" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "planejamento" 
              ? "bg-blue-500 text-white hover:bg-blue-600" 
              : "hover:bg-blue-50"
          }`}
          onClick={() => setStatusFilter("planejamento")}
        >
          Planejamento
        </Badge>
        <Badge
          variant={statusFilter === "confirmada" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "confirmada" 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "hover:bg-green-50"
          }`}
          onClick={() => setStatusFilter("confirmada")}
        >
          Confirmada
        </Badge>
        <Badge
          variant={statusFilter === "encerrada_pendente" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "encerrada_pendente" 
              ? "bg-orange-500 text-white hover:bg-orange-600" 
              : "hover:bg-orange-50"
          }`}
          onClick={() => setStatusFilter("encerrada_pendente")}
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Encerrada - Pag. Pendente</span>
          <span className="sm:hidden">Enc. Pend.</span>
        </Badge>
        <Badge
          variant={statusFilter === "encerrada" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "encerrada" 
              ? "bg-gray-500 text-white hover:bg-gray-600" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => setStatusFilter("encerrada")}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Encerrada
        </Badge>
      </div>

      {/* Lista de Festas */}
      {filteredFestas.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm
              ? "Nenhuma festa encontrada"
              : "Nenhuma festa cadastrada ainda"}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/festas/nova" className="inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeira Festa
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredFestas.map((festa) => {
            const statusInfo = statusLabels[festa.status] || statusLabels.planejamento;
            
            return (
              <Card
                key={festa.id}
                className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {festa.titulo}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                          Cliente: {festa.cliente_nome}
                        </p>
                        {festa.tema && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                            Tema: {festa.tema}
                          </p>
                        )}
                      </div>
                      <Badge 
                        className={`${statusInfo.color} cursor-pointer hover:opacity-80 transition-opacity text-xs whitespace-nowrap flex-shrink-0`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleStatus(festa.id, festa.status);
                        }}
                        title="Clique para alterar o status"
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Badges de Pagamento */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {festa.status_pagamento_freelancers && (
                        <Badge 
                          className={`${statusPagamentoLabels[festa.status_pagamento_freelancers]?.color || 'bg-gray-100 text-gray-800'} border text-xs`}
                        >
                          {(() => {
                            const Icon = statusPagamentoLabels[festa.status_pagamento_freelancers]?.icon;
                            return Icon ? <Icon className="w-3 h-3 mr-1" /> : null;
                          })()}
                          <span className="hidden sm:inline">{statusPagamentoLabels[festa.status_pagamento_freelancers]?.label || 'Status Desconhecido'}</span>
                          <span className="sm:hidden">
                            {festa.status_pagamento_freelancers === 'pendente' && 'Pend.'}
                            {festa.status_pagamento_freelancers === 'parcial' && 'Parcial'}
                            {festa.status_pagamento_freelancers === 'pago' && 'Pago'}
                          </span>
                        </Badge>
                      )}
                      
                      {/* Alerta: Cliente pagou mas freelancers não receberam */}
                      {festa.clientePagou && !festa.freelancersReceberam && (
                        <Link
                          href={`/dashboard/pagamentos?festa=${festa.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge 
                            className="bg-red-500 text-white border-red-600 cursor-pointer hover:bg-red-600 transition-all animate-pulse text-xs"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pagar Freelancers!
                          </Badge>
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(festa.data)}
                          {festa.horario && (
                            <span className="text-primary font-medium ml-1">
                              às {festa.horario}
                            </span>
                          )}
                        </span>
                      </div>
                      {festa.local && (
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0">📍</span>
                          <span className="truncate">{festa.local}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/festas/${festa.id}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

