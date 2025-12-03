-- Migração: Adicionar informações de convidados nas festas
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de informações dos convidados na tabela festas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS estimativa_convidados INTEGER,
ADD COLUMN IF NOT EXISTS quantidade_criancas INTEGER,
ADD COLUMN IF NOT EXISTS faixas_etarias JSONB DEFAULT '[]'::jsonb;

-- Comentários explicativos
COMMENT ON COLUMN festas.estimativa_convidados IS 'Estimativa total de convidados na festa';
COMMENT ON COLUMN festas.quantidade_criancas IS 'Quantidade de crianças esperadas';
COMMENT ON COLUMN festas.faixas_etarias IS 'Array de faixas etárias selecionadas: "0-5", "6-12", "13-17", "18+"';

-- Sucesso!
-- As colunas foram adicionadas com sucesso.
-- Agora você pode usar os novos campos de informações de convidados.

