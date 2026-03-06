-- Fix empresa_id NULL: back-fill, NOT NULL constraints e RLS sem bypass de NULL
-- Execute no SQL Editor do Supabase ANTES de usar o sistema com múltiplas empresas.

-- =============================================================================
-- 1. Back-fill: atribuir empresa existente a todos os registros com empresa_id NULL
--    Usa a primeira empresa ativa encontrada (ou a empresa com slug 'tio-fabinho' se existir)
-- =============================================================================

DO $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Tentar achar a empresa original pelo slug
  SELECT id INTO v_empresa_id FROM public.empresas WHERE slug = 'tio-fabinho' LIMIT 1;

  -- Se não achar, pegar qualquer empresa ativa
  IF v_empresa_id IS NULL THEN
    SELECT id INTO v_empresa_id FROM public.empresas WHERE ativo = true ORDER BY created_at LIMIT 1;
  END IF;

  -- Se ainda NULL, não tem empresa no banco — abortar
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada para back-fill. Crie ao menos uma empresa primeiro.';
  END IF;

  RAISE NOTICE 'Back-fill com empresa_id: %', v_empresa_id;

  UPDATE public.festas              SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.clientes            SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.freelancers         SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.orcamentos          SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.parcelas_pagamento  SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.pagamentos_freelancers SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.checklist           SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.contratos           SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.despesas_gerais     SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.valores_funcoes     SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
END $$;

-- =============================================================================
-- 2. Adicionar NOT NULL em todas as tabelas
-- =============================================================================

ALTER TABLE public.festas               ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.clientes             ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.freelancers          ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.orcamentos           ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.parcelas_pagamento   ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.pagamentos_freelancers ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.checklist            ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.contratos            ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.despesas_gerais      ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.valores_funcoes      ALTER COLUMN empresa_id SET NOT NULL;

-- =============================================================================
-- 3. Remover o bypass de NULL da função user_can_access_empresa
-- =============================================================================

CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_id_val UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.role() = 'authenticated'
    AND empresa_id_val IN (SELECT public.user_empresa_ids());
$$;
