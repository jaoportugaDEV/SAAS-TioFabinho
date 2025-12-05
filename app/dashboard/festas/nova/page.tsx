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
    estimativa_convidados: undefined as number | undefined,
    quantidade_criancas: undefined as number | undefined,
    faixas_etarias: [] as string[],
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
      forma_pagamento: "avista" as "avista" | "parcelado",
      quantidade_parcelas: 1,
      entrada: 0,
    },
    // Step 5
    checklist: [] as string[],
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validar Step 1 - Informações Básicas
      if (!formData.titulo.trim()) {
        newErrors.titulo = "O título da festa é obrigatório";
      }
      if (!formData.data) {
        newErrors.data = "A data da festa é obrigatória";
      }
    } else if (step === 2) {
      // Validar Step 2 - Cliente
      if (!formData.cliente_nome.trim()) {
        newErrors.cliente_nome = "O nome do cliente é obrigatório";
      }
      if (!formData.cliente_contato.trim()) {
        newErrors.cliente_contato = "O contato do cliente é obrigatório";
      }
    }
    // Steps 3, 4 e 5 são opcionais

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        setErrors({}); // Limpar erros ao avançar
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Limpar erros ao voltar
    }
  };

  const handleSubmit = async () => {
    // Validar todos os campos obrigatórios antes de submeter
    if (!validateStep(1) || !validateStep(2)) {
      alert("Por favor, preencha todos os campos obrigatórios antes de criar a festa.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar a festa
      const { data: festa, error: festaError } = await supabase
        .from("festas")
        .insert([
          {
            titulo: formData.titulo,
            data: formData.data,
            horario: formData.horario || null,
            tema: formData.tema,
            local: formData.local,
            cliente_nome: formData.cliente_nome,
            cliente_contato: formData.cliente_contato,
            cliente_observacoes: formData.cliente_observacoes,
            estimativa_convidados: formData.estimativa_convidados || null,
            quantidade_criancas: formData.quantidade_criancas || null,
            faixas_etarias: formData.faixas_etarias.length > 0 ? formData.faixas_etarias : null,
            status: formData.status,
          },
        ])
        .select()
        .single();

      if (festaError) throw festaError;

      // 2. Adicionar freelancers com valores
      if (formData.freelancers.length > 0) {
        // Buscar informações dos freelancers e valores das funções
        const { data: freelancersData, error: freelancersError } = await supabase
          .from("freelancers")
          .select("id, funcao")
          .in("id", formData.freelancers);

        if (freelancersError) throw freelancersError;

        // Buscar valores de todas as funções
        const funcoes = [...new Set(freelancersData?.map((f) => f.funcao) || [])];
        const { data: valoresFuncoes, error: valoresError } = await supabase
          .from("valores_funcoes")
          .select("funcao, valor")
          .in("funcao", funcoes);

        if (valoresError) throw valoresError;

        // Criar mapa de valores por função
        const valoresMap = new Map(
          valoresFuncoes?.map((v) => [v.funcao, v.valor]) || []
        );

        // Criar inserts com valores
        const freelancerInserts = freelancersData?.map((freelancer) => ({
          festa_id: festa.id,
          freelancer_id: freelancer.id,
          valor_acordado: valoresMap.get(freelancer.funcao) || 0,
          status_pagamento: 'pendente',
        })) || [];

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

      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from("orcamentos")
        .insert([
          {
            festa_id: festa.id,
            itens: formData.orcamento.itens,
            desconto: formData.orcamento.desconto,
            acrescimo: formData.orcamento.acrescimo,
            total,
            status_pagamento: "pendente",
            forma_pagamento: formData.orcamento.forma_pagamento,
            quantidade_parcelas: formData.orcamento.quantidade_parcelas,
            entrada: formData.orcamento.entrada,
          },
        ])
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // 3.1 Criar parcelas se for pagamento parcelado
      if (formData.orcamento.forma_pagamento === "parcelado" && orcamentoData) {
        const valorParcelar = total - formData.orcamento.entrada;
        const valorParcela = valorParcelar / formData.orcamento.quantidade_parcelas;
        const dataFesta = new Date(formData.data);
        
        const parcelas = [];
        for (let i = 1; i <= formData.orcamento.quantidade_parcelas; i++) {
          const dataVencimento = new Date(dataFesta);
          dataVencimento.setMonth(dataVencimento.getMonth() + i - 1);
          
          parcelas.push({
            orcamento_id: orcamentoData.id,
            festa_id: festa.id,
            numero_parcela: i,
            valor: valorParcela,
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            status: 'pendente' as const,
          });
        }

        const { error: parcelasError } = await supabase
          .from("parcelas_pagamento")
          .insert(parcelas);

        if (parcelasError) {
          console.error("Erro ao criar parcelas:", parcelasError);
          // Não bloqueia a criação da festa
        }
      }

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
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between mb-2 gap-1">
            {steps.map((step) => (
              <div key={step.id} className="flex-1 text-center min-w-0">
                <div
                  className={`text-xs sm:text-sm font-medium truncate px-1 ${
                    currentStep >= step.id ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {/* Versão mobile: abreviações */}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">
                    {step.id === 1 && "Info. Básicas"}
                    {step.id === 2 && "Cliente"}
                    {step.id === 3 && "Freelancers"}
                    {step.id === 4 && "Orçam."}
                    {step.id === 5 && "Checklist"}
                  </span>
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
            {loading ? "Salvando..." : "Criar Festa"}
          </Button>
        )}
      </div>
    </div>
  );
}

