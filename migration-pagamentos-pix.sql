-- Migration para Sistema de Pagamentos PIX para Freelancers
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campo valor_padrao na tabela freelancers
ALTER TABLE freelancers 
ADD COLUMN IF NOT EXISTS valor_padrao DECIMAL(10,2) DEFAULT 0;

-- 2. Adicionar campo horario na tabela festas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS horario VARCHAR(10);

-- 3. Criar ENUM para status de pagamento de freelancers
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento_freelancers') THEN
    CREATE TYPE status_pagamento_freelancers AS ENUM ('pendente', 'parcial', 'pago');
  END IF;
END $$;

-- 4. Adicionar campo status_pagamento_freelancers na tabela festas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS status_pagamento_freelancers status_pagamento_freelancers DEFAULT 'pendente';

-- 5. Adicionar campos na tabela festa_freelancers
ALTER TABLE festa_freelancers 
ADD COLUMN IF NOT EXISTS valor_acordado DECIMAL(10,2) DEFAULT 0;

ALTER TABLE festa_freelancers 
ADD COLUMN IF NOT EXISTS status_pagamento VARCHAR(20) DEFAULT 'pendente';

-- 6. Modificar tabela pagamentos_freelancers
ALTER TABLE pagamentos_freelancers 
ADD COLUMN IF NOT EXISTS pago BOOLEAN DEFAULT false;

-- Tornar data_pagamento nullable
ALTER TABLE pagamentos_freelancers 
ALTER COLUMN data_pagamento DROP NOT NULL;

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_festa_freelancers_status_pagamento ON festa_freelancers(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_festas_status_pagamento_freelancers ON festas(status_pagamento_freelancers);
CREATE INDEX IF NOT EXISTS idx_festas_data_horario ON festas(data, horario);
CREATE INDEX IF NOT EXISTS idx_pagamentos_freelancers_pago ON pagamentos_freelancers(pago);

-- 8. Comentários para documentação
COMMENT ON COLUMN freelancers.valor_padrao IS 'Valor padrão que o freelancer recebe por festa';
COMMENT ON COLUMN festas.horario IS 'Horário de início da festa (formato HH:MM)';
COMMENT ON COLUMN festas.status_pagamento_freelancers IS 'Status geral dos pagamentos dos freelancers desta festa';
COMMENT ON COLUMN festa_freelancers.valor_acordado IS 'Valor específico acordado para este freelancer nesta festa';
COMMENT ON COLUMN festa_freelancers.status_pagamento IS 'Status do pagamento deste freelancer (pendente/pago)';
COMMENT ON COLUMN pagamentos_freelancers.pago IS 'Indica se o pagamento foi confirmado/realizado';

