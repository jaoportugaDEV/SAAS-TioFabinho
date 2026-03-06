import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Converte hex (#DC2626) para HSL no formato usado por CSS variables: "H S% L%" (ex: "0 84% 51%") */
export function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 84% 51%";
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lRounded = Math.round(l * 100);
  return `${h} ${s}% ${lRounded}%`;
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

/**
 * Verifica se a festa já começou baseado na data e horário
 * @param festaData - Data da festa no formato YYYY-MM-DD
 * @param festaHorario - Horário da festa no formato HH:MM (opcional)
 * @returns true se a festa já começou, false caso contrário
 */
export function festaJaComecou(festaData: string, festaHorario?: string | null): boolean {
  const now = new Date();
  
  if (festaHorario) {
    // Se tem horário, criar data completa com horário
    const dataFesta = new Date(`${festaData}T${festaHorario}`);
    return dataFesta < now;
  } else {
    // Se não tem horário, considerar que começa às 00:00 do dia
    const dataFesta = new Date(`${festaData}T00:00:00`);
    return dataFesta < now;
  }
}

/**
 * Filtra festas removendo as que já começaram
 * @param festas - Array de festas com data e horário
 * @returns Array com apenas festas futuras
 */
export function filtrarFestasFuturas<T extends { data: string; horario?: string | null }>(festas: T[]): T[] {
  return festas.filter(festa => !festaJaComecou(festa.data, festa.horario));
}

/**
 * Gera mensagem formatada com todas as festas futuras para enviar via WhatsApp
 * @param nomeFreelancer - Nome do freelancer
 * @param festas - Array de festas futuras com título, data, horário e local
 * @returns Mensagem formatada pronta para enviar
 */
export function gerarMensagemFestasFuturas(
  nomeFreelancer: string,
  festas: Array<{ titulo: string; data: string; horario?: string | null; local: string }>
): string {
  if (festas.length === 0) {
    return `Olá ${nomeFreelancer}! Tudo bem?\n\nNo momento você não está escalado(a) em nenhuma festa futura.\n\nQualquer novidade, entro em contato!`;
  }

  let mensagem = `Olá ${nomeFreelancer}! Tudo bem?\n\nSeguem as festas que você está escalado(a):\n\n`;

  festas.forEach((festa, index) => {
    mensagem += `📅 ${festa.titulo}\n`;
    mensagem += `Data: ${formatDate(festa.data)}\n`;
    
    if (festa.horario) {
      mensagem += `Horário: ${festa.horario}\n`;
    }
    
    mensagem += `Local: ${festa.local}\n`;
    
    // Adicionar linha em branco entre festas, exceto na última
    if (index < festas.length - 1) {
      mensagem += `\n`;
    }
  });

  mensagem += `\nQualquer dúvida, estou à disposição!`;

  return mensagem;
}
