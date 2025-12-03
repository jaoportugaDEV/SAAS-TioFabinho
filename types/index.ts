export type FuncaoFreelancer = 'monitor' | 'cozinheira' | 'fotografo' | 'outros';

export type StatusFesta = 'planejamento' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';

export type StatusPagamento = 'pendente' | 'pago_parcial' | 'pago_total';

export type StatusConfirmacao = 'pendente' | 'confirmado';

export interface Freelancer {
  id: string;
  nome: string;
  foto_url: string | null;
  funcao: FuncaoFreelancer;
  whatsapp: string;
  pix: string;
  dias_disponiveis: string[]; // Array de datas ISO (deprecated - usar dias_semana_disponiveis)
  dias_semana_disponiveis: number[]; // Array de dias da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  ativo: boolean;
  created_at: string;
}

export interface Festa {
  id: string;
  titulo: string;
  data: string;
  horario?: string;
  tema: string;
  local: string;
  cliente_nome: string;
  cliente_contato: string;
  cliente_observacoes?: string;
  status: StatusFesta;
  created_at: string;
}

export interface FestaFreelancer {
  id: string;
  festa_id: string;
  freelancer_id: string;
  status_confirmacao: StatusConfirmacao;
  freelancer?: Freelancer;
}

export interface FestaFoto {
  id: string;
  festa_id: string;
  foto_url: string;
  uploaded_at: string;
}

export interface Contrato {
  id: string;
  festa_id: string;
  template_html: string;
  pdf_url: string | null;
  created_at: string;
}

export interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface Orcamento {
  id: string;
  festa_id: string;
  itens: ItemOrcamento[];
  desconto: number;
  acrescimo: number;
  total: number;
  status_pagamento: StatusPagamento;
  observacoes?: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  festa_id: string;
  tarefa: string;
  concluido: boolean;
  ordem: number;
  created_at: string;
}

export interface PagamentoFreelancer {
  id: string;
  festa_id: string;
  freelancer_id: string;
  valor: number;
  data_pagamento: string;
  comprovante_pix?: string;
  observacoes?: string;
  freelancer?: Freelancer;
}

export interface MensagemWhatsApp {
  id: string;
  festa_id: string;
  freelancer_id: string;
  template: string;
  mensagem: string;
  enviado_em: string;
}

export interface DespesaFesta {
  id: string;
  festa_id: string;
  descricao: string;
  valor: number;
  categoria: 'freelancer' | 'material' | 'aluguel' | 'outros';
  data: string;
}

