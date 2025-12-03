"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";

interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

interface OrcamentoData {
  id: string;
  itens: ItemOrcamento[];
  desconto: number;
  acrescimo: number;
  total: number;
  status_pagamento: string;
  observacoes?: string;
  created_at: string;
  festa: {
    titulo: string;
    data: string;
    cliente_nome: string;
    cliente_contato: string;
    tema?: string;
    local?: string;
    horario?: string;
  };
}

interface OrcamentoPDFGeneratorProps {
  orcamento: OrcamentoData;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function OrcamentoPDFGenerator({ 
  orcamento, 
  variant = "default", 
  size = "default",
  className = "" 
}: OrcamentoPDFGeneratorProps) {
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 20;

      const numeroOrcamento = `ORC-${orcamento.id.substring(0, 8).toUpperCase()}`;

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
      addCenteredText("Orcamento de Servicos", 25, 12);
      
      doc.setTextColor(0, 0, 0);
      yPosition = 55;

      // Informações do Orçamento
      addCenteredText("ORCAMENTO", yPosition, 14, true);
      yPosition += 15;

      yPosition = addText(`Orcamento No: ${numeroOrcamento}`, yPosition, 10);
      yPosition = addText(`Data de Emissao: ${formatDate(orcamento.created_at)}`, yPosition, 10);
      yPosition += 10;

      // CLIENTE
      doc.setFont("helvetica", "bold");
      yPosition = addText("CLIENTE:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Nome: ${orcamento.festa.cliente_nome}`, yPosition);
      yPosition = addText(`Contato: ${orcamento.festa.cliente_contato}`, yPosition);
      yPosition += 10;

      // EVENTO
      doc.setFont("helvetica", "bold");
      yPosition = addText("EVENTO:", yPosition, 12);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      yPosition = addText(`Titulo: ${orcamento.festa.titulo}`, yPosition);
      const dataTexto = orcamento.festa.horario 
        ? `Data: ${formatDate(orcamento.festa.data)} as ${orcamento.festa.horario}`
        : `Data: ${formatDate(orcamento.festa.data)}`;
      yPosition = addText(dataTexto, yPosition);
      
      if (orcamento.festa.tema) {
        yPosition = addText(`Tema: ${orcamento.festa.tema}`, yPosition);
      }
      if (orcamento.festa.local) {
        yPosition = addText(`Local: ${orcamento.festa.local}`, yPosition);
      }
      yPosition += 10;

      // ITENS DO ORÇAMENTO
      doc.setFont("helvetica", "bold");
      yPosition = addText("ITENS DO ORCAMENTO:", yPosition, 12);
      yPosition += 8;

      // Cabeçalho da tabela
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Descricao", margin + 2, yPosition);
      doc.text("Qtd", margin + 100, yPosition);
      doc.text("Valor Unit.", margin + 120, yPosition);
      doc.text("Subtotal", margin + 150, yPosition);
      yPosition += 8;

      // Itens
      doc.setFont("helvetica", "normal");
      let subtotalGeral = 0;

      for (const item of orcamento.itens) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const subtotal = item.quantidade * item.valor_unitario;
        subtotalGeral += subtotal;

        // Quebrar descrição longa
        const descLines = doc.splitTextToSize(item.descricao, 95);
        const lineHeight = 5;
        
        doc.text(descLines[0], margin + 2, yPosition);
        doc.text(item.quantidade.toString(), margin + 100, yPosition);
        doc.text(
          item.valor_unitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          margin + 120,
          yPosition
        );
        doc.text(
          subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          margin + 150,
          yPosition
        );

        yPosition += lineHeight;

        // Linhas adicionais da descrição
        for (let i = 1; i < descLines.length; i++) {
          doc.text(descLines[i], margin + 2, yPosition);
          yPosition += lineHeight;
        }

        yPosition += 2;
      }

      yPosition += 5;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Totais
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const valorSubtotal = subtotalGeral.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      doc.text("Subtotal:", margin + 120, yPosition);
      doc.text(valorSubtotal, margin + 150, yPosition);
      yPosition += 6;

      if (orcamento.desconto > 0) {
        const valorDesconto = Number(orcamento.desconto).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        doc.text("Desconto:", margin + 120, yPosition);
        doc.text(`- ${valorDesconto}`, margin + 150, yPosition);
        yPosition += 6;
      }

      if (orcamento.acrescimo > 0) {
        const valorAcrescimo = Number(orcamento.acrescimo).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        doc.text("Acrescimo:", margin + 120, yPosition);
        doc.text(`+ ${valorAcrescimo}`, margin + 150, yPosition);
        yPosition += 6;
      }

      // Total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const valorTotal = Number(orcamento.total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      doc.text("TOTAL:", margin + 120, yPosition);
      doc.text(valorTotal, margin + 150, yPosition);
      yPosition += 10;

      // Status de Pagamento
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const statusMap: Record<string, string> = {
        pendente: "Pendente",
        pago_parcial: "Pago Parcial",
        pago_total: "Pago Total",
      };
      const statusTexto = statusMap[orcamento.status_pagamento] || orcamento.status_pagamento;
      doc.text(`Status do Pagamento: ${statusTexto}`, margin, yPosition);
      yPosition += 10;

      // Observações
      if (orcamento.observacoes) {
        doc.setFont("helvetica", "bold");
        yPosition = addText("OBSERVACOES:", yPosition, 11);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const obsLines = doc.splitTextToSize(orcamento.observacoes, maxWidth);
        for (const line of obsLines) {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
      }

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Tio Fabinho Buffet - Presidente Prudente, SP",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Salvar PDF
      doc.save(`Orcamento_${orcamento.festa.titulo.replace(/\s+/g, "_")}_${numeroOrcamento}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF do orçamento:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  return (
    <Button
      onClick={generatePDF}
      variant={variant}
      size={size}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar PDF
    </Button>
  );
}

