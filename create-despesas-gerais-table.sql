-- Script SQL para criar a tabela despesas_gerais no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

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

-- Criar índice para melhor performance em consultas por data
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_data ON despesas_gerais(data);

-- Habilitar Row Level Security (RLS)
ALTER TABLE despesas_gerais ENABLE ROW LEVEL SECURITY;

-- Criar política RLS: Permitir acesso completo para usuários autenticados
CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON despesas_gerais FOR ALL
  USING (auth.role() = 'authenticated');

-- Verificar se a tabela foi criada com sucesso
SELECT * FROM despesas_gerais LIMIT 1;

