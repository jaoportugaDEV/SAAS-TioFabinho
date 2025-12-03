"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Freelancer } from "@/types";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface StepFreelancersProps {
  formData: any;
  setFormData: (data: any) => void;
}

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  outros: "Outros",
};

export function StepFreelancers({ formData, setFormData }: StepFreelancersProps) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from("freelancers")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setFreelancers(data || []);
    } catch (error) {
      console.error("Erro ao carregar freelancers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFreelancer = (id: string) => {
    const selected = formData.freelancers || [];
    if (selected.includes(id)) {
      setFormData({
        ...formData,
        freelancers: selected.filter((fid: string) => fid !== id),
      });
    } else {
      setFormData({
        ...formData,
        freelancers: [...selected, id],
      });
    }
  };

  const isSelected = (id: string) => {
    return (formData.freelancers || []).includes(id);
  };

  const isAvailable = (freelancer: Freelancer) => {
    if (!formData.data) return true;
    
    // Se o freelancer usa o novo sistema de dias da semana
    if (freelancer.dias_semana_disponiveis && freelancer.dias_semana_disponiveis.length > 0) {
      // Pegar o dia da semana da data da festa (0=Domingo, 6=Sábado)
      const diaSemanaFesta = new Date(formData.data + "T00:00:00").getDay();
      return freelancer.dias_semana_disponiveis.includes(diaSemanaFesta);
    }
    
    // Fallback para o sistema antigo de datas exatas (compatibilidade)
    return freelancer.dias_disponiveis?.includes(formData.data) || false;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Carregando freelancers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Selecionar Equipe</h2>
        <p className="text-sm text-gray-600 mt-1">
          Escolha os freelancers que trabalharão nesta festa
          {formData.data && " (mostrando disponibilidade para a data selecionada)"}
        </p>
      </div>
      
      {freelancers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Nenhum freelancer cadastrado ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {freelancers.map((freelancer) => {
            const selected = isSelected(freelancer.id);
            const available = isAvailable(freelancer);

            return (
              <div
                key={freelancer.id}
                onClick={() => toggleFreelancer(freelancer.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                } ${!available ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {selected ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <Avatar className="w-12 h-12">
                    {freelancer.foto_url ? (
                      <AvatarImage src={freelancer.foto_url} alt={freelancer.nome} />
                    ) : (
                      <AvatarFallback className="bg-primary text-white">
                        {freelancer.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {freelancer.nome}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {funcaoLabels[freelancer.funcao]}
                      </Badge>
                      {!available && (
                        <Badge variant="destructive" className="text-xs">
                          Indisponível
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Você pode pular esta etapa e adicionar freelancers depois na página de detalhes da festa.
        </p>
      </div>
    </div>
  );
}

