"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Festa } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Eye, Wallet, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  concluida: { label: "Concluída", color: "bg-gray-100 text-gray-800" },
};

const statusOrder = ["planejamento", "confirmada", "concluida"] as const;

const statusPagamentoLabels: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: "Pagamento Pendente", color: "bg-red-100 text-red-800 border-red-200", icon: Clock },
  parcial: { label: "Pagamento Parcial", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wallet },
  pago: { label: "Pagamento Completo", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
};

export default function FestasPage() {
  const [festas, setFestas] = useState<Festa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadFestas();
  }, []);

  const loadFestas = async () => {
    try {
      const { data, error } = await supabase
        .from("festas")
        .select("*")
        .order("data", { ascending: false });

      if (error) throw error;
      setFestas(data || []);
    } catch (error) {
      console.error("Erro ao carregar festas:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (festaId: string, currentStatus: string) => {
    try {
      const currentIndex = statusOrder.indexOf(currentStatus as any);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      const nextStatus = statusOrder[nextIndex];

      const { error } = await supabase
        .from("festas")
        .update({ status: nextStatus })
        .eq("id", festaId);

      if (error) throw error;

      // Atualiza o estado local
      setFestas(festas.map(f => 
        f.id === festaId ? { ...f, status: nextStatus } : f
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredFestas = festas.filter(
    (f) =>
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tema?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Festas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie todas as festas e eventos
          </p>
        </div>
        <Link href="/dashboard/festas/nova">
          <Button className="gap-2">
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

      {/* Lista de Festas */}
      {filteredFestas.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Nenhuma festa encontrada"
              : "Nenhuma festa cadastrada ainda"}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/festas/nova">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeira Festa
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFestas.map((festa) => {
            const statusInfo = statusLabels[festa.status] || statusLabels.planejamento;
            
            return (
              <Card
                key={festa.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {festa.titulo}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Cliente: {festa.cliente_nome}
                        </p>
                        {festa.tema && (
                          <p className="text-sm text-gray-500 mt-1">
                            Tema: {festa.tema}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge 
                          className={`${statusInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleStatus(festa.id, festa.status);
                          }}
                          title="Clique para alterar o status"
                        >
                          {statusInfo.label}
                        </Badge>
                        {festa.status_pagamento_freelancers && (
                          <Badge 
                            className={`${statusPagamentoLabels[festa.status_pagamento_freelancers]?.color || 'bg-gray-100 text-gray-800'} border`}
                          >
                            {(() => {
                              const Icon = statusPagamentoLabels[festa.status_pagamento_freelancers]?.icon;
                              return Icon ? <Icon className="w-3 h-3 mr-1" /> : null;
                            })()}
                            {statusPagamentoLabels[festa.status_pagamento_freelancers]?.label || 'Status Desconhecido'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(festa.data)}
                        {festa.horario && (
                          <span className="text-primary font-medium">
                            às {festa.horario}
                          </span>
                        )}
                      </div>
                      {festa.local && (
                        <div className="flex items-center gap-2">
                          📍 {festa.local}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <Link
                      href={`/dashboard/festas/${festa.id}`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

