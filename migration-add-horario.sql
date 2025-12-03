-- Migração: Adicionar campo de horário nas festas
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna horario na tabela festas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS horario TIME;

-- Comentário explicativo
COMMENT ON COLUMN festas.horario IS 'Horário de início da festa';

-- Sucesso!
-- A coluna horario foi adicionada com sucesso.

