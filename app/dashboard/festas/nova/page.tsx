"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { StepInfoBasica } from "@/components/festas/step-info-basica";
import { StepCliente } from "@/components/festas/step-cliente";
import { StepFreelancers } from "@/components/festas/step-freelancers";
import { StepOrcamento } from "@/components/festas/step-orcamento";
import { StepChecklist } from "@/components/festas/step-checklist";

const steps = [
  { id: 1, title: "Informações Básicas" },
  { id: 2, title: "Cliente" },
  { id: 3, title: "Freelancers" },
  { id: 4, title: "Orçamento" },
  { id: 5, title: "Checklist" },
];

export default function NovaFestaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // Step 1
    titulo: "",
    data: "",
    tema: "",
    local: "",
    status: "planejamento" as const,
    // Step 2
    cliente_nome: "",
    cliente_contato: "",
    cliente_observacoes: "",
    // Step 3
    freelancers: [] as string[],
    // Step 4
    orcamento: {
      itens: [] as Array<{ descricao: string; quantidade: number; valor_unitario: number }>,
      desconto: 0,
      acrescimo: 0,
    },
    // Step 5
    checklist: [] as string[],
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Criar a festa
      const { data: festa, error: festaError } = await supabase
        .from("festas")
        .insert([
          {
            titulo: formData.titulo,
            data: formData.data,
            tema: formData.tema,
            local: formData.local,
            cliente_nome: formData.cliente_nome,
            cliente_contato: formData.cliente_contato,
            cliente_observacoes: formData.cliente_observacoes,
            status: formData.status,
          },
        ])
        .select()
        .single();

      if (festaError) throw festaError;

      // 2. Adicionar freelancers
      if (formData.freelancers.length > 0) {
        const freelancerInserts = formData.freelancers.map((freelancerId) => ({
          festa_id: festa.id,
          freelancer_id: freelancerId,
        }));

        const { error: freelancerError } = await supabase
          .from("festa_freelancers")
          .insert(freelancerInserts);

        if (freelancerError) throw freelancerError;
      }

      // 3. Criar orçamento
      const total =
        formData.orcamento.itens.reduce(
          (acc, item) => acc + item.quantidade * item.valor_unitario,
          0
        ) -
        formData.orcamento.desconto +
        formData.orcamento.acrescimo;

      const { error: orcamentoError } = await supabase
        .from("orcamentos")
        .insert([
          {
            festa_id: festa.id,
            itens: formData.orcamento.itens,
            desconto: formData.orcamento.desconto,
            acrescimo: formData.orcamento.acrescimo,
            total,
            status_pagamento: "pendente",
          },
        ]);

      if (orcamentoError) throw orcamentoError;

      // 4. Criar checklist
      if (formData.checklist.length > 0) {
        const checklistInserts = formData.checklist.map((tarefa, index) => ({
          festa_id: festa.id,
          tarefa,
          concluido: false,
          ordem: index,
        }));

        const { error: checklistError } = await supabase
          .from("checklist")
          .insert(checklistInserts);

        if (checklistError) throw checklistError;
      }

      router.push(`/dashboard/festas/${festa.id}`);
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar festa:", error);
      alert("Erro ao criar festa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/festas">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Festa</h1>
          <p className="text-gray-500 mt-1">
            Passo {currentStep} de {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div key={step.id} className="flex-1 text-center">
                <div
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <StepInfoBasica formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <StepCliente formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <StepFreelancers formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 4 && (
            <StepOrcamento formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 5 && (
            <StepChecklist formData={formData} setFormData={setFormData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1 || loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext} disabled={loading}>
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Criar Festa"}
          </Button>
        )}
      </div>
    </div>
  );
}

