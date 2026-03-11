/**
 * Padrão de segurança para webhooks: validação de assinatura e idempotência.
 * Usar quando o sistema passar a receber webhooks (ex.: pagamentos, notificações).
 */

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Valida assinatura HMAC do webhook (ex.: Stripe, Supabase).
 * @param payload corpo bruto da requisição (string ou Buffer)
 * @param signature header de assinatura (ex.: Stripe-Signature, x-webhook-signature)
 * @param secret segredo compartilhado (variável de ambiente)
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const body = typeof payload === "string" ? Buffer.from(payload, "utf8") : payload;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const received = signature.replace(/^sha256=/, "").trim();
  if (expected.length !== received.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

/** Chave de idempotência: usar como cache key para evitar processar o mesmo evento duas vezes. */
export function webhookIdempotencyKey(provider: string, eventId: string): string {
  return `webhook:${provider}:${eventId}`;
}
