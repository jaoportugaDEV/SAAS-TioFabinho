"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Info } from "lucide-react";

interface ValorComBonusProps {
  valorBase: number;
  valorBonus?: number;
  motivoBonus?: string | null;
  showDetalhes?: boolean; // se true, mostra detalhamento completo
  compact?: boolean; // modo compacto para listas
}

export function ValorComBonusDisplay({
  valorBase,
  valorBonus = 0,
  motivoBonus,
  showDetalhes = false,
  compact = false,
}: ValorComBonusProps) {
  const temBonus = (valorBonus || 0) > 0;
  const valorTotal = valorBase + (valorBonus || 0);

  // Modo compacto - apenas o total com ícone se tiver bônus
  if (compact && !showDetalhes) {
    return (
      <div className="flex items-center gap-1.5">
        {temBonus && (
          <DollarSign className="w-4 h-4 text-green-600" title="Possui bônus" />
        )}
        <span className={`font-semibold ${temBonus ? "text-green-700" : ""}`}>
          {formatCurrency(valorTotal)}
        </span>
        {temBonus && motivoBonus && (
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-2.5 whitespace-nowrap">
                {motivoBonus}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sem bônus - exibição simples
  if (!temBonus) {
    return (
      <div className="text-sm">
        <span className="font-semibold">{formatCurrency(valorBase)}</span>
      </div>
    );
  }

  // Com bônus - exibição detalhada
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <DollarSign className="w-3 h-3 mr-1" />
          Com Bônus
        </Badge>
      </div>
      
      <div className="text-sm space-y-0.5">
        <div className="flex items-center justify-between text-gray-600">
          <span>Valor Base:</span>
          <span className="font-medium">{formatCurrency(valorBase)}</span>
        </div>
        <div className="flex items-center justify-between text-green-700">
          <span>Bônus:</span>
          <span className="font-medium">+ {formatCurrency(valorBonus)}</span>
        </div>
        {motivoBonus && (
          <div className="text-xs text-gray-500 italic mt-1 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{motivoBonus}</span>
          </div>
        )}
        <div className="border-t pt-1 mt-1.5 flex items-center justify-between font-semibold text-base">
          <span>Total:</span>
          <span className="text-green-700">{formatCurrency(valorTotal)}</span>
        </div>
      </div>
    </div>
  );
}
