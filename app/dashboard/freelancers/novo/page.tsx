"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Save } from "lucide-react";
import Link from "next/link";
import { VALORES_PADRAO_POR_FUNCAO } from "@/lib/constants";

export default function NovoFreelancerPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    funcao: "monitor" as "monitor" | "cozinheira" | "fotografo" | "garcom" | "recepcao" | "outros",
    whatsapp: "",
    pix: "",
    valor_padrao: 50, // Valor inicial para monitor
    bonus_fixo: 0, // Bonificação fixa
    ativo: true,
  });

  // Atualizar valor padrão quando a função mudar
  useEffect(() => {
    const valorPadrao = VALORES_PADRAO_POR_FUNCAO[formData.funcao];
    setFormData(prev => ({ ...prev, valor_padrao: valorPadrao }));
  }, [formData.funcao]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `freelancers/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("festa-fotos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from("festa-fotos")
        .getPublicUrl(filePath);

      setFotoUrl(data.publicUrl);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("freelancers").insert([
        {
          ...formData,
          foto_url: fotoUrl || null,
          dias_disponiveis: [],
          dias_semana_disponiveis: diasSemana,
        },
      ]);

      if (error) throw error;

      router.push("/dashboard/freelancers");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar freelancer:", error);
      alert("Erro ao criar freelancer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/freelancers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Freelancer</h1>
          <p className="text-gray-500 mt-1">Cadastre um novo membro da equipe</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Freelancer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                {fotoUrl ? (
                  <AvatarImage src={fotoUrl} alt="Foto" />
                ) : (
                  <AvatarFallback className="bg-gray-200 text-gray-500 text-2xl">
                    {formData.nome ? formData.nome.substring(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <input
                  type="file"
                  id="foto"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Label htmlFor="foto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById("foto")?.click()}
                    className="cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Enviando..." : "Escolher Foto"}
                  </Button>
                </Label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Máximo 5MB - JPG, PNG ou WebP
                </p>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            {/* Função */}
            <div className="space-y-2">
              <Label htmlFor="funcao">Função *</Label>
              <Select
                id="funcao"
                value={formData.funcao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    funcao: e.target.value as typeof formData.funcao,
                  })
                }
                required
              >
                <option value="monitor">Monitor</option>
                <option value="cozinheira">Cozinheira</option>
                <option value="garcom">Garçom</option>
                <option value="recepcao">Recepção</option>
                <option value="outros">Outros</option>
              </Select>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="(18) 99999-9999"
                required
              />
              <p className="text-xs text-gray-500">
                Digite apenas números ou com formatação
              </p>
            </div>

            {/* PIX */}
            <div className="space-y-2">
              <Label htmlFor="pix">Chave PIX *</Label>
              <Input
                id="pix"
                value={formData.pix}
                onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                placeholder="CPF, telefone, email ou chave aleatória"
                required
              />
            </div>

            {/* Valor Padrão */}
            <div className="space-y-2">
              <Label htmlFor="valor_padrao">Valor Padrão por Festa *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="valor_padrao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_padrao}
                  onChange={(e) => setFormData({ ...formData, valor_padrao: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                {VALORES_PADRAO_POR_FUNCAO[formData.funcao] > 0 
                  ? `Valor padrão para ${formData.funcao}: R$ ${VALORES_PADRAO_POR_FUNCAO[formData.funcao].toFixed(2)}. Você pode editar para dar bônus.`
                  : "Defina o valor que este freelancer receberá por festa."
                }
              </p>
            </div>

            {/* Bonificação Fixa */}
            <div className="space-y-2">
              <Label htmlFor="bonus_fixo">Bonificação Fixa (Opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="bonus_fixo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonus_fixo}
                  onChange={(e) => setFormData({ ...formData, bonus_fixo: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="pl-12"
                  placeholder="0,00"
                />
              </div>
              <p className="text-xs text-gray-500">
                💰 Este valor será <strong>adicionado automaticamente como bônus</strong> quando o freelancer for adicionado a uma festa. 
                Útil para freelancers que sempre recebem um valor extra fixo.
              </p>
              {formData.bonus_fixo > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    ℹ️ Valor total ao adicionar em festas: <strong>R$ {(formData.valor_padrao + formData.bonus_fixo).toFixed(2)}</strong>
                    <span className="text-xs block mt-1">
                      (R$ {formData.valor_padrao.toFixed(2)} base + R$ {formData.bonus_fixo.toFixed(2)} bônus)
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) =>
                  setFormData({ ...formData, ativo: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Freelancer ativo
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Dias da Semana Disponíveis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Dias da Semana Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecione os dias da semana em que este freelancer está disponível para trabalhar.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { valor: 0, nome: "Domingo" },
                { valor: 1, nome: "Segunda-feira" },
                { valor: 2, nome: "Terça-feira" },
                { valor: 3, nome: "Quarta-feira" },
                { valor: 4, nome: "Quinta-feira" },
                { valor: 5, nome: "Sexta-feira" },
                { valor: 6, nome: "Sábado" },
              ].map((dia) => {
                const isSelected = diasSemana.includes(dia.valor);
                return (
                  <div
                    key={dia.valor}
                    onClick={() => {
                      if (isSelected) {
                        setDiasSemana(diasSemana.filter(d => d !== dia.valor));
                      } else {
                        setDiasSemana([...diasSemana, dia.valor].sort());
                      }
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label className="cursor-pointer font-medium">
                        {dia.nome}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>

            {diasSemana.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Nenhum dia da semana selecionado. Este freelancer não aparecerá como disponível ao criar festas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4 mt-6">
          <Link href="/dashboard/freelancers" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Freelancer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

