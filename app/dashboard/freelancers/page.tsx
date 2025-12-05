"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Freelancer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, MessageCircle, Edit, Trash2 } from "lucide-react";
import { formatPhone, whatsappLink } from "@/lib/utils";

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

const funcaoCores: Record<string, string> = {
  monitor: "bg-blue-500 text-white border-blue-500",
  cozinheira: "bg-purple-500 text-white border-purple-500",
  fotografo: "bg-pink-500 text-white border-pink-500",
  garcom: "bg-green-500 text-white border-green-500",
  recepcao: "bg-orange-500 text-white border-orange-500",
  outros: "bg-gray-500 text-white border-gray-500",
};

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [funcaoFilter, setFuncaoFilter] = useState<string>("todos");
  const supabase = createClient();

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from("freelancers")
        .select("*")
        .order("nome");

      if (error) throw error;
      setFreelancers(data || []);
    } catch (error) {
      console.error("Erro ao carregar freelancers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este freelancer?")) return;

    try {
      const { error } = await supabase
        .from("freelancers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setFreelancers(freelancers.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erro ao excluir freelancer:", error);
      alert("Erro ao excluir freelancer");
    }
  };

  const filteredFreelancers = freelancers.filter((f) => {
    // Filtro de busca por texto
    const matchesSearch = 
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.funcao.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por função
    const matchesFuncao = funcaoFilter === "todos" || f.funcao === funcaoFilter;
    
    return matchesSearch && matchesFuncao;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando freelancers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Freelancers</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
            Gerencie sua equipe de monitores, cozinheiras, fotógrafos, garçons e recepcionistas
          </p>
        </div>
        <Link href="/dashboard/freelancers/novo" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Novo Freelancer
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nome ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros por Função */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Badge
          variant={funcaoFilter === "todos" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "todos" 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "hover:bg-gray-100"
          }`}
          onClick={() => setFuncaoFilter("todos")}
        >
          Todos
        </Badge>
        <Badge
          variant={funcaoFilter === "monitor" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "monitor" 
              ? "bg-blue-500 text-white hover:bg-blue-600" 
              : "hover:bg-blue-50"
          }`}
          onClick={() => setFuncaoFilter("monitor")}
        >
          Monitor
        </Badge>
        <Badge
          variant={funcaoFilter === "cozinheira" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "cozinheira" 
              ? "bg-purple-500 text-white hover:bg-purple-600" 
              : "hover:bg-purple-50"
          }`}
          onClick={() => setFuncaoFilter("cozinheira")}
        >
          Cozinheira
        </Badge>
        <Badge
          variant={funcaoFilter === "fotografo" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "fotografo" 
              ? "bg-pink-500 text-white hover:bg-pink-600" 
              : "hover:bg-pink-50"
          }`}
          onClick={() => setFuncaoFilter("fotografo")}
        >
          Fotógrafo
        </Badge>
        <Badge
          variant={funcaoFilter === "garcom" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "garcom" 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "hover:bg-green-50"
          }`}
          onClick={() => setFuncaoFilter("garcom")}
        >
          Garçom
        </Badge>
        <Badge
          variant={funcaoFilter === "recepcao" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "recepcao" 
              ? "bg-orange-500 text-white hover:bg-orange-600" 
              : "hover:bg-orange-50"
          }`}
          onClick={() => setFuncaoFilter("recepcao")}
        >
          Recepção
        </Badge>
        <Badge
          variant={funcaoFilter === "outros" ? "default" : "outline"}
          className={`cursor-pointer transition-all text-xs sm:text-sm px-2 py-1 ${
            funcaoFilter === "outros" 
              ? "bg-gray-500 text-white hover:bg-gray-600" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => setFuncaoFilter("outros")}
        >
          Outros
        </Badge>
      </div>

      {/* Lista de Freelancers */}
      {filteredFreelancers.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm
              ? "Nenhum freelancer encontrado"
              : "Nenhum freelancer cadastrado ainda"}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/freelancers/novo" className="inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Freelancer
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                  {freelancer.foto_url ? (
                    <AvatarImage src={freelancer.foto_url} alt={freelancer.nome} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white text-base sm:text-lg">
                      {freelancer.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                    {freelancer.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge 
                      className={`text-xs ${funcaoCores[freelancer.funcao] || funcaoCores.outros}`}
                    >
                      {funcaoLabels[freelancer.funcao]}
                    </Badge>
                    <Badge 
                      variant={freelancer.ativo ? "default" : "destructive"}
                      className={`text-xs ${freelancer.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      {freelancer.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    {formatPhone(freelancer.whatsapp)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  onClick={() => window.open(whatsappLink(freelancer.whatsapp), "_blank")}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">WhatsApp</span>
                </Button>
                <Link href={`/dashboard/freelancers/${freelancer.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(freelancer.id)}
                  className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir freelancer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

