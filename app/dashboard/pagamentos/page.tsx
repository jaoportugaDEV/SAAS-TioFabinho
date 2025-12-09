"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, Copy, CheckCircle, Clock, Calendar, Users, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getFestasPagamentosPendentes, marcarPagamentoComoRealizado } from "@/app/actions/pagamentos";
import { checkAndUpdatePagamentosCompletos } from "@/app/actions/auto-update-status";

interface FreelancerPagamento {
  id: string;
  nome: string;
  foto_url: string | null;
  funcao: string;
  pix: string;
  whatsapp: string;
}

interface FestaFreelancerPagamento {
  id: string;
  valor_acordado: number;
  status_pagamento: string;
  freelancer: FreelancerPagamento;
}

interface FestaPagamento {
  id: string;
  titulo: string;
  data: string;
  horario?: string;
  status_pagamento_freelancers: string;
  festa_freelancers: FestaFreelancerPagamento[];
}

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

interface FreelancerAgrupado {
  id: string;
  nome: string;
  foto_url: string | null;
  funcao: string;
  pix: string;
  whatsapp: string;
  totalDevido: number;
  totalPago: number;
  festas: Array<{
    festaId: string;
    festaTitulo: string;
    festaData: string;
    festaHorario?: string;
    valor: number;
    status: string;
  }>;
  temPendentes: boolean;
}

type ViewMode = "por-festa" | "por-freelancer";

export default function PagamentosPage() {
  const searchParams = useSearchParams();
  const [festas, setFestas] = useState<FestaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [highlightFestaId, setHighlightFestaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("por-festa");
  const [expandedFreelancers, setExpandedFreelancers] = useState<Set<string>>(new Set());
  const festaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    loadFestas();
  }, []);

  // Detectar festa destacada e fazer scroll + animação
  useEffect(() => {
    const festaId = searchParams.get('festa');
    if (festaId && !loading && festas.length > 0) {
      // Aguardar renderização
      setTimeout(() => {
        const festaRef = festaRefs.current[festaId];
        if (festaRef) {
          // Scroll suave até a festa
          festaRef.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Ativar animação de destaque
          setHighlightFestaId(festaId);
          
          // Remover animação após 4 segundos
          setTimeout(() => {
            setHighlightFestaId(null);
          }, 4000);
        }
      }, 500);
    }
  }, [searchParams, loading, festas]);

  const loadFestas = async () => {
    setLoading(true);
    // Verificar e atualizar status de festas com pagamentos completos
    await checkAndUpdatePagamentosCompletos();
    // Carregar festas pendentes
    const result = await getFestasPagamentosPendentes();
    if (result.success) {
      setFestas(result.data as FestaPagamento[]);
    }
    setLoading(false);
  };

  const copiarPix = (pix: string, nome: string) => {
    navigator.clipboard.writeText(pix);
    alert(`Chave PIX de ${nome} copiada!`);
  };

  const togglePagamento = async (festaId: string, freelancerId: string, statusAtual: string) => {
    setProcessando(freelancerId);
    const novoPago = statusAtual !== "pago";
    
    const result = await marcarPagamentoComoRealizado(festaId, freelancerId, novoPago);
    
    if (result.success) {
      // Recarregar festas para atualizar status
      await loadFestas();
    } else {
      alert("Erro ao atualizar pagamento. Tente novamente.");
    }
    
    setProcessando(null);
  };

  const marcarTodosPagamentosFreelancer = async (freelancerId: string, pagamentos: Array<{festaId: string, status: string}>) => {
    setProcessando(freelancerId);
    
    // Marcar todos os pagamentos pendentes deste freelancer
    const pagamentosPendentes = pagamentos.filter(p => p.status !== "pago");
    
    try {
      for (const pagamento of pagamentosPendentes) {
        const result = await marcarPagamentoComoRealizado(pagamento.festaId, freelancerId, true);
        if (!result.success) {
          throw new Error("Erro ao marcar pagamento");
        }
      }
      
      // Recarregar festas para atualizar status
      await loadFestas();
      alert("Todos os pagamentos foram marcados como realizados!");
    } catch (error) {
      alert("Erro ao atualizar pagamentos. Tente novamente.");
    }
    
    setProcessando(null);
  };

  const toggleExpandFreelancer = (freelancerId: string) => {
    setExpandedFreelancers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(freelancerId)) {
        newSet.delete(freelancerId);
      } else {
        newSet.add(freelancerId);
      }
      return newSet;
    });
  };

  const agruparPorFreelancer = (): FreelancerAgrupado[] => {
    const freelancersMap = new Map<string, FreelancerAgrupado>();

    festas.forEach(festa => {
      festa.festa_freelancers.forEach(ff => {
        const freelancerId = ff.freelancer.id;
        
        if (!freelancersMap.has(freelancerId)) {
          freelancersMap.set(freelancerId, {
            id: ff.freelancer.id,
            nome: ff.freelancer.nome,
            foto_url: ff.freelancer.foto_url,
            funcao: ff.freelancer.funcao,
            pix: ff.freelancer.pix,
            whatsapp: ff.freelancer.whatsapp,
            totalDevido: 0,
            totalPago: 0,
            festas: [],
            temPendentes: false,
          });
        }

        const freelancerData = freelancersMap.get(freelancerId)!;
        
        freelancerData.festas.push({
          festaId: festa.id,
          festaTitulo: festa.titulo,
          festaData: festa.data,
          festaHorario: festa.horario,
          valor: ff.valor_acordado || 0,
          status: ff.status_pagamento,
        });

        if (ff.status_pagamento === "pago") {
          freelancerData.totalPago += ff.valor_acordado || 0;
        } else {
          freelancerData.totalDevido += ff.valor_acordado || 0;
          freelancerData.temPendentes = true;
        }
      });
    });

    // Ordenar por nome e priorizar quem tem pendentes
    return Array.from(freelancersMap.values()).sort((a, b) => {
      if (a.temPendentes && !b.temPendentes) return -1;
      if (!a.temPendentes && b.temPendentes) return 1;
      return a.nome.localeCompare(b.nome);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  const freelancersAgrupados = agruparPorFreelancer();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              Pagamentos Pendentes
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie os pagamentos dos freelancers das festas já realizadas
            </p>
          </div>
          
          {/* Botões de Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === "por-festa" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("por-festa")}
              className="gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              Por Festa
            </Button>
            <Button
              variant={viewMode === "por-freelancer" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("por-freelancer")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Por Freelancer
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Festas ou Freelancers */}
      {festas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pagamento pendente!</h3>
              <p className="text-sm">
                Todos os freelancers das festas realizadas já foram pagos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "por-freelancer" ? (
        <div className="space-y-6">
          {freelancersAgrupados.map((freelancer) => {
            const isExpanded = expandedFreelancers.has(freelancer.id);
            
            return (
              <Card
                key={freelancer.id}
                className={`transition-all duration-300 ${
                  freelancer.temPendentes
                    ? "border-yellow-300 bg-yellow-50/50"
                    : "border-green-300 bg-green-50/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      {freelancer.foto_url ? (
                        <AvatarImage
                          src={freelancer.foto_url}
                          alt={freelancer.nome}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {freelancer.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-xl">{freelancer.nome}</CardTitle>
                            <Badge
                              className={
                                freelancer.temPendentes
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {freelancer.temPendentes ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Todos Pagos
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {funcaoLabels[freelancer.funcao] || freelancer.funcao}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {freelancer.festas.length} festa{freelancer.festas.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          {freelancer.temPendentes && (
                            <>
                              <p className="text-sm text-gray-500">Total a Pagar</p>
                              <p className="text-3xl font-bold text-primary">
                                {formatCurrency(freelancer.totalDevido)}
                              </p>
                            </>
                          )}
                          {freelancer.totalPago > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Já pago: {formatCurrency(freelancer.totalPago)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* PIX */}
                      {freelancer.temPendentes && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200">
                          <span className="text-sm font-medium text-gray-600">PIX:</span>
                          <code className="text-sm flex-1 truncate font-mono">
                            {freelancer.pix}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copiarPix(freelancer.pix, freelancer.nome)}
                            className="gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copiar
                          </Button>
                        </div>
                      )}

                      {/* Checkbox de Pagamento em Lote */}
                      {freelancer.temPendentes && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-green-200">
                          <input
                            type="checkbox"
                            id={`pago-all-${freelancer.id}`}
                            checked={false}
                            onChange={() =>
                              marcarTodosPagamentosFreelancer(
                                freelancer.id,
                                freelancer.festas.map(f => ({ festaId: f.festaId, status: f.status }))
                              )
                            }
                            disabled={processando === freelancer.id}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`pago-all-${freelancer.id}`}
                            className="font-medium cursor-pointer select-none flex-1"
                          >
                            <span className="text-gray-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Marcar todos os pagamentos como realizados
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Detalhes das Festas */}
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandFreelancer(freelancer.id)}
                          className="gap-2 w-full justify-between"
                        >
                          <span className="text-sm font-medium">
                            Detalhes das festas ({freelancer.festas.length})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {freelancer.festas.map((festa) => (
                              <div
                                key={`${festa.festaId}-${freelancer.id}`}
                                className={`p-3 rounded-lg border ${
                                  festa.status === "pago"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {festa.festaTitulo}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {formatDate(festa.festaData)}
                                        {festa.festaHorario && ` às ${festa.festaHorario}`}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-primary">
                                      {formatCurrency(festa.valor)}
                                    </p>
                                    {festa.status === "pago" && (
                                      <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Pago
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {festas.map((festa) => {
            const todosPagos = festa.festa_freelancers.every(
              (ff) => ff.status_pagamento === "pago"
            );
            const totalValor = festa.festa_freelancers.reduce(
              (acc, ff) => acc + (ff.valor_acordado || 0),
              0
            );
            const totalPago = festa.festa_freelancers
              .filter((ff) => ff.status_pagamento === "pago")
              .reduce((acc, ff) => acc + (ff.valor_acordado || 0), 0);
            
            return (
              <Card
                key={festa.id}
                ref={(el) => (festaRefs.current[festa.id] = el)}
                className={`transition-all duration-500 ${
                  todosPagos
                    ? "border-green-300 bg-green-50/50"
                    : "border-yellow-300 bg-yellow-50/50"
                } ${
                  highlightFestaId === festa.id
                    ? "ring-4 ring-red-500 ring-opacity-50 shadow-2xl shadow-red-500/50 scale-[1.02]"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-xl">{festa.titulo}</CardTitle>
                        <Badge
                          className={
                            todosPagos
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {todosPagos ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Todos Pagos
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(festa.data)}
                          {festa.horario && ` às ${festa.horario}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(totalValor)}
                      </p>
                      {!todosPagos && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pago: {formatCurrency(totalPago)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {festa.festa_freelancers.map((ff) => {
                      const isPago = ff.status_pagamento === "pago";
                      
                      return (
                        <div
                          key={ff.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isPago
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              {ff.freelancer.foto_url ? (
                                <AvatarImage
                                  src={ff.freelancer.foto_url}
                                  alt={ff.freelancer.nome}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-primary text-white">
                                  {ff.freelancer.nome.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <p className="font-semibold">{ff.freelancer.nome}</p>
                                  <p className="text-sm text-gray-600">
                                    {funcaoLabels[ff.freelancer.funcao] || ff.freelancer.funcao}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    {formatCurrency(ff.valor_acordado || 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {/* PIX */}
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                  <span className="text-xs font-medium text-gray-600">PIX:</span>
                                  <code className="text-xs flex-1 truncate font-mono">
                                    {ff.freelancer.pix}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copiarPix(ff.freelancer.pix, ff.freelancer.nome)}
                                    className="gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copiar
                                  </Button>
                                </div>

                                {/* Checkbox de Pagamento */}
                                <div className="flex items-center gap-3 p-2">
                                  <input
                                    type="checkbox"
                                    id={`pago-${ff.id}`}
                                    checked={isPago}
                                    onChange={() =>
                                      togglePagamento(festa.id, ff.freelancer.id, ff.status_pagamento)
                                    }
                                    disabled={processando === ff.freelancer.id}
                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                  />
                                  <label
                                    htmlFor={`pago-${ff.id}`}
                                    className="font-medium cursor-pointer select-none"
                                  >
                                    {isPago ? (
                                      <span className="text-green-600 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Pagamento Confirmado
                                      </span>
                                    ) : (
                                      <span className="text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Marcar como pago
                                      </span>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Informações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Como funciona</h3>
          {viewMode === "por-festa" ? (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• As festas aparecem aqui automaticamente após a data/horário programado</li>
              <li>• Clique em "Copiar" para copiar a chave PIX do freelancer</li>
              <li>• Após realizar o pagamento, marque a caixinha para confirmar</li>
              <li>• Quando todos os freelancers forem pagos, a festa sairá desta lista</li>
              <li>• Use a visualização "Por Freelancer" para pagar todos os valores de um freelancer de uma vez</li>
            </ul>
          ) : (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Veja o total devido a cada freelancer somando todas as festas</li>
              <li>• Clique em "Copiar" para copiar a chave PIX e fazer um único pagamento</li>
              <li>• Marque a caixinha para confirmar o pagamento de TODAS as festas do freelancer</li>
              <li>• Clique em "Detalhes das festas" para ver o valor individual de cada festa</li>
              <li>• Use a visualização "Por Festa" para pagamentos individuais</li>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

