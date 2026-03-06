-- Adiciona coluna status na tabela contratos (ativo | cancelado)
-- Contratos cancelados: orçamento da festa foi excluído

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ativo';

ALTER TABLE public.contratos
  DROP CONSTRAINT IF EXISTS contratos_status_check;

ALTER TABLE public.contratos
  ADD CONSTRAINT contratos_status_check CHECK (status IN ('ativo', 'cancelado'));

COMMENT ON COLUMN public.contratos.status IS 'ativo = contrato vigente; cancelado = orçamento da festa foi excluído';
