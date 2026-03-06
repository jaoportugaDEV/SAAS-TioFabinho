import { cookies } from "next/headers";

export const COOKIE_EMPRESA_ID = "current_empresa_id";

/** Usar em Server Actions e Server Components para obter o empresa_id do contexto atual. */
export async function getCurrentEmpresaId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_EMPRESA_ID)?.value ?? null;
}
