"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/types";
import { ClienteSelector } from "@/components/clientes/cliente-selector";
import { UserCircle, UserPlus } from "lucide-react";

interface StepClienteProps {
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}

export function StepCliente({ formData, setFormData, errors = {} }: StepClienteProps) {
  const [modoCliente, setModoCliente] = useState<"cadastrado" | "novo">(
    formData.cliente_id ? "cadastrado" : "novo"
  );
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    formData.clienteSelecionado || null
  );

  const handleSelectCliente = (cliente: Cliente | null) => {
    setClienteSelecionado(cliente);
    if (cliente) {
      // Preencher dados do formulário com dados do cliente
      setFormData({
        ...formData,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_contato: cliente.whatsapp || cliente.telefone,
        cliente_observacoes: cliente.observacoes || "",
        clienteSelecionado: cliente,
      });
    } else {
      // Limpar seleção
      setFormData({
        ...formData,
        cliente_id: null,
        clienteSelecionado: null,
      });
    }
  };

  const handleModoChange = (modo: "cadastrado" | "novo") => {
    setModoCliente(modo);
    if (modo === "novo") {
      // Limpar cliente selecionado
      setClienteSelecionado(null);
      setFormData({
        ...formData,
        cliente_id: null,
        clienteSelecionado: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Informações do Cliente</h2>
      
      {/* Toggle entre Cliente Cadastrado e Novo */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full sm:w-auto">
        <Button
          type="button"
          variant={modoCliente === "cadastrado" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModoChange("cadastrado")}
          className="flex-1 sm:flex-none gap-2"
        >
          <UserCircle className="w-4 h-4" />
          Cliente Cadastrado
        </Button>
        <Button
          type="button"
          variant={modoCliente === "novo" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModoChange("novo")}
          className="flex-1 sm:flex-none gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Cliente Novo
        </Button>
      </div>

      {modoCliente === "cadastrado" ? (
        <div className="space-y-4">
          <ClienteSelector 
            onSelect={handleSelectCliente} 
            selectedCliente={clienteSelecionado}
          />
          
          {clienteSelecionado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Cliente Selecionado</h3>
              <p className="text-sm text-green-800">
                Os dados deste cliente serão usados automaticamente para esta festa. 
                Você pode adicionar observações específicas desta festa no campo abaixo.
              </p>
            </div>
          )}

          {!clienteSelecionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Como funciona</h3>
              <p className="text-sm text-blue-800">
                Busque um cliente já cadastrado digitando o nome ou telefone. 
                Ao selecionar, os dados serão preenchidos automaticamente.
              </p>
            </div>
          )}

          {/* Observações específicas desta festa */}
          {clienteSelecionado && (
            <div className="space-y-2">
              <Label htmlFor="cliente_observacoes">Observações Específicas desta Festa</Label>
              <Textarea
                id="cliente_observacoes"
                value={formData.cliente_observacoes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_observacoes: e.target.value })
                }
                placeholder="Ex: Preferências especiais para esta festa em particular..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Observações gerais do cliente estão no cadastro dele. Use este campo apenas para informações específicas desta festa.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Cliente Novo</h3>
            <p className="text-sm text-blue-800">
              Este cliente será cadastrado automaticamente no sistema quando você criar a festa. 
              Depois você poderá editar e adicionar mais informações no perfil dele.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_nome">Nome Completo do Cliente *</Label>
            <Input
              id="cliente_nome"
              value={formData.cliente_nome}
              onChange={(e) =>
                setFormData({ ...formData, cliente_nome: e.target.value })
              }
              placeholder="Nome completo"
              required
              className={errors.cliente_nome ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.cliente_nome && (
              <p className="text-sm text-red-600 mt-1">{errors.cliente_nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_contato">Contato (WhatsApp/Telefone) *</Label>
            <Input
              id="cliente_contato"
              value={formData.cliente_contato}
              onChange={(e) =>
                setFormData({ ...formData, cliente_contato: e.target.value })
              }
              placeholder="(18) 99999-9999"
              required
              className={errors.cliente_contato ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.cliente_contato && (
              <p className="text-sm text-red-600 mt-1">{errors.cliente_contato}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_observacoes">Observações</Label>
            <Textarea
              id="cliente_observacoes"
              value={formData.cliente_observacoes}
              onChange={(e) =>
                setFormData({ ...formData, cliente_observacoes: e.target.value })
              }
              placeholder="Informações adicionais, preferências, restrições alimentares, etc."
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Anote aqui qualquer informação importante sobre o cliente ou suas preferências
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

