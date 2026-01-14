"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getClienteById, updateCliente, toggleClienteStatus } from "@/app/actions/clientes";
import { ClienteForm } from "@/components/clientes/cliente-form";

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCliente();
  }, [params.id]);

  const loadCliente = async () => {
    try {
      const result = await getClienteById(params.id as string);
      if (result.success) {
        setCliente(result.data);
      } else {
        alert("Cliente não encontrado");
        router.push("/dashboard/clientes");
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      alert("Erro ao carregar cliente");
      router.push("/dashboard/clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    
    try {
      const result = await updateCliente(params.id as string, data);
      
      if (result.success) {
        alert("Cliente atualizado com sucesso!");
        router.push(`/dashboard/clientes/${params.id}`);
        router.refresh();
      } else {
        alert(`Erro ao atualizar cliente: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!cliente) return;
    
    const novoStatus = !cliente.ativo;
    const confirmacao = confirm(
      `Deseja realmente ${novoStatus ? "ativar" : "desativar"} este cliente?`
    );
    
    if (!confirmacao) return;
    
    try {
      const result = await toggleClienteStatus(params.id as string, novoStatus);
      
      if (result.success) {
        alert(`Cliente ${novoStatus ? "ativado" : "desativado"} com sucesso!`);
        setCliente({ ...cliente, ativo: novoStatus });
      } else {
        alert(`Erro ao alterar status: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  if (loading || !cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clientes/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-500 mt-1">
            Atualize as informações de {cliente.nome}
          </p>
        </div>
        <Button
          variant={cliente.ativo ? "destructive" : "default"}
          onClick={handleToggleStatus}
        >
          {cliente.ativo ? "Desativar Cliente" : "Ativar Cliente"}
        </Button>
      </div>

      {/* Formulário */}
      <ClienteForm 
        cliente={cliente} 
        onSubmit={handleSubmit} 
        submitLabel="Salvar Alterações" 
        loading={saving} 
      />

      {/* Aviso */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Atenção</h3>
        <p className="text-sm text-yellow-800">
          Ao alterar o telefone do cliente, todas as festas vinculadas continuarão associadas a ele. 
          Os dados das festas antigas não serão alterados automaticamente.
        </p>
      </div>
    </div>
  );
}
