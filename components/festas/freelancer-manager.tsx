"use client";

import { useState } from "react";
import { Freelancer, FestaFreelancer } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, Users, MessageCircle, CheckCircle, Clock, Phone } from "lucide-react";
import { formatPhone, whatsappLink } from "@/lib/utils";
import {
  addFreelancerToFesta,
  removeFreelancerFromFesta,
  updateFreelancerConfirmacao,
} from "@/app/actions/festas";

interface FreelancerManagerProps {
  festaId: string;
  festaFreelancers: (FestaFreelancer & { freelancer: Freelancer })[];
  availableFreelancers: Freelancer[];
}

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  outros: "Outros",
};

const funcaoColors: Record<string, string> = {
  monitor: "bg-blue-100 text-blue-800",
  cozinheira: "bg-purple-100 text-purple-800",
  fotografo: "bg-green-100 text-green-800",
  outros: "bg-gray-100 text-gray-800",
};

export function FreelancerManager({
  festaId,
  festaFreelancers: initialFestaFreelancers,
  availableFreelancers: initialAvailableFreelancers,
}: FreelancerManagerProps) {
  const [festaFreelancers, setFestaFreelancers] = useState(initialFestaFreelancers);
  const [availableFreelancers, setAvailableFreelancers] = useState(initialAvailableFreelancers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddFreelancer = async (freelancerId: string) => {
    setLoading(true);
    const result = await addFreelancerToFesta(festaId, freelancerId);

    if (result.success) {
      // Recarrega a página para atualizar os dados
      window.location.reload();
    } else {
      alert("Erro ao adicionar freelancer. Tente novamente.");
    }

    setLoading(false);
  };

  const handleRemoveFreelancer = async (freelancerId: string) => {
    if (!confirm("Tem certeza que deseja remover este freelancer da festa?")) {
      return;
    }

    setLoading(true);
    const result = await removeFreelancerFromFesta(festaId, freelancerId);

    if (result.success) {
      setFestaFreelancers(festaFreelancers.filter(f => f.freelancer_id !== freelancerId));
      
      // Adiciona de volta à lista de disponíveis
      const removedFreelancer = festaFreelancers.find(f => f.freelancer_id === freelancerId);
      if (removedFreelancer) {
        setAvailableFreelancers([...availableFreelancers, removedFreelancer.freelancer]);
      }
    } else {
      alert("Erro ao remover freelancer. Tente novamente.");
    }

    setLoading(false);
  };

  const handleToggleConfirmacao = async (freelancerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "confirmado" ? "pendente" : "confirmado";
    
    // Atualiza localmente para feedback imediato
    setFestaFreelancers(festaFreelancers.map(f => 
      f.freelancer_id === freelancerId 
        ? { ...f, status_confirmacao: newStatus as "pendente" | "confirmado" } 
        : f
    ));

    const result = await updateFreelancerConfirmacao(festaId, freelancerId, newStatus as "pendente" | "confirmado");

    if (!result.success) {
      // Reverte se falhar
      setFestaFreelancers(festaFreelancers.map(f => 
        f.freelancer_id === freelancerId 
          ? { ...f, status_confirmacao: currentStatus as "pendente" | "confirmado" } 
          : f
      ));
      alert("Erro ao atualizar status. Tente novamente.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipe da Festa
          </span>
          <Button
            onClick={() => setShowAddDialog(!showAddDialog)}
            size="sm"
            variant={showAddDialog ? "secondary" : "default"}
          >
            {showAddDialog ? "Cancelar" : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dialog para adicionar freelancer */}
        {showAddDialog && (
          <div className="border-2 border-dashed border-primary rounded-lg p-4 space-y-3 bg-gray-50">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Freelancers Disponíveis
            </h4>
            {availableFreelancers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Todos os freelancers ativos já estão vinculados a esta festa.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-white hover:shadow-md transition-all"
                  >
                    <Avatar className="w-14 h-14">
                      {freelancer.foto_url ? (
                        <AvatarImage 
                          src={freelancer.foto_url} 
                          alt={freelancer.nome}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                          {freelancer.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-semibold text-base truncate">{freelancer.nome}</p>
                        <Badge className={funcaoColors[freelancer.funcao] + " text-xs mt-1"}>
                          {funcaoLabels[freelancer.funcao]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{formatPhone(freelancer.whatsapp)}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => window.open(whatsappLink(freelancer.whatsapp), "_blank")}
                          title="Enviar mensagem no WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span className="text-xs">WhatsApp</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddFreelancer(freelancer.id)}
                          disabled={loading}
                          className="flex-1 gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-xs">Adicionar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lista de freelancers da festa */}
        {festaFreelancers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhum freelancer vinculado a esta festa.</p>
            <p className="text-xs mt-1">Clique em "Adicionar" para vincular freelancers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {festaFreelancers.map((festaFreelancer) => {
              const isConfirmado = festaFreelancer.status_confirmacao === "confirmado";
              
              return (
                <div
                  key={festaFreelancer.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <Avatar className="w-14 h-14">
                    {festaFreelancer.freelancer.foto_url ? (
                      <AvatarImage 
                        src={festaFreelancer.freelancer.foto_url}
                        alt={festaFreelancer.freelancer.nome}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                        {festaFreelancer.freelancer.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-base">{festaFreelancer.freelancer.nome}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{formatPhone(festaFreelancer.freelancer.whatsapp)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={funcaoColors[festaFreelancer.freelancer.funcao] + " text-xs"}>
                        {funcaoLabels[festaFreelancer.freelancer.funcao]}
                      </Badge>
                      <Badge 
                        className={`text-xs cursor-pointer transition-colors ${
                          isConfirmado 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                        onClick={() => handleToggleConfirmacao(
                          festaFreelancer.freelancer_id, 
                          festaFreelancer.status_confirmacao
                        )}
                        title={isConfirmado ? "Clique para marcar como pendente" : "Clique para confirmar"}
                      >
                        {isConfirmado ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(whatsappLink(festaFreelancer.freelancer.whatsapp), "_blank")}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      title="Enviar mensagem no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFreelancer(festaFreelancer.freelancer_id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remover da festa"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

