"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Building2, Plus, Trash2 } from "lucide-react";
import { updateEmpresa } from "@/app/actions/empresa";
import { getCanEditBranding } from "@/app/actions/auth";

export default function ConfiguracoesEmpresaPage() {
  const router = useRouter();
  const { empresa, empresaId } = useEmpresa();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEditBranding, setCanEditBranding] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    logo_url: "",
    cor_primaria: "#DC2626",
    cnpj: "",
    razao_social: "",
    endereco: "",
    cidade: "",
    estado: "",
    telefone: "",
    locais: [] as string[],
  });
  const [novoLocal, setNovoLocal] = useState("");

  useEffect(() => {
    getCanEditBranding().then(({ canEditBranding: can }) => setCanEditBranding(can));
  }, []);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome || "",
        logo_url: empresa.logo_url || "",
        cor_primaria: empresa.cor_primaria || "#DC2626",
        cnpj: empresa.cnpj || "",
        razao_social: empresa.razao_social || "",
        endereco: empresa.endereco || "",
        cidade: empresa.cidade || "",
        estado: empresa.estado || "",
        telefone: empresa.telefone || "",
        locais: Array.isArray(empresa.locais) ? [...empresa.locais] : [],
      });
    }
    setLoading(false);
  }, [empresa]);

  const handleSalvar = async () => {
    setSaving(true);
    try {
      const result = await updateEmpresa({
        nome: form.nome,
        logo_url: form.logo_url || null,
        cor_primaria: form.cor_primaria,
        cnpj: form.cnpj || null,
        razao_social: form.razao_social || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        telefone: form.telefone || null,
        locais: form.locais,
      });
      if (result.success) {
        alert("Dados da empresa salvos com sucesso!");
        router.refresh();
      } else {
        alert(result.error || "Erro ao salvar.");
      }
    } catch (e) {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const adicionarLocal = () => {
    const t = novoLocal.trim();
    if (t && !form.locais.includes(t)) {
      setForm((f) => ({ ...f, locais: [...f.locais, t] }));
      setNovoLocal("");
    }
  };

  const removerLocal = (index: number) => {
    setForm((f) => ({ ...f, locais: f.locais.filter((_, i) => i !== index) }));
  };

  if (loading || !empresaId) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/configuracoes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dados da Empresa</h1>
          <p className="text-sm text-gray-500">Personalize o nome, logo e dados jurídicos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome exibido</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Tio Fabinho Buffet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">URL do logo</Label>
            <Input
              id="logo_url"
              value={form.logo_url}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="/LogoFabinho.png ou URL"
              readOnly={!canEditBranding}
              className={!canEditBranding ? "bg-muted" : undefined}
            />
            {!canEditBranding && (
              <p className="text-xs text-muted-foreground">O logo é configurado pelo suporte.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cor_primaria">Cor primária</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="cor_primaria"
                value={form.cor_primaria}
                onChange={(e) => setForm((f) => ({ ...f, cor_primaria: e.target.value }))}
                className={`h-10 w-14 rounded border ${canEditBranding ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                readOnly={!canEditBranding}
                disabled={!canEditBranding}
              />
              <Input
                value={form.cor_primaria}
                onChange={(e) => setForm((f) => ({ ...f, cor_primaria: e.target.value }))}
                placeholder="#DC2626"
                readOnly={!canEditBranding}
                className={!canEditBranding ? "bg-muted" : undefined}
              />
            </div>
            {!canEditBranding && (
              <p className="text-xs text-muted-foreground">A cor primária é configurada pelo suporte.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados jurídicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input
              id="razao_social"
              value={form.razao_social}
              onChange={(e) => setForm((f) => ({ ...f, razao_social: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={form.cnpj}
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={form.cidade}
                onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input
                id="estado"
                value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locais para festas</CardTitle>
          <p className="text-sm text-gray-500">Opções exibidas no cadastro de festas (ex: Unidade 1, Unidade 2)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={novoLocal}
              onChange={(e) => setNovoLocal(e.target.value)}
              placeholder="Nome do local"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarLocal())}
            />
            <Button type="button" variant="outline" onClick={adicionarLocal}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ul className="space-y-2">
            {form.locais.map((loc, i) => (
              <li key={i} className="flex items-center justify-between py-2 border-b">
                <span>{loc}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removerLocal(i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSalvar} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
