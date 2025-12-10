-- Migração: Adicionar campo duracao_horas à tabela festas
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna duracao_horas com valor padrão de 4.5 horas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS duracao_horas DECIMAL(3,1) DEFAULT 4.5;

-- Atualizar festas existentes que não têm valor
UPDATE festas 
SET duracao_horas = 4.5 
WHERE duracao_horas IS NULL;

-- Verificar se foi adicionado com sucesso
-- SELECT id, titulo, duracao_horas FROM festas LIMIT 5;

