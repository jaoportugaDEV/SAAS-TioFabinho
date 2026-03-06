"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setCurrentEmpresaAndRedirect } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Image from "next/image";

interface EmpresaOption {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
}

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: userEmpresas } = await supabase
        .from("user_empresas")
        .select("empresa_id")
        .eq("user_id", user.id);
      if (!userEmpresas?.length) {
        setEmpresas([]);
        setLoading(false);
        return;
      }
      const ids = userEmpresas.map((u) => u.empresa_id);
      const { data: empresasData } = await supabase
        .from("empresas")
        .select("id, nome, slug, logo_url")
        .in("id", ids)
        .eq("ativo", true);
      setEmpresas(empresasData || []);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const handleSelecionar = async (empresaId: string) => {
    await setCurrentEmpresaAndRedirect(empresaId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Nenhuma empresa vinculada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Sua conta ainda não está vinculada a nenhuma empresa. Entre em contato com o administrador.
            </p>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Selecione a empresa</h1>
          <p className="text-gray-500 mt-1">Escolha com qual empresa deseja acessar o sistema</p>
        </div>
        <div className="space-y-3">
          {empresas.map((emp) => (
            <Card
              key={emp.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelecionar(emp.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={emp.logo_url || "/LogoFabinho.png"}
                    alt={emp.nome}
                    fill
                    className="object-contain"
                    unoptimized={(emp.logo_url || "").startsWith("http")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{emp.nome}</p>
                  <p className="text-sm text-gray-500">Clique para acessar</p>
                </div>
                <Building2 className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
