"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ParcelaPagamento, Orcamento } from "@/types";
import { MarcarPagoDialog } from "@/components/parcelas/marcar-pago-dialog";

interface PagamentoManagerProps {
  festaId: string;
  orcamento: Orcamento | null;
}

export function PagamentoManager({ festaId, orcamento }: PagamentoManagerProps) {
  const [parcelas, setParcelas] = useState<ParcelaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcela, setSelectedParcela] = useState<ParcelaPagamento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (orcamento) {
      loadParcelas();
    }
  }, [orcamento]);

  const loadParcelas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("parcelas_pagamento")
        .select("*")
        .eq("festa_id", festaId)
        .order("numero_parcela", { ascending: true });

      if (error) throw error;

      // Atualizar status das parcelas atrasadas
      if (data) {
        const hoje = new Date().toISOString().split('T')[0];
        const parcelasAtualizadas = data.map((parcela) => {
          if (parcela.status === 'pendente' && parcela.data_vencimento < hoje) {
            return { ...parcela, status: 'atrasada' as const };
          }
          return parcela;
        });
        setParcelas(parcelasAtualizadas);
      }
    } catch (error) {
      console.error("Erro ao carregar parcelas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPaga = (parcela: ParcelaPagamento) => {
    setSelectedParcela(parcela);
    setDialogOpen(true);
  };

  const handleParcelaAtualizada = async () => {
    await loadParcelas();
    setDialogOpen(false);
    setSelectedParcela(null);
  };

  const getStatusBadge = (status: string, dataVencimento: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    const isAtrasada = status === 'pendente' && dataVencimento < hoje;

    if (status === 'paga') {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1 text-xs flex-shrink-0">
          <CheckCircle className="w-3 h-3" />
          Paga
        </Badge>
      );
    }

    if (isAtrasada || status === 'atrasada') {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1 text-xs flex-shrink-0">
          <AlertTriangle className="w-3 h-3" />
          Atrasada
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 text-xs flex-shrink-0">
        <Clock className="w-3 h-3" />
        Pendente
      </Badge>
    );
  };

  const calcularProgresso = () => {
    if (parcelas.length === 0) return 0;
    const pagas = parcelas.filter((p) => p.status === 'paga').length;
    return (pagas / parcelas.length) * 100;
  };

  const calcularTotalPago = () => {
    const totalParcelas = parcelas
      .filter((p) => p.status === 'paga')
      .reduce((acc, p) => acc + Number(p.valor), 0);
    
    // Adiciona o valor de entrada se for pagamento parcelado
    const entrada = orcamento?.forma_pagamento === 'parcelado' 
      ? Number(orcamento.entrada || 0) 
      : 0;
    
    return totalParcelas + entrada;
  };

  const calcularTotalPendente = () => {
    return parcelas
      .filter((p) => p.status !== 'paga')
      .reduce((acc, p) => acc + Number(p.valor), 0);
  };

  if (!orcamento) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Nenhum orçamento cadastrado para esta festa.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando informações de pagamento...</p>
        </CardContent>
      </Card>
    );
  }

  const progresso = calcularProgresso();
  const totalPago = calcularTotalPago();
  const totalPendente = calcularTotalPendente();

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Total do Orçamento</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900 truncate">
                R$ {Number(orcamento.total).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Total Pago</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900 truncate">
                R$ {totalPago.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Total Pendente</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-900 truncate">
                R$ {totalPendente.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          {parcelas.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Progresso do Pagamento
                </span>
                <span className="text-xs sm:text-sm text-gray-600">
                  {parcelas.filter((p) => p.status === 'paga').length} de {parcelas.length} pagas
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}

          {/* Informações de Parcelamento */}
          {orcamento.forma_pagamento === 'parcelado' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <h4 className="text-sm sm:text-base font-semibold text-yellow-900 mb-2">Pagamento Parcelado</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-800">
                <p>• Parcelas: {orcamento.quantidade_parcelas}x</p>
                <p>• Entrada: R$ {Number(orcamento.entrada).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Lista de Parcelas */}
          {parcelas.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Parcelas</h4>
              <div className="space-y-2 sm:space-y-3">
                {parcelas.map((parcela) => (
                  <div
                    key={parcela.id}
                    className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-gray-900">
                          Parcela {parcela.numero_parcela}
                        </span>
                        {getStatusBadge(parcela.status, parcela.data_vencimento)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p className="break-words">Valor: R$ {Number(parcela.valor).toFixed(2)}</p>
                        <p className="break-words">Vencimento: {formatDate(parcela.data_vencimento)}</p>
                        {parcela.data_pagamento && (
                          <p className="text-green-600 break-words">
                            Pago em: {formatDate(parcela.data_pagamento)}
                            {parcela.metodo_pagamento && ` - ${parcela.metodo_pagamento}`}
                          </p>
                        )}
                        {parcela.observacoes && (
                          <p className="text-gray-500 italic break-words text-xs">Obs: {parcela.observacoes}</p>
                        )}
                      </div>
                    </div>
                    {parcela.status !== 'paga' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarcarPaga(parcela)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Paga
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                {orcamento.forma_pagamento === 'avista'
                  ? 'Pagamento à vista - Sem parcelas'
                  : 'Nenhuma parcela cadastrada'}
              </p>
              {orcamento.forma_pagamento === 'parcelado' && (
                <p className="text-sm text-gray-500">
                  As parcelas serão criadas automaticamente ao salvar o orçamento.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedParcela && (
        <MarcarPagoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          parcela={selectedParcela}
          onSuccess={handleParcelaAtualizada}
        />
      )}
    </>
  );
}

