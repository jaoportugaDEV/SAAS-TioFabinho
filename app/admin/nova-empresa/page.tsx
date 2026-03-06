"use client";

import { useState } from "react";
import Link from "next/link";
import { criarEmpresaComUsuario, adicionarAdminATodasEmpresas } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";

export default function AdminNovaEmpresaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addingToAll, setAddingToAll] = useState(false);
  const [addToAllResult, setAddToAllResult] = useState<string | null>(null);

  async function handleAdicionarATodas() {
    setAddingToAll(true);
    setAddToAllResult(null);
    const result = await adicionarAdminATodasEmpresas();
    if (result.success) {
      setAddToAllResult(
        result.adicionadas === 0
          ? "Você já está em todas as empresas."
          : `Adicionado a ${result.adicionadas} empresa(s). Agora pode selecioná-las em "Selecionar empresa".`
      );
    } else {
      setAddToAllResult(result.error);
    }
    setAddingToAll(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await criarEmpresaComUsuario(formData);

    if (result.success) {
      setSuccess(true);
      form.reset();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Nova empresa</CardTitle>
          </div>
          <CardDescription>
            Crie uma nova empresa e o primeiro usuário (admin). Apenas o e-mail configurado em ADMIN_EMAIL pode acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-4 text-center text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
              Empresa e usuário criados com sucesso. O novo usuário já pode fazer login com o e-mail e senha definidos.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da empresa</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Buffet XYZ"
                  required
                  disabled={loading}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (identificador único)</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="Ex: buffet-xyz"
                  required
                  disabled={loading}
                  className="lowercase"
                />
                <p className="text-xs text-muted-foreground">Apenas letras minúsculas, números e hífens.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    type="text"
                    placeholder="Ex: São Paulo"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    name="estado"
                    type="text"
                    placeholder="SP"
                    required
                    disabled={loading}
                    maxLength={2}
                    className="uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do primeiro usuário</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "A criar..." : "Criar empresa e usuário"}
              </Button>
            </form>
          )}
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-muted bg-muted/30 p-3">
              <p className="text-sm font-medium text-foreground">Empresas já existentes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Para poder selecionar e editar logo/cor de qualquer empresa, adicione-se a todas.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                disabled={addingToAll}
                onClick={handleAdicionarATodas}
              >
                {addingToAll ? "A adicionar..." : "Adicionar-me a todas as empresas"}
              </Button>
              {addToAllResult && (
                <p className={`text-xs mt-2 ${addToAllResult.startsWith("Adicionado") || addToAllResult.includes("já está") ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {addToAllResult}
                </p>
              )}
            </div>
            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao dashboard
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
