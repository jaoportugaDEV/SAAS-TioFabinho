-- SaaS Tio Fabinho Buffet - Schema do Banco de Dados
-- Execute este script no SQL Editor do Supabase

-- Criar tipos ENUM
CREATE TYPE funcao_freelancer AS ENUM ('monitor', 'cozinheira', 'fotografo', 'outros');
CREATE TYPE status_festa AS ENUM ('planejamento', 'confirmada', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago_parcial', 'pago_total');
CREATE TYPE categoria_despesa AS ENUM ('freelancer', 'material', 'aluguel', 'outros');

-- Tabela de Freelancers
CREATE TABLE IF NOT EXISTS freelancers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  foto_url TEXT,
  funcao funcao_freelancer NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  pix VARCHAR(255) NOT NULL,
  dias_disponiveis JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Festas
CREATE TABLE IF NOT EXISTS festas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  tema VARCHAR(255),
  local TEXT,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_contato VARCHAR(50) NOT NULL,
  cliente_observacoes TEXT,
  status status_festa DEFAULT 'planejamento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de relação Festa-Freelancer (N para N)
CREATE TABLE IF NOT EXISTS festa_freelancers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(festa_id, freelancer_id)
);

-- Tabela de Fotos da Festa
CREATE TABLE IF NOT EXISTS festa_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID REFERENCES festas(id) ON DELETE CASCADE,
  template_html TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  desconto DECIMAL(10,2) DEFAULT 0,
  acrescimo DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status_pagamento status_pagamento DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Checklist
CREATE TABLE IF NOT EXISTS checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  tarefa TEXT NOT NULL,
  concluido BOOLEAN DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Pagamentos para Freelancers
CREATE TABLE IF NOT EXISTS pagamentos_freelancers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  comprovante_pix TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Mensagens WhatsApp (histórico)
CREATE TABLE IF NOT EXISTS mensagens_whatsapp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID REFERENCES festas(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  template VARCHAR(100) NOT NULL,
  mensagem TEXT NOT NULL,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Despesas da Festa
CREATE TABLE IF NOT EXISTS despesas_festas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria categoria_despesa DEFAULT 'outros',
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_freelancers_funcao ON freelancers(funcao);
CREATE INDEX idx_freelancers_ativo ON freelancers(ativo);
CREATE INDEX idx_festas_data ON festas(data);
CREATE INDEX idx_festas_status ON festas(status);
CREATE INDEX idx_festa_freelancers_festa ON festa_freelancers(festa_id);
CREATE INDEX idx_festa_freelancers_freelancer ON festa_freelancers(freelancer_id);
CREATE INDEX idx_festa_fotos_festa ON festa_fotos(festa_id);
CREATE INDEX idx_checklist_festa ON checklist(festa_id);
CREATE INDEX idx_pagamentos_freelancers_festa ON pagamentos_freelancers(festa_id);
CREATE INDEX idx_despesas_festas_festa ON despesas_festas(festa_id);

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE festas ENABLE ROW LEVEL SECURITY;
ALTER TABLE festa_freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE festa_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_festas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir acesso completo apenas para usuários autenticados
-- (A dona do sistema terá acesso total)

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON freelancers FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON festas FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON festa_freelancers FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON festa_fotos FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON contratos FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON orcamentos FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON checklist FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON pagamentos_freelancers FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON mensagens_whatsapp FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON despesas_festas FOR ALL
  USING (auth.role() = 'authenticated');

-- Storage Bucket para fotos (será criado manualmente no Supabase Dashboard)
-- Nome do bucket: 'festa-fotos'
-- Configuração: público para leitura, autenticado para escrita

