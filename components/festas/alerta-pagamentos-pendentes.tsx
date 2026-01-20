"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface AlertaPagamentosPendentesProps {
  festaId: string;
  freelancersPendentes: Array<{
    id: string;
    nome: string;
    valor: number;
  }>;
  totalPendente: number;
}

export function AlertaPagamentosPendentes({
  festaId,
  freelancersPendentes,
  totalPendente,
}: AlertaPagamentosPendentesProps) {
  if (freelancersPendentes.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Ícone e Título */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-1">
                ⚠️ Pagamentos Pendentes
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                Esta festa possui {freelancersPendentes.length} {freelancersPendentes.length === 1 ? "freelancer" : "freelancers"} aguardando pagamento.
              </p>

              {/* Lista de Freelancers Pendentes */}
              <div className="space-y-2 mb-4">
                {freelancersPendentes.slice(0, 3).map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-900">{freelancer.nome}</span>
                    </div>
                    <span className="font-semibold text-orange-700">
                      {formatCurrency(freelancer.valor)}
                    </span>
                  </div>
                ))}
                
                {freelancersPendentes.length > 3 && (
                  <p className="text-xs text-orange-700 pl-6">
                    + {freelancersPendentes.length - 3} {freelancersPendentes.length - 3 === 1 ? "outro" : "outros"}
                  </p>
                )}
              </div>

              {/* Total Pendente */}
              <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-700" />
                    <span className="text-sm font-medium text-orange-900">Total Pendente:</span>
                  </div>
                  <span className="text-xl font-bold text-orange-900">
                    {formatCurrency(totalPendente)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="w-full sm:w-auto flex-shrink-0">
            <Link href={`/dashboard/pagamentos?festa=${festaId}`} className="block">
              <Button 
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                size="lg"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Ir para Pagamentos
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
