"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentEmpresaId } from "@/lib/server-empresa";
import { revalidatePath } from "next/cache";
import { buildPDFContrato } from "@/lib/pdf-contrato";
import { headers } from "next/headers";
import {
  isValidUUID,
  validarNomeAssinante,
  validarSignatureBase64,
  MSG_ERRO_GENERICO,
} from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { auditLog, getCorrelationId } from "@/lib/audit-log";

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
    if (selectError) console.error("[contratos] registrarAssinatura select:", selectError.code);
    return { success: false, error: "Contrato não encontrado." };
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
    console.error("[contratos] registrarAssinatura update:", updateError.code);
    return { success: false, error: MSG_ERRO_GENERICO };
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
    if (selectError) console.error("[contratos] registrarAssinaturaContratado select:", selectError.code);
    return { success: false, error: "Contrato não encontrado." };
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
    console.error("[contratos] registrarAssinaturaContratado update:", updateError.code);
    return { success: false, error: MSG_ERRO_GENERICO };
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
    if (selectError) console.error("[contratos] criarLinkAssinatura select:", selectError.code);
    return { success: false, error: "Contrato não encontrado." };
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
    console.error("[contratos] criarLinkAssinatura insert:", insertError.code);
    return { success: false, error: MSG_ERRO_GENERICO };
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

/** Exclui um contrato (e seus tokens de assinatura por CASCADE). Só permite se pertencer à empresa atual. */
export async function excluirContrato(
  contratoId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada" };

  const { data: contrato, error: selectError } = await supabase
    .from("contratos")
    .select("id")
    .eq("id", contratoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !contrato) {
    if (selectError) console.error("[contratos] excluirContrato select:", selectError.code);
    return { success: false, error: "Contrato não encontrado." };
  }

  const { error: deleteError } = await supabase
    .from("contratos")
    .delete()
    .eq("id", contratoId)
    .eq("empresa_id", empresaId);

  if (deleteError) {
    console.error("[contratos] excluirContrato delete:", deleteError.code);
    return { success: false, error: MSG_ERRO_GENERICO };
  }

  revalidatePath("/dashboard/contratos");
  return { success: true };
}

export type ContratoPorTokenResumo = {
  festa: { titulo: string; data: string; cliente_nome: string; horario?: string; tema?: string; local?: string; id: string };
  orcamento?: { total: number };
  empresa: { nome: string; cidade: string | null; estado: string | null; endereco?: string | null; telefone?: string | null; razao_social?: string | null; cnpj?: string | null };
  contratante?: { nome: string; cpf_cnpj?: string | null; email?: string | null; telefone?: string | null; endereco?: string | null; cidade?: string | null; estado?: string | null; cep?: string | null } | null;
  contrato: { created_at: string; id: string; festa_id: string };
};

export async function getContratoPorToken(
  token: string
): Promise<{ success: true; data: ContratoPorTokenResumo } | { success: false; error: string }> {
  const h = await headers();
  const ip = getClientIp(h);
  if (!checkRateLimit(`assinar:${ip}`, 30, 60_000)) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }
  if (!isValidUUID(token)) {
    return { success: false, error: "Link inválido ou expirado." };
  }

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
    .select("id, festa_id, empresa_id, created_at, assinado_at")
    .eq("id", row.contrato_id)
    .single();

  if (contratoError || !contrato || contrato.assinado_at) {
    return { success: false, error: "Contrato não disponível para assinatura." };
  }

  if (contrato.empresa_id !== row.empresa_id) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: festa, error: festaError } = await admin
    .from("festas")
    .select("id, titulo, data, cliente_id, cliente_nome, horario, tema, local, empresa_id")
    .eq("id", contrato.festa_id)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Dados do evento não encontrados." };
  }

  if (festa.empresa_id !== row.empresa_id) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: orcamento } = await admin
    .from("orcamentos")
    .select("total")
    .eq("festa_id", contrato.festa_id)
    .maybeSingle();

  const { data: empresa, error: empresaError } = await admin
    .from("empresas")
    .select("nome, cidade, estado, endereco, telefone, razao_social, cnpj")
    .eq("id", row.empresa_id)
    .single();

  if (empresaError || !empresa) {
    return { success: false, error: "Dados da empresa não encontrados." };
  }

  let contratante: ContratoPorTokenResumo["contratante"] = null;
  if (festa.cliente_id) {
    const { data: cliente } = await admin
      .from("clientes")
      .select("nome, cpf_cnpj, email, telefone, whatsapp, endereco, cidade, estado, cep")
      .eq("id", festa.cliente_id)
      .eq("empresa_id", row.empresa_id)
      .single();
    if (cliente) {
      contratante = {
        nome: cliente.nome,
        cpf_cnpj: cliente.cpf_cnpj ?? null,
        email: cliente.email ?? null,
        telefone: (cliente.telefone || cliente.whatsapp) ?? null,
        endereco: cliente.endereco ?? null,
        cidade: cliente.cidade ?? null,
        estado: cliente.estado ?? null,
        cep: cliente.cep ?? null,
      };
    }
  }

  return {
    success: true,
    data: {
      festa: { id: festa.id, ...festa },
      orcamento: orcamento ?? undefined,
      empresa: {
        nome: empresa.nome,
        cidade: empresa.cidade ?? null,
        estado: empresa.estado ?? null,
        endereco: empresa.endereco ?? null,
        telefone: empresa.telefone ?? null,
        razao_social: empresa.razao_social ?? null,
        cnpj: empresa.cnpj ?? null,
      },
      contratante,
      contrato: { id: contrato.id, festa_id: contrato.festa_id, created_at: contrato.created_at },
    },
  };
}

const BUCKET_CONTRATOS_NAME = "contratos_assinados";

/** Baixa arquivo do nosso bucket a partir de URL pública ou path (evita SSRF). Retorna null se não for do nosso storage. */
async function downloadFromOurStorage(
  admin: ReturnType<typeof getAdminClient>,
  bucketIdOrName: string,
  urlOrPath: string
): Promise<Buffer | null> {
  if (!urlOrPath || typeof urlOrPath !== "string") return null;
  let path: string | null = null;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    const prefix = `${base}/storage/v1/object/public/`;
    if (!urlOrPath.startsWith(prefix)) return null;
    const after = urlOrPath.slice(prefix.length);
    const sep = after.indexOf("/");
    if (sep === -1) return null;
    const bucketInUrl = after.slice(0, sep);
    const isOurBucket =
      bucketInUrl === bucketIdOrName || bucketInUrl === BUCKET_CONTRATOS_NAME;
    if (!isOurBucket) return null;
    path = after.slice(sep + 1) || null;
  } else {
    path = urlOrPath.trim() || null;
  }
  if (!path) return null;
  try {
    const { data, error } = await admin.storage.from(bucketIdOrName).download(path);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

export async function registrarAssinaturaPorToken(
  token: string,
  params: { nome: string; signatureBase64: string }
): Promise<
  { success: true; pdf_assinado_url: string } | { success: false; error: string }
> {
  const h = await headers();
  const ip = getClientIp(h);
  if (!checkRateLimit(`assinar:${ip}`, 30, 60_000)) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }
  if (!isValidUUID(token)) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const nomeVal = validarNomeAssinante(params.nome);
  if (!nomeVal.valido) return { success: false, error: nomeVal.erro ?? "Nome inválido." };

  const sigVal = validarSignatureBase64(params.signatureBase64);
  if (!sigVal.valido) return { success: false, error: sigVal.erro ?? "Assinatura inválida." };

  const admin = getAdminClient();
  const bucket =
    process.env.NEXT_PUBLIC_BUCKET_CONTRATOS_ASSINADOS_ID ?? "contratos_assinados";
  const nome = params.nome.trim();

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
    .select("id, festa_id, empresa_id, created_at, assinado_at, contratado_assinatura_url, contratado_assinado_por_nome")
    .eq("id", row.contrato_id)
    .single();

  if (contratoError || !contrato || contrato.assinado_at) {
    return { success: false, error: "Contrato não disponível para assinatura." };
  }

  if (contrato.empresa_id !== row.empresa_id) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: festa, error: festaError } = await admin
    .from("festas")
    .select("id, titulo, data, cliente_id, cliente_nome, horario, tema, local, empresa_id")
    .eq("id", contrato.festa_id)
    .single();

  if (festaError || !festa) {
    return { success: false, error: "Dados do evento não encontrados." };
  }

  if (festa.empresa_id !== row.empresa_id) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  const { data: orcamento } = await admin
    .from("orcamentos")
    .select("total")
    .eq("festa_id", contrato.festa_id)
    .maybeSingle();

  const { data: empresa, error: empresaError } = await admin
    .from("empresas")
    .select("nome, cidade, estado, endereco, telefone, razao_social, cnpj")
    .eq("id", row.empresa_id)
    .single();

  if (empresaError || !empresa) {
    return { success: false, error: "Dados da empresa não encontrados." };
  }

  let contratante: { nome: string; cpf_cnpj?: string | null; email?: string | null; telefone?: string | null; endereco?: string | null; cidade?: string | null; estado?: string | null; cep?: string | null } | null = null;
  if (festa.cliente_id) {
    const { data: cliente } = await admin
      .from("clientes")
      .select("nome, cpf_cnpj, email, telefone, whatsapp, endereco, cidade, estado, cep")
      .eq("id", festa.cliente_id)
      .eq("empresa_id", row.empresa_id)
      .single();
    if (cliente) {
      contratante = {
        nome: cliente.nome,
        cpf_cnpj: cliente.cpf_cnpj ?? null,
        email: cliente.email ?? null,
        telefone: (cliente.telefone || cliente.whatsapp) ?? null,
        endereco: cliente.endereco ?? null,
        cidade: cliente.cidade ?? null,
        estado: cliente.estado ?? null,
        cep: cliente.cep ?? null,
      };
    }
  }

  const { data: tokenUpdated, error: consumeError } = await admin
    .from("contratos_assinatura_tokens")
    .update({ usado_em: new Date().toISOString() })
    .eq("id", row.id)
    .is("usado_em", null)
    .select("id")
    .single();

  if (consumeError || !tokenUpdated) {
    return { success: false, error: "Link já utilizado ou expirado." };
  }

  const prefix = `${row.empresa_id}/${contrato.id}`;
  const pathAssinatura = `${prefix}-assinatura.png`;
  const pathPdf = `${prefix}-assinado.pdf`;

  const signatureBuffer = Buffer.from(params.signatureBase64, "base64");
  const { error: uploadSigError } = await admin.storage
    .from(bucket)
    .upload(pathAssinatura, signatureBuffer, { contentType: "image/png", upsert: true });

  if (uploadSigError) {
    console.error("[contratos] registrarAssinaturaPorToken upload assinatura:", uploadSigError.message);
    return { success: false, error: "Falha ao salvar assinatura. Tente novamente." };
  }

  const assinaturaUrl = pathAssinatura;

  const dados = {
    festa: { id: festa.id, ...festa },
    orcamento: orcamento ?? undefined,
    contratante,
    empresa: {
      nome: empresa.nome,
      cidade: empresa.cidade ?? null,
      estado: empresa.estado ?? null,
      endereco: empresa.endereco ?? null,
      telefone: empresa.telefone ?? null,
      razao_social: empresa.razao_social ?? null,
      cnpj: empresa.cnpj ?? null,
    },
    contrato: { created_at: contrato.created_at },
  };
  const opcoesAssinatura = { signatureBase64: params.signatureBase64, nome };
  let opcoesAssinaturaContratado: { signatureBase64: string; nome: string } | undefined;
  if (contrato.contratado_assinatura_url) {
    const buf = await downloadFromOurStorage(admin, bucket, contrato.contratado_assinatura_url);
    if (buf && buf.length > 0) {
      opcoesAssinaturaContratado = {
        signatureBase64: buf.toString("base64"),
        nome: contrato.contratado_assinado_por_nome ?? empresa.nome,
      };
    }
  }
  const { doc } = buildPDFContrato(dados, opcoesAssinatura, opcoesAssinaturaContratado);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  const { error: uploadPdfError } = await admin.storage
    .from(bucket)
    .upload(pathPdf, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadPdfError) {
    console.error("[contratos] registrarAssinaturaPorToken upload PDF:", uploadPdfError.message);
    return { success: false, error: "Falha ao salvar PDF assinado. Tente novamente." };
  }

  const { error: updateContratoError } = await admin
    .from("contratos")
    .update({
      assinado_at: new Date().toISOString(),
      assinado_por_nome: nome,
      assinatura_url: assinaturaUrl,
      pdf_assinado_url: pathPdf,
    })
    .eq("id", contrato.id);

  if (updateContratoError) {
    console.error("[contratos] registrarAssinaturaPorToken update contrato:", updateContratoError.code);
    return { success: false, error: MSG_ERRO_GENERICO };
  }

  let urlParaCliente = pathPdf;
  try {
    const { data: signed } = await admin.storage.from(bucket).createSignedUrl(pathPdf, 3600);
    if (signed?.signedUrl) urlParaCliente = signed.signedUrl;
  } catch {
    // cliente pode usar getSignedUrlForContratoPdf se necessário
  }
  const reqHeaders = await headers();
  auditLog({
    action: "contrato_assinatura_token",
    empresaId: row.empresa_id,
    targetId: contrato.id,
    correlationId: getCorrelationId(reqHeaders),
  });
  return { success: true, pdf_assinado_url: urlParaCliente };
}

/** Extrai path do storage a partir de URL pública ou retorna o próprio valor se já for path (sem protocolo). */
function extractStoragePath(urlOrPath: string, bucketName: string): string | null {
  if (!urlOrPath || typeof urlOrPath !== "string") return null;
  const t = urlOrPath.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    const prefix = `${base}/storage/v1/object/public/`;
    if (!t.startsWith(prefix)) return null;
    const after = t.slice(prefix.length);
    const sep = after.indexOf("/");
    if (sep === -1) return null;
    const bucketInUrl = after.slice(0, sep);
    const path = after.slice(sep + 1);
    if (bucketInUrl !== bucketName && bucketInUrl !== BUCKET_CONTRATOS_NAME) return null;
    return path || null;
  }
  return t;
}

/** Gera URL assinada (1h) para o PDF do contrato. Usar quando o bucket for privado. */
export async function getSignedUrlForContratoPdf(
  contratoId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { success: false, error: "Empresa não selecionada." };

  const { data: contrato, error: selectError } = await supabase
    .from("contratos")
    .select("id, empresa_id, pdf_assinado_url")
    .eq("id", contratoId)
    .eq("empresa_id", empresaId)
    .single();

  if (selectError || !contrato || !contrato.pdf_assinado_url) {
    return { success: false, error: "Contrato ou PDF não encontrado." };
  }

  const bucket =
    process.env.NEXT_PUBLIC_BUCKET_CONTRATOS_ASSINADOS_ID ?? BUCKET_CONTRATOS_NAME;
  const path = extractStoragePath(contrato.pdf_assinado_url, bucket);
  if (!path) return { success: false, error: "URL do PDF inválida." };

  const admin = getAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (signError || !signed?.signedUrl) {
    console.error("[contratos] getSignedUrlForContratoPdf:", signError?.message);
    return { success: false, error: "Falha ao gerar link. Tente novamente." };
  }
  return { success: true, url: signed.signedUrl };
}
