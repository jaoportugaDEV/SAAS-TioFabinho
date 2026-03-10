-- Adiciona coluna local em despesas_gerais para vincular despesa a uma unidade
ALTER TABLE public.despesas_gerais
  ADD COLUMN IF NOT EXISTS local TEXT;
