-- Link único para o cliente assinar o contrato remotamente

CREATE TABLE IF NOT EXISTS public.contratos_assinatura_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expira_em TIMESTAMPTZ NOT NULL,
  usado_em TIMESTAMPTZ,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contratos_assinatura_tokens_token ON public.contratos_assinatura_tokens(token);
CREATE INDEX IF NOT EXISTS idx_contratos_assinatura_tokens_contrato_id ON public.contratos_assinatura_tokens(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_assinatura_tokens_empresa_id ON public.contratos_assinatura_tokens(empresa_id);

ALTER TABLE public.contratos_assinatura_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê tokens da sua empresa"
  ON public.contratos_assinatura_tokens FOR SELECT
  USING (public.user_can_access_empresa(empresa_id));

CREATE POLICY "Usuário insere tokens da sua empresa"
  ON public.contratos_assinatura_tokens FOR INSERT
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

COMMENT ON TABLE public.contratos_assinatura_tokens IS 'Tokens de uso único para o cliente assinar o contrato via link; validação/uso via admin client nas Server Actions.';
