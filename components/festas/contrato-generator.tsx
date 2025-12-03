"use client";

import { useState } from "react";
import { Festa, Orcamento } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";

interface ContratoGeneratorProps {
  festa: Festa;
  orcamento: Orcamento | null;
}

export function ContratoGenerator({ festa, orcamento }: ContratoGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 20;

      // Helper para adicionar texto centralizado
      const addCenteredText = (text: string, y: number, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
      };

      // Helper para adicionar texto normal
      const addText = (text: string, y: number, fontSize = 11) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "normal");
        doc.text(text, margin, y, { maxWidth });
        return y + (fontSize * 0.5);
      };

      // Cabeçalho
      doc.setFillColor(255, 0, 0); // Vermelho
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255); // Branco
      addCenteredText("TIO FABINHO BUFFET", 15, 20, true);
      addCenteredText("Contrato de Prestacao de Servicos", 25, 12);
      
      doc.setTextColor(0, 0, 0); // Preto
      yPosition = 55;

      // Informações do Contrato
      addCenteredText("CONTRATO DE PRESTACAO DE SERVICOS", yPosition, 14, true);
      yPosition += 15;

      // Número do contrato
      const numeroContrato = `CTR-${festa.id.substring(0, 8).toUpperCase()}`;
      yPosition = addText(`Contrato No: ${numeroContrato}`, yPosition, 10);
      yPosition = addText(`Data de Emissao: ${formatDate(new Date().toISOString())}`, yPosition, 10);
      yPosition += 10;

      // CONTRATANTE
      doc.setFont("helvetica", "bold");
      yPosition = addText("CONTRATANTE:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Nome: ${festa.cliente_nome}`, yPosition);
      yPosition = addText(`Contato: ${festa.cliente_contato}`, yPosition);
      yPosition += 10;

      // CONTRATADO
      doc.setFont("helvetica", "bold");
      yPosition = addText("CONTRATADO:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText("Nome: Tio Fabinho Buffet", yPosition);
      yPosition = addText("CNPJ/CPF: [Preencher]", yPosition);
      yPosition = addText("Endereco: Presidente Prudente - SP", yPosition);
      yPosition += 10;

      // OBJETO DO CONTRATO
      doc.setFont("helvetica", "bold");
      yPosition = addText("OBJETO DO CONTRATO:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Evento: ${festa.titulo}`, yPosition);
      const dataTexto = festa.horario 
        ? `Data do Evento: ${formatDate(festa.data)} as ${festa.horario}`
        : `Data do Evento: ${formatDate(festa.data)}`;
      yPosition = addText(dataTexto, yPosition);
      if (festa.tema) {
        yPosition = addText(`Tema: ${festa.tema}`, yPosition);
      }
      if (festa.local) {
        yPosition = addText(`Local: ${festa.local}`, yPosition);
      }
      yPosition += 10;

      // VALOR
      if (orcamento) {
        doc.setFont("helvetica", "bold");
        yPosition = addText("VALOR DO CONTRATO:", yPosition, 12);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        const valorFormatado = Number(orcamento.total).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        yPosition = addText(`Valor Total: ${valorFormatado}`, yPosition);
        yPosition = addText(`Status: ${orcamento.status_pagamento === "pago_total" ? "Pago" : "Pendente"}`, yPosition);
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
          if (yPosition > 270) { // Nova página se necessário
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

      yPosition = addText("Presidente Prudente, SP, " + formatDate(new Date().toISOString()), yPosition, 10);
      yPosition += 20;

      // Linha para assinatura do contratante
      doc.line(margin, yPosition, margin + 70, yPosition);
      yPosition += 5;
      yPosition = addText("Assinatura do Contratante", yPosition, 9);
      yPosition += 5;
      yPosition = addText(festa.cliente_nome, yPosition, 9);

      // Linha para assinatura do contratado
      yPosition -= 10;
      const xRightSignature = pageWidth - margin - 70;
      doc.line(xRightSignature, yPosition, xRightSignature + 70, yPosition);
      doc.text("Assinatura do Contratado", xRightSignature, yPosition + 5, { maxWidth: 70 });
      doc.text("Tio Fabinho Buffet", xRightSignature, yPosition + 10, { maxWidth: 70 });

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Tio Fabinho Buffet - Presidente Prudente, SP - WhatsApp: (18) XXXXX-XXXX",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Salvar PDF
      doc.save(`Contrato_${festa.titulo.replace(/\s+/g, "_")}_${numeroContrato}.pdf`);

      alert("Contrato gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar contrato. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contrato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📄 Gerar Contrato</h4>
            <p className="text-sm text-blue-800 mb-4">
              Clique no botão abaixo para gerar um contrato em PDF com todas as informações desta festa.
              O documento poderá ser impresso e assinado pelo cliente.
            </p>
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? "Gerando..." : "Gerar Contrato PDF"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Contrato inclui todas as informações da festa</p>
            <p>✓ Cláusulas padrão de prestação de serviços</p>
            <p>✓ Campos para assinatura do cliente e prestador</p>
            {orcamento && <p>✓ Valor total: R$ {Number(orcamento.total).toFixed(2)}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

