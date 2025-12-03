"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Freelancer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Save, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

export default function EditarFreelancerPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);

  useEffect(() => {
    loadFreelancer();
  }, [params.id]);

  const loadFreelancer = async () => {
    try {
      const { data, error } = await supabase
        .from("freelancers")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      
      setFreelancer(data);
      setFotoUrl(data.foto_url || "");
      setDiasSemana(data.dias_semana_disponiveis || []);
    } catch (error) {
      console.error("Erro ao carregar freelancer:", error);
      alert("Freelancer não encontrado");
      router.push("/dashboard/freelancers");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `freelancers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("festa-fotos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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

  const toggleDiaSemana = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancer) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("freelancers")
        .update({
          nome: freelancer.nome,
          funcao: freelancer.funcao,
          whatsapp: freelancer.whatsapp,
          pix: freelancer.pix,
          foto_url: fotoUrl || null,
          ativo: freelancer.ativo,
          dias_semana_disponiveis: diasSemana,
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/dashboard/freelancers");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar freelancer:", error);
      alert("Erro ao atualizar freelancer");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !freelancer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Editar Freelancer</h1>
          <p className="text-gray-500 mt-1">{freelancer.nome}</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
                    {freelancer.nome.substring(0, 2).toUpperCase()}
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
                    {uploading ? "Enviando..." : "Alterar Foto"}
                  </Button>
                </Label>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={freelancer.nome}
                onChange={(e) =>
                  setFreelancer({ ...freelancer, nome: e.target.value })
                }
                required
              />
            </div>

            {/* Função */}
            <div className="space-y-2">
              <Label htmlFor="funcao">Função *</Label>
              <Select
                id="funcao"
                value={freelancer.funcao}
                onChange={(e) =>
                  setFreelancer({
                    ...freelancer,
                    funcao: e.target.value as typeof freelancer.funcao,
                  })
                }
                required
              >
                <option value="monitor">Monitor</option>
                <option value="cozinheira">Cozinheira</option>
                <option value="fotografo">Fotógrafo</option>
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
                value={freelancer.whatsapp}
                onChange={(e) =>
                  setFreelancer({ ...freelancer, whatsapp: e.target.value })
                }
                required
              />
            </div>

            {/* PIX */}
            <div className="space-y-2">
              <Label htmlFor="pix">Chave PIX *</Label>
              <Input
                id="pix"
                value={freelancer.pix}
                onChange={(e) =>
                  setFreelancer({ ...freelancer, pix: e.target.value })
                }
                required
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={freelancer.ativo}
                onChange={(e) =>
                  setFreelancer({ ...freelancer, ativo: e.target.checked })
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Dias da Semana Disponíveis
            </CardTitle>
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
              ].map((dia) => (
                <div
                  key={dia.valor}
                  onClick={() => toggleDiaSemana(dia.valor)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    diasSemana.includes(dia.valor)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={diasSemana.includes(dia.valor)}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label className="cursor-pointer font-medium">
                      {dia.nome}
                    </Label>
                  </div>
                </div>
              ))}
            </div>

            {diasSemana.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Nenhum dia da semana selecionado. Este freelancer não aparecerá como disponível ao criar festas.
                </p>
              </div>
            )}

            {diasSemana.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Disponível em {diasSemana.length} {diasSemana.length === 1 ? "dia" : "dias"} da semana
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4">
          <Link href="/dashboard/freelancers" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

