-- Migração: Adicionar status 'acontecendo' ao ENUM status_festa
-- Execute este script no SQL Editor do Supabase

-- Adicionar o novo valor ao ENUM
ALTER TYPE status_festa ADD VALUE IF NOT EXISTS 'acontecendo';

-- Verificar se foi adicionado com sucesso
-- SELECT unnest(enum_range(NULL::status_festa));

