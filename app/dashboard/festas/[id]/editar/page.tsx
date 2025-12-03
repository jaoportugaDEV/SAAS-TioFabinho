"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditarFestaPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado do formulário
  const [formData, setFormData] = useState({
    // Step 1
    titulo: "",
    data: "",
    horario: "",
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

  useEffect(() => {
    loadFestaData();
  }, [params.id]);

  const loadFestaData = async () => {
    try {
      setLoadingData(true);

      // Carregar festa
      const { data: festaData, error: festaError } = await supabase
        .from("festas")
        .select("*")
        .eq("id", params.id)
        .single();

      if (festaError) throw festaError;

      // Carregar freelancers da festa
      const { data: festaFreelancersData } = await supabase
        .from("festa_freelancers")
        .select("freelancer_id")
        .eq("festa_id", params.id);

      const freelancerIds = festaFreelancersData?.map((f) => f.freelancer_id) || [];

      // Carregar orçamento
      const { data: orcamentoData } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("festa_id", params.id)
        .single();

      // Carregar checklist
      const { data: checklistData } = await supabase
        .from("checklist")
        .select("tarefa")
        .eq("festa_id", params.id)
        .order("ordem", { ascending: true });

      const checklistTarefas = checklistData?.map((c) => c.tarefa) || [];

      // Preencher formulário com dados existentes
      setFormData({
        titulo: festaData.titulo || "",
        data: festaData.data || "",
        horario: festaData.horario || "",
        tema: festaData.tema || "",
        local: festaData.local || "",
        status: festaData.status || "planejamento",
        cliente_nome: festaData.cliente_nome || "",
        cliente_contato: festaData.cliente_contato || "",
        cliente_observacoes: festaData.cliente_observacoes || "",
        freelancers: freelancerIds,
        orcamento: {
          itens: orcamentoData?.itens || [],
          desconto: orcamentoData?.desconto || 0,
          acrescimo: orcamentoData?.acrescimo || 0,
        },
        checklist: checklistTarefas,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da festa");
      router.push("/dashboard/festas");
    } finally {
      setLoadingData(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.titulo.trim()) {
        newErrors.titulo = "O título da festa é obrigatório";
      }
      if (!formData.data) {
        newErrors.data = "A data da festa é obrigatória";
      }
    } else if (step === 2) {
      if (!formData.cliente_nome.trim()) {
        newErrors.cliente_nome = "O nome do cliente é obrigatório";
      }
      if (!formData.cliente_contato.trim()) {
        newErrors.cliente_contato = "O contato do cliente é obrigatório";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      alert("Por favor, preencha todos os campos obrigatórios antes de salvar.");
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar a festa
      const { error: festaError } = await supabase
        .from("festas")
        .update({
          titulo: formData.titulo,
          data: formData.data,
          horario: formData.horario || null,
          tema: formData.tema,
          local: formData.local,
          cliente_nome: formData.cliente_nome,
          cliente_contato: formData.cliente_contato,
          cliente_observacoes: formData.cliente_observacoes,
          status: formData.status,
        })
        .eq("id", params.id);

      if (festaError) throw festaError;

      // 2. Atualizar freelancers - remover todos e adicionar novos
      await supabase
        .from("festa_freelancers")
        .delete()
        .eq("festa_id", params.id);

      if (formData.freelancers.length > 0) {
        const freelancerInserts = formData.freelancers.map((freelancerId) => ({
          festa_id: params.id,
          freelancer_id: freelancerId,
        }));

        const { error: freelancerError } = await supabase
          .from("festa_freelancers")
          .insert(freelancerInserts);

        if (freelancerError) throw freelancerError;
      }

      // 3. Atualizar orçamento
      const total =
        formData.orcamento.itens.reduce(
          (acc, item) => acc + item.quantidade * item.valor_unitario,
          0
        ) -
        formData.orcamento.desconto +
        formData.orcamento.acrescimo;

      // Verificar se já existe orçamento
      const { data: orcamentoExistente } = await supabase
        .from("orcamentos")
        .select("id")
        .eq("festa_id", params.id)
        .single();

      if (orcamentoExistente) {
        // Atualizar orçamento existente
        const { error: orcamentoError } = await supabase
          .from("orcamentos")
          .update({
            itens: formData.orcamento.itens,
            desconto: formData.orcamento.desconto,
            acrescimo: formData.orcamento.acrescimo,
            total,
          })
          .eq("festa_id", params.id);

        if (orcamentoError) throw orcamentoError;
      } else {
        // Criar novo orçamento
        const { error: orcamentoError } = await supabase
          .from("orcamentos")
          .insert([
            {
              festa_id: params.id,
              itens: formData.orcamento.itens,
              desconto: formData.orcamento.desconto,
              acrescimo: formData.orcamento.acrescimo,
              total,
              status_pagamento: "pendente",
            },
          ]);

        if (orcamentoError) throw orcamentoError;
      }

      // 4. Atualizar checklist - remover todos e adicionar novos
      await supabase
        .from("checklist")
        .delete()
        .eq("festa_id", params.id);

      if (formData.checklist.length > 0) {
        const checklistInserts = formData.checklist.map((tarefa, index) => ({
          festa_id: params.id,
          tarefa,
          concluido: false,
          ordem: index,
        }));

        const { error: checklistError } = await supabase
          .from("checklist")
          .insert(checklistInserts);

        if (checklistError) throw checklistError;
      }

      alert("Festa atualizada com sucesso!");
      router.push(`/dashboard/festas/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar festa:", error);
      alert("Erro ao atualizar festa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/festas/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Festa</h1>
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

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Por favor, preencha os campos obrigatórios
                </h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <StepInfoBasica formData={formData} setFormData={setFormData} errors={errors} />
          )}
          {currentStep === 2 && (
            <StepCliente formData={formData} setFormData={setFormData} errors={errors} />
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
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        )}
      </div>
    </div>
  );
}

