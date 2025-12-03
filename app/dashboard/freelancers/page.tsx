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

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredFreelancers = freelancers.filter((f) =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Freelancers</h1>
          <p className="text-gray-500 mt-1">
            Gerencie sua equipe de monitores, cozinheiras, fotógrafos, garçons e recepcionistas
          </p>
        </div>
        <Link href="/dashboard/freelancers/novo">
          <Button className="gap-2">
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

      {/* Lista de Freelancers */}
      {filteredFreelancers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Nenhum freelancer encontrado"
              : "Nenhum freelancer cadastrado ainda"}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/freelancers/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Freelancer
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  {freelancer.foto_url ? (
                    <AvatarImage src={freelancer.foto_url} alt={freelancer.nome} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {freelancer.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {freelancer.nome}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {funcaoLabels[freelancer.funcao]}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {formatPhone(freelancer.whatsapp)}
                  </p>
                  {!freelancer.ativo && (
                    <Badge variant="destructive" className="mt-2">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open(whatsappLink(freelancer.whatsapp), "_blank")}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Link href={`/dashboard/freelancers/${freelancer.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(freelancer.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

