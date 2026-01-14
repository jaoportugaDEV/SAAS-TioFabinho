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
import { Select } from "@/components/ui/select";
import { criarDespesaGeral } from "@/app/actions/despesas";
import { CategoriaDespesa, MetodoPagamentoDespesa } from "@/types";
import { ShoppingCart, Gift, Home, MoreHorizontal, CreditCard, Smartphone, Banknote, Wallet } from "lucide-react";

interface AdicionarDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const categoriaOptions: { value: CategoriaDespesa; label: string; icon: any }[] = [
  { value: "mercado_cozinha", label: "Compras Mercado/Cozinha", icon: ShoppingCart },
  { value: "material_festa", label: "Material para Festas", icon: Gift },
  { value: "aluguel_contas", label: "Aluguel e Contas Fixas", icon: Home },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
];

const metodoPagamentoOptions: { value: MetodoPagamentoDespesa; label: string; icon: any; destaque?: boolean }[] = [
  { value: "cartao_empresa", label: "Cartão da Empresa", icon: CreditCard, destaque: true },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "debito", label: "Débito", icon: CreditCard },
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
];

export function AdicionarDespesaDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdicionarDespesaDialogProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState<CategoriaDespesa>("mercado_cozinha");
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamentoDespesa>("cartao_empresa");
  const [fornecedor, setFornecedor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim() || !valor || !data) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Por favor, insira um valor válido");
      return;
    }

    setSalvando(true);

    const result = await criarDespesaGeral(
      descricao.trim(),
      valorNumerico,
      data,
      categoria,
      metodoPagamento,
      fornecedor.trim() || undefined,
      undefined, // nota_fiscal
      undefined  // observacoes
    );

    setSalvando(false);

    if (result.success) {
      setDescricao("");
      setValor("");
      setData(new Date().toISOString().split("T")[0]);
      setCategoria("mercado_cozinha");
      setMetodoPagamento("cartao_empresa");
      setFornecedor("");
      onSuccess();
      onOpenChange(false);
    } else {
      alert("Erro ao criar despesa. Tente novamente.");
    }
  };

  const handleClose = () => {
    setDescricao("");
    setValor("");
    setData(new Date().toISOString().split("T")[0]);
    setCategoria("mercado_cozinha");
    setMetodoPagamento("cartao_empresa");
    setFornecedor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Nova Despesa Geral</DialogTitle>
            <DialogDescription>
              Adicione uma despesa do negócio de forma rápida e fácil
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data" className="text-sm font-semibold">Data da Despesa *</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={salvando}
                required
                className="text-base h-12"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-semibold">Categoria *</Label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}
                disabled={salvando}
                required
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categoriaOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="metodo_pagamento" className="text-sm font-semibold">Método de Pagamento *</Label>
              <select
                id="metodo_pagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value as MetodoPagamentoDespesa)}
                disabled={salvando}
                required
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {metodoPagamentoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.destaque ? "⭐" : ""}
                  </option>
                ))}
              </select>
              {metodoPagamento === "cartao_empresa" && (
                <p className="text-xs text-primary font-medium mt-1">
                  ⭐ Este valor será incluído no relatório fiscal
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-semibold">Descrição da Despesa *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Frutas e verduras, Copos descartáveis, etc."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={salvando}
                required
                className="text-base h-12"
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-semibold">Valor (R$) *</Label>
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
                className="text-base h-12 text-lg font-semibold"
              />
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="fornecedor" className="text-sm font-semibold">
                Fornecedor/Estabelecimento <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="fornecedor"
                placeholder="Ex: Supermercado ABC, Loja XYZ"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                disabled={salvando}
                className="text-base h-12"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={salvando}
              className="h-11"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="h-11 px-6">
              {salvando ? "Salvando..." : "Adicionar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
