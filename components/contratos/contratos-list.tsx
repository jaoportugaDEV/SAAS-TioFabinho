"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search, Calendar, User, PenLine, Link2, Trash2 } from "lucide-react";
import { formatDate, whatsappLink } from "@/lib/utils";
import { criarLinkAssinatura, getSignedUrlForContratoPdf, excluirContrato } from "@/app/actions/contratos";
import Link from "next/link";
import { buildPDFContrato, type DadosContratoPDF } from "@/lib/pdf-contrato";
import { AssinarContratoDialog } from "./assinar-contrato-dialog";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ContratoComFesta {
  id: string;
  festa_id: string;
  template_html: string;
  pdf_url: string | null;
  created_at: string;
  status?: string;
  assinado_at?: string | null;
  assinado_por_nome?: string | null;
  assinatura_url?: string | null;
  pdf_assinado_url?: string | null;
  contratado_assinado_at?: string | null;
  contratado_assinado_por_nome?: string | null;
  contratado_assinatura_url?: string | null;
  festa: {
    id: string;
    titulo: string;
    data: string;
    cliente_id?: string | null;
    cliente_nome: string;
    cliente_contato?: string;
    status: string;
    tema: string;
    local: string;
    horario?: string;
  };
  orcamento?: {
    total: number;
    status_pagamento: string;
  };
}

export function ContratosList() {
  const { empresa, empresaId } = useEmpresa();
  const nomeEmpresa = empresa?.nome || "Buffet";
  const cidadeEstado = [empresa?.cidade, empresa?.estado].filter(Boolean).join(" - ") || "Brasil";
  const [contratos, setContratos] = useState<ContratoComFesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contratoParaAssinar, setContratoParaAssinar] = useState<ContratoComFesta | null>(null);
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; url: string | null; contrato: ContratoComFesta | null }>({
    open: false,
    url: null,
    contrato: null,
  });
  const [linkLoading, setLinkLoading] = useState(false);
  const [contratoParaExcluir, setContratoParaExcluir] = useState<ContratoComFesta | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const supabase = createClient();

  const handleExcluirContrato = async () => {
    if (!contratoParaExcluir) return;
    setExcluindo(true);
    try {
      const result = await excluirContrato(contratoParaExcluir.id);
      if (result.success) {
        setContratoParaExcluir(null);
        loadContratos();
      } else {
        alert(result.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir contrato. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleEnviarParaCliente = async (contrato: ContratoComFesta) => {
    setLinkLoading(true);
    try {
      const result = await criarLinkAssinatura(contrato.id);
      if (!result.success) {
        alert(result.error);
        return;
      }
      setLinkDialog({ open: true, url: result.url, contrato });
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar link. Tente novamente.");
    } finally {
      setLinkLoading(false);
    }
  };

  useEffect(() => {
    loadContratos();
  }, [empresaId]);

  const loadContratos = async () => {
    if (!empresaId) return;
    try {
      setLoading(true);
      
      // Buscar contratos com informações das festas
      const { data: contratosData, error: contratosError } = await supabase
        .from("contratos")
        .select(`
          id,
          festa_id,
          template_html,
          pdf_url,
          created_at,
          status,
          assinado_at,
          assinado_por_nome,
          assinatura_url,
          pdf_assinado_url,
          contratado_assinado_at,
          contratado_assinado_por_nome,
          contratado_assinatura_url
        `)
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (contratosError) throw contratosError;

      if (!contratosData || contratosData.length === 0) {
        setContratos([]);
        return;
      }

      // Buscar festas relacionadas
      const festaIds = contratosData.map((c) => c.festa_id);
      const { data: festasData, error: festasError } = await supabase
        .from("festas")
        .select("id, titulo, data, cliente_id, cliente_nome, cliente_contato, status, tema, local, horario")
        .eq("empresa_id", empresaId)
        .in("id", festaIds);

      if (festasError) throw festasError;

      // Buscar orçamentos
      const { data: orcamentosData } = await supabase
        .from("orcamentos")
        .select("festa_id, total, status_pagamento")
        .in("festa_id", festaIds);

      // Combinar dados
      const contratosCompletos = contratosData.map((contrato) => {
        const festa = festasData?.find((f) => f.id === contrato.festa_id);
        const orcamento = orcamentosData?.find((o) => o.festa_id === contrato.festa_id);
        
        return {
          ...contrato,
          festa: festa || {
            id: contrato.festa_id,
            titulo: "Festa não encontrada",
            data: "",
            cliente_nome: "",
            status: "planejamento",
            tema: "",
            local: "",
          },
          orcamento,
        };
      });

      setContratos(contratosCompletos);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setLoading(false);
    }
  };

  const regeneratePDF = async (contrato: ContratoComFesta) => {
    try {
      let contratante: DadosContratoPDF["contratante"] = null;
      if (contrato.festa.cliente_id && empresaId) {
        const { data: cliente } = await supabase
          .from("clientes")
          .select("nome, cpf_cnpj, email, telefone, whatsapp, endereco, cidade, estado, cep")
          .eq("id", contrato.festa.cliente_id)
          .eq("empresa_id", empresaId)
          .single();
        if (cliente) {
          contratante = {
            nome: cliente.nome,
            cpf_cnpj: cliente.cpf_cnpj ?? null,
            email: cliente.email ?? null,
            telefone: (cliente.telefone || cliente.whatsapp) ?? null,
            endereco: cliente.endereco ?? null,
            cidade: cliente.cidade ?? null,
            estado: cliente.estado ?? null,
            cep: cliente.cep ?? null,
          };
        }
      }
      const dados: DadosContratoPDF = {
        festa: {
          id: contrato.festa.id,
          titulo: contrato.festa.titulo,
          data: contrato.festa.data,
          cliente_nome: contrato.festa.cliente_nome,
          horario: contrato.festa.horario,
          tema: contrato.festa.tema,
          local: contrato.festa.local,
        },
        orcamento: contrato.orcamento ? { total: contrato.orcamento.total } : undefined,
        contratante,
        empresa: {
          nome: nomeEmpresa,
          razao_social: empresa?.razao_social ?? null,
          cnpj: empresa?.cnpj ?? null,
          endereco: empresa?.endereco ?? null,
          cidade: empresa?.cidade ?? null,
          estado: empresa?.estado ?? null,
          telefone: empresa?.telefone ?? null,
          email: undefined,
        },
        contrato: { created_at: contrato.created_at },
      };
      const { doc } = buildPDFContrato(dados);
      const numeroContrato = `CTR-${contrato.festa.id.substring(0, 8).toUpperCase()}`;
      doc.save(`Contrato_${contrato.festa.titulo.replace(/\s+/g, "_")}_${numeroContrato}.pdf`);
    } catch (error) {
      console.error("Erro ao regenerar PDF:", error);
      alert("Erro ao regenerar contrato. Tente novamente.");
    }
  };

  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch =
      contrato.festa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.festa.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "cancelado"
          ? contrato.status === "cancelado"
          : contrato.festa.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      planejamento: { label: "Planejamento", className: "bg-yellow-100 text-yellow-800" },
      confirmada: { label: "Confirmada", className: "bg-blue-100 text-blue-800" },
      concluida: { label: "Concluída", className: "bg-green-100 text-green-800" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-gray-500">Carregando contratos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por festa ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos os Status</option>
              <option value="planejamento">Planejamento</option>
              <option value="confirmada">Confirmada</option>
              <option value="concluida">Concluída</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contratos */}
      {filteredContratos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum contrato encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Os contratos gerados aparecerão aqui. Gere um contrato nos detalhes de uma festa."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContratos.map((contrato) => (
            <Card
              key={contrato.id}
              className={`hover:shadow-md transition-shadow ${contrato.status === "cancelado" ? "opacity-60" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {contrato.festa.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {contrato.festa.cliente_nome}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(contrato.festa.data)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contrato.status === "cancelado" && (
                            <Badge className="bg-red-100 text-red-800 border border-red-200">
                              Cancelado
                            </Badge>
                          )}
                          {contrato.assinado_at && (
                            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Assinado em {formatDate(contrato.assinado_at)}
                            </Badge>
                          )}
                          {contrato.contratado_assinado_at && !contrato.assinado_at && (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                              Aguardando assinatura do cliente
                            </Badge>
                          )}
                          {getStatusBadge(contrato.festa.status)}
                          {contrato.orcamento && (
                            <Badge className="bg-green-100 text-green-800">
                              {Number(contrato.orcamento.total).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {contrato.status !== "cancelado" && !contrato.assinado_at && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnviarParaCliente(contrato)}
                          disabled={linkLoading}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Enviar para cliente
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContratoParaAssinar(contrato)}
                        >
                          <PenLine className="w-4 h-4 mr-2" />
                          Assinar
                        </Button>
                      </>
                    )}
                    {contrato.pdf_assinado_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="inline-flex h-9 items-center justify-center gap-2"
                        onClick={async () => {
                          const res = await getSignedUrlForContratoPdf(contrato.id);
                          if (res.success) window.open(res.url, "_blank", "noopener,noreferrer");
                          else alert(res.error);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Baixar PDF Assinado
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regeneratePDF(contrato)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Link href={`/dashboard/festas/${contrato.festa.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Festa
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => setContratoParaExcluir(contrato)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Contrato gerado em {formatDate(contrato.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssinarContratoDialog
        contrato={contratoParaAssinar}
        open={!!contratoParaAssinar}
        onOpenChange={(open) => !open && setContratoParaAssinar(null)}
        onSuccess={loadContratos}
      />

      <Dialog open={!!contratoParaExcluir} onOpenChange={(open) => !open && setContratoParaExcluir(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-10">
            <DialogClose onClose={() => setContratoParaExcluir(null)} />
            <DialogTitle>Excluir contrato</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Tem certeza que deseja excluir o contrato da festa &quot;{contratoParaExcluir?.festa.titulo}&quot;?
              Esta ação não pode ser desfeita.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContratoParaExcluir(null)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExcluirContrato}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkDialog.open} onOpenChange={(open) => !open && setLinkDialog((d) => ({ ...d, open: false }))}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-10">
            <DialogClose onClose={() => setLinkDialog((d) => ({ ...d, open: false }))} />
            <DialogTitle>Link para assinatura do cliente</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Envie este link para o cliente assinar o contrato do evento &quot;{linkDialog.contrato?.festa.titulo}&quot;.
            </p>
          </DialogHeader>
          <div className="px-4 sm:px-6 pb-2">
            {linkDialog.url && (
              <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-800 break-all select-all">
                {linkDialog.url}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (linkDialog.url) navigator.clipboard.writeText(linkDialog.url);
              }}
            >
              Copiar link
            </Button>
            {linkDialog.contrato?.festa.cliente_contato && (
              <Button
                onClick={() => {
                  const msg = linkDialog.url
                    ? `Olá! Segue o link para assinar o contrato do evento ${linkDialog.contrato?.festa.titulo}: ${linkDialog.url}`
                    : "";
                  window.open(whatsappLink(linkDialog.contrato!.festa.cliente_contato!, msg), "_blank");
                }}
              >
                Enviar por WhatsApp
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

