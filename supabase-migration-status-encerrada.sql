-- Migração: Adicionar status 'encerrada' e 'encerrada_pendente', remover 'concluida' e 'em_andamento'
-- Execute este script no SQL Editor do Supabase se o banco já estiver criado

-- IMPORTANTE: Esta migração remove valores do ENUM, então primeiro precisamos migrar os dados

-- 1. Atualizar festas que estão como 'concluida' ou 'em_andamento' para 'confirmada'
UPDATE festas 
SET status = 'confirmada' 
WHERE status IN ('em_andamento', 'concluida');

-- 2. Adicionar coluna de status de pagamento do cliente
ALTER TABLE festas ADD COLUMN IF NOT EXISTS status_pagamento_cliente status_pagamento DEFAULT 'pendente';

-- 3. Atualizar festas existentes para ter o status de pagamento padrão
UPDATE festas 
SET status_pagamento_cliente = 'pendente' 
WHERE status_pagamento_cliente IS NULL;

-- 4. Recrear o ENUM (só funciona se não houver mais valores antigos em uso)
-- NOTA: Execute os passos acima primeiro, depois descomente e execute este bloco:

-- ALTER TYPE status_festa RENAME TO status_festa_old;
-- CREATE TYPE status_festa AS ENUM ('planejamento', 'confirmada', 'encerrada_pendente', 'encerrada', 'cancelada');
-- ALTER TABLE festas ALTER COLUMN status TYPE status_festa USING status::text::status_festa;
-- DROP TYPE status_festa_old;

