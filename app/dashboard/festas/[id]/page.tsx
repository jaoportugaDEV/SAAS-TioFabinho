"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import { Festa, ChecklistItem, Freelancer, FestaFreelancer, Orcamento } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, User, Phone, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusSelector } from "@/components/festas/status-selector";
import { autoUpdateFestaStatus } from "@/app/actions/auto-update-status";
import { ChecklistManager } from "@/components/festas/checklist-manager";
import { FreelancerManager } from "@/components/festas/freelancer-manager";
import { ContratoGenerator } from "@/components/festas/contrato-generator";
import { DeleteFestaDialog } from "@/components/festas/delete-festa-dialog";
import { PagamentoManager } from "@/components/festas/pagamento-manager";
import { Pencil } from "lucide-react";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { AlertaPagamentosPendentes } from "@/components/festas/alerta-pagamentos-pendentes";

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  acontecendo: { label: "Acontecendo Agora", color: "bg-yellow-100 text-yellow-800" },
  encerrada_pendente: { label: "Encerrada - Pag. Pendente", color: "bg-orange-100 text-orange-800" },
  encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-800" },
};

export default function DetalheFestaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { empresaId } = useEmpresa();
  const supabase = createClient();
  const pagamentoRef = useRef<HTMLDivElement>(null);
  const [festa, setFesta] = useState<Festa | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [festaFreelancers, setFestaFreelancers] = useState<(FestaFreelancer & { freelancer: Freelancer })[]>([]);
  const [availableFreelancers, setAvailableFreelancers] = useState<Freelancer[]>([]);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightPagamentos, setHighlightPagamentos] = useState(false);
  const [totalFestasCliente, setTotalFestasCliente] = useState<number>(0);

  useEffect(() => {
    // Atualizar status automaticamente antes de carregar os dados
    autoUpdateFestaStatus().then(() => {
      loadFestaData();
    });
  }, [params.id]);

  // Detectar highlight de pagamentos e fazer scroll + animação
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight === 'pagamentos' && !loading && pagamentoRef.current) {
      // Aguardar um pouco para garantir que tudo foi renderizado
      setTimeout(() => {
        // Scroll suave até a seção de pagamentos
        pagamentoRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Ativar animação de destaque
        setHighlightPagamentos(true);
        
        // Remover animação após 3 segundos
        setTimeout(() => {
          setHighlightPagamentos(false);
        }, 3000);
      }, 500);
    }
  }, [searchParams, loading]);

  const loadFestaData = async () => {
    if (!empresaId) return;
    try {
      // Carregar festa
      const { data: festaData, error: festaError } = await supabase
        .from("festas")
        .select("*")
        .eq("id", params.id)
        .eq("empresa_id", empresaId)
        .single();

      if (festaError) throw festaError;
      setFesta(festaData);

      // Carregar checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklist")
        .select("*")
        .eq("festa_id", params.id)
        .eq("empresa_id", empresaId)
        .order("ordem", { ascending: true });

      if (!checklistError && checklistData) {
        setChecklist(checklistData);
      }

      // Carregar freelancers da festa
      const { data: festaFreelancersData, error: festaFreelancersError } = await supabase
        .from("festa_freelancers")
        .select(`
          id,
          festa_id,
          freelancer_id,
          status_confirmacao,
          valor_acordado,
          valor_bonus,
          motivo_bonus,
          status_pagamento,
          freelancer:freelancers (*)
        `)
        .eq("festa_id", params.id);

      if (!festaFreelancersError && festaFreelancersData) {
        setFestaFreelancers(festaFreelancersData as any);
      }

      // Carregar freelancers disponíveis (que não estão na festa)
      const freelancersNaFesta = festaFreelancersData?.map((f: any) => f.freelancer_id) || [];

      let availableQuery = supabase
        .from("freelancers")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("ativo", true);

      if (freelancersNaFesta.length > 0) {
        const idsExclusao = freelancersNaFesta.map((id: string) => `"${id}"`).join(",");
        availableQuery = availableQuery.not("id", "in", `(${idsExclusao})`);
      }

      const { data: availableData, error: availableError } = await availableQuery;

      if (availableError) {
        console.error("Erro ao carregar freelancers disponíveis:", availableError);
        setAvailableFreelancers([]);
      } else {
        setAvailableFreelancers(availableData || []);
      }

      // Carregar orçamento
      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("festa_id", params.id)
        .eq("empresa_id", empresaId)
        .single();

      if (!orcamentoError && orcamentoData) {
        setOrcamento(orcamentoData);
      }

      // Carregar total de festas do cliente (se tiver cliente_id)
      if (festaData.cliente_id) {
        const { count } = await supabase
          .from("festas")
          .select("*", { count: "exact", head: true })
          .eq("cliente_id", festaData.cliente_id)
          .eq("empresa_id", empresaId);
        
        if (count) {
          setTotalFestasCliente(count);
        }
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Festa não encontrada");
      router.push("/dashboard/festas");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !festa) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabels[festa.status] || statusLabels.planejamento;

  // Calcular dados do alerta de pagamentos pendentes
  const freelancersPendentes = festaFreelancers
    .filter(ff => ff.status_pagamento !== "pago")
    .map(ff => ({
      id: ff.freelancer.id,
      nome: ff.freelancer.nome,
      valor: (ff.valor_acordado || 0) + (ff.valor_bonus || 0)
    }));

  const totalPendente = freelancersPendentes.reduce((sum, f) => sum + f.valor, 0);
  
  // Só mostrar alerta se a festa já começou (acontecendo, encerrada_pendente ou encerrada)
  const festaJaComecou = ["acontecendo", "encerrada_pendente", "encerrada"].includes(festa.status);
  const temPagamentosPendentes = freelancersPendentes.length > 0 && festaJaComecou;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Link href="/dashboard/festas">
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">{festa.titulo}</h1>
              <Badge className={`${statusInfo.color} text-xs sm:text-sm flex-shrink-0`}>{statusInfo.label}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Detalhes completos da festa</p>
          </div>
        </div>
        
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Botão de Editar */}
          <Link href={`/dashboard/festas/${festa.id}/editar`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          
          {/* Seletor de Status */}
          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <label className="text-xs text-gray-500 font-medium">Alterar Status</label>
            <StatusSelector festaId={festa.id} currentStatus={festa.status} />
          </div>
          
          {/* Botão de Exclusão */}
          <div className="flex items-end">
            <DeleteFestaDialog festaId={festa.id} festaTitulo={festa.titulo} />
          </div>
        </div>
      </div>

      {/* Alerta de Pagamentos Pendentes */}
      {temPagamentosPendentes && (
        <AlertaPagamentosPendentes
          festaId={festa.id}
          freelancersPendentes={freelancersPendentes}
          totalPendente={totalPendente}
        />
      )}

      {/* Alerta: festa sem orçamento */}
      {!orcamento && !loading && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">Esta festa não tem orçamento</p>
              <p className="text-sm text-yellow-700">Adicione um orçamento para registrar os valores.</p>
            </div>
          </div>
          <Link href={`/dashboard/festas/${festa.id}/editar?step=4`}>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white whitespace-nowrap">
              Adicionar Orçamento
            </Button>
          </Link>
        </div>
      )}

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Informações da Festa e Convidados */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Detalhes da Festa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
            {/* Seção: Informações Básicas */}
            <CollapsibleSection title="Informações Básicas" defaultOpen={true}>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Data e Horário</p>
                    <p className="text-sm sm:text-base font-medium break-words">
                      {formatDate(festa.data)}
                      {festa.horario && (
                        <span className="text-gray-600"> às {festa.horario}</span>
                      )}
                    </p>
                  </div>
                </div>

                {festa.tema && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl mt-0.5 flex-shrink-0">🎨</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Tema</p>
                      <p className="text-sm sm:text-base font-medium break-words">{festa.tema}</p>
                    </div>
                  </div>
                )}

                {festa.local && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Local</p>
                      <p className="text-sm sm:text-base font-medium break-words">{festa.local}</p>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Seção: Informações dos Convidados */}
            {(festa.estimativa_convidados || festa.quantidade_criancas || (festa.faixas_etarias && festa.faixas_etarias.length > 0)) && (
              <CollapsibleSection title="Informações dos Convidados" defaultOpen={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {festa.estimativa_convidados && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">👥</span>
                      <div>
                        <p className="text-sm text-gray-500">Estimativa de Convidados</p>
                        <p className="font-medium">{festa.estimativa_convidados}</p>
                      </div>
                    </div>
                  )}

                  {festa.quantidade_criancas && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">👶</span>
                      <div>
                        <p className="text-sm text-gray-500">Quantidade de Crianças</p>
                        <p className="font-medium">{festa.quantidade_criancas}</p>
                      </div>
                    </div>
                  )}

                  {festa.faixas_etarias && festa.faixas_etarias.length > 0 && (
                    <div className="flex items-start gap-3 sm:col-span-2">
                      <span className="text-xl mt-0.5">🎂</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Faixas Etárias</p>
                        <div className="flex flex-wrap gap-2">
                          {festa.faixas_etarias.map((faixa) => (
                            <Badge key={faixa} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {faixa === "0-4" && "0-4 anos"}
                              {faixa === "5-12" && "5-12 anos"}
                              {faixa === "13-17" && "13-17 anos"}
                              {faixa === "18+" && "18+"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <CollapsibleSection title="Dados de Contato" defaultOpen={true}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Nome</p>
                    {festa.cliente_id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/dashboard/clientes/${festa.cliente_id}`}>
                          <p className="text-sm sm:text-base font-medium break-words text-primary hover:underline">
                            {festa.cliente_nome}
                          </p>
                        </Link>
                        {totalFestasCliente > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {totalFestasCliente} {totalFestasCliente === 1 ? "festa" : "festas"} com o buffet
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base font-medium break-words">{festa.cliente_nome}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Contato</p>
                    <p className="text-sm sm:text-base font-medium break-words">{festa.cliente_contato}</p>
                  </div>
                </div>

                {festa.cliente_observacoes && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Observações</p>
                    <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-md break-words">
                      {festa.cliente_observacoes}
                    </p>
                  </div>
                )}

                {festa.cliente_id && (
                  <Link href={`/dashboard/clientes/${festa.cliente_id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                      <User className="w-4 h-4" />
                      Ver Perfil Completo
                    </Button>
                  </Link>
                )}
              </div>
            </CollapsibleSection>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Pagamentos */}
      <div 
        ref={pagamentoRef}
        className={`transition-all duration-500 ${
          highlightPagamentos 
            ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg shadow-2xl shadow-red-500/50 scale-[1.02]' 
            : ''
        }`}
      >
        <PagamentoManager festaId={festa.id} orcamento={orcamento} />
      </div>

      {/* Gerenciamento de Freelancers */}
      <FreelancerManager
        festaId={festa.id}
        festaData={festa.data}
        festaFreelancers={festaFreelancers}
        availableFreelancers={availableFreelancers}
      />

      {/* Checklist */}
      <ChecklistManager festaId={festa.id} items={checklist} />

      {/* Gerador de Contrato */}
      <ContratoGenerator festa={festa} orcamento={orcamento} />
    </div>
  );
}
