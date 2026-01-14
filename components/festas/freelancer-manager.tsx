"use client";

import { useState } from "react";
import { Freelancer, FestaFreelancer } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, Users, MessageCircle, CheckCircle, Clock, Phone, AlertTriangle, DollarSign } from "lucide-react";
import { formatPhone, whatsappLink } from "@/lib/utils";
import {
  addFreelancerToFesta,
  removeFreelancerFromFesta,
  updateFreelancerConfirmacao,
} from "@/app/actions/festas";
import { ValorComBonusDisplay } from "@/components/pagamentos/valor-com-bonus";
import { EditarBonusDialog } from "@/components/pagamentos/editar-bonus-dialog";

interface FreelancerManagerProps {
  festaId: string;
  festaData: string; // Data da festa no formato ISO (YYYY-MM-DD)
  festaFreelancers: (FestaFreelancer & { freelancer: Freelancer })[];
  availableFreelancers: Freelancer[];
}

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

const funcaoColors: Record<string, string> = {
  monitor: "bg-blue-100 text-blue-800",
  cozinheira: "bg-purple-100 text-purple-800",
  fotografo: "bg-green-100 text-green-800",
  garcom: "bg-orange-100 text-orange-800",
  recepcao: "bg-pink-100 text-pink-800",
  outros: "bg-gray-100 text-gray-800",
};

export function FreelancerManager({
  festaId,
  festaData,
  festaFreelancers: initialFestaFreelancers,
  availableFreelancers: initialAvailableFreelancers,
}: FreelancerManagerProps) {
  const [festaFreelancers, setFestaFreelancers] = useState(initialFestaFreelancers);
  const [availableFreelancers, setAvailableFreelancers] = useState(initialAvailableFreelancers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtroFuncao, setFiltroFuncao] = useState<string>("todos");
  
  // Estado para dialog de edição de bônus
  const [editandoBonus, setEditandoBonus] = useState<{
    freelancerId: string;
    freelancerNome: string;
    valorBase: number;
    valorBonusAtual: number;
    motivoBonusAtual?: string | null;
  } | null>(null);

  // Verifica se o freelancer está disponível na data da festa
  const isAvailable = (freelancer: Freelancer): boolean => {
    if (!festaData) return true;
    
    // Se o freelancer usa o sistema de dias da semana
    if (freelancer.dias_semana_disponiveis && freelancer.dias_semana_disponiveis.length > 0) {
      // Pegar o dia da semana da data da festa (0=Domingo, 6=Sábado)
      const diaSemanaFesta = new Date(festaData + "T00:00:00").getDay();
      return freelancer.dias_semana_disponiveis.includes(diaSemanaFesta);
    }
    
    // Fallback para o sistema antigo de datas exatas (compatibilidade)
    return freelancer.dias_disponiveis?.includes(festaData) || false;
  };

  const handleAddFreelancer = async (freelancerId: string) => {
    // Encontrar o freelancer que será adicionado
    const freelancerToAdd = availableFreelancers.find(f => f.id === freelancerId);
    if (!freelancerToAdd) return;

    // Update otimista: adiciona imediatamente na UI
    const novoFestaFreelancer = {
      id: `temp-${Date.now()}`, // ID temporário
      festa_id: festaId,
      freelancer_id: freelancerId,
      valor_acordado: freelancerToAdd.valor_padrao,
      valor_bonus: 0,
      motivo_bonus: null,
      status_confirmacao: "pendente" as const,
      status_pagamento: "pendente" as const,
      freelancer: freelancerToAdd,
    };

    setFestaFreelancers([...festaFreelancers, novoFestaFreelancer]);
    setAvailableFreelancers(availableFreelancers.filter(f => f.id !== freelancerId));
    setShowAddDialog(false); // Fechar o dialog

    // Fazer a chamada real à API em background
    setLoading(true);
    const result = await addFreelancerToFesta(festaId, freelancerId);
    setLoading(false);

    if (!result.success) {
      // Se falhar, reverter as mudanças
      alert("Erro ao adicionar freelancer. Tente novamente.");
      setFestaFreelancers(festaFreelancers.filter(f => f.freelancer_id !== freelancerId));
      setAvailableFreelancers([...availableFreelancers, freelancerToAdd]);
    } else if (result.data) {
      // Atualizar com os dados reais do servidor (incluindo ID real)
      setFestaFreelancers(prev => 
        prev.map(f => f.id === novoFestaFreelancer.id ? result.data : f)
      );
    }
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

  const handleAbrirEditarBonus = (festaFreelancer: FestaFreelancer & { freelancer: Freelancer }) => {
    setEditandoBonus({
      freelancerId: festaFreelancer.freelancer_id,
      freelancerNome: festaFreelancer.freelancer.nome,
      valorBase: festaFreelancer.valor_acordado,
      valorBonusAtual: festaFreelancer.valor_bonus || 0,
      motivoBonusAtual: festaFreelancer.motivo_bonus,
    });
  };

  const handleSucessoBonus = (freelancerId: string, novoValorBonus: number, novoMotivoBonus?: string | null) => {
    // Atualizar o estado local imediatamente
    setFestaFreelancers(prev =>
      prev.map(f =>
        f.freelancer_id === freelancerId
          ? { ...f, valor_bonus: novoValorBonus, motivo_bonus: novoMotivoBonus }
          : f
      )
    );
    setEditandoBonus(null);
  };


  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <span className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Equipe da Festa
          </span>
          <Button
            onClick={() => setShowAddDialog(!showAddDialog)}
            size="sm"
            variant={showAddDialog ? "secondary" : "default"}
            className="w-full sm:w-auto text-sm"
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
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {/* Dialog para adicionar freelancer */}
        {showAddDialog && (
          <div className="border-2 border-dashed border-primary rounded-lg p-3 sm:p-4 space-y-3 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Freelancers Disponíveis
              </h4>
              
              {/* Filtro por Função */}
              <div className="flex items-center gap-2">
                <label htmlFor="filtro-funcao-modal" className="text-xs font-medium text-gray-600 whitespace-nowrap">
                  Filtrar:
                </label>
                <select
                  id="filtro-funcao-modal"
                  value={filtroFuncao}
                  onChange={(e) => setFiltroFuncao(e.target.value)}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos</option>
                  <option value="monitor">Monitor</option>
                  <option value="cozinheira">Cozinheira</option>
                  <option value="garcom">Garçom</option>
                  <option value="recepcao">Recepção</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
            
            {(() => {
              const freelancersFiltrados = filtroFuncao === "todos" 
                ? availableFreelancers 
                : availableFreelancers.filter(f => f.funcao === filtroFuncao);
              
              return freelancersFiltrados.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {filtroFuncao === "todos" 
                    ? "Todos os freelancers ativos já estão vinculados a esta festa."
                    : `Nenhum freelancer disponível com a função "${funcaoLabels[filtroFuncao]}".`
                  }
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto">
                  {freelancersFiltrados.map((freelancer) => {
                  const disponivel = isAvailable(freelancer);
                  
                  return (
                    <div
                      key={freelancer.id}
                      className={`flex flex-col gap-3 p-3 sm:p-4 rounded-lg border bg-white hover:shadow-md transition-all ${
                        !disponivel ? "border-orange-200 bg-orange-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                          {freelancer.foto_url ? (
                            <AvatarImage 
                              src={freelancer.foto_url} 
                              alt={freelancer.nome}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-white text-base sm:text-lg font-semibold">
                              {freelancer.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{freelancer.nome}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge className={funcaoColors[freelancer.funcao] + " text-xs"}>
                              {funcaoLabels[freelancer.funcao]}
                            </Badge>
                            {!disponivel && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Não Disp.
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs truncate">{formatPhone(freelancer.whatsapp)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!disponivel && (
                        <div className="bg-orange-100 border border-orange-200 rounded-md p-2 text-xs text-orange-800">
                          <p className="font-medium">⚠️ Não marcou disponibilidade para esta data.</p>
                          <p className="mt-1">Contacte via WhatsApp antes de adicionar.</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => window.open(whatsappLink(freelancer.whatsapp), "_blank")}
                          title="Enviar mensagem no WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddFreelancer(freelancer.id)}
                          disabled={loading}
                          className="flex-1 gap-1 text-xs"
                          title={!disponivel ? "Adicionar mesmo assim (verifique disponibilidade antes)" : "Adicionar freelancer"}
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  );
                })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Lista de freelancers da festa */}
        {festaFreelancers.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-20" />
            <p className="text-xs sm:text-sm">Nenhum freelancer vinculado a esta festa.</p>
            <p className="text-xs mt-1">Clique em "Adicionar" para vincular freelancers.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {festaFreelancers.map((festaFreelancer) => {
              const isConfirmado = festaFreelancer.status_confirmacao === "confirmado";
              
              return (
                <div
                  key={festaFreelancer.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                      {festaFreelancer.freelancer.foto_url ? (
                        <AvatarImage 
                          src={festaFreelancer.freelancer.foto_url}
                          alt={festaFreelancer.freelancer.nome}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-white text-base sm:text-lg font-semibold">
                          {festaFreelancer.freelancer.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm sm:text-base">{festaFreelancer.freelancer.nome}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs truncate">{formatPhone(festaFreelancer.freelancer.whatsapp)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
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
                      
                      {/* Valor com bônus */}
                      <div className="mt-3 pt-2 border-t">
                        <ValorComBonusDisplay
                          valorBase={festaFreelancer.valor_acordado}
                          valorBonus={festaFreelancer.valor_bonus}
                          motivoBonus={festaFreelancer.motivo_bonus}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAbrirEditarBonus(festaFreelancer)}
                      className="text-xs sm:text-sm gap-1"
                      title="Editar valor e bônus"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar Valor</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(whatsappLink(festaFreelancer.freelancer.whatsapp), "_blank")}
                      className="text-xs sm:text-sm text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
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

      {/* Dialog de edição de bônus */}
      {editandoBonus && (
        <EditarBonusDialog
          open={true}
          onClose={() => setEditandoBonus(null)}
          festaId={festaId}
          freelancerId={editandoBonus.freelancerId}
          freelancerNome={editandoBonus.freelancerNome}
          valorBase={editandoBonus.valorBase}
          valorBonusAtual={editandoBonus.valorBonusAtual}
          motivoBonusAtual={editandoBonus.motivoBonusAtual}
          onSuccess={(freelancerId, novoValorBonus, novoMotivoBonus) => 
            handleSucessoBonus(freelancerId, novoValorBonus, novoMotivoBonus)
          }
        />
      )}
    </Card>
  );
}

