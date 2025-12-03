"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, DollarSign, Save, AlertCircle } from "lucide-react";
import { FUNCAO_LABELS, FUNCAO_COLORS } from "@/lib/constants";
import { FuncaoFreelancer } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ValorFuncao {
  id: string;
  funcao: FuncaoFreelancer;
  valor: number;
  updated_at: string;
}

export default function ConfiguracoesPage() {
  const [valores, setValores] = useState<ValorFuncao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadValores();
  }, []);

  const loadValores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("valores_funcoes")
        .select("*")
        .order("funcao", { ascending: true });

      if (error) throw error;
      
      setValores(data || []);
    } catch (error) {
      console.error("Erro ao carregar valores:", error);
      alert("Erro ao carregar configurações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleValorChange = (funcao: FuncaoFreelancer, novoValor: number) => {
    setValores(valores.map(v => 
      v.funcao === funcao ? { ...v, valor: novoValor } : v
    ));
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      // Atualizar cada valor
      for (const valor of valores) {
        const { error } = await supabase
          .from("valores_funcoes")
          .update({ 
            valor: valor.valor,
            updated_at: new Date().toISOString()
          })
          .eq("funcao", valor.funcao);

        if (error) throw error;
      }

      alert("✅ Valores salvos com sucesso!");
      await loadValores(); // Recarregar para pegar o updated_at atualizado
    } catch (error) {
      console.error("Erro ao salvar valores:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie os valores padrão por função dos freelancers
        </p>
      </div>

      {/* Card de Valores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Valores por Função
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Como funciona</p>
              <p>
                Quando você adicionar um freelancer a uma festa, o valor será definido automaticamente
                com base na função dele. Você pode ajustar esses valores aqui a qualquer momento.
              </p>
            </div>
          </div>

          {/* Grid de Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {valores.map((valor) => (
              <div
                key={valor.funcao}
                className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className={FUNCAO_COLORS[valor.funcao] + " mb-2"}>
                      {FUNCAO_LABELS[valor.funcao]}
                    </Badge>
                    {valor.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Última atualização: {new Date(valor.updated_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`valor-${valor.funcao}`} className="text-sm text-gray-700 mb-2 block">
                    Valor padrão
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      R$
                    </span>
                    <Input
                      id={`valor-${valor.funcao}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={valor.valor}
                      onChange={(e) => handleValorChange(valor.funcao, parseFloat(e.target.value) || 0)}
                      className="pl-12 text-lg font-semibold"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSalvar}
              disabled={saving}
              className="gap-2 min-w-[200px]"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Informativo */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Informações Importantes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Valores automáticos:</strong> Quando adicionar um freelancer a uma festa, 
                o valor será preenchido automaticamente com base na função dele.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Festas antigas:</strong> Alterar esses valores aqui NÃO afeta festas que 
                já foram criadas, apenas novas festas.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Valores especiais:</strong> Se você definir 0,00, pode ser porque esse 
                freelancer tem combinação especial ou não cobra valor fixo.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

