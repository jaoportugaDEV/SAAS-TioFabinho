"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { OrcamentoPDFGenerator } from "./orcamento-pdf-generator";

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

interface OrcamentosListProps {
  orcamentos: OrcamentoComFesta[];
}

export function OrcamentosList({ orcamentos }: OrcamentosListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    const matchesSearch =
      orcamento.festa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.festa.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || orcamento.status_pagamento === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendente: { label: "Pendente", className: "bg-red-100 text-red-800" },
      pago_parcial: { label: "Pago Parcial", className: "bg-yellow-100 text-yellow-800" },
      pago_total: { label: "Pago", className: "bg-green-100 text-green-800" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getFestaStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      planejamento: { label: "Planejamento", className: "bg-yellow-100 text-yellow-800" },
      confirmada: { label: "Confirmada", className: "bg-blue-100 text-blue-800" },
      concluida: { label: "Concluída", className: "bg-green-100 text-green-800" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por festa ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="pago_parcial">Pago Parcial</option>
              <option value="pago_total">Pago Total</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      {filteredOrcamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Os orçamentos das festas aparecerão aqui."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrcamentos.map((orcamento) => (
            <Card key={orcamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {orcamento.festa.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {orcamento.festa.cliente_nome}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(orcamento.festa.data)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getStatusBadge(orcamento.status_pagamento)}
                          {getFestaStatusBadge(orcamento.festa.status)}
                        </div>
                      </div>
                    </div>

                    {/* Resumo dos itens */}
                    <div className="ml-8 pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        {orcamento.itens.length} item{orcamento.itens.length !== 1 ? "ns" : ""} no orçamento
                      </p>
                      <div className="space-y-1">
                        {orcamento.itens.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            • {item.descricao} ({item.quantidade}x)
                          </p>
                        ))}
                        {orcamento.itens.length > 2 && (
                          <p className="text-xs text-gray-500">
                            ... e mais {orcamento.itens.length - 2} item{orcamento.itens.length - 2 !== 1 ? "ns" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {Number(orcamento.total).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <OrcamentoPDFGenerator
                        orcamento={{
                          ...orcamento,
                          festa: {
                            ...orcamento.festa,
                          },
                        }}
                        variant="outline"
                        size="sm"
                      />
                      <Link href={`/dashboard/festas/${orcamento.festa.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Festa
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Orçamento criado em {formatDate(orcamento.created_at)}</span>
                    {orcamento.desconto > 0 && (
                      <span className="text-green-600">
                        Desconto: R$ {Number(orcamento.desconto).toFixed(2)}
                      </span>
                    )}
                    {orcamento.acrescimo > 0 && (
                      <span className="text-orange-600">
                        Acréscimo: R$ {Number(orcamento.acrescimo).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

