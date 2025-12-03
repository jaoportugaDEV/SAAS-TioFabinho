"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import jsPDF from "jspdf";

interface ContratoComFesta {
  id: string;
  festa_id: string;
  template_html: string;
  pdf_url: string | null;
  created_at: string;
  festa: {
    id: string;
    titulo: string;
    data: string;
    cliente_nome: string;
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
  const [contratos, setContratos] = useState<ContratoComFesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
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
          created_at
        `)
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
        .select("id, titulo, data, cliente_nome, status, tema, local, horario")
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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 20;

      const numeroContrato = `CTR-${contrato.festa.id.substring(0, 8).toUpperCase()}`;

      // Helper para adicionar texto centralizado
      const addCenteredText = (text: string, y: number, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
      };

      const addText = (text: string, y: number, fontSize = 11) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "normal");
        doc.text(text, margin, y, { maxWidth });
        return y + (fontSize * 0.5);
      };

      // Cabeçalho
      doc.setFillColor(255, 0, 0);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      addCenteredText("TIO FABINHO BUFFET", 15, 20, true);
      addCenteredText("Contrato de Prestacao de Servicos", 25, 12);
      
      doc.setTextColor(0, 0, 0);
      yPosition = 55;

      addCenteredText("CONTRATO DE PRESTACAO DE SERVICOS", yPosition, 14, true);
      yPosition += 15;

      yPosition = addText(`Contrato No: ${numeroContrato}`, yPosition, 10);
      yPosition = addText(`Data de Emissao: ${formatDate(contrato.created_at)}`, yPosition, 10);
      yPosition += 10;

      // CONTRATANTE
      doc.setFont("helvetica", "bold");
      yPosition = addText("CONTRATANTE:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Nome: ${contrato.festa.cliente_nome}`, yPosition);
      yPosition += 10;

      // CONTRATADO
      doc.setFont("helvetica", "bold");
      yPosition = addText("CONTRATADO:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText("Nome: Tio Fabinho Buffet", yPosition);
      yPosition = addText("Endereco: Presidente Prudente - SP", yPosition);
      yPosition += 10;

      // OBJETO DO CONTRATO
      doc.setFont("helvetica", "bold");
      yPosition = addText("OBJETO DO CONTRATO:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Evento: ${contrato.festa.titulo}`, yPosition);
      const dataTexto = contrato.festa.horario 
        ? `Data do Evento: ${formatDate(contrato.festa.data)} as ${contrato.festa.horario}`
        : `Data do Evento: ${formatDate(contrato.festa.data)}`;
      yPosition = addText(dataTexto, yPosition);
      if (contrato.festa.tema) {
        yPosition = addText(`Tema: ${contrato.festa.tema}`, yPosition);
      }
      if (contrato.festa.local) {
        yPosition = addText(`Local: ${contrato.festa.local}`, yPosition);
      }
      yPosition += 10;

      // VALOR
      if (contrato.orcamento) {
        doc.setFont("helvetica", "bold");
        yPosition = addText("VALOR DO CONTRATO:", yPosition, 12);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        const valorFormatado = Number(contrato.orcamento.total).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        yPosition = addText(`Valor Total: ${valorFormatado}`, yPosition);
        yPosition += 10;
      }

      // CLÁUSULAS
      doc.setFont("helvetica", "bold");
      yPosition = addText("CLAUSULAS:", yPosition, 12);
      yPosition += 5;

      const clausulas = [
        "1. O CONTRATADO se compromete a prestar os servicos de buffet conforme acordado.",
        "2. O CONTRATANTE devera efetuar o pagamento nas datas estabelecidas.",
        "3. Cancelamentos devem ser comunicados com no minimo 7 dias de antecedencia.",
        "4. O CONTRATADO fornecera todos os materiais e equipe necessarios para o evento.",
        "5. Alteracoes no contrato devem ser feitas por escrito e acordadas por ambas as partes.",
      ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      for (const clausula of clausulas) {
        const lines = doc.splitTextToSize(clausula, maxWidth);
        for (const line of lines) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }

      yPosition += 15;

      // Assinaturas
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition = addText("Presidente Prudente, SP, " + formatDate(contrato.created_at), yPosition, 10);
      yPosition += 20;

      doc.line(margin, yPosition, margin + 70, yPosition);
      yPosition += 5;
      yPosition = addText("Assinatura do Contratante", yPosition, 9);
      yPosition += 5;
      yPosition = addText(contrato.festa.cliente_nome, yPosition, 9);

      yPosition -= 10;
      const xRightSignature = pageWidth - margin - 70;
      doc.line(xRightSignature, yPosition, xRightSignature + 70, yPosition);
      doc.text("Assinatura do Contratado", xRightSignature, yPosition + 5, { maxWidth: 70 });
      doc.text("Tio Fabinho Buffet", xRightSignature, yPosition + 10, { maxWidth: 70 });

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Tio Fabinho Buffet - Presidente Prudente, SP",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

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
    
    const matchesStatus = statusFilter === "all" || contrato.festa.status === statusFilter;
    
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
            <Card key={contrato.id} className="hover:shadow-md transition-shadow">
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
                        <div className="flex gap-2 mt-2">
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
    </div>
  );
}

