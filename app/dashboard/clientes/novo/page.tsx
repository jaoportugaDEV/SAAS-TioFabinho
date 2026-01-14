"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createCliente } from "@/app/actions/clientes";
import { ClienteForm } from "@/components/clientes/cliente-form";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      const result = await createCliente(data);
      
      if (result.success) {
        alert("Cliente cadastrado com sucesso!");
        router.push(`/dashboard/clientes/${result.data.id}`);
        router.refresh();
      } else {
        alert(`Erro ao cadastrar cliente: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clientes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-gray-500 mt-1">
            Cadastre um novo cliente para facilitar o agendamento de festas
          </p>
        </div>
      </div>

      {/* Formulário */}
      <ClienteForm onSubmit={handleSubmit} submitLabel="Cadastrar Cliente" loading={loading} />

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
        <p className="text-sm text-blue-800">
          Apenas o <strong>nome</strong> e <strong>telefone</strong> são obrigatórios. 
          Os demais campos podem ser preenchidos depois, mas quanto mais informações você tiver, 
          melhor será o atendimento ao cliente.
        </p>
      </div>
    </div>
  );
}
