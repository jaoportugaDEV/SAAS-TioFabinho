"use client";

import { useState, useEffect } from "react";
import { Festa, Orcamento, ParcelaPagamento } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import { buildPDFContrato, type DadosContratoPDF } from "@/lib/pdf-contrato";

interface ContratoGeneratorProps {
  festa: Festa;
  orcamento: Orcamento | null;
  compact?: boolean;
}

export function ContratoGenerator({ festa, orcamento, compact = false }: ContratoGeneratorProps) {
  const { empresa, empresaId } = useEmpresa();
  const [generating, setGenerating] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaPagamento[]>([]);
  const supabase = createClient();

  const nomeEmpresa = empresa?.nome || "Buffet";
  const cidadeEstado = [empresa?.cidade, empresa?.estado].filter(Boolean).join(" - ") || "Brasil";
  const enderecoEmpresa = empresa?.endereco || "Nao informado";
  const razaoSocial = empresa?.razao_social || empresa?.nome || "Nao informado";
  const cnpjEmpresa = empresa?.cnpj || "Nao informado";
  const telefoneEmpresa = empresa?.telefone || "Nao informado";
  const emailEmpresa = "Nao informado"; // schema empresas nao tem email

  const [cliente, setCliente] = useState<{ nome: string; cpf_cnpj?: string | null; email?: string | null; telefone?: string | null; whatsapp?: string | null; endereco?: string | null; cidade?: string | null; estado?: string | null; cep?: string | null } | null>(null);

  // Carregar parcelas se existirem
  useEffect(() => {
    if (orcamento?.id) {
      loadParcelas();
    }
  }, [orcamento?.id]);

  // Carregar cliente quando festa tem cliente_id (para PDF e HTML com dados completos)
  useEffect(() => {
    if (!festa.cliente_id || !empresaId) {
      setCliente(null);
      return;
    }
    const loadCliente = async () => {
      const { data } = await supabase
        .from("clientes")
        .select("nome, cpf_cnpj, email, telefone, whatsapp, endereco, cidade, estado, cep")
        .eq("id", festa.cliente_id)
        .eq("empresa_id", empresaId)
        .single();
      setCliente(data ?? null);
    };
    loadCliente();
  }, [festa.cliente_id, empresaId]);

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
        <title>Contrato ${numeroContrato} - ${nomeEmpresa}</title>
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
        <h1>${nomeEmpresa.toUpperCase()}</h1>
        <h2>Contrato de Prestação de Serviços de Buffet Infantil</h2>
        
        <div class="info">
          <p><span class="destaque">Contrato Nº:</span> ${numeroContrato}</p>
          <p><span class="destaque">Data de Emissão:</span> ${formatDate(new Date().toISOString())}</p>
        </div>
        
        <h3>1. QUALIFICAÇÃO DAS PARTES</h3>
        <p><span class="destaque">CONTRATADO:</span></p>
        <p>Razão Social: ${razaoSocial}</p>
        <p>CNPJ: ${cnpjEmpresa}</p>
        <p>Endereço: ${enderecoEmpresa} - ${cidadeEstado}</p>
        <p>Telefone/WhatsApp: ${telefoneEmpresa}</p>
        <p>E-mail: ${emailEmpresa}</p>
        
        <p><span class="destaque">CONTRATANTE:</span></p>
        <p>Nome: ${festa.cliente_nome}</p>
        <p>CPF/CNPJ: ${cliente?.cpf_cnpj?.trim() ? cliente.cpf_cnpj : "Nao informado"}</p>
        <p>Endereço: ${cliente?.endereco || cliente?.cidade || cliente?.estado || cliente?.cep ? [cliente?.endereco, cliente?.cidade, cliente?.estado, cliente?.cep].filter(Boolean).join(", ") : "Nao informado"}</p>
        <p>Telefone: ${(cliente?.telefone || cliente?.whatsapp || festa.cliente_contato) || "Nao informado"}</p>
        <p>E-mail: ${cliente?.email?.trim() ? cliente.email : "Nao informado"}</p>
        
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
          <p><strong>5.4. Das Disposições Gerais:</strong> Este contrato é regido pelas leis brasileiras, elegendo-se o Foro de ${cidadeEstado}.</p>
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
            <p>${nomeEmpresa}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    if (festa.cliente_id && cliente) {
      const semCpf = !cliente.cpf_cnpj?.trim();
      const semEmail = !cliente.email?.trim();
      if (semCpf || semEmail) {
        alert("Complete o cadastro do cliente (CPF/CNPJ e e-mail) antes de gerar o contrato.");
        return;
      }
    }
    setGenerating(true);

    try {
      const numeroContrato = `CTR-${festa.id.substring(0, 8).toUpperCase()}`;
      const dados: DadosContratoPDF = {
        festa: {
          id: festa.id,
          titulo: festa.titulo,
          data: festa.data,
          cliente_nome: festa.cliente_nome,
          horario: festa.horario,
          tema: festa.tema,
          local: festa.local,
        },
        orcamento: orcamento ? { total: orcamento.total } : undefined,
        contratante: cliente
          ? {
              nome: cliente.nome,
              cpf_cnpj: cliente.cpf_cnpj ?? null,
              email: cliente.email ?? null,
              telefone: (cliente.telefone || cliente.whatsapp) ?? null,
              endereco: cliente.endereco ?? null,
              cidade: cliente.cidade ?? null,
              estado: cliente.estado ?? null,
              cep: cliente.cep ?? null,
            }
          : null,
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
        contrato: { created_at: new Date().toISOString() },
      };
      const { doc } = buildPDFContrato(dados);
      const fileName = `Contrato_${festa.titulo.replace(/\s+/g, "_")}_${numeroContrato}.pdf`;
      doc.save(fileName);

      // Salvar registro do contrato no banco de dados
      const templateHTML = generateContractHTML();
      const { error: contratoError } = await supabase
        .from("contratos")
        .insert([
          {
            empresa_id: empresaId,
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

  if (compact) {
    return (
      <Button
        onClick={generatePDF}
        disabled={generating}
        variant="outline"
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
      >
        <Download className="w-4 h-4 mr-2" />
        {generating ? "Gerando..." : "Gerar Contrato PDF"}
      </Button>
    );
  }

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

