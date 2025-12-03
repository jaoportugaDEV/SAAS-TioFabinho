"use client";

import { useState } from "react";
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
import { criarDespesaGeral } from "@/app/actions/despesas";

interface AdicionarDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdicionarDespesaDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdicionarDespesaDialogProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim() || !valor) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Por favor, insira um valor válido");
      return;
    }

    setSalvando(true);

    const dataHoje = new Date().toISOString().split("T")[0];
    const result = await criarDespesaGeral(
      descricao.trim(),
      valorNumerico,
      dataHoje
    );

    setSalvando(false);

    if (result.success) {
      setDescricao("");
      setValor("");
      onSuccess();
      onOpenChange(false);
    } else {
      alert("Erro ao criar despesa. Tente novamente.");
    }
  };

  const handleClose = () => {
    setDescricao("");
    setValor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Despesa Geral</DialogTitle>
            <DialogDescription>
              Adicione uma despesa geral do negócio (não vinculada a festas)
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Nome da Despesa</Label>
              <Input
                id="descricao"
                placeholder="Ex: Aluguel, Conta de luz, etc."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={salvando}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="text"
                placeholder="0,00"
                value={valor}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d,]/g, "");
                  setValor(val);
                }}
                disabled={salvando}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Adicionar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

