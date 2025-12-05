"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, Copy, CheckCircle, Clock, Calendar } from "lucide-react";
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

export default function PagamentosPage() {
  const searchParams = useSearchParams();
  const [festas, setFestas] = useState<FestaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [highlightFestaId, setHighlightFestaId] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" />
          Pagamentos Pendentes
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie os pagamentos dos freelancers das festas já realizadas
        </p>
      </div>

      {/* Lista de Festas */}
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
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• As festas aparecem aqui automaticamente após a data/horário programado</li>
            <li>• Clique em "Copiar" para copiar a chave PIX do freelancer</li>
            <li>• Após realizar o pagamento, marque a caixinha para confirmar</li>
            <li>• Quando todos os freelancers forem pagos, a festa sairá desta lista</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

