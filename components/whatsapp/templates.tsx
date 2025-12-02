"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Copy, Send } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

interface TemplatesWhatsAppProps {
  freelancerNome: string;
  freelancerWhatsApp: string;
  festaData?: string;
  festaLocal?: string;
  valorPagamento?: number;
}

export function TemplatesWhatsApp({
  freelancerNome,
  freelancerWhatsApp,
  festaData,
  festaLocal,
  valorPagamento,
}: TemplatesWhatsAppProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");

  const templates = [
    {
      id: "disponibilidade",
      titulo: "Confirmar Disponibilidade",
      mensagem: `Olá ${freelancerNome}! Tudo bem?\n\nGostaria de saber se você está disponível para trabalhar em uma festa no dia ${festaData || "[data]"}${festaLocal ? ` no local: ${festaLocal}` : ""}.\n\nPode me confirmar sua disponibilidade?\n\nObrigada!`,
    },
    {
      id: "lembrete",
      titulo: "Lembrete de Festa",
      mensagem: `Oi ${freelancerNome}!\n\nLembrando que temos uma festa amanhã (${festaData || "[data]"})${festaLocal ? ` no local: ${festaLocal}` : ""}.\n\nConta comigo!\n\nQualquer dúvida, estou à disposição.`,
    },
    {
      id: "pagamento",
      titulo: "Pagamento Efetuado",
      mensagem: `Olá ${freelancerNome}!\n\nO pagamento${valorPagamento ? ` de R$ ${valorPagamento.toFixed(2)}` : ""} referente à festa do dia ${festaData || "[data]"} foi efetuado via PIX.\n\nPor favor, confirme o recebimento.\n\nObrigada pelo excelente trabalho!`,
    },
    {
      id: "agradecimento",
      titulo: "Agradecimento",
      mensagem: `Oi ${freelancerNome}!\n\nQueria agradecer pelo ótimo trabalho na festa! Foi tudo perfeito!\n\nConto com você nas próximas festas! 🎉`,
    },
  ];

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template.id);
    setCustomMessage(template.mensagem);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    alert("Mensagem copiada!");
  };

  const handleSend = () => {
    if (!customMessage.trim()) {
      alert("Escreva uma mensagem primeiro");
      return;
    }
    window.open(whatsappLink(freelancerWhatsApp, customMessage), "_blank");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Templates de Mensagem</h3>

      {/* Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "border-primary border-2"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">{template.titulo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor de Mensagem */}
      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea
          id="mensagem"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Escreva sua mensagem aqui ou selecione um template acima"
          rows={8}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!customMessage.trim()}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copiar
        </Button>
        <Button
          onClick={handleSend}
          disabled={!customMessage.trim()}
          className="gap-2 flex-1"
        >
          <Send className="w-4 h-4" />
          Enviar pelo WhatsApp
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        A mensagem será enviada diretamente pelo WhatsApp Web
      </p>
    </div>
  );
}

