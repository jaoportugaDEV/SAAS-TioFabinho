"use client";

import { useState, useEffect } from "react";
import { Festa, Orcamento, ParcelaPagamento } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ContratoGeneratorProps {
  festa: Festa;
  orcamento: Orcamento | null;
}

export function ContratoGenerator({ festa, orcamento }: ContratoGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaPagamento[]>([]);
  const supabase = createClient();

  // Carregar parcelas se existirem
  useEffect(() => {
    if (orcamento?.id) {
      loadParcelas();
    }
  }, [orcamento?.id]);

  const loadParcelas = async () => {
    if (!orcamento?.id) return;
    
    const { data, error } = await supabase
      .from("parcelas_pagamento")
      .select("*")
      .eq("orcamento_id", orcamento.id)
      .order("numero_parcela", { ascending: true });

    if (!error && data) {
      setParcelas(data);
    }
  };

  // Função para gerar o HTML do contrato
  const generateContractHTML = (): string => {
    const numeroContrato = `CTR-${festa.id.substring(0, 8).toUpperCase()}`;
    const valorFormatado = orcamento 
      ? Number(orcamento.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "N/A";
    
    let itensHTML = "";
    if (orcamento && orcamento.itens && orcamento.itens.length > 0) {
      itensHTML = "<ul>";
      for (const item of orcamento.itens) {
        const valorItem = Number(item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        itensHTML += `<li>${item.descricao} (Qtd: ${item.quantidade}) - ${valorItem}</li>`;
      }
      itensHTML += "</ul>";
    }

    let parcelasHTML = "";
    if (parcelas && parcelas.length > 0) {
      parcelasHTML = "<ul>";
      for (const parcela of parcelas) {
        const valorParcela = Number(parcela.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        parcelasHTML += `<li>Parcela ${parcela.numero_parcela}: ${valorParcela} - Vencimento: ${formatDate(parcela.data_vencimento)}</li>`;
      }
      parcelasHTML += "</ul>";
    }
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Contrato ${numeroContrato} - Tio Fabinho Buffet</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
          h1 { color: #DC2626; text-align: center; margin-bottom: 5px; }
          h2 { text-align: center; color: #555; margin-top: 0; font-size: 18px; }
          h3 { color: #DC2626; margin-top: 20px; border-bottom: 2px solid #DC2626; padding-bottom: 5px; }
          .info { margin: 10px 0; }
          .destaque { font-weight: bold; }
          .assinaturas { margin-top: 60px; display: flex; justify-content: space-around; }
          .assinatura { text-align: center; }
          .linha { border-top: 1px solid #000; width: 250px; margin: 40px auto 10px; }
          ul { margin-left: 20px; }
          .clausula { margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>TIO FABINHO BUFFET</h1>
        <h2>Contrato de Prestação de Serviços de Buffet Infantil</h2>
        
        <div class="info">
          <p><span class="destaque">Contrato Nº:</span> ${numeroContrato}</p>
          <p><span class="destaque">Data de Emissão:</span> ${formatDate(new Date().toISOString())}</p>
        </div>
        
        <h3>1. QUALIFICAÇÃO DAS PARTES</h3>
        <p><span class="destaque">CONTRATADO:</span></p>
        <p>Razão Social: Tio Fabinho Buffet [Razão Social Completa]</p>
        <p>CNPJ: [Preencher]</p>
        <p>Endereço: [Endereço Completo] - Presidente Prudente - SP</p>
        
        <p><span class="destaque">CONTRATANTE:</span></p>
        <p>Nome: ${festa.cliente_nome}</p>
        <p>CPF/CNPJ: [Preencher]</p>
        <p>Telefone: ${festa.cliente_contato}</p>
        
        <h3>2. OBJETO DO CONTRATO</h3>
        <div class="info">
          <p><span class="destaque">Evento:</span> ${festa.titulo}</p>
          <p><span class="destaque">Data:</span> ${formatDate(festa.data)}${festa.horario ? ` às ${festa.horario}` : ""}</p>
          ${festa.tema ? `<p><span class="destaque">Tema:</span> ${festa.tema}</p>` : ""}
          ${festa.local ? `<p><span class="destaque">Local:</span> ${festa.local}</p>` : ""}
          ${festa.estimativa_convidados ? `<p><span class="destaque">Estimativa de Convidados:</span> ${festa.estimativa_convidados}</p>` : ""}
        </div>
        
        <h3>3. SERVIÇOS INCLUSOS</h3>
        ${itensHTML || "<p>Conforme pacote contratado detalhado no orçamento.</p>"}
        
        ${orcamento ? `
        <h3>4. CONDIÇÕES FINANCEIRAS</h3>
        <p><span class="destaque">Valor Total:</span> ${valorFormatado}</p>
        <p><span class="destaque">Forma de Pagamento:</span> ${orcamento.forma_pagamento === "avista" ? "À vista" : "Parcelado"}</p>
        ${orcamento.forma_pagamento === "parcelado" && parcelasHTML ? `
          <p><span class="destaque">Parcelas:</span></p>
          ${parcelasHTML}
        ` : ""}
        ` : ""}
        
        <h3>5. CLÁUSULAS CONTRATUAIS</h3>
        <div class="clausula">
          <p><strong>5.1. Das Obrigações do CONTRATADO:</strong> Fornecer todos os serviços conforme especificado, com equipe qualificada e materiais adequados.</p>
          <p><strong>5.2. Das Obrigações do CONTRATANTE:</strong> Efetuar pagamentos nas datas acordadas e fornecer informações corretas sobre o evento.</p>
          <p><strong>5.3. Do Cancelamento:</strong> Cancelamentos devem ser comunicados por escrito com antecedência mínima conforme política estabelecida.</p>
          <p><strong>5.4. Das Disposições Gerais:</strong> Este contrato é regido pelas leis brasileiras, elegendo-se o Foro de Presidente Prudente - SP.</p>
        </div>
        
        <div class="assinaturas">
          <div class="assinatura">
            <div class="linha"></div>
            <p><strong>CONTRATANTE</strong></p>
            <p>${festa.cliente_nome}</p>
          </div>
          <div class="assinatura">
            <div class="linha"></div>
            <p><strong>CONTRATADO</strong></p>
            <p>Tio Fabinho Buffet</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 20;
      let currentPage = 1;

      // Número do contrato
      const numeroContrato = `CTR-${festa.id.substring(0, 8).toUpperCase()}`;

      // Helper para adicionar rodapé em todas as páginas
      const addFooter = () => {
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Tio Fabinho Buffet - Presidente Prudente, SP - WhatsApp: [Preencher] - E-mail: [Preencher]`,
          pageWidth / 2,
          footerY,
          { align: "center" }
        );
        // Número da página
        doc.text(`Pagina ${currentPage}`, pageWidth - margin, footerY, { align: "right" });
      };

      // Helper para adicionar texto centralizado
      const addCenteredText = (text: string, y: number, fontSize = 12, isBold = false): number => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
        return y + (fontSize * 0.5);
      };

      // Helper para adicionar texto normal com quebra automática
      const addText = (text: string, y: number, fontSize = 10, isBold = false, indent = 0): number => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        
        const lines = doc.splitTextToSize(text, maxWidth - indent);
        for (const line of lines) {
          if (y > pageHeight - 25) {
            addFooter();
            doc.addPage();
            currentPage++;
            y = 20;
          }
          doc.text(line, margin + indent, y);
          y += fontSize * 0.45;
        }
        return y;
      };

      // Helper para adicionar espaçamento
      const addSpace = (y: number, space = 8): number => {
        return y + space;
      };

      // ===== CABEÇALHO =====
      doc.setFillColor(220, 38, 38); // Vermelho profissional
      doc.rect(0, 0, pageWidth, 35, "F");
      
      doc.setTextColor(255, 255, 255);
      yPosition = addCenteredText("TIO FABINHO BUFFET", 15, 18, true);
      yPosition = addCenteredText("Buffet Infantil Especializado", 24, 11);
      
      doc.setTextColor(0, 0, 0);
      yPosition = 45;

      // ===== TÍTULO DO CONTRATO =====
      yPosition = addCenteredText("CONTRATO DE PRESTACAO DE SERVICOS DE BUFFET INFANTIL", yPosition, 13, true);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText(`Contrato No: ${numeroContrato}`, yPosition, 9);
      yPosition = addText(`Data de Emissao: ${formatDate(new Date().toISOString())}`, yPosition, 9);
      yPosition = addSpace(yPosition, 10);

      // ===== QUALIFICAÇÃO DAS PARTES =====
      yPosition = addText("1. QUALIFICACAO DAS PARTES", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);

      yPosition = addText("CONTRATADO:", yPosition, 10, true);
      yPosition = addText("Razao Social: Tio Fabinho Buffet [Razao Social Completa]", yPosition, 9);
      yPosition = addText("CNPJ: [Preencher]", yPosition, 9);
      yPosition = addText("Endereco: [Endereco Completo] - Presidente Prudente - SP", yPosition, 9);
      yPosition = addText("Telefone/WhatsApp: [Preencher]", yPosition, 9);
      yPosition = addText("E-mail: [Preencher]", yPosition, 9);
      yPosition = addSpace(yPosition, 6);

      yPosition = addText("CONTRATANTE:", yPosition, 10, true);
      yPosition = addText(`Nome: ${festa.cliente_nome}`, yPosition, 9);
      yPosition = addText("CPF/CNPJ: [Preencher]", yPosition, 9);
      yPosition = addText("Endereco: [Preencher]", yPosition, 9);
      yPosition = addText(`Telefone: ${festa.cliente_contato}`, yPosition, 9);
      yPosition = addText("E-mail: [Preencher]", yPosition, 9);
      yPosition = addSpace(yPosition, 10);

      // ===== OBJETO DO CONTRATO =====
      yPosition = addText("2. OBJETO DO CONTRATO", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);

      yPosition = addText(
        "O presente contrato tem como objeto a prestacao de servicos de buffet infantil pelo CONTRATADO ao CONTRATANTE, conforme especificacoes a seguir:",
        yPosition,
        9
      );
      yPosition = addSpace(yPosition, 4);

      yPosition = addText(`Evento: ${festa.titulo}`, yPosition, 9, true);
      const dataTexto = festa.horario 
        ? `Data e Horario: ${formatDate(festa.data)} as ${festa.horario}`
        : `Data: ${formatDate(festa.data)}`;
      yPosition = addText(dataTexto, yPosition, 9);
      if (festa.tema) {
        yPosition = addText(`Tema: ${festa.tema}`, yPosition, 9);
      }
      if (festa.local) {
        yPosition = addText(`Local: ${festa.local}`, yPosition, 9);
      }
      if (festa.estimativa_convidados) {
        yPosition = addText(`Estimativa de Convidados: ${festa.estimativa_convidados}`, yPosition, 9);
      }
      if (festa.quantidade_criancas) {
        yPosition = addText(`Quantidade de Criancas: ${festa.quantidade_criancas}`, yPosition, 9);
      }
      if (festa.faixas_etarias && festa.faixas_etarias.length > 0) {
        const faixasTexto = festa.faixas_etarias.map(f => {
          if (f === "0-4") return "0-4 anos";
          if (f === "5-12") return "5-12 anos";
          if (f === "13-17") return "13-17 anos";
          if (f === "18+") return "18+";
          return f;
        }).join(", ");
        yPosition = addText(`Faixas Etarias: ${faixasTexto}`, yPosition, 9);
      }
      yPosition = addText("Duracao do Evento: 4 horas (conforme pacote contratado)", yPosition, 9);
      yPosition = addSpace(yPosition, 10);

      // ===== SERVIÇOS INCLUSOS =====
      yPosition = addText("3. SERVICOS INCLUSOS", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);

      if (orcamento && orcamento.itens && orcamento.itens.length > 0) {
        yPosition = addText("O CONTRATADO fornecera os seguintes servicos e itens:", yPosition, 9);
        yPosition = addSpace(yPosition, 3);
        
        for (const item of orcamento.itens) {
          const itemTexto = `- ${item.descricao} (Qtd: ${item.quantidade}) - ${Number(item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
          yPosition = addText(itemTexto, yPosition, 9, false, 5);
        }
        yPosition = addSpace(yPosition, 5);
      } else {
        yPosition = addText("- Cardapio infantil completo conforme pacote selecionado", yPosition, 9);
        yPosition = addText("- Decoracao tematica personalizada", yPosition, 9);
        yPosition = addText("- Equipe de monitores/recreadores qualificados", yPosition, 9);
        yPosition = addText("- Materiais para atividades recreativas", yPosition, 9);
        yPosition = addText("- Mesas, cadeiras e utensilios", yPosition, 9);
        yPosition = addText("- Limpeza e organizacao durante o evento", yPosition, 9);
        yPosition = addSpace(yPosition, 5);
      }

      if (orcamento?.observacoes) {
        yPosition = addText(`Observacoes: ${orcamento.observacoes}`, yPosition, 9);
        yPosition = addSpace(yPosition, 10);
      }

      // ===== CONDIÇÕES FINANCEIRAS =====
      if (orcamento) {
        yPosition = addText("4. CONDICOES FINANCEIRAS", yPosition, 11, true);
        yPosition = addSpace(yPosition, 5);
        
        const valorFormatado = Number(orcamento.total).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        yPosition = addText(`Valor Total do Contrato: ${valorFormatado}`, yPosition, 10, true);
        yPosition = addSpace(yPosition, 3);

        if (orcamento.desconto > 0) {
          const descontoFormatado = Number(orcamento.desconto).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          yPosition = addText(`Desconto Aplicado: ${descontoFormatado}`, yPosition, 9);
        }

        if (orcamento.acrescimo > 0) {
          const acrescimoFormatado = Number(orcamento.acrescimo).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          yPosition = addText(`Acrescimo: ${acrescimoFormatado}`, yPosition, 9);
        }

        yPosition = addSpace(yPosition, 3);

        if (orcamento.forma_pagamento === "avista") {
          yPosition = addText("Forma de Pagamento: A vista", yPosition, 9, true);
          yPosition = addText("O pagamento devera ser realizado ate [data].", yPosition, 9);
        } else {
          yPosition = addText("Forma de Pagamento: Parcelado", yPosition, 9, true);
          
          if (orcamento.entrada > 0) {
            const entradaFormatada = Number(orcamento.entrada).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
            yPosition = addText(`Entrada: ${entradaFormatada}`, yPosition, 9);
          }

          if (parcelas && parcelas.length > 0) {
            yPosition = addText(`Numero de Parcelas: ${parcelas.length}`, yPosition, 9);
            yPosition = addSpace(yPosition, 3);
            yPosition = addText("Vencimento das Parcelas:", yPosition, 9, true);
            
            for (const parcela of parcelas) {
              const valorParcela = Number(parcela.valor).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              const parcelaTexto = `Parcela ${parcela.numero_parcela}: ${valorParcela} - Vencimento: ${formatDate(parcela.data_vencimento)}`;
              yPosition = addText(parcelaTexto, yPosition, 9, false, 5);
            }
          } else {
            yPosition = addText(`Numero de Parcelas: ${orcamento.quantidade_parcelas}`, yPosition, 9);
          }
        }

        yPosition = addSpace(yPosition, 3);
        yPosition = addText("Formas de Pagamento Aceitas: Dinheiro, PIX, Cartao de Credito/Debito", yPosition, 9);
        yPosition = addSpace(yPosition, 10);
      }

      // ===== CLÁUSULAS CONTRATUAIS =====
      // Quebra de página para as cláusulas
      if (yPosition > pageHeight - 60) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = 20;
      }

      yPosition = addText("5. DAS OBRIGACOES DO CONTRATADO", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("5.1. Fornecer todos os servicos conforme especificado no item 3 deste contrato.", yPosition, 9);
      yPosition = addText("5.2. Apresentar equipe qualificada, uniformizada e em numero adequado para a realizacao do evento.", yPosition, 9);
      yPosition = addText("5.3. Garantir a qualidade, higiene e seguranca alimentar de todos os produtos fornecidos, seguindo as normas da vigilancia sanitaria.", yPosition, 9);
      yPosition = addText("5.4. Chegar ao local com antecedencia minima de 1 hora para montagem e preparacao.", yPosition, 9);
      yPosition = addText("5.5. Responsabilizar-se pelo fornecimento de todos os materiais, equipamentos e utensilios necessarios.", yPosition, 9);
      yPosition = addText("5.6. Realizar a limpeza e organizacao do espaco utilizado ao final do evento.", yPosition, 9);
      yPosition = addText("5.7. Manter seguro de responsabilidade civil vigente durante a realizacao do evento.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("6. DAS OBRIGACOES DO CONTRATANTE", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("6.1. Efetuar os pagamentos nas datas estabelecidas na clausula 4 deste contrato.", yPosition, 9);
      yPosition = addText("6.2. Fornecer informacoes completas e corretas sobre o evento, incluindo restricoes alimentares e alergias com antecedencia minima de 7 dias.", yPosition, 9);
      yPosition = addText("6.3. Garantir o acesso ao local do evento com antecedencia minima de 1 hora antes do inicio.", yPosition, 9);
      yPosition = addText("6.4. Informar sobre a infraestrutura disponivel no local (energia eletrica, agua, cozinha, banheiros).", yPosition, 9);
      yPosition = addText("6.5. Providenciar estacionamento ou informar sobre opcoes de estacionamento para a equipe do CONTRATADO.", yPosition, 9);
      yPosition = addText("6.6. Garantir a seguranca do local e supervisao das criancas pelos pais ou responsaveis.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("7. DO LOCAL DO EVENTO", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("7.1. O local do evento devera estar limpo e preparado para receber a equipe do CONTRATADO.", yPosition, 9);
      yPosition = addText("7.2. E de responsabilidade do CONTRATANTE garantir que o local possua infraestrutura minima: energia eletrica (110V/220V), agua encanada e ponto de apoio.", yPosition, 9);
      yPosition = addText("7.3. Caso o local nao possua a infraestrutura necessaria, o CONTRATANTE devera informar com antecedencia minima de 7 dias para que sejam tomadas providencias.", yPosition, 9);
      yPosition = addText("7.4. Custos adicionais com adaptacoes de infraestrutura serao cobrados separadamente.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("8. DO CANCELAMENTO", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("8.1. CANCELAMENTO PELO CONTRATANTE:", yPosition, 9, true);
      yPosition = addText("   a) Com antecedencia superior a 30 dias: devolucao de 80% dos valores pagos.", yPosition, 9);
      yPosition = addText("   b) Com antecedencia entre 15 e 30 dias: devolucao de 50% dos valores pagos.", yPosition, 9);
      yPosition = addText("   c) Com antecedencia inferior a 15 dias: sem direito a devolucao.", yPosition, 9);
      yPosition = addSpace(yPosition, 3);
      yPosition = addText("8.2. CANCELAMENTO PELO CONTRATADO:", yPosition, 9, true);
      yPosition = addText("   a) O CONTRATADO podera cancelar o evento apenas em caso de forca maior ou caso fortuito.", yPosition, 9);
      yPosition = addText("   b) Em caso de cancelamento pelo CONTRATADO, havera devolucao integral dos valores pagos acrescidos de multa de 20%.", yPosition, 9);
      yPosition = addSpace(yPosition, 3);
      yPosition = addText("8.3. Todos os cancelamentos devem ser formalizados por escrito (e-mail ou WhatsApp).", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("9. DA ALTERACAO DE DATA", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("9.1. O CONTRATANTE podera solicitar alteracao da data do evento com antecedencia minima de 30 dias.", yPosition, 9);
      yPosition = addText("9.2. A alteracao de data esta sujeita a disponibilidade do CONTRATADO na nova data solicitada.", yPosition, 9);
      yPosition = addText("9.3. Sera cobrada taxa de reagendamento de 10% do valor total do contrato.", yPosition, 9);
      yPosition = addText("9.4. Nao serao permitidas mais de uma alteracao de data por contrato.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      // Nova página se necessário
      if (yPosition > pageHeight - 80) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = 20;
      }

      yPosition = addText("10. DA ALTERACAO NO NUMERO DE CONVIDADOS", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("10.1. Alteracoes no numero de convidados devem ser comunicadas com antecedencia minima de 7 dias corridos.", yPosition, 9);
      yPosition = addText("10.2. Sera permitida variacao de ate 10% para mais ou para menos no numero de convidados sem alteracao de valor.", yPosition, 9);
      yPosition = addText("10.3. Variacoes superiores a 10% terao reajuste proporcional no valor do contrato.", yPosition, 9);
      yPosition = addText("10.4. Reducoes no numero de convidados comunicadas com menos de 7 dias nao darao direito a reembolso.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("11. DOS ATRASOS DE PAGAMENTO", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("11.1. Em caso de atraso no pagamento, serao aplicados:", yPosition, 9);
      yPosition = addText("   a) Multa de 2% sobre o valor em atraso;", yPosition, 9);
      yPosition = addText("   b) Juros de mora de 1% ao mes;", yPosition, 9);
      yPosition = addText("   c) Correcao monetaria pelo IPCA.", yPosition, 9);
      yPosition = addSpace(yPosition, 3);
      yPosition = addText("11.2. O nao pagamento integral ate 48 horas antes do evento autoriza o CONTRATADO a cancelar o evento sem devolucao de valores.", yPosition, 9);
      yPosition = addText("11.3. Atrasos superiores a 30 dias poderao ser inscritos em orgaos de protecao ao credito (SPC/SERASA).", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("12. DAS RESTRICOES ALIMENTARES E ALERGIAS", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("12.1. O CONTRATANTE devera informar sobre restricoes alimentares e alergias com antecedencia minima de 7 dias.", yPosition, 9);
      yPosition = addText("12.2. O CONTRATADO se compromete a adaptar o cardapio sempre que possivel para atender as restricoes informadas.", yPosition, 9);
      yPosition = addText("12.3. O CONTRATADO isenta-se de responsabilidade por reacoes alergicas se as restricoes nao forem informadas no prazo estabelecido.", yPosition, 9);
      yPosition = addText("12.4. Cardapios especiais para restricoes severas podem gerar custos adicionais.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("13. DA SEGURANCA E RESPONSABILIDADES", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("13.1. O CONTRATADO mantem seguro de responsabilidade civil vigente para cobertura de eventuais danos durante o evento.", yPosition, 9);
      yPosition = addText("13.2. A supervisao e responsabilidade pelas criancas e exclusiva dos pais ou responsaveis legais.", yPosition, 9);
      yPosition = addText("13.3. O CONTRATADO disponibilizara kit de primeiros socorros basico durante o evento.", yPosition, 9);
      yPosition = addText("13.4. O CONTRATANTE responsabiliza-se por danos ao patrimonio do local causados pelos convidados.", yPosition, 9);
      yPosition = addText("13.5. O CONTRATADO nao se responsabiliza por objetos pessoais perdidos ou danificados durante o evento.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("14. DOS SERVICOS NAO INCLUSOS", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("Os seguintes itens NAO estao inclusos neste contrato, salvo especificacao em contrario no item 3:", yPosition, 9);
      yPosition = addText("- Bolo de aniversario (o CONTRATADO pode fornecer mediante orcamento adicional)", yPosition, 9);
      yPosition = addText("- Convites personalizados", yPosition, 9);
      yPosition = addText("- Lembrancinhas e brindes", yPosition, 9);
      yPosition = addText("- Fotografo ou videomaker profissional", yPosition, 9);
      yPosition = addText("- Aluguel do espaco/salao (caso nao seja proprio do CONTRATADO)", yPosition, 9);
      yPosition = addText("- Servicos de transporte de convidados", yPosition, 9);
      yPosition = addText("- Personagens caracterizados (podem ser contratados separadamente)", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      yPosition = addText("15. DO CASO FORTUITO E FORCA MAIOR", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("15.1. Nenhuma das partes sera responsabilizada por descumprimento contratual em casos de forca maior ou caso fortuito, tais como:", yPosition, 9);
      yPosition = addText("   - Condicoes climaticas extremas que impossibilitem a realizacao do evento;", yPosition, 9);
      yPosition = addText("   - Pandemias ou restricoes sanitarias impostas por autoridades publicas;", yPosition, 9);
      yPosition = addText("   - Catastrofes naturais;", yPosition, 9);
      yPosition = addText("   - Interrupcao de servicos essenciais (energia, agua) por motivos alheios as partes.", yPosition, 9);
      yPosition = addSpace(yPosition, 3);
      yPosition = addText("15.2. Em caso de impossibilidade de realizacao por forca maior, as partes negociarao de boa-fe o reagendamento ou devolucao proporcional dos valores.", yPosition, 9);
      yPosition = addSpace(yPosition, 8);

      // Nova página para disposições finais e assinaturas
      if (yPosition > pageHeight - 100) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = 20;
      }

      yPosition = addText("16. DAS DISPOSICOES GERAIS", yPosition, 11, true);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("16.1. Este contrato tem validade a partir da data de assinatura e se estende ate a realizacao completa do evento e quitacao de todos os pagamentos.", yPosition, 9);
      yPosition = addText("16.2. Qualquer alteracao neste contrato devera ser formalizada por escrito e assinada por ambas as partes.", yPosition, 9);
      yPosition = addText("16.3. Todas as comunicacoes oficiais entre as partes deverao ser feitas por escrito (e-mail, WhatsApp ou carta registrada).", yPosition, 9);
      yPosition = addText("16.4. O presente contrato e regido pelas leis brasileiras, especialmente pelo Codigo Civil e Codigo de Defesa do Consumidor.", yPosition, 9);
      yPosition = addText("16.5. Fica eleito o Foro da Comarca de Presidente Prudente - SP para dirimir quaisquer questoes oriundas deste contrato.", yPosition, 9);
      yPosition = addSpace(yPosition, 3);
      yPosition = addText("16.6. As partes declaram ter lido, compreendido e concordado com todos os termos deste contrato.", yPosition, 9);
      yPosition = addSpace(yPosition, 15);

      // ===== ASSINATURAS =====
      if (yPosition > pageHeight - 80) {
        addFooter();
        doc.addPage();
        currentPage++;
        yPosition = 30;
      }

      yPosition = addText(`Presidente Prudente, SP, ${formatDate(new Date().toISOString())}`, yPosition, 10);
      yPosition = addSpace(yPosition, 20);

      // Linha para assinatura do contratante (esquerda)
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, margin + 70, yPosition);
      yPosition = addSpace(yPosition, 5);
      yPosition = addText("CONTRATANTE", yPosition, 9, true);
      yPosition = addText(festa.cliente_nome, yPosition, 9);
      yPosition = addText("CPF: _______________________", yPosition, 8);

      // Linha para assinatura do contratado (direita)
      const savedY = yPosition;
      yPosition = savedY - 30;
      const xRightSignature = pageWidth - margin - 70;
      doc.line(xRightSignature, yPosition, xRightSignature + 70, yPosition);
      yPosition = addSpace(yPosition, 5);
      doc.text("CONTRATADO", xRightSignature, yPosition, { maxWidth: 70 });
      yPosition = addSpace(yPosition, 5);
      doc.text("Tio Fabinho Buffet", xRightSignature, yPosition, { maxWidth: 70 });
      yPosition = addSpace(yPosition, 5);
      doc.text("CNPJ: [Preencher]", xRightSignature, yPosition, { maxWidth: 70 });

      yPosition = Math.max(savedY, yPosition);
      yPosition = addSpace(yPosition, 15);

      // Testemunhas (opcional)
      yPosition = addText("TESTEMUNHAS:", yPosition, 9, true);
      yPosition = addSpace(yPosition, 10);

      doc.line(margin, yPosition, margin + 60, yPosition);
      doc.line(xRightSignature, yPosition, xRightSignature + 60, yPosition);
      yPosition = addSpace(yPosition, 5);
      doc.text("Nome: _____________________", margin, yPosition);
      doc.text("Nome: _____________________", xRightSignature, yPosition);
      yPosition = addSpace(yPosition, 5);
      doc.text("CPF: ______________________", margin, yPosition);
      doc.text("CPF: ______________________", xRightSignature, yPosition);

      // Adicionar rodapé na última página
      addFooter();

      // Salvar PDF
      const fileName = `Contrato_${festa.titulo.replace(/\s+/g, "_")}_${numeroContrato}.pdf`;
      doc.save(fileName);

      // Salvar registro do contrato no banco de dados
      const templateHTML = generateContractHTML();
      const { error: contratoError } = await supabase
        .from("contratos")
        .insert([
          {
            festa_id: festa.id,
            template_html: templateHTML,
            pdf_url: null,
          },
        ]);

      if (contratoError) {
        console.error("Erro ao salvar contrato no banco:", contratoError);
      }

      alert("Contrato profissional gerado com sucesso!");
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
          Contrato Profissional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-blue-900 mb-1 text-base sm:text-lg">Contrato de Prestação de Serviços</h4>
                <p className="text-sm text-blue-800">
                  Gere um contrato profissional e juridicamente robusto com todas as cláusulas necessárias para buffet infantil.
                </p>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-md p-3 mb-4 space-y-2 text-xs sm:text-sm">
              <p className="text-gray-700"><strong>O contrato inclui:</strong></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Qualificação completa das partes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Detalhamento dos serviços inclusos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Condições financeiras e parcelas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>16 cláusulas contratuais profissionais</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Políticas de cancelamento e reagendamento</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Responsabilidades e seguros</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Restrições alimentares e alergias</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Espaços para assinaturas e testemunhas</span>
                </div>
              </div>
            </div>

            {orcamento && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm font-semibold text-amber-900 mb-1">💰 Resumo Financeiro</p>
                <p className="text-sm text-amber-800">
                  Valor Total: <span className="font-bold">{Number(orcamento.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </p>
                {orcamento.forma_pagamento === "parcelado" && (
                  <p className="text-xs text-amber-700 mt-1">
                    {parcelas.length > 0 ? `${parcelas.length} parcelas detalhadas no contrato` : `${orcamento.quantidade_parcelas} parcelas`}
                  </p>
                )}
              </div>
            )}
            
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? "Gerando Contrato..." : "Gerar Contrato Profissional PDF"}
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-medium mb-2">⚠️ Atenção: Campos para Preencher Manualmente</p>
            <p className="text-xs text-yellow-700">
              O contrato será gerado com alguns campos marcados como <strong>[Preencher]</strong> (CNPJ da empresa, endereço completo, etc.). 
              Preencha estas informações antes de imprimir e assinar o documento.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

