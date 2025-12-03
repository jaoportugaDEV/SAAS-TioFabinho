-- Migration: Criar tabela de valores por função
-- Execute este script no SQL Editor do Supabase

-- Tabela de Valores por Função
CREATE TABLE IF NOT EXISTS valores_funcoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcao funcao_freelancer UNIQUE NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir valores padrão
INSERT INTO valores_funcoes (funcao, valor) VALUES
  ('monitor', 50.00),
  ('cozinheira', 80.00),
  ('recepcao', 50.00),
  ('garcom', 60.00),
  ('fotografo', 0.00),
  ('outros', 0.00)
ON CONFLICT (funcao) DO NOTHING;

-- Habilitar Row Level Security
ALTER TABLE valores_funcoes ENABLE ROW LEVEL SECURITY;

-- Política RLS: Permitir acesso completo para usuários autenticados
CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON valores_funcoes FOR ALL
  USING (auth.role() = 'authenticated');

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_valores_funcoes_funcao ON valores_funcoes(funcao);

