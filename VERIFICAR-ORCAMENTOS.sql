-- Verificar os orçamentos criados e suas configurações de parcelamento
SELECT 
  o.id,
  f.titulo as festa_titulo,
  o.total,
  o.forma_pagamento,
  o.quantidade_parcelas,
  o.entrada,
  o.created_at,
  (SELECT COUNT(*) FROM parcelas_pagamento WHERE orcamento_id = o.id) as total_parcelas_criadas
FROM orcamentos o
JOIN festas f ON f.id = o.festa_id
ORDER BY o.created_at DESC
LIMIT 10;

-- Verificar parcelas criadas
SELECT 
  p.*,
  f.titulo as festa_titulo
FROM parcelas_pagamento p
JOIN festas f ON f.id = p.festa_id
ORDER BY p.created_at DESC
LIMIT 10;



