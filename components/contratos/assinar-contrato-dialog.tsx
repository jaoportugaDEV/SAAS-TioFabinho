"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEmpresa } from "@/lib/empresa-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssinaturaCanvas } from "./assinatura-canvas";
import { formatDate } from "@/lib/utils";
import { registrarAssinaturaContratado } from "@/app/actions/contratos";

interface ContratoComFesta {
  id: string;
  festa_id: string;
  template_html: string;
  pdf_url: string | null;
  created_at: string;
  status?: string;
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

interface AssinarContratoDialogProps {
  contrato: ContratoComFesta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssinarContratoDialog({
  contrato,
  open,
  onOpenChange,
  onSuccess,
}: AssinarContratoDialogProps) {
  const { empresa, empresaId } = useEmpresa();
  const nomeEmpresa = empresa?.nome || "Buffet";
  const [nomeAssinante, setNomeAssinante] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const supabase = createClient();

  const handleConfirmSignature = async (signatureBase64: string) => {
    if (!contrato || !empresaId) return;
    const nome = (nomeAssinante.trim() || nomeEmpresa).trim();
    if (!nome) {
      setErro("Informe o nome do assinante.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const bucket = process.env.NEXT_PUBLIC_BUCKET_CONTRATOS_ASSINADOS_ID ?? "contratos_assinados";
      const prefix = `${empresaId}/${contrato.id}`;
      const pathAssinatura = `${prefix}-contratado-assinatura.png`;

      const signatureBlob = fetch(`data:image/png;base64,${signatureBase64}`).then((r) => r.blob());
      const signatureBlobRes = await signatureBlob;

      const { error: uploadSigError } = await supabase.storage
        .from(bucket)
        .upload(pathAssinatura, signatureBlobRes, { contentType: "image/png", upsert: true });

      if (uploadSigError) throw uploadSigError;

      const { data: sigUrlData } = supabase.storage.from(bucket).getPublicUrl(pathAssinatura);
      const assinaturaUrl = sigUrlData.publicUrl;

      const result = await registrarAssinaturaContratado(contrato.id, {
        assinado_por_nome: nome,
        assinatura_url: assinaturaUrl,
      });

      if (!result.success) throw new Error(result.error);
      onSuccess();
      onOpenChange(false);
      setNomeAssinante("");
    } catch (err) {
      console.error(err);
      const msg =
        err && typeof err === "object" && "message" in err && String((err as { message: string }).message).toLowerCase().includes("bucket")
          ? "Bucket de storage não encontrado. No Supabase, use Storage > New bucket com o nome: contratos_assinados (público) ou execute o script em supabase/scripts/criar-bucket-contratos.sql no SQL Editor."
          : err instanceof Error
            ? err.message
            : "Erro ao assinar contrato. Tente novamente.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!contrato) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assinar contrato</DialogTitle>
          <DialogDescription>
            Contrato da festa &quot;{contrato.festa.titulo}&quot; — {contrato.festa.cliente_nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6 pb-2">
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p>
              <strong>Cliente:</strong> {contrato.festa.cliente_nome}
            </p>
            <p>
              <strong>Data do evento:</strong> {formatDate(contrato.festa.data)}
            </p>
            {contrato.orcamento && (
              <p>
                <strong>Valor:</strong>{" "}
                {Number(contrato.orcamento.total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome-assinante">Nome do buffet (contratado) *</Label>
            <Input
              id="nome-assinante"
              value={nomeAssinante}
              onChange={(e) => setNomeAssinante(e.target.value)}
              placeholder={nomeEmpresa}
              disabled={loading}
              className={erro ? "border-red-500" : ""}
            />
            {erro && <p className="text-sm text-red-600">{erro}</p>}
          </div>

          <AssinaturaCanvas
            onConfirm={handleConfirmSignature}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
