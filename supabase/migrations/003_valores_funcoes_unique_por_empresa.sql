-- Corrige valores_funcoes para multi-tenant: único por (empresa_id, funcao)
-- Remove a constraint antiga que era só em funcao (impedia várias empresas).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'valores_funcoes') THEN
    ALTER TABLE public.valores_funcoes DROP CONSTRAINT IF EXISTS valores_funcoes_funcao_key;
    BEGIN
      ALTER TABLE public.valores_funcoes
        ADD CONSTRAINT valores_funcoes_empresa_id_funcao_key UNIQUE (empresa_id, funcao);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
