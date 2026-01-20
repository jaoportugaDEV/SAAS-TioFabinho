export type FuncaoFreelancer = 'monitor' | 'cozinheira' | 'garcom' | 'recepcao' | 'outros';

export type StatusFesta = 'planejamento' | 'confirmada' | 'acontecendo' | 'encerrada_pendente' | 'encerrada' | 'cancelada';

export type StatusPagamento = 'pendente' | 'pago_parcial' | 'pago_total';

export type StatusParcela = 'pendente' | 'paga' | 'atrasada';

export type FormaPagamento = 'avista' | 'parcelado';

export type StatusPagamentoFreelancers = 'pendente' | 'parcial' | 'pago';

export type StatusPagamentoIndividual = 'pendente' | 'pago';

export type StatusConfirmacao = 'pendente' | 'confirmado';

export type CategoriaDespesa = 'mercado_cozinha' | 'material_festa' | 'aluguel_contas' | 'outros';

export type MetodoPagamentoDespesa = 'cartao_empresa' | 'pix' | 'debito' | 'dinheiro';

export interface Freelancer {
  id: string;
  nome: string;
  foto_url: string | null;
  funcao: FuncaoFreelancer;
  whatsapp: string;
  pix: string;
  valor_padrao: number;
  bonus_fixo?: number; // Bonificação fixa aplicada automaticamente ao adicionar em festas
  dias_disponiveis: string[]; // Array de datas ISO (deprecated - usar dias_semana_disponiveis)
  dias_semana_disponiveis: number[]; // Array de dias da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string | null;
  telefone: string;
  whatsapp?: string | null;
  cpf_cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  data_nascimento?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteComEstatisticas extends Cliente {
  total_festas: number;
  valor_total_gasto: number;
  ultima_festa_data?: string | null;
  proxima_festa_data?: string | null;
}

export interface Festa {
  id: string;
  titulo: string;
  data: string;
  horario?: string;
  duracao_horas?: number; // Duração da festa em horas (padrão: 4.5)
  tema: string;
  local: string;
  cliente_id?: string | null; // NOVO: Referência ao cliente
  cliente?: Cliente; // NOVO: Dados do cliente (para joins)
  cliente_nome: string; // Mantido por compatibilidade
  cliente_contato: string; // Mantido por compatibilidade
  cliente_observacoes?: string; // Mantido por compatibilidade
  estimativa_convidados?: number;
  quantidade_criancas?: number;
  faixas_etarias?: string[];
  status: StatusFesta;
  status_pagamento_freelancers: StatusPagamentoFreelancers;
  status_pagamento_cliente?: StatusPagamento;
  created_at: string;
}

export interface FestaFreelancer {
  id: string;
  festa_id: string;
  freelancer_id: string;
  status_confirmacao: StatusConfirmacao;
  valor_acordado: number;
  valor_bonus?: number; // Valor adicional/bônus concedido ao freelancer
  motivo_bonus?: string | null; // Motivo/descrição opcional do bônus
  status_pagamento: StatusPagamentoIndividual;
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
  forma_pagamento: FormaPagamento;
  quantidade_parcelas: number;
  entrada: number;
  observacoes?: string;
  created_at: string;
}

export interface ParcelaPagamento {
  id: string;
  orcamento_id: string;
  festa_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status: StatusParcela;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
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
  data_pagamento: string | null;
  pago: boolean;
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

export interface DespesaGeral {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: CategoriaDespesa;
  metodo_pagamento: MetodoPagamentoDespesa;
  nota_fiscal?: string;
  fornecedor?: string;
  observacoes?: string;
  created_at: string;
}

export interface RankingCliente {
  cliente_id: string;
  cliente_nome: string;
  total_festas: number;
  posicao: number;
}

export interface RankingFreelancer {
  freelancer_id: string;
  freelancer_nome: string;
  funcao: FuncaoFreelancer;
  total_festas: number;
  posicao: number;
}

export interface DistribuicaoMensal {
  mes: number;
  mes_nome: string;
  total_festas: number;
}

export interface MesMaiorDemanda {
  mes: number;
  mes_nome: string;
  total_festas: number;
  percentual_acima_media: number;
}

