-- Script para adicionar sistema de bônus aos freelancers
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de bônus na tabela festa_freelancers
ALTER TABLE festa_freelancers 
ADD COLUMN IF NOT EXISTS valor_bonus DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS motivo_bonus TEXT;

-- Adicionar comentários explicativos
COMMENT ON COLUMN festa_freelancers.valor_bonus IS 'Valor adicional/bônus concedido ao freelancer nesta festa';
COMMENT ON COLUMN festa_freelancers.motivo_bonus IS 'Motivo/descrição opcional do bônus (ex: "Horas extras", "Excelente trabalho")';

-- Verificar se as colunas foram criadas corretamente
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'festa_freelancers' 
  AND column_name IN ('valor_bonus', 'motivo_bonus')
ORDER BY ordinal_position;

-- Estatísticas após migração
SELECT 
  'Total de vínculos festa-freelancer' as metrica,
  COUNT(*) as quantidade
FROM festa_freelancers
UNION ALL
SELECT 
  'Vínculos com bônus' as metrica,
  COUNT(*) as quantidade
FROM festa_freelancers
WHERE valor_bonus > 0;
