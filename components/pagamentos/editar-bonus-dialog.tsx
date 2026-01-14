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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold">Editar Bônus</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Freelancer: <span className="font-medium">{freelancerNome}</span>
            </p>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Valor Base (Read-only) */}
            <div>
              <Label className="text-xs sm:text-sm">Valor Base (Acordado)</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border text-sm font-medium">
                {formatCurrency(valorBase)}
              </div>
            </div>

            {/* Valor do Bônus */}
            <div>
              <Label htmlFor="valor-bonus" className="text-xs sm:text-sm">
                Valor do Bônus <span className="text-gray-500">(opcional)</span>
              </Label>
              <Input
                id="valor-bonus"
                type="number"
                min="0"
                step="0.01"
                value={valorBonus}
                onChange={(e) => setValorBonus(e.target.value)}
                placeholder="0.00"
                className="mt-1"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite 0 para remover o bônus
              </p>
            </div>

            {/* Motivo do Bônus */}
            <div>
              <Label htmlFor="motivo-bonus" className="text-xs sm:text-sm">
                Motivo do Bônus <span className="text-gray-500">(opcional)</span>
              </Label>
              <Textarea
                id="motivo-bonus"
                value={motivoBonus}
                onChange={(e) => setMotivoBonus(e.target.value)}
                placeholder="Ex: Horas extras, Excelente trabalho, etc."
                className="mt-1 resize-none"
                rows={2}
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {motivoBonus.length}/200 caracteres
              </p>
            </div>

            {/* Preview do Total */}
            <div className="border-t pt-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Preview do Pagamento:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Valor Base:</span>
                    <span className="font-medium">{formatCurrency(valorBase)}</span>
                  </div>
                  {valorBonusNumber > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Bônus:</span>
                      <span className="font-medium">+ {formatCurrency(valorBonusNumber)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total a Pagar:</span>
                    <span className="text-green-700">{formatCurrency(valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 sm:p-6 flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleFechar}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Bônus"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
