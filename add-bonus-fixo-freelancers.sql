-- =====================================================
-- MIGRATION: Adicionar Bonificação Fixa para Freelancers
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-01-14
-- =====================================================

-- Adicionar campo bonus_fixo na tabela freelancers
ALTER TABLE freelancers 
  ADD COLUMN IF NOT EXISTS bonus_fixo DECIMAL(10,2) DEFAULT 0.00;

-- Criar índice para melhorar performance em consultas (apenas onde há bônus)
CREATE INDEX IF NOT EXISTS idx_freelancers_bonus_fixo 
  ON freelancers(bonus_fixo) WHERE bonus_fixo > 0;

-- Comentário para documentação
COMMENT ON COLUMN freelancers.bonus_fixo IS 'Bonificação fixa em R$ aplicada automaticamente quando o freelancer for adicionado a uma festa';

-- Verificar se a coluna foi adicionada com sucesso
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'freelancers'
  AND column_name = 'bonus_fixo';

-- Listar freelancers com suas bonificações
SELECT 
  id,
  nome,
  funcao,
  bonus_fixo,
  ativo
FROM freelancers
ORDER BY nome;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
