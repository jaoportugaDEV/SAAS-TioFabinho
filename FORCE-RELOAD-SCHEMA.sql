-- ===================================================================
-- FORÇAR RELOAD DO SCHEMA CACHE DO SUPABASE
-- Execute este comando para forçar o PostgREST a recarregar o schema
-- ===================================================================

-- Opção 1: Notify para reload do schema
NOTIFY pgrst, 'reload schema';

-- Verificar se as colunas existem
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'orcamentos' 
  AND column_name IN ('forma_pagamento', 'quantidade_parcelas', 'entrada');

-- Verificar se a tabela parcelas existe
SELECT table_name 
FROM information_schema.tables
WHERE table_name = 'parcelas_pagamento';



