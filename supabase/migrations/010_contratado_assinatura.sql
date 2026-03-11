-- Assinatura do contratado (buffet) separada da do cliente (contratante)

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS contratado_assinado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contratado_assinado_por_nome TEXT,
  ADD COLUMN IF NOT EXISTS contratado_assinatura_url TEXT;

COMMENT ON COLUMN public.contratos.contratado_assinado_at IS 'Data em que o buffet (contratado) assinou no dashboard';
COMMENT ON COLUMN public.contratos.contratado_assinado_por_nome IS 'Nome do buffet ao assinar (empresa.nome)';
COMMENT ON COLUMN public.contratos.contratado_assinatura_url IS 'URL da imagem da assinatura do contratado no storage';
