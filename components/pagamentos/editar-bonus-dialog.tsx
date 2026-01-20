"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { updateBonusFreelancerFesta } from "@/app/actions/pagamentos";
import { DollarSign, Loader2 } from "lucide-react";

interface EditarBonusDialogProps {
  open: boolean;
  onClose: () => void;
  festaId: string;
  freelancerId: string;
  freelancerNome: string;
  valorBase: number;
  valorBonusAtual: number;
  motivoBonusAtual?: string | null;
  onSuccess: (freelancerId: string, novoValorBonus: number, novoMotivoBonus?: string | null) => void;
}

export function EditarBonusDialog({
  open,
  onClose,
  festaId,
  freelancerId,
  freelancerNome,
  valorBase,
  valorBonusAtual,
  motivoBonusAtual,
  onSuccess,
}: EditarBonusDialogProps) {
  const [valorBonus, setValorBonus] = useState<string>(
    valorBonusAtual ? valorBonusAtual.toString() : "0"
  );
  const [motivoBonus, setMotivoBonus] = useState<string>(motivoBonusAtual || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valorBonusNumber = parseFloat(valorBonus) || 0;
  const valorTotal = valorBase + valorBonusNumber;

  const handleSalvar = async () => {
    // Validação
    if (valorBonusNumber < 0) {
      setError("O valor do bônus não pode ser negativo");
      return;
    }

    // Sugerir motivo para bônus > R$ 50
    if (valorBonusNumber > 50 && !motivoBonus.trim()) {
      const confirmar = confirm(
        "Você está adicionando um bônus de " + formatCurrency(valorBonusNumber) + 
        " sem especificar um motivo. Deseja continuar assim mesmo?"
      );
      if (!confirmar) return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateBonusFreelancerFesta(
        festaId,
        freelancerId,
        valorBonusNumber,
        motivoBonus.trim() || null
      );

      if (result.success) {
        onSuccess(freelancerId, valorBonusNumber, motivoBonus.trim() || null);
        onClose();
      } else {
        setError(result.error || "Erro ao salvar bônus");
      }
    } catch (err) {
      setError("Erro inesperado ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    if (!loading) {
      setValorBonus(valorBonusAtual ? valorBonusAtual.toString() : "0");
      setMotivoBonus(motivoBonusAtual || "");
      setError(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">Editar Bônus</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              <span className="hidden sm:inline">Freelancer: </span>
              <span className="font-medium">{freelancerNome}</span>
            </p>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {/* Valor Base (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium">Valor Base</Label>
              <div className="p-2.5 sm:p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Acordado:</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {formatCurrency(valorBase)}
                  </span>
                </div>
              </div>
            </div>

            {/* Valor do Bônus */}
            <div className="space-y-1.5">
              <Label htmlFor="valor-bonus" className="text-xs sm:text-sm font-medium">
                Valor do Bônus <span className="text-gray-500 font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <Input
                  id="valor-bonus"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorBonus}
                  onChange={(e) => setValorBonus(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 text-sm sm:text-base"
                  disabled={loading}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <p className="text-xs text-gray-500">
                💡 Digite 0 para remover o bônus
              </p>
            </div>

            {/* Motivo do Bônus */}
            <div className="space-y-1.5">
              <Label htmlFor="motivo-bonus" className="text-xs sm:text-sm font-medium">
                Motivo do Bônus <span className="text-gray-500 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="motivo-bonus"
                value={motivoBonus}
                onChange={(e) => setMotivoBonus(e.target.value)}
                placeholder="Ex: Horas extras, Excelente trabalho..."
                className="resize-none text-sm"
                rows={2}
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {motivoBonus.length}/200 caracteres
              </p>
            </div>

            {/* Preview do Total */}
            <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-600 mb-2.5 font-medium">Preview do Pagamento:</p>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Valor Base:</span>
                    <span className="font-semibold">{formatCurrency(valorBase)}</span>
                  </div>
                  {valorBonusNumber > 0 && (
                    <div className="flex justify-between items-center text-green-700">
                      <span>Bônus:</span>
                      <span className="font-semibold">+ {formatCurrency(valorBonusNumber)}</span>
                    </div>
                  )}
                  <div className="border-t border-green-300 pt-2 mt-2 flex justify-between items-center font-bold text-sm sm:text-base">
                    <span>Total a Pagar:</span>
                    <span className="text-green-700 text-base sm:text-lg">{formatCurrency(valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2.5 sm:p-3 text-xs sm:text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleFechar}
              disabled={loading}
              className="w-full sm:flex-1 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={loading}
              className="w-full sm:flex-1 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Salvar Bônus
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
