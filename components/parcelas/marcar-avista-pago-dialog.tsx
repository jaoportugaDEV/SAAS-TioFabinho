"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Orcamento } from "@/types";

interface MarcarAvistaPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orcamento: Orcamento;
  onSuccess: () => void;
}

export function MarcarAvistaPagoDialog({
  open,
  onOpenChange,
  orcamento,
  onSuccess,
}: MarcarAvistaPagoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [observacoes, setObservacoes] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Atualizar orçamento para pago_total
      const { error: orcamentoError } = await supabase
        .from("orcamentos")
        .update({ 
          status_pagamento: "pago_total",
          observacoes: observacoes 
            ? `Pago em ${dataPagamento} via ${metodoPagamento}. ${observacoes}`
            : `Pago em ${dataPagamento} via ${metodoPagamento}`
        })
        .eq("id", orcamento.id);

      if (orcamentoError) throw orcamentoError;

      // Atualizar status_pagamento_cliente na tabela festas
      const { error: festaError } = await supabase
        .from("festas")
        .update({ status_pagamento_cliente: "pago_total" })
        .eq("id", orcamento.festa_id);

      if (festaError) throw festaError;

      onSuccess();
    } catch (error) {
      console.error("Erro ao marcar pagamento como pago:", error);
      alert("Erro ao marcar pagamento como pago. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Marcar Pagamento À Vista como Pago</DialogTitle>
            <DialogDescription className="text-sm">
              Total: R$ {Number(orcamento.total).toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="data_pagamento" className="text-sm">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pagamento" className="text-sm">Método de Pagamento *</Label>
              <select
                id="metodo_pagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm">Observações (Opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Pagamento recebido via PIX às 14h30"
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-blue-900">
                ✓ O status do orçamento será atualizado para "Pago Total"
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto text-sm"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
              {loading ? "Salvando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

