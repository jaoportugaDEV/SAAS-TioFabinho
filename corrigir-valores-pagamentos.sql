-- Script para Corrigir Valores de Pagamento dos Freelancers
-- Execute este script no SQL Editor do Supabase para atualizar os valores
-- dos freelancers que estão com R$ 0,00 nas festas

-- Atualizar valor_acordado baseado na função do freelancer
UPDATE festa_freelancers ff
SET valor_acordado = COALESCE(vf.valor, 0)
FROM freelancers f
LEFT JOIN valores_funcoes vf ON vf.funcao = f.funcao
WHERE ff.freelancer_id = f.id
  AND (ff.valor_acordado IS NULL OR ff.valor_acordado = 0);

-- Verificar quantos registros foram atualizados
SELECT 
  COUNT(*) as total_atualizados,
  SUM(ff.valor_acordado) as soma_total_valores
FROM festa_freelancers ff
WHERE ff.valor_acordado > 0;

-- Exibir detalhes dos valores atualizados por função
SELECT 
  f.funcao,
  COUNT(*) as quantidade_freelancers,
  ff.valor_acordado as valor_configurado,
  SUM(ff.valor_acordado) as total_por_funcao
FROM festa_freelancers ff
JOIN freelancers f ON f.id = ff.freelancer_id
WHERE ff.valor_acordado > 0
GROUP BY f.funcao, ff.valor_acordado
ORDER BY f.funcao;

-- Verificar se ainda há algum freelancer sem valor (para debug)
SELECT 
  fe.titulo as festa,
  f.nome as freelancer,
  f.funcao,
  ff.valor_acordado,
  CASE 
    WHEN vf.valor IS NULL THEN 'Função não configurada em valores_funcoes'
    ELSE 'OK'
  END as status
FROM festa_freelancers ff
JOIN freelancers f ON f.id = ff.freelancer_id
JOIN festas fe ON fe.id = ff.festa_id
LEFT JOIN valores_funcoes vf ON vf.funcao = f.funcao
WHERE ff.valor_acordado IS NULL OR ff.valor_acordado = 0
ORDER BY fe.data DESC;

