"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClienteComEstatisticas } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { getClientes } from "@/app/actions/clientes";
import { ClienteCard } from "@/components/clientes/cliente-card";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteComEstatisticas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const result = await getClientes();
      if (result.success) {
        setClientes(result.data);
      } else {
        console.error("Erro ao carregar clientes:", result.error);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    // Filtro de busca por texto
    const matchesSearch = 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por status
    const matchesStatus = 
      statusFilter === "todos" ||
      (statusFilter === "ativos" && cliente.ativo) ||
      (statusFilter === "inativos" && !cliente.ativo);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gerencie seus clientes e histórico de festas
          </p>
        </div>
        <Link href="/dashboard/clientes/novo" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Badge
          variant={statusFilter === "todos" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "todos" 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "hover:bg-gray-100"
          }`}
          onClick={() => setStatusFilter("todos")}
        >
          Todos
        </Badge>
        <Badge
          variant={statusFilter === "ativos" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "ativos" 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "hover:bg-green-50"
          }`}
          onClick={() => setStatusFilter("ativos")}
        >
          Ativos
        </Badge>
        <Badge
          variant={statusFilter === "inativos" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            statusFilter === "inativos" 
              ? "bg-gray-500 text-white hover:bg-gray-600" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => setStatusFilter("inativos")}
        >
          Inativos
        </Badge>
      </div>

      {/* Contador */}
      <div className="text-sm text-gray-600">
        {filteredClientes.length} {filteredClientes.length === 1 ? "cliente encontrado" : "clientes encontrados"}
      </div>

      {/* Lista de Clientes */}
      {filteredClientes.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm
              ? "Nenhum cliente encontrado"
              : "Nenhum cliente cadastrado ainda"}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/clientes/novo" className="inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredClientes.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}
    </div>
  );
}
