-- ===================================================================
-- MIGRATION: Sistema de Pagamentos Parcelados
-- Execute este script NO SQL EDITOR do Supabase
-- ===================================================================

-- 1. Criar tipo ENUM para status de parcela
DO $$ BEGIN
  CREATE TYPE status_parcela AS ENUM ('pendente', 'paga', 'atrasada');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar campos na tabela de orçamentos
ALTER TABLE orcamentos 
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(20) DEFAULT 'avista',
ADD COLUMN IF NOT EXISTS quantidade_parcelas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS entrada DECIMAL(10,2) DEFAULT 0;

-- 3. Criar tabela de parcelas de pagamento
CREATE TABLE IF NOT EXISTS parcelas_pagamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  festa_id UUID NOT NULL REFERENCES festas(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_parcela DEFAULT 'pendente',
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_parcelas_orcamento ON parcelas_pagamento(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_festa ON parcelas_pagamento(festa_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_pagamento(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas_pagamento(status);

-- 5. Habilitar RLS
ALTER TABLE parcelas_pagamento ENABLE ROW LEVEL SECURITY;

-- 6. Criar política RLS
DO $$ BEGIN
  CREATE POLICY "Permitir acesso completo para usuários autenticados"
    ON parcelas_pagamento FOR ALL
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ===================================================================
-- VERIFICAÇÃO: Execute para ver se criou corretamente
-- ===================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns
WHERE table_name = 'orcamentos' 
  AND column_name IN ('forma_pagamento', 'quantidade_parcelas', 'entrada');

SELECT COUNT(*) as total_parcelas FROM parcelas_pagamento;

