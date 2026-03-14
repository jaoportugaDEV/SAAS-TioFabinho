import type { StatusPagamento, StatusParcela } from "@/types";

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = {
  pendente: "Pendente",
  pago_parcial: "Pago Parcial",
  pago_total: "Pago Total",
};

export function normalizeParcelaStatus(status: string): StatusParcela {
  if (status === "pago") return "paga";
  if (status === "paga" || status === "atrasada") return status;
  return "pendente";
}

export function isParcelaPaga(status: string): boolean {
  return normalizeParcelaStatus(status) === "paga";
}

export function getPagamentoStatusFromParcelas(
  parcelas: Array<{ status: string }>
): StatusPagamento {
  if (!parcelas || parcelas.length === 0) return "pendente";
  const todasPagas = parcelas.every((p) => isParcelaPaga(p.status));
  const algumaPaga = parcelas.some((p) => isParcelaPaga(p.status));

  if (todasPagas) return "pago_total";
  if (algumaPaga) return "pago_parcial";
  return "pendente";
}

export function sumParcelasPagas(
  parcelas: Array<{ status: string; valor: number | string | null | undefined }>
): number {
  return (parcelas || [])
    .filter((p) => isParcelaPaga(String(p.status ?? "")))
    .reduce((acc, p) => acc + Number(p.valor ?? 0), 0);
}

export function getOrcamentoPagamentoResumo(
  total: number,
  valorPagoParcelas: number,
  formaPagamento?: string,
  entrada?: number
): {
  valorPagoReal: number;
  valorPendente: number;
  isParcial: boolean;
} {
  const entradaPaga = formaPagamento === "parcelado" ? Math.max(0, Number(entrada || 0)) : 0;
  const valorPagoParcelasNormalizado = Math.max(0, Number(valorPagoParcelas || 0));
  const valorPagoReal = Math.min(Number(total || 0), valorPagoParcelasNormalizado + entradaPaga);
  const valorPendente = Math.max(0, Number(total || 0) - valorPagoReal);
  return {
    valorPagoReal,
    valorPendente,
    isParcial: valorPagoReal > 0 && valorPendente > 0,
  };
}
