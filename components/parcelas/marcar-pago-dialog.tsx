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
import { ParcelaPagamento } from "@/types";

interface MarcarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaPagamento;
  onSuccess: () => void;
}

export function MarcarPagoDialog({
  open,
  onOpenChange,
  parcela,
  onSuccess,
}: MarcarPagoDialogProps) {
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
      // Atualizar parcela
      const { error: parcelaError } = await supabase
        .from("parcelas_pagamento")
        .update({
          status: "paga",
          data_pagamento: dataPagamento,
          metodo_pagamento: metodoPagamento,
          observacoes: observacoes || null,
        })
        .eq("id", parcela.id);

      if (parcelaError) throw parcelaError;

      // Verificar se todas as parcelas foram pagas para atualizar o orçamento
      const { data: todasParcelas, error: parcelasError } = await supabase
        .from("parcelas_pagamento")
        .select("status")
        .eq("orcamento_id", parcela.orcamento_id);

      if (parcelasError) throw parcelasError;

      const todasPagas = todasParcelas?.every((p) => p.status === "paga");
      const algumaPaga = todasParcelas?.some((p) => p.status === "paga");

      // Atualizar status do orçamento
      let novoStatus: "pendente" | "pago_parcial" | "pago_total" = "pendente";
      if (todasPagas) {
        novoStatus = "pago_total";
      } else if (algumaPaga) {
        novoStatus = "pago_parcial";
      }

      const { error: orcamentoError } = await supabase
        .from("orcamentos")
        .update({ status_pagamento: novoStatus })
        .eq("id", parcela.orcamento_id);

      if (orcamentoError) throw orcamentoError;

      onSuccess();
    } catch (error) {
      console.error("Erro ao marcar parcela como paga:", error);
      alert("Erro ao marcar parcela como paga. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Marcar Parcela como Paga</DialogTitle>
            <DialogDescription>
              Parcela {parcela.numero_parcela} - R$ {Number(parcela.valor).toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pagamento">Método de Pagamento *</Label>
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
              <Label htmlFor="observacoes">Observações (Opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Pagamento recebido via PIX às 14h30"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                ✓ O status do orçamento será atualizado automaticamente
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

