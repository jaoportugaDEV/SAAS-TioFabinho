import jsPDF from "jspdf";
import { formatDate, formatDateTime } from "@/lib/utils";

export interface DadosContratoPDF {
  festa: {
    id: string;
    titulo: string;
    data: string;
    cliente_nome: string;
    horario?: string;
    tema?: string;
    local?: string;
  };
  orcamento?: { total: number };
  empresa: { nome: string; cidade?: string | null; estado?: string | null };
  contrato: { created_at: string };
}

export interface OpcoesAssinatura {
  signatureBase64: string;
  nome: string;
}

/**
 * Gera o PDF do contrato. Opcionalmente insere a assinatura sobre a linha do contratante.
 * Retorna o doc e a posição Y da linha para uso no client quando a assinatura é adicionada depois.
 */
export function buildPDFContrato(
  dados: DadosContratoPDF,
  opcoesAssinatura?: OpcoesAssinatura,
  opcoesAssinaturaContratado?: OpcoesAssinatura
): { doc: jsPDF; yLineContratante: number } {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  const nomeEmpresa = dados.empresa.nome || "Buffet";
  const cidadeEstado = [dados.empresa.cidade, dados.empresa.estado].filter(Boolean).join(" - ") || "Brasil";
  const numeroContrato = `CTR-${dados.festa.id.substring(0, 8).toUpperCase()}`;

  const addCenteredText = (text: string, y: number, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, y: number, fontSize = 11): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.text(text, margin, y, { maxWidth });
    return y + fontSize * 0.5;
  };

  doc.setFillColor(255, 0, 0);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  addCenteredText((nomeEmpresa || "BUFFET").toUpperCase(), 15, 20, true);
  addCenteredText("Contrato de Prestacao de Servicos", 25, 12);
  doc.setTextColor(0, 0, 0);
  yPosition = 55;

  addCenteredText("CONTRATO DE PRESTACAO DE SERVICOS", yPosition, 14, true);
  yPosition += 15;
  yPosition = addText(`Contrato No: ${numeroContrato}`, yPosition, 10);
  yPosition = addText(`Data de Emissao: ${formatDate(dados.contrato.created_at)}`, yPosition, 10);
  yPosition += 10;

  doc.setFont("helvetica", "bold");
  yPosition = addText("CONTRATANTE:", yPosition, 12);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition = addText(`Nome: ${dados.festa.cliente_nome}`, yPosition);
  yPosition += 10;

  doc.setFont("helvetica", "bold");
  yPosition = addText("CONTRATADO:", yPosition, 12);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition = addText(`Nome: ${nomeEmpresa}`, yPosition);
  yPosition = addText("Endereco: Presidente Prudente - SP", yPosition);
  yPosition += 10;

  doc.setFont("helvetica", "bold");
  yPosition = addText("OBJETO DO CONTRATO:", yPosition, 12);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  yPosition = addText(`Evento: ${dados.festa.titulo}`, yPosition);
  const dataTexto = dados.festa.horario
    ? `Data do Evento: ${formatDate(dados.festa.data)} as ${dados.festa.horario}`
    : `Data do Evento: ${formatDate(dados.festa.data)}`;
  yPosition = addText(dataTexto, yPosition);
  if (dados.festa.tema) yPosition = addText(`Tema: ${dados.festa.tema}`, yPosition);
  if (dados.festa.local) yPosition = addText(`Local: ${dados.festa.local}`, yPosition);
  yPosition += 10;

  if (dados.orcamento) {
    doc.setFont("helvetica", "bold");
    yPosition = addText("VALOR DO CONTRATO:", yPosition, 12);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    const valorFormatado = Number(dados.orcamento.total).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    yPosition = addText(`Valor Total: ${valorFormatado}`, yPosition);
    yPosition += 10;
  }

  doc.setFont("helvetica", "bold");
  yPosition = addText("CLAUSULAS:", yPosition, 12);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const clausulas = [
    "1. O CONTRATADO se compromete a prestar os servicos de buffet conforme acordado.",
    "2. O CONTRATANTE devera efetuar o pagamento nas datas estabelecidas.",
    "3. Cancelamentos devem ser comunicados com no minimo 7 dias de antecedencia.",
    "4. O CONTRATADO fornecera todos os materiais e equipe necessarios para o evento.",
    "5. Alteracoes no contrato devem ser feitas por escrito e acordadas por ambas as partes.",
  ];
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
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addText(`${cidadeEstado || "Brasil"}, ${formatDate(dados.contrato.created_at)}`, yPosition, 10);
  yPosition += 20;

  const yLineContratante = yPosition;
  doc.line(margin, yPosition, margin + 70, yPosition);
  yPosition += 5;
  yPosition = addText("Assinatura do Contratante", yPosition, 9);
  yPosition += 5;
  yPosition = addText(dados.festa.cliente_nome, yPosition, 9);

  const xRightSignature = pageWidth - margin - 70;
  const yLineContratado = yPosition;
  doc.line(xRightSignature, yPosition, xRightSignature + 70, yPosition);
  doc.text("Assinatura do Contratado", xRightSignature, yPosition + 5, { maxWidth: 70 });
  doc.text(nomeEmpresa, xRightSignature, yPosition + 10, { maxWidth: 70 });

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    cidadeEstado ? `${nomeEmpresa} - ${cidadeEstado}` : nomeEmpresa,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const imgW = 60;
  const imgH = 25;

  if (opcoesAssinatura?.signatureBase64 && opcoesAssinatura?.nome) {
    const imgX = margin;
    const imgY = yLineContratante - imgH;
    doc.addImage(
      `data:image/png;base64,${opcoesAssinatura.signatureBase64}`,
      "PNG",
      imgX,
      imgY,
      imgW,
      imgH
    );
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Assinado digitalmente em ${formatDateTime(new Date().toISOString())} por ${opcoesAssinatura.nome}`,
      margin,
      yLineContratante + 22
    );
  }

  if (opcoesAssinaturaContratado?.signatureBase64 && opcoesAssinaturaContratado?.nome) {
    const imgX = xRightSignature;
    const imgY = yLineContratado - imgH;
    doc.addImage(
      `data:image/png;base64,${opcoesAssinaturaContratado.signatureBase64}`,
      "PNG",
      imgX,
      imgY,
      imgW,
      imgH
    );
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Assinado digitalmente em ${formatDateTime(new Date().toISOString())} por ${opcoesAssinaturaContratado.nome}`,
      xRightSignature,
      yLineContratado + 22
    );
  }

  return { doc, yLineContratante };
}
