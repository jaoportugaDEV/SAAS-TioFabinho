"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssinaturaCanvas } from "./assinatura-canvas";
import { formatDate } from "@/lib/utils";
import { registrarAssinaturaPorToken } from "@/app/actions/contratos";
import type { ContratoPorTokenResumo } from "@/app/actions/contratos";
import { FileText, CheckCircle, Download } from "lucide-react";

interface AssinarPorLinkProps {
  token: string;
  data: ContratoPorTokenResumo;
}

export function AssinarPorLink({ token, data }: AssinarPorLinkProps) {
  const [nomeAssinante, setNomeAssinante] = useState(data.festa.cliente_nome);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    setNomeAssinante(data.festa.cliente_nome);
  }, [data.festa.cliente_nome]);

  const handleConfirmSignature = async (signatureBase64: string) => {
    const nome = nomeAssinante.trim();
    if (!nome) {
      setErro("Informe o nome do assinante.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const result = await registrarAssinaturaPorToken(token, {
        nome,
        signatureBase64,
      });
      if (!result.success) throw new Error(result.error);
      setPdfUrl(result.pdf_assinado_url);
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao assinar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <CardTitle>Contrato assinado com sucesso</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              O contrato foi assinado digitalmente. Você pode baixar o documento abaixo.
            </p>
          </CardHeader>
          <CardContent>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                Baixar PDF assinado
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Assinar contrato
          </CardTitle>
          <p className="text-sm text-gray-600">
            Contrato do evento &quot;{data.festa.titulo}&quot; — {data.empresa.nome}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p>
              <strong>Cliente:</strong> {data.festa.cliente_nome}
            </p>
            <p>
              <strong>Data do evento:</strong> {formatDate(data.festa.data)}
            </p>
            {data.orcamento && (
              <p>
                <strong>Valor:</strong>{" "}
                {Number(data.orcamento.total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome-assinante">Nome do assinante *</Label>
            <Input
              id="nome-assinante"
              value={nomeAssinante}
              onChange={(e) => setNomeAssinante(e.target.value)}
              placeholder="Nome completo"
              disabled={loading}
              className={erro ? "border-red-500" : ""}
            />
            {erro && <p className="text-sm text-red-600">{erro}</p>}
          </div>

          <AssinaturaCanvas
            onConfirm={handleConfirmSignature}
            disabled={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
