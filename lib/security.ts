/**
 * Utilitários de segurança: validação de input, escape para filtros e mensagens seguras.
 * Reutilizar em Server Actions para hardening consistente.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Valida formato UUID (v4). */
export function isValidUUID(token: string): boolean {
  return typeof token === "string" && UUID_REGEX.test(token.trim());
}

/** Limites para assinatura por token (evitar payload excessivo e abuso). */
export const ASSINATURA_LIMITES = {
  nomeMaxLength: 200,
  /** Tamanho máximo do base64 da imagem de assinatura (ex.: ~500KB em base64). */
  signatureBase64MaxBytes: 700_000,
} as const;

/** Valida nome do assinante (comprimento e caracteres seguros). */
export function validarNomeAssinante(nome: string): { valido: boolean; erro?: string } {
  const t = nome?.trim();
  if (!t) return { valido: false, erro: "Nome do assinante é obrigatório." };
  if (t.length > ASSINATURA_LIMITES.nomeMaxLength) {
    return { valido: false, erro: "Nome muito longo." };
  }
  return { valido: true };
}

/** Valida payload base64 da assinatura (tamanho e formato). */
export function validarSignatureBase64(value: string): { valido: boolean; erro?: string } {
  if (typeof value !== "string" || !value) {
    return { valido: false, erro: "Assinatura é obrigatória." };
  }
  const len = value.length;
  if (len > ASSINATURA_LIMITES.signatureBase64MaxBytes) {
    return { valido: false, erro: "Assinatura muito grande." };
  }
  try {
    const buf = Buffer.from(value, "base64");
    if (buf.length > 400_000) return { valido: false, erro: "Assinatura muito grande." };
    return { valido: true };
  } catch {
    return { valido: false, erro: "Formato de assinatura inválido." };
  }
}

/**
 * Escapa string para uso seguro em filtros PostgREST (ilike).
 * Evita injeção de sintaxe e caracteres curinga.
 */
export function escapeForPostgrestIlike(value: string): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ");
}

/** Mensagem genérica para o cliente quando ocorre erro interno (não expor detalhes). */
export const MSG_ERRO_GENERICO = "Falha ao processar. Tente novamente.";
