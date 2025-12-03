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
import { ArrowLeft, Calendar, MapPin, User, Phone, Wallet, CheckCircle, Clock, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusSelector } from "@/components/festas/status-selector";
import { ChecklistManager } from "@/components/festas/checklist-manager";
import { FreelancerManager } from "@/components/festas/freelancer-manager";
import { GaleriaFotos } from "@/components/festas/galeria-fotos";
import { ContratoGenerator } from "@/components/festas/contrato-generator";
import { DeleteFestaDialog } from "@/components/festas/delete-festa-dialog";
import { Pencil } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  concluida: { label: "Concluída", color: "bg-gray-100 text-gray-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

const statusPagamentoLabels: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: "Pendente", color: "bg-red-100 text-red-800", icon: Clock },
  parcial: { label: "Parcial", color: "bg-yellow-100 text-yellow-800", icon: Wallet },
  pago: { label: "Completo", color: "bg-green-100 text-green-800", icon: CheckCircle },
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
        {/* Informações da Festa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Festa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Orçamento */}
      {orcamento && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💰</span>
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {Number(orcamento.total).toFixed(2)}
                </p>
              </div>
              <Badge className={
                orcamento.status_pagamento === "pago_total"
                  ? "bg-green-100 text-green-800"
                  : orcamento.status_pagamento === "pago_parcial"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }>
                {orcamento.status_pagamento === "pago_total"
                  ? "Pago"
                  : orcamento.status_pagamento === "pago_parcial"
                  ? "Pago Parcial"
                  : "Pendente"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gerenciamento de Freelancers */}
      <FreelancerManager
        festaId={festa.id}
        festaData={festa.data}
        festaFreelancers={festaFreelancers}
        availableFreelancers={availableFreelancers}
      />

      {/* Seção de Pagamentos */}
      {festaFreelancers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Pagamentos de Freelancers
              </span>
              {festa.status_pagamento_freelancers && (
                <Badge className={statusPagamentoLabels[festa.status_pagamento_freelancers]?.color || 'bg-gray-100 text-gray-800'}>
                  {(() => {
                    const Icon = statusPagamentoLabels[festa.status_pagamento_freelancers]?.icon;
                    return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
                  })()}
                  {statusPagamentoLabels[festa.status_pagamento_freelancers]?.label || 'Status Desconhecido'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {festaFreelancers.map((ff) => {
                const isPago = ff.status_pagamento === "pago";
                return (
                  <div
                    key={ff.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isPago
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPago ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {isPago ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Clock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{ff.freelancer.nome}</p>
                        <p className="text-sm text-gray-600">
                          {isPago ? "Pagamento confirmado" : "Pagamento pendente"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(ff.valor_acordado || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className="pt-3 border-t-2 border-gray-200">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">Total de Pagamentos</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      festaFreelancers.reduce((acc, ff) => acc + (ff.valor_acordado || 0), 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Link para página de pagamentos se houver pendências */}
              {festa.status_pagamento_freelancers !== "pago" && (
                <div className="pt-3">
                  <Link href="/dashboard/pagamentos">
                    <Button className="w-full gap-2" variant="outline">
                      <Wallet className="w-4 h-4" />
                      Ir para Pagamentos Pendentes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <ChecklistManager festaId={festa.id} items={checklist} />

      {/* Galeria de Fotos */}
      <GaleriaFotos festaId={festa.id} />

      {/* Gerador de Contrato */}
      <ContratoGenerator festa={festa} orcamento={orcamento} />
    </div>
  );
}
