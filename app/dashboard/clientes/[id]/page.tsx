"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, MessageCircle, Plus, Calendar, DollarSign, TrendingUp, PartyPopper, MapPin } from "lucide-react";
import { getClienteById, deleteCliente } from "@/app/actions/clientes";
import { formatPhone, whatsappLink, formatCurrency, formatDate } from "@/lib/utils";

export default function DetalheClientePage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCliente();
  }, [params.id]);

  const loadCliente = async () => {
    try {
      const result = await getClienteById(params.id as string);
      if (result.success) {
        setCliente(result.data);
      } else {
        alert("Cliente não encontrado");
        router.push("/dashboard/clientes");
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      alert("Erro ao carregar cliente");
      router.push("/dashboard/clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const result = await deleteCliente(params.id as string);
      if (result.success) {
        alert("Cliente excluído com sucesso!");
        router.push("/dashboard/clientes");
        router.refresh();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente");
    }
  };

  if (loading || !cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalFestas = cliente.festas?.length || 0;
  const valorTotal = cliente.festas?.reduce((acc: number, festa: any) => 
    acc + (festa.orcamentos?.[0]?.total || 0), 0
  ) || 0;
  const ticketMedio = totalFestas > 0 ? valorTotal / totalFestas : 0;

  // Filtrar festas futuras
  const hoje = new Date().toISOString().split('T')[0];
  const festasFuturas = cliente.festas?.filter((f: any) => f.data >= hoje) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/clientes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {cliente.nome}
              </h1>
              <Badge className={cliente.ativo ? "bg-green-600" : "bg-gray-500"}>
                {cliente.ativo ? "Ativo" : "Inativo"}
              </Badge>
              {totalFestas >= 5 && (
                <Badge className="bg-yellow-500 text-white">VIP ⭐</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Perfil completo do cliente</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/dashboard/clientes/${params.id}/editar`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            onClick={() => window.open(whatsappLink(cliente.whatsapp || cliente.telefone), "_blank")}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Link href={`/dashboard/festas/nova?cliente=${params.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              Nova Festa
            </Button>
          </Link>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{formatPhone(cliente.telefone)}</p>
            </div>
            {cliente.whatsapp && (
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium">{formatPhone(cliente.whatsapp)}</p>
              </div>
            )}
            {cliente.email && (
              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <p className="font-medium break-words">{cliente.email}</p>
              </div>
            )}
            {cliente.cpf_cnpj && (
              <div>
                <p className="text-sm text-gray-500">CPF/CNPJ</p>
                <p className="font-medium">{cliente.cpf_cnpj}</p>
              </div>
            )}
            {cliente.data_nascimento && (
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">{formatDate(cliente.data_nascimento)}</p>
              </div>
            )}
          </div>
          
          {(cliente.endereco || cliente.cidade || cliente.estado) && (
            <div>
              <p className="text-sm text-gray-500">Endereço</p>
              <p className="font-medium">
                {cliente.endereco && `${cliente.endereco}`}
                {cliente.cidade && ` - ${cliente.cidade}`}
                {cliente.estado && `/${cliente.estado}`}
                {cliente.cep && ` - CEP: ${cliente.cep}`}
              </p>
            </div>
          )}
          
          {cliente.observacoes && (
            <div>
              <p className="text-sm text-gray-500">Observações</p>
              <p className="text-sm bg-gray-50 p-3 rounded-md break-words">
                {cliente.observacoes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Total de Festas
            </CardTitle>
            <PartyPopper className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalFestas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Valor Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl font-bold truncate">{formatCurrency(valorTotal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-base sm:text-xl font-bold truncate">{formatCurrency(ticketMedio)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              Próximas
            </CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{festasFuturas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Festas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Festas</CardTitle>
        </CardHeader>
        <CardContent>
          {!cliente.festas || cliente.festas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PartyPopper className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma festa cadastrada para este cliente</p>
              <Link href={`/dashboard/festas/nova?cliente=${params.id}`}>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Festa
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cliente.festas.map((festa: any) => {
                const statusLabels: Record<string, { label: string; color: string }> = {
                  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-800" },
                  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
                  acontecendo: { label: "Acontecendo", color: "bg-yellow-100 text-yellow-800" },
                  encerrada_pendente: { label: "Enc. Pendente", color: "bg-orange-100 text-orange-800" },
                  encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-800" },
                };
                const statusInfo = statusLabels[festa.status] || statusLabels.planejamento;

                return (
                  <Link
                    key={festa.id}
                    href={`/dashboard/festas/${festa.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{festa.titulo}</h3>
                          <Badge className={statusInfo.color + " text-xs"}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDate(festa.data)}
                              {festa.horario && ` às ${festa.horario}`}
                            </span>
                          </div>
                          {festa.local && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{festa.local}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {festa.orcamentos?.[0]?.total && (
                          <p className="font-bold text-primary">
                            {formatCurrency(festa.orcamentos[0].total)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Ao excluir este cliente, todas as informações serão perdidas permanentemente. 
            Esta ação não pode ser desfeita.
          </p>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir Cliente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
