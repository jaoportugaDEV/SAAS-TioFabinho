import jsPDF from "jspdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DespesaGeral } from "@/types";

// Cor principal da empresa (vermelho)
const PRIMARY_COLOR = "#FF0000";
const PRIMARY_RGB = [255, 0, 0];

// Helper para adicionar cabeçalho
function addHeader(doc: jsPDF, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Fundo vermelho
  doc.setFillColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Texto branco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TIO FABINHO BUFFET", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, pageWidth / 2, 25, { align: "center" });
  
  // Resetar cor para preto
  doc.setTextColor(0, 0, 0);
}

// Helper para adicionar rodapé
function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Tio Fabinho Buffet - Presidente Prudente, SP",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );
}

// Helper para adicionar info do período
function addPeriodInfo(doc: jsPDF, mes: number, ano: number, yPosition: number) {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const mesNome = meses[mes - 1];
  const periodo = `Período: ${mesNome} de ${ano}`;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(periodo, 20, yPosition);
  
  const dataGeracao = `Gerado em: ${formatDate(new Date().toISOString())}`;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(dataGeracao, pageWidth - 20, yPosition, { align: "right" });
  
  return yPosition + 10;
}

// PDF de Despesas (Freelancers + Gerais)
export async function gerarPDFDespesas(
  mes: number,
  ano: number,
  despesasFreelancers: { nome: string; valor: number; data: string; festa: string }[],
  despesasGerais: DespesaGeral[]
) {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Despesas");
  
  let yPosition = 45;
  yPosition = addPeriodInfo(doc, mes, ano, yPosition);
  
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Despesas de Freelancers
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
  doc.text("Despesas com Freelancers", margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  if (despesasFreelancers.length === 0) {
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhuma despesa com freelancer neste período", margin, yPosition);
    yPosition += 8;
  } else {
    let totalFreelancers = 0;
    
    for (const despesa of despesasFreelancers) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "normal");
      doc.text(`• ${despesa.nome}`, margin, yPosition);
      doc.text(formatCurrency(despesa.valor), pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`  ${despesa.festa} - ${formatDate(despesa.data)}`, margin + 5, yPosition);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
      
      totalFreelancers += despesa.valor;
    }
    
    yPosition += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal Freelancers:", margin, yPosition);
    doc.text(formatCurrency(totalFreelancers), pageWidth - margin, yPosition, { align: "right" });
    yPosition += 10;
  }
  
  // Despesas Gerais
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
  doc.text("Despesas Gerais", margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  if (despesasGerais.length === 0) {
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhuma despesa geral neste período", margin, yPosition);
    yPosition += 8;
  } else {
    let totalGerais = 0;
    
    for (const despesa of despesasGerais) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "normal");
      doc.text(`• ${despesa.descricao}`, margin, yPosition);
      doc.text(formatCurrency(despesa.valor), pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`  ${formatDate(despesa.data)}`, margin + 5, yPosition);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
      
      totalGerais += despesa.valor;
    }
    
    yPosition += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal Despesas Gerais:", margin, yPosition);
    doc.text(formatCurrency(totalGerais), pageWidth - margin, yPosition, { align: "right" });
    yPosition += 10;
  }
  
  // Total Geral
  yPosition += 5;
  doc.setDrawColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  const totalGeral = 
    despesasFreelancers.reduce((acc, d) => acc + d.valor, 0) +
    despesasGerais.reduce((acc, d) => acc + d.valor, 0);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
  doc.text("TOTAL DE DESPESAS:", margin, yPosition);
  doc.text(formatCurrency(totalGeral), pageWidth - margin, yPosition, { align: "right" });
  
  addFooter(doc);
  
  const meses = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const fileName = `Relatorio_Despesas_${meses[mes - 1]}_${ano}.pdf`;
  doc.save(fileName);
}

// PDF de Festas
export async function gerarPDFFestas(
  mes: number,
  ano: number,
  festas: { titulo: string; data: string; cliente: string; valor: number; status: string }[]
) {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Festas");
  
  let yPosition = 45;
  yPosition = addPeriodInfo(doc, mes, ano, yPosition);
  
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Total de festas: ${festas.length}`, margin, yPosition);
  yPosition += 10;
  
  if (festas.length === 0) {
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhuma festa neste período", margin, yPosition);
  } else {
    let totalFaturamento = 0;
    
    for (const festa of festas) {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Título da festa
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(festa.titulo, margin, yPosition);
      yPosition += 6;
      
      // Informações
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Cliente: ${festa.cliente}`, margin + 5, yPosition);
      yPosition += 5;
      doc.text(`Data: ${formatDate(festa.data)}`, margin + 5, yPosition);
      yPosition += 5;
      doc.text(`Status: ${festa.status}`, margin + 5, yPosition);
      yPosition += 5;
      
      // Valor
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
      doc.text(`Valor: ${formatCurrency(festa.valor)}`, margin + 5, yPosition);
      yPosition += 10;
      
      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      totalFaturamento += festa.valor;
    }
    
    // Total
    yPosition += 5;
    doc.setDrawColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
    doc.text("FATURAMENTO TOTAL:", margin, yPosition);
    doc.text(formatCurrency(totalFaturamento), pageWidth - margin, yPosition, { align: "right" });
  }
  
  addFooter(doc);
  
  const meses = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const fileName = `Relatorio_Festas_${meses[mes - 1]}_${ano}.pdf`;
  doc.save(fileName);
}

// PDF de Freelancers
export async function gerarPDFFreelancers(
  mes: number,
  ano: number,
  pagamentos: { nome: string; funcao: string; valor: number; festa: string; data: string }[]
) {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Pagamentos de Freelancers");
  
  let yPosition = 45;
  yPosition = addPeriodInfo(doc, mes, ano, yPosition);
  
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (pagamentos.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhum pagamento de freelancer neste período", margin, yPosition);
  } else {
    // Agrupar por freelancer
    const freelancersMap = new Map<string, { funcao: string; pagamentos: typeof pagamentos; total: number }>();
    
    for (const pag of pagamentos) {
      if (!freelancersMap.has(pag.nome)) {
        freelancersMap.set(pag.nome, { funcao: pag.funcao, pagamentos: [], total: 0 });
      }
      const freelancer = freelancersMap.get(pag.nome)!;
      freelancer.pagamentos.push(pag);
      freelancer.total += pag.valor;
    }
    
    let totalGeral = 0;
    
    for (const [nome, data] of freelancersMap.entries()) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Nome e função do freelancer
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
      doc.text(nome, margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Função: ${data.funcao}`, margin + 5, yPosition);
      yPosition += 8;
      
      // Pagamentos
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      for (const pag of data.pagamentos) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`• ${pag.festa}`, margin + 10, yPosition);
        doc.text(formatCurrency(pag.valor), pageWidth - margin, yPosition, { align: "right" });
        yPosition += 4;
        doc.setTextColor(128, 128, 128);
        doc.text(`  ${formatDate(pag.data)}`, margin + 15, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;
      }
      
      // Subtotal
      yPosition += 2;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total ${nome}:`, margin + 10, yPosition);
      doc.text(formatCurrency(data.total), pageWidth - margin, yPosition, { align: "right" });
      yPosition += 8;
      
      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      totalGeral += data.total;
    }
    
    // Total Geral
    yPosition += 5;
    doc.setDrawColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_RGB[0], PRIMARY_RGB[1], PRIMARY_RGB[2]);
    doc.text("TOTAL DE PAGAMENTOS:", margin, yPosition);
    doc.text(formatCurrency(totalGeral), pageWidth - margin, yPosition, { align: "right" });
  }
  
  addFooter(doc);
  
  const meses = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const fileName = `Relatorio_Freelancers_${meses[mes - 1]}_${ano}.pdf`;
  doc.save(fileName);
}

