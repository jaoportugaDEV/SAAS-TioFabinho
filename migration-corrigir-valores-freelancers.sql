-- Migration: Corrigir Valores dos Freelancers
-- Execute este script no SQL Editor do Supabase

-- 1. Atualizar valor_padrao dos freelancers existentes baseado na função
UPDATE freelancers 
SET valor_padrao = CASE funcao
  WHEN 'monitor' THEN 50.00
  WHEN 'cozinheira' THEN 80.00
  WHEN 'recepcao' THEN 50.00
  WHEN 'garcom' THEN 60.00
  WHEN 'fotografo' THEN 0.00
  WHEN 'outros' THEN 0.00
  ELSE 0.00
END
WHERE valor_padrao = 0 OR valor_padrao IS NULL;

-- 2. Atualizar valor_acordado nas festa_freelancers onde está zerado
-- Busca o valor_padrao do freelancer e atualiza o valor_acordado
UPDATE festa_freelancers ff
SET valor_acordado = f.valor_padrao
FROM freelancers f
WHERE ff.freelancer_id = f.id
  AND (ff.valor_acordado = 0 OR ff.valor_acordado IS NULL)
  AND f.valor_padrao > 0;

-- 3. Para casos onde o freelancer ainda está com valor_padrao = 0 (fotografo/outros)
-- mas precisa aparecer algum valor na festa, preenche com base na função
UPDATE festa_freelancers ff
SET valor_acordado = CASE f.funcao
  WHEN 'monitor' THEN 50.00
  WHEN 'cozinheira' THEN 80.00
  WHEN 'recepcao' THEN 50.00
  WHEN 'garcom' THEN 60.00
  WHEN 'fotografo' THEN 0.00
  WHEN 'outros' THEN 0.00
  ELSE 0.00
END
FROM freelancers f
WHERE ff.freelancer_id = f.id
  AND (ff.valor_acordado = 0 OR ff.valor_acordado IS NULL);

-- 4. Verificar resultados
-- Descomente as linhas abaixo para verificar os valores atualizados:

-- SELECT nome, funcao, valor_padrao FROM freelancers ORDER BY funcao;
-- SELECT f.nome, f.funcao, ff.valor_acordado, fest.titulo
-- FROM festa_freelancers ff
-- JOIN freelancers f ON ff.freelancer_id = f.id
-- JOIN festas fest ON ff.festa_id = fest.id
-- ORDER BY fest.data DESC;

COMMENT ON COLUMN freelancers.valor_padrao IS 'Valor padrão que o freelancer recebe por festa (baseado na função)';
COMMENT ON COLUMN festa_freelancers.valor_acordado IS 'Valor específico acordado para este freelancer nesta festa';

-- ✅ Migration concluída!
-- Os valores dos freelancers foram corrigidos automaticamente.

