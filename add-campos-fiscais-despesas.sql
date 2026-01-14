-- Migration SQL para adicionar campos fiscais na tabela despesas_gerais
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-01-14

-- Adicionar campos para controle fiscal
ALTER TABLE despesas_gerais 
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) NOT NULL DEFAULT 'outros',
  ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50) NOT NULL DEFAULT 'dinheiro',
  ADD COLUMN IF NOT EXISTS nota_fiscal VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(200);

-- Criar índices para melhorar performance em consultas filtradas
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_categoria ON despesas_gerais(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_metodo_pagamento ON despesas_gerais(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_data_categoria ON despesas_gerais(data, categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_data_metodo ON despesas_gerais(data, metodo_pagamento);

-- Verificar se as colunas foram adicionadas com sucesso
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'despesas_gerais'
  AND column_name IN ('categoria', 'metodo_pagamento', 'nota_fiscal', 'fornecedor');

-- Comentários nas colunas para documentação
COMMENT ON COLUMN despesas_gerais.categoria IS 'Categoria da despesa: mercado_cozinha, material_festa, aluguel_contas, outros';
COMMENT ON COLUMN despesas_gerais.metodo_pagamento IS 'Método de pagamento: cartao_empresa, pix, debito, dinheiro';
COMMENT ON COLUMN despesas_gerais.nota_fiscal IS 'Número da nota fiscal (opcional)';
COMMENT ON COLUMN despesas_gerais.fornecedor IS 'Nome do fornecedor/estabelecimento (opcional)';
