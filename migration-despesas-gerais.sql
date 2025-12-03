-- Migration: Adicionar tabela de despesas gerais
-- Execute este script no SQL Editor do Supabase

-- Tabela de Despesas Gerais (não vinculadas a festas específicas)
CREATE TABLE IF NOT EXISTS despesas_gerais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índice para melhor performance nas consultas por data
CREATE INDEX idx_despesas_gerais_data ON despesas_gerais(data);

-- Habilitar Row Level Security (RLS)
ALTER TABLE despesas_gerais ENABLE ROW LEVEL SECURITY;

-- Política RLS: Permitir acesso completo apenas para usuários autenticados
CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON despesas_gerais FOR ALL
  USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE despesas_gerais IS 'Despesas gerais do negócio (não vinculadas a festas específicas)';
COMMENT ON COLUMN despesas_gerais.descricao IS 'Descrição da despesa (ex: Aluguel, Conta de luz, etc)';
COMMENT ON COLUMN despesas_gerais.valor IS 'Valor da despesa em reais';
COMMENT ON COLUMN despesas_gerais.data IS 'Data da despesa';
COMMENT ON COLUMN despesas_gerais.categoria IS 'Categoria da despesa (opcional)';
COMMENT ON COLUMN despesas_gerais.observacoes IS 'Observações adicionais (opcional)';

