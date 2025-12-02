"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Festa } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, User, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  concluida: { label: "Concluída", color: "bg-gray-100 text-gray-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

export default function DetalheFestaPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [festa, setFesta] = useState<Festa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFesta();
  }, [params.id]);

  const loadFesta = async () => {
    try {
      const { data, error } = await supabase
        .from("festas")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setFesta(data);
    } catch (error) {
      console.error("Erro ao carregar festa:", error);
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Link href="/dashboard/festas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{festa.titulo}</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <p className="text-gray-500 mt-1">Detalhes completos da festa</p>
          </div>
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
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">{formatDate(festa.data)}</p>
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

      {/* Tabs/Seções */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold">Freelancers</h3>
            <p className="text-xs text-gray-500 mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📸</div>
            <h3 className="font-semibold">Galeria</h3>
            <p className="text-xs text-gray-500 mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold">Contrato</h3>
            <p className="text-xs text-gray-500 mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold">Orçamento</h3>
            <p className="text-xs text-gray-500 mt-1">Em breve</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold">Checklist</h3>
            <p className="text-xs text-gray-500 mt-1">Em breve</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">✅ Festa Criada com Sucesso!</h3>
        <p className="text-sm text-green-800">
          A festa foi criada. As funcionalidades de galeria, contratos, e outras seções estão sendo desenvolvidas.
          Por enquanto, você pode gerenciar suas festas e freelancers.
        </p>
      </div>
    </div>
  );
}

