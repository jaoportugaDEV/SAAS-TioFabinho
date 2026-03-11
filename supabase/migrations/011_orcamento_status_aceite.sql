-- Status de aceite do orçamento (dono marca se cliente aceitou ou recusou)

ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS status_aceite TEXT NOT NULL DEFAULT 'aguardando'
    CHECK (status_aceite IN ('aguardando', 'aceito', 'recusado'));

COMMENT ON COLUMN public.orcamentos.status_aceite IS 'Aceite do orçamento: aguardando resposta, aceito ou recusado (marcado pelo dono)';
