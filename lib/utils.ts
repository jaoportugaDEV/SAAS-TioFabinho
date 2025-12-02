import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function whatsappLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const baseUrl = 'https://wa.me/55' + cleaned;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

export function calcularTotalOrcamento(
  itens: { quantidade: number; valor_unitario: number }[],
  desconto: number = 0,
  acrescimo: number = 0
): number {
  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
  return subtotal - desconto + acrescimo;
}

