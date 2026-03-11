"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { revalidatePath } from "next/cache";
import { buildPDFContrato } from "@/lib/pdf-contrato";
import { headers } from "next/headers";

export async function registrarAssinatura(
  contratoId: string,
  params: {
    assinado_por_nome: string;
    assinatura_url: string;
    pdf_assinado_url: string;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: contrato, error: selectError } = await supabase
    .from("contratos")
    .select("id, assinado_at, status")
    .eq("id", contratoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !contrato) {
    return { success: false, error: selectError?.message ?? "Contrato não encontrado" };
  }

  if (contrato.assinado_at) {
    return { success: false, error: "Este contrato já foi assinado." };
  }

  if (contrato.status === "cancelado") {
    return { success: false, error: "Não é possível assinar um contrato cancelado." };
  }

  const { error: updateError } = await supabase
    .from("contratos")
    .update({
      assinado_at: new Date().toISOString(),
      assinado_por_nome: params.assinado_por_nome.trim(),
      assinatura_url: params.assinatura_url,
      pdf_assinado_url: params.pdf_assinado_url,
    })
    .eq("id", contratoId)
    .eq("empresa_id", empresaId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard/contratos");
  return { success: true };
}

export async function registrarAssinaturaContratado(
  contratoId: string,
  params: { assinado_por_nome: string; assinatura_url: string }
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: contrato, error: selectError } = await supabase
    .from("contratos")
    .select("id, status")
    .eq("id", contratoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !contrato) {
    return { success: false, error: selectError?.message ?? "Contrato não encontrado" };
  }

  if (contrato.status === "cancelado") {
    return { success: false, error: "Não é possível assinar um contrato cancelado." };
  }

  const { error: updateError } = await supabase
    .from("contratos")
    .update({
      contratado_assinado_at: new Date().toISOString(),
      contratado_assinado_por_nome: params.assinado_por_nome.trim(),
      contratado_assinatura_url: params.assinatura_url,
    })
    .eq("id", contratoId)
    .eq("empresa_id", empresaId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard/contratos");
  return { success: true };
}

export async function criarLinkAssinatura(
  contratoId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: contrato, error: selectError } = await supabase
    .from("contratos")
    .select("id, assinado_at, status")
    .eq("id", contratoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !contrato) {
    return { success: false, error: selectError?.message ?? "Contrato não encontrado" };
  }

  if (contrato.assinado_at) {
    return { success: false, error: "Este contrato já foi assinado." };
  }

  if (contrato.status === "cancelado") {
    return { success: false, error: "Não é possível gerar link para contrato cancelado." };
  }

  const token = crypto.randomUUID();
  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + 15);

  const { error: insertError } = await supabase.from("contratos_assinatura_tokens").insert({
    contrato_id: contratoId,
    token,
    expira_em: expiraEm.toISOString(),
    empresa_id: empresaId,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (await (async () => {
      const h = await headers();
      const host = h.get("host") || "";
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`;
    })());
  const url = `${baseUrl}/assinar/${token}`;

  revalidatePath("/dashboard/contratos");
  return { success: true, url };
}

export type ContratoPorTokenResumo = {
  festa: { titulo: string; data: string; cliente_nome: string; horario?: string; tema?: string; local?: string; id: string };
  orcamento?: { total: number };
  empresa: { nome: string; cidade: string | null; estado: string | null };
  contrato: { created_at: string; id: string; festa_id: string };
};

export async function getContratoPorToken(
  token: string
): Promise<{ success: true; data: ContratoPorTokenResumo } | { success: false; error: string }> {
  const admin = getAdminClient();

  const { data: row, error: tokenError } = await admin
    .from("contratos_assinatura_tokens")
    .select("contrato_id, empresa_id")
    .eq("token", token)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .single();

  if (tokenError || !row) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: contrato, error: contratoError } = await admin
    .from("contratos")
    .select("id, festa_id, created_at, assinado_at")
    .eq("id", row.contrato_id)
    .single();

  if (contratoError || !contrato || contrato.assinado_at) {
    return { success: false, error: "Contrato não disponível para assinatura." };
  }

  const { data: festa, error: festaError } = await admin
    .from("festas")
    .select("id, titulo, data, cliente_nome, horario, tema, local")
    .eq("id", contrato.festa_id)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Dados do evento não encontrados." };
  }

  const { data: orcamento } = await admin
    .from("orcamentos")
    .select("total")
    .eq("festa_id", contrato.festa_id)
    .maybeSingle();

  const { data: empresa, error: empresaError } = await admin
    .from("empresas")
    .select("nome, cidade, estado")
    .eq("id", row.empresa_id)
    .single();

  if (empresaError || !empresa) {
    return { success: false, error: "Dados da empresa não encontrados." };
  }

  return {
    success: true,
    data: {
      festa: { id: festa.id, ...festa },
      orcamento: orcamento ?? undefined,
      empresa: { nome: empresa.nome, cidade: empresa.cidade ?? null, estado: empresa.estado ?? null },
      contrato: { id: contrato.id, festa_id: contrato.festa_id, created_at: contrato.created_at },
    },
  };
}

export async function registrarAssinaturaPorToken(
  token: string,
  params: { nome: string; signatureBase64: string }
): Promise<
  { success: true; pdf_assinado_url: string } | { success: false; error: string }
> {
  const admin = getAdminClient();
  const bucket =
    process.env.NEXT_PUBLIC_BUCKET_CONTRATOS_ASSINADOS_ID ?? "contratos_assinados";
  const nome = params.nome.trim();
  if (!nome) return { success: false, error: "Nome do assinante é obrigatório." };

  const { data: row, error: tokenError } = await admin
    .from("contratos_assinatura_tokens")
    .select("id, contrato_id, empresa_id")
    .eq("token", token)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .single();

  if (tokenError || !row) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: contrato, error: contratoError } = await admin
    .from("contratos")
    .select("id, festa_id, created_at, assinado_at, contratado_assinatura_url, contratado_assinado_por_nome")
    .eq("id", row.contrato_id)
    .single();

  if (contratoError || !contrato || contrato.assinado_at) {
    return { success: false, error: "Contrato não disponível para assinatura." };
  }

  const { data: festa, error: festaError } = await admin
    .from("festas")
    .select("id, titulo, data, cliente_nome, horario, tema, local")
    .eq("id", contrato.festa_id)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Dados do evento não encontrados." };
  }

  const { data: orcamento } = await admin
    .from("orcamentos")
    .select("total")
    .eq("festa_id", contrato.festa_id)
    .maybeSingle();

  const { data: empresa, error: empresaError } = await admin
    .from("empresas")
    .select("nome, cidade, estado")
    .eq("id", row.empresa_id)
    .single();

  if (empresaError || !empresa) {
    return { success: false, error: "Dados da empresa não encontrados." };
  }

  const prefix = `${row.empresa_id}/${contrato.id}`;
  const pathAssinatura = `${prefix}-assinatura.png`;
  const pathPdf = `${prefix}-assinado.pdf`;

  const signatureBuffer = Buffer.from(params.signatureBase64, "base64");
  const { error: uploadSigError } = await admin.storage
    .from(bucket)
    .upload(pathAssinatura, signatureBuffer, { contentType: "image/png", upsert: true });

  if (uploadSigError) {
    return { success: false, error: "Falha ao salvar assinatura. Tente novamente." };
  }

  const { data: sigUrlData } = admin.storage.from(bucket).getPublicUrl(pathAssinatura);
  const assinaturaUrl = sigUrlData.publicUrl;

  const dados = {
    festa: { id: festa.id, ...festa },
    orcamento: orcamento ?? undefined,
    empresa: { nome: empresa.nome, cidade: empresa.cidade ?? null, estado: empresa.estado ?? null },
    contrato: { created_at: contrato.created_at },
  };
  const opcoesAssinatura = { signatureBase64: params.signatureBase64, nome };
  let opcoesAssinaturaContratado: { signatureBase64: string; nome: string } | undefined;
  if (contrato.contratado_assinatura_url) {
    try {
      const res = await fetch(contrato.contratado_assinatura_url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        opcoesAssinaturaContratado = {
          signatureBase64: buf.toString("base64"),
          nome: contrato.contratado_assinado_por_nome ?? empresa.nome,
        };
      }
    } catch {
      // ignora falha ao carregar assinatura do contratado; PDF sai só com assinatura do cliente
    }
  }
  const { doc } = buildPDFContrato(dados, opcoesAssinatura, opcoesAssinaturaContratado);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  const { error: uploadPdfError } = await admin.storage
    .from(bucket)
    .upload(pathPdf, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadPdfError) {
    return { success: false, error: "Falha ao salvar PDF assinado. Tente novamente." };
  }

  const { data: pdfUrlData } = admin.storage.from(bucket).getPublicUrl(pathPdf);
  const pdf_assinado_url = pdfUrlData.publicUrl;

  const { error: updateContratoError } = await admin
    .from("contratos")
    .update({
      assinado_at: new Date().toISOString(),
      assinado_por_nome: nome,
      assinatura_url: assinaturaUrl,
      pdf_assinado_url,
    })
    .eq("id", contrato.id);

  if (updateContratoError) {
    return { success: false, error: updateContratoError.message };
  }

  const { error: updateTokenError } = await admin
    .from("contratos_assinatura_tokens")
    .update({ usado_em: new Date().toISOString() })
    .eq("id", row.id);

  if (updateTokenError) {
    return { success: false, error: "Erro ao finalizar. Contrato já foi assinado." };
  }

  return { success: true, pdf_assinado_url };
}
