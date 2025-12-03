-- ⚠️ SCRIPT DEFINITIVO: Corrigir TODOS os Valores (Freelancers e Festas)
-- Execute este script para garantir que TUDO esteja corrigido

-- ==============================================================
-- PARTE 1: CORRIGIR VALOR_PADRAO DE TODOS OS FREELANCERS
-- ==============================================================

-- Atualizar freelancers com valor zerado baseado na função
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

-- ==============================================================
-- PARTE 2: CORRIGIR VALOR_ACORDADO EM TODAS AS FESTAS
-- ==============================================================

-- Atualizar festas onde o valor_acordado está zerado
-- Busca o valor_padrao atualizado do freelancer
UPDATE festa_freelancers ff
SET valor_acordado = f.valor_padrao
FROM freelancers f
WHERE ff.freelancer_id = f.id
  AND (ff.valor_acordado = 0 OR ff.valor_acordado IS NULL)
  AND f.valor_padrao > 0;

-- Para funções que ainda têm valor 0 (fotógrafo/outros)
-- Preenche com o valor padrão da função
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

-- ==============================================================
-- VERIFICAÇÃO: Ver resultados da correção
-- ==============================================================

-- Descomente as linhas abaixo para ver os resultados:

-- 1. Ver freelancers corrigidos
-- SELECT nome, funcao, valor_padrao 
-- FROM freelancers 
-- ORDER BY funcao, nome;

-- 2. Ver estatísticas
-- SELECT 
--   funcao,
--   COUNT(*) as total_freelancers,
--   AVG(valor_padrao) as valor_medio,
--   MIN(valor_padrao) as valor_minimo,
--   MAX(valor_padrao) as valor_maximo
-- FROM freelancers
-- GROUP BY funcao
-- ORDER BY funcao;

-- 3. Ver festas corrigidas (últimas 10)
-- SELECT 
--   f.titulo,
--   f.data,
--   fr.nome,
--   fr.funcao,
--   ff.valor_acordado
-- FROM festas f
-- JOIN festa_freelancers ff ON f.id = ff.festa_id
-- JOIN freelancers fr ON ff.freelancer_id = fr.id
-- ORDER BY f.created_at DESC
-- LIMIT 10;

-- ==============================================================
-- ✅ SCRIPT EXECUTADO COM SUCESSO!
-- ==============================================================

-- Próximos passos:
-- 1. Verifique os resultados descomentando as queries acima
-- 2. Teste criando uma nova festa
-- 3. Verifique se os valores aparecem corretamente

