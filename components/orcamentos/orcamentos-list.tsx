"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, DollarSign, Trash2, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { OrcamentoPDFGenerator } from "./orcamento-pdf-generator";
import { excluirOrcamento, atualizarStatusAceite } from "@/app/actions/orcamentos";
import { ContratoGenerator } from "@/components/festas/contrato-generator";
import type { StatusAceite } from "@/types";
import { STATUS_PAGAMENTO_LABEL } from "@/lib/orcamentos/pagamento-utils";

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
  status_aceite?: string;
  forma_pagamento?: string;
  quantidade_parcelas?: number;
  entrada?: number;
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
  showEncerradas: boolean;
  onToggleEncerradas: (show: boolean) => void;
  quantidadeEncerradas: number;
  onOrcamentoExcluido?: () => void;
  onOrcamentoAtualizado?: () => void;
}

export function OrcamentosList({ 
  orcamentos, 
  showEncerradas, 
  onToggleEncerradas, 
  quantidadeEncerradas,
  onOrcamentoExcluido,
  onOrcamentoAtualizado,
}: OrcamentosListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [aceiteFilter, setAceiteFilter] = useState<string>("all");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [atualizandoAceiteId, setAtualizandoAceiteId] = useState<string | null>(null);
  // Mapa de overrides locais: id -> status_aceite (atualização otimista)
  const [aceiteOverrides, setAceiteOverrides] = useState<Record<string, string>>({});

  const handleExcluir = async (orcamento: OrcamentoComFesta) => {
    if (!confirm("Excluir este orçamento? Esta ação não pode ser desfeita.")) return;
    setExcluindoId(orcamento.id);
    const result = await excluirOrcamento(orcamento.id);
    setExcluindoId(null);
    if (result.success) {
      onOrcamentoExcluido?.();
    } else {
      alert(result.error ?? "Erro ao excluir orçamento.");
    }
  };

  const handleAtualizarAceite = async (orcamentoId: string, status: StatusAceite) => {
    // Atualização otimista: reflete imediatamente na UI
    const statusAnterior = aceiteOverrides[orcamentoId] ?? orcamentos.find((o) => o.id === orcamentoId)?.status_aceite ?? "aguardando";
    setAceiteOverrides((prev) => ({ ...prev, [orcamentoId]: status }));
    setAtualizandoAceiteId(orcamentoId);
    const result = await atualizarStatusAceite(orcamentoId, status);
    setAtualizandoAceiteId(null);
    if (!result.success) {
      // Reverter em caso de erro
      setAceiteOverrides((prev) => ({ ...prev, [orcamentoId]: statusAnterior }));
      alert(result.error ?? "Erro ao atualizar status.");
    }
    // Notifica a page em background para manter totais financeiros sincronizados
    onOrcamentoAtualizado?.();
  };

  // Retorna o status_aceite efetivo (override local ou dado original)
  const getStatusAceite = (orcamento: OrcamentoComFesta): string =>
    aceiteOverrides[orcamento.id] ?? orcamento.status_aceite ?? "aguardando";

  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    const matchesSearch =
      orcamento.festa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.festa.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || orcamento.status_pagamento === statusFilter;
    const statusAceite = getStatusAceite(orcamento);
    const matchesAceite = aceiteFilter === "all" || statusAceite === aceiteFilter;
    
    return matchesSearch && matchesStatus && matchesAceite;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendente: { label: STATUS_PAGAMENTO_LABEL.pendente, className: "bg-red-100 text-red-800" },
      pago_parcial: { label: STATUS_PAGAMENTO_LABEL.pago_parcial, className: "bg-yellow-100 text-yellow-800" },
      pago_total: { label: "Pago Total", className: "bg-green-100 text-green-800" },
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

  const getStatusAceiteBadge = (status: string) => {
    const statusAceite = status ?? "aguardando";
    const map: Record<string, { label: string; className: string }> = {
      aguardando: { label: "Aguardando aceite", className: "bg-gray-100 text-gray-800" },
      aceito: { label: "Aceito", className: "bg-green-100 text-green-800" },
      recusado: { label: "Recusado", className: "bg-red-100 text-red-800" },
    };
    const info = map[statusAceite] || map.aguardando;
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="all">Todos os Status (pagamento)</option>
                <option value="pendente">Pendente</option>
                <option value="pago_parcial">Pago Parcial</option>
                <option value="pago_total">Pago Total</option>
              </select>
              <select
                value={aceiteFilter}
                onChange={(e) => setAceiteFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Todos (aceite)</option>
                <option value="aguardando">Aguardando aceite</option>
                <option value="aceito">Aceito</option>
                <option value="recusado">Recusado</option>
              </select>
            </div>
            
            {/* Toggle para mostrar festas encerradas */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="show-encerradas"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Exibir festas encerradas
                </label>
                {!showEncerradas && quantidadeEncerradas > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {quantidadeEncerradas} oculta{quantidadeEncerradas !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <button
                id="show-encerradas"
                type="button"
                onClick={() => onToggleEncerradas(!showEncerradas)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showEncerradas ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showEncerradas ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
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
                {searchTerm || statusFilter !== "all" || aceiteFilter !== "all"
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
                <div className="flex flex-col gap-3">
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
                        {getStatusAceiteBadge(getStatusAceite(orcamento))}
                        {getStatusBadge(orcamento.status_pagamento)}
                        {getFestaStatusBadge(orcamento.festa.status)}
                      </div>
                      <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Valor Total</span>
                        <span className="text-xl font-bold text-primary">
                          {Number(orcamento.total).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
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

                  {/* Ações de aceite */}
                  <div className="flex gap-2 mt-1">
                    {getStatusAceite(orcamento) !== "aceito" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none text-green-700 border-green-300 hover:bg-green-50"
                        onClick={() => handleAtualizarAceite(orcamento.id, "aceito")}
                        disabled={atualizandoAceiteId === orcamento.id}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {atualizandoAceiteId === orcamento.id ? "..." : "Aceitar"}
                      </Button>
                    )}
                    {getStatusAceite(orcamento) !== "recusado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleAtualizarAceite(orcamento.id, "recusado")}
                        disabled={atualizandoAceiteId === orcamento.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Recusar
                      </Button>
                    )}
                  </div>

                  {/* Ações secundárias */}
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <ContratoGenerator
                      compact
                      festa={{
                        id: orcamento.festa.id,
                        titulo: orcamento.festa.titulo,
                        data: orcamento.festa.data,
                        horario: orcamento.festa.horario,
                        tema: orcamento.festa.tema ?? "",
                        local: orcamento.festa.local ?? "",
                        cliente_nome: orcamento.festa.cliente_nome,
                        cliente_contato: orcamento.festa.cliente_contato ?? "",
                        status: orcamento.festa.status as import("@/types").StatusFesta,
                        status_pagamento_freelancers: "pendente",
                        created_at: "",
                      }}
                      orcamento={{
                        id: orcamento.id,
                        festa_id: orcamento.festa_id,
                        itens: orcamento.itens,
                        desconto: orcamento.desconto,
                        acrescimo: orcamento.acrescimo,
                        total: orcamento.total,
                        status_pagamento: orcamento.status_pagamento as import("@/types").StatusPagamento,
                          status_aceite: getStatusAceite(orcamento) as import("@/types").StatusAceite,
                        forma_pagamento: (orcamento.forma_pagamento ?? "avista") as import("@/types").FormaPagamento,
                        quantidade_parcelas: orcamento.quantidade_parcelas ?? 1,
                        entrada: orcamento.entrada ?? 0,
                        observacoes: orcamento.observacoes,
                        created_at: orcamento.created_at,
                      }}
                    />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={() => handleExcluir(orcamento)}
                      disabled={excluindoId === orcamento.id}
                    >
                      {excluindoId === orcamento.id ? (
                        "Excluindo..."
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir orçamento
                        </>
                      )}
                    </Button>
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

