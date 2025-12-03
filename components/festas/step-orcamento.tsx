"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, calcularTotalOrcamento } from "@/lib/utils";

interface StepOrcamentoProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function StepOrcamento({ formData, setFormData }: StepOrcamentoProps) {
  const [novoItem, setNovoItem] = useState({
    descricao: "",
    quantidade: 1,
    valor_unitario: 0,
  });

  const adicionarItem = () => {
    if (!novoItem.descricao || novoItem.valor_unitario <= 0) {
      alert("Preencha a descrição e o valor unitário");
      return;
    }

    setFormData({
      ...formData,
      orcamento: {
        ...formData.orcamento,
        itens: [...formData.orcamento.itens, novoItem],
      },
    });

    setNovoItem({ descricao: "", quantidade: 1, valor_unitario: 0 });
  };

  const removerItem = (index: number) => {
    const novosItens = formData.orcamento.itens.filter(
      (_: any, i: number) => i !== index
    );
    setFormData({
      ...formData,
      orcamento: {
        ...formData.orcamento,
        itens: novosItens,
      },
    });
  };

  const total = calcularTotalOrcamento(
    formData.orcamento.itens,
    formData.orcamento.desconto,
    formData.orcamento.acrescimo
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orçamento</h2>
        <p className="text-sm text-gray-600 mt-1">
          Adicione os itens que compõem o orçamento da festa
        </p>
      </div>

      {/* Adicionar Item */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-900">Adicionar Item</h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={novoItem.descricao}
              onChange={(e) =>
                setNovoItem({ ...novoItem, descricao: e.target.value })
              }
              placeholder="Ex: Decoração, Bolo, Salgados"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="quantidade">Qtd</Label>
            <Input
              type="number"
              id="quantidade"
              min="1"
              value={novoItem.quantidade}
              onChange={(e) =>
                setNovoItem({
                  ...novoItem,
                  quantidade: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="valor_unitario">Valor Unit.</Label>
            <Input
              type="number"
              id="valor_unitario"
              min="0"
              step="0.01"
              value={novoItem.valor_unitario}
              onChange={(e) =>
                setNovoItem({
                  ...novoItem,
                  valor_unitario: Number(e.target.value),
                })
              }
              placeholder="0.00"
            />
          </div>
          <div className="sm:col-span-1 flex items-end">
            <Button type="button" onClick={adicionarItem} className="w-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      {formData.orcamento.itens.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Itens do Orçamento</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-center p-3">Qtd</th>
                  <th className="text-right p-3">Valor Unit.</th>
                  <th className="text-right p-3">Subtotal</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.orcamento.itens.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="p-3">{item.descricao}</td>
                    <td className="text-center p-3">{item.quantidade}</td>
                    <td className="text-right p-3">
                      {formatCurrency(item.valor_unitario)}
                    </td>
                    <td className="text-right p-3 font-semibold">
                      {formatCurrency(item.quantidade * item.valor_unitario)}
                    </td>
                    <td className="p-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Desconto e Acréscimo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="desconto">Desconto (R$)</Label>
          <Input
            type="number"
            id="desconto"
            min="0"
            step="0.01"
            value={formData.orcamento.desconto}
            onChange={(e) =>
              setFormData({
                ...formData,
                orcamento: {
                  ...formData.orcamento,
                  desconto: Number(e.target.value),
                },
              })
            }
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acrescimo">Acréscimo (R$)</Label>
          <Input
            type="number"
            id="acrescimo"
            min="0"
            step="0.01"
            value={formData.orcamento.acrescimo}
            onChange={(e) =>
              setFormData({
                ...formData,
                orcamento: {
                  ...formData.orcamento,
                  acrescimo: Number(e.target.value),
                },
              })
            }
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Forma de Pagamento</h3>
        
        <div className="space-y-2">
          <Label htmlFor="forma_pagamento">Tipo de Pagamento</Label>
          <select
            id="forma_pagamento"
            value={formData.orcamento.forma_pagamento || 'avista'}
            onChange={(e) =>
              setFormData({
                ...formData,
                orcamento: {
                  ...formData.orcamento,
                  forma_pagamento: e.target.value,
                  quantidade_parcelas: e.target.value === 'avista' ? 1 : (formData.orcamento.quantidade_parcelas || 2),
                },
              })
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="avista">À Vista</option>
            <option value="parcelado">Parcelado</option>
          </select>
        </div>

        {formData.orcamento.forma_pagamento === 'parcelado' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="quantidade_parcelas">Quantidade de Parcelas</Label>
              <Input
                type="number"
                id="quantidade_parcelas"
                min="2"
                max="12"
                value={formData.orcamento.quantidade_parcelas || 2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orcamento: {
                      ...formData.orcamento,
                      quantidade_parcelas: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrada">Entrada (R$) - Opcional</Label>
              <Input
                type="number"
                id="entrada"
                min="0"
                step="0.01"
                value={formData.orcamento.entrada || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orcamento: {
                      ...formData.orcamento,
                      entrada: Number(e.target.value),
                    },
                  })
                }
                placeholder="0.00"
              />
            </div>
            {formData.orcamento.quantidade_parcelas > 1 && (
              <div className="sm:col-span-2 text-sm text-gray-700">
                <p className="font-semibold mb-1">Resumo do Parcelamento:</p>
                <p>
                  • Entrada: {formatCurrency(formData.orcamento.entrada || 0)}
                </p>
                <p>
                  • Valor a parcelar: {formatCurrency(total - (formData.orcamento.entrada || 0))}
                </p>
                <p>
                  • {formData.orcamento.quantidade_parcelas}x de{' '}
                  {formatCurrency((total - (formData.orcamento.entrada || 0)) / formData.orcamento.quantidade_parcelas)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Valor Total:
          </span>
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Você pode adicionar itens ao orçamento mais tarde na página de detalhes da festa.
        </p>
      </div>
    </div>
  );
}

