/**
 * Rate limiting em memória (por instância). Para múltiplas instâncias, use Redis/Upstash.
 * Uso: verificar em Server Actions críticas (login, assinatura por token).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const TTL_MS = 60 * 1000; // 1 minuto

function prune() {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key);
  }
}

/**
 * Verifica se o identificador (ex.: IP ou IP+action) excedeu o limite.
 * @param identifier chave única (ex.: ip ou `ip:getContratoPorToken`)
 * @param limit número máximo de requisições na janela
 * @param windowMs janela em ms (padrão 60s)
 * @returns true se dentro do limite, false se excedeu (deve retornar 429)
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = TTL_MS
): boolean {
  if (store.size > 10_000) prune();
  const now = Date.now();
  const entry = store.get(identifier);
  if (!entry) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Obtém IP da requisição a partir de headers (Vercel/proxy). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
