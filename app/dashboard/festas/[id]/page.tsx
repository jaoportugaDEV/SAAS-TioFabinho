"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Festa, ChecklistItem, Freelancer, FestaFreelancer, Orcamento } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, User, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusSelector } from "@/components/festas/status-selector";
import { ChecklistManager } from "@/components/festas/checklist-manager";
import { FreelancerManager } from "@/components/festas/freelancer-manager";
import { GaleriaFotos } from "@/components/festas/galeria-fotos";
import { ContratoGenerator } from "@/components/festas/contrato-generator";
import { DeleteFestaDialog } from "@/components/festas/delete-festa-dialog";
import { PagamentoManager } from "@/components/festas/pagamento-manager";
import { Pencil } from "lucide-react";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  concluida: { label: "Concluída", color: "bg-gray-100 text-gray-800" },
};

export default function DetalheFestaPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [festa, setFesta] = useState<Festa | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [festaFreelancers, setFestaFreelancers] = useState<(FestaFreelancer & { freelancer: Freelancer })[]>([]);
  const [availableFreelancers, setAvailableFreelancers] = useState<Freelancer[]>([]);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFestaData();
  }, [params.id]);

  const loadFestaData = async () => {
    try {
      // Carregar festa
      const { data: festaData, error: festaError } = await supabase
        .from("festas")
        .select("*")
        .eq("id", params.id)
        .single();

      if (festaError) throw festaError;
      setFesta(festaData);

      // Carregar checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklist")
        .select("*")
        .eq("festa_id", params.id)
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
          freelancer:freelancers (*)
        `)
        .eq("festa_id", params.id);

      if (!festaFreelancersError && festaFreelancersData) {
        setFestaFreelancers(festaFreelancersData as any);
      }

      // Carregar freelancers disponíveis (que não estão na festa)
      const freelancersNaFesta = festaFreelancersData?.map((f: any) => f.freelancer_id) || [];
      
      const { data: availableData, error: availableError } = await supabase
        .from("freelancers")
        .select("*")
        .eq("ativo", true)
        .not("id", "in", `(${freelancersNaFesta.length > 0 ? freelancersNaFesta.join(",") : "null"})`);

      if (!availableError && availableData) {
        setAvailableFreelancers(availableData);
      }

      // Carregar orçamento
      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("festa_id", params.id)
        .single();

      if (!orcamentoError && orcamentoData) {
        setOrcamento(orcamentoData);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Link href="/dashboard/festas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{festa.titulo}</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <p className="text-gray-500 mt-1">Detalhes completos da festa</p>
          </div>
        </div>
        
        {/* Ações */}
        <div className="flex gap-3 items-end">
          {/* Botão de Editar */}
          <Link href={`/dashboard/festas/${festa.id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          
          {/* Seletor de Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Alterar Status</label>
            <StatusSelector festaId={festa.id} currentStatus={festa.status} />
          </div>
          
          {/* Botão de Exclusão */}
          <DeleteFestaDialog festaId={festa.id} festaTitulo={festa.titulo} />
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Festa e Convidados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes da Festa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Seção: Informações Básicas */}
            <CollapsibleSection title="Informações Básicas" defaultOpen={true}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Data e Horário</p>
                    <p className="font-medium">
                      {formatDate(festa.data)}
                      {festa.horario && (
                        <span className="text-gray-600"> às {festa.horario}</span>
                      )}
                    </p>
                  </div>
                </div>

                {festa.tema && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🎨</span>
                    <div>
                      <p className="text-sm text-gray-500">Tema</p>
                      <p className="font-medium">{festa.tema}</p>
                    </div>
                  </div>
                )}

                {festa.local && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Local</p>
                      <p className="font-medium">{festa.local}</p>
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
                              {faixa === "0-5" && "0-5 anos"}
                              {faixa === "6-12" && "6-12 anos"}
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
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <CollapsibleSection title="Dados de Contato" defaultOpen={true}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{festa.cliente_nome}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contato</p>
                    <p className="font-medium">{festa.cliente_contato}</p>
                  </div>
                </div>

                {festa.cliente_observacoes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Observações</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {festa.cliente_observacoes}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Pagamentos */}
      <PagamentoManager festaId={festa.id} orcamento={orcamento} />

      {/* Gerenciamento de Freelancers */}
      <FreelancerManager
        festaId={festa.id}
        festaData={festa.data}
        festaFreelancers={festaFreelancers}
        availableFreelancers={availableFreelancers}
      />

      {/* Checklist */}
      <ChecklistManager festaId={festa.id} items={checklist} />

      {/* Galeria de Fotos */}
      <GaleriaFotos festaId={festa.id} />

      {/* Gerador de Contrato */}
      <ContratoGenerator festa={festa} orcamento={orcamento} />
    </div>
  );
}
