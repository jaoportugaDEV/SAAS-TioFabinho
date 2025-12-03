-- Migração: Adicionar Status de Confirmação e Dias da Semana
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna status_confirmacao na tabela festa_freelancers
ALTER TABLE festa_freelancers 
ADD COLUMN IF NOT EXISTS status_confirmacao VARCHAR(20) DEFAULT 'pendente';

-- Comentário explicativo
COMMENT ON COLUMN festa_freelancers.status_confirmacao IS 'Status de confirmação do freelancer: pendente ou confirmado';

-- 2. Adicionar coluna dias_semana_disponiveis na tabela freelancers
ALTER TABLE freelancers 
ADD COLUMN IF NOT EXISTS dias_semana_disponiveis JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN freelancers.dias_semana_disponiveis IS 'Array de dias da semana disponíveis (0=Domingo, 1=Segunda, ..., 6=Sábado)';

-- 3. Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_festa_freelancers_status ON festa_freelancers(status_confirmacao);

-- Sucesso!
-- As colunas foram adicionadas com sucesso.
-- Agora você pode usar o sistema atualizado.

