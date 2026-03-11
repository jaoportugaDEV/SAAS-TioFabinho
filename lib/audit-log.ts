/**
 * Log de auditoria para eventos críticos. Em produção, redirecionar para serviço de log (ex.: Datadog, Sentry).
 * Não logar PII em texto claro; usar códigos ou hashes quando necessário.
 */

type AuditAction =
  | "login"
  | "logout"
  | "empresa_troca"
  | "contrato_assinatura"
  | "contrato_assinatura_token"
  | "cliente_delete"
  | "festa_delete"
  | "export"
  | "download_sensivel";

type AuditPayload = {
  action: AuditAction;
  userId?: string;
  empresaId?: string;
  targetId?: string;
  /** Não incluir dados sensíveis; usar apenas códigos/IDs. */
  meta?: Record<string, string | number | boolean>;
  correlationId?: string;
};

function redact(msg: string): string {
  return msg.replace(/[\w.+-]+@[\w.-]+\.\w+/g, "[email]");
}

export function auditLog(payload: AuditPayload): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const line = {
    ts: new Date().toISOString(),
    action: payload.action,
    userId: payload.userId ?? null,
    empresaId: payload.empresaId ?? null,
    targetId: payload.targetId ?? null,
    meta: payload.meta ?? {},
    correlationId: payload.correlationId ?? null,
  };
  const out = redact(JSON.stringify(line));
  console.error("[audit]", out);
}

export function getCorrelationId(headers: Headers): string | undefined {
  const id = headers.get("x-correlation-id") ?? headers.get("x-request-id");
  return id?.slice(0, 64) ?? undefined;
}
