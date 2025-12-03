-- Script de Verificação: Valores dos Freelancers
-- Execute este script para verificar se os freelancers têm valores corretos

-- 1. Ver todos os freelancers e seus valores
SELECT 
  nome,
  funcao,
  valor_padrao,
  CASE 
    WHEN valor_padrao = 0 OR valor_padrao IS NULL THEN '❌ ZERADO - PRECISA CORRIGIR'
    ELSE '✅ OK'
  END as status
FROM freelancers
ORDER BY funcao, nome;

-- 2. Ver quantos freelancers estão com valor zerado
SELECT 
  funcao,
  COUNT(*) as total,
  SUM(CASE WHEN valor_padrao = 0 OR valor_padrao IS NULL THEN 1 ELSE 0 END) as com_valor_zero,
  SUM(CASE WHEN valor_padrao > 0 THEN 1 ELSE 0 END) as com_valor_correto
FROM freelancers
GROUP BY funcao
ORDER BY funcao;

-- 3. Ver festas recentes e valores dos freelancers
SELECT 
  f.titulo as festa,
  f.data,
  fr.nome as freelancer,
  fr.funcao,
  fr.valor_padrao as valor_padrao_freelancer,
  ff.valor_acordado as valor_na_festa
FROM festas f
JOIN festa_freelancers ff ON f.id = ff.festa_id
JOIN freelancers fr ON ff.freelancer_id = fr.id
ORDER BY f.data DESC
LIMIT 20;

