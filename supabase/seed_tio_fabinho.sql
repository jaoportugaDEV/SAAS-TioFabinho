-- Seed: criar empresa Tio Fabinho e atribuir todos os dados e usuários existentes
-- Executar APÓS a migração 001_multi_tenant.sql
-- UUID fixo para idempotência e referência no app

DO $$
DECLARE
  empresa_tio_fabinho_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Inserir empresa Tio Fabinho (ignorar se já existir)
  INSERT INTO public.empresas (
    id, nome, slug, logo_url, cor_primaria,
    cidade, estado, ativo, created_at, updated_at
  ) VALUES (
    empresa_tio_fabinho_id,
    'Tio Fabinho Buffet',
    'tio-fabinho',
    '/LogoFabinho.png',
    '#DC2626',
    'Presidente Prudente',
    'SP',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    slug = EXCLUDED.slug,
    locais = COALESCE(EXCLUDED.locais, empresas.locais),
    updated_at = timezone('utc'::text, now());

  -- Atualizar todas as tabelas: atribuir empresa_id ao Tio Fabinho
  UPDATE public.festas SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.freelancers SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.orcamentos SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.parcelas_pagamento SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.pagamentos_freelancers SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.checklist SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.contratos SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  UPDATE public.despesas_gerais SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
    UPDATE public.clientes SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'valores_funcoes') THEN
    UPDATE public.valores_funcoes SET empresa_id = empresa_tio_fabinho_id WHERE empresa_id IS NULL;
  END IF;

  -- Vincular todos os usuários autenticados existentes ao Tio Fabinho
  INSERT INTO public.user_empresas (user_id, empresa_id, role)
  SELECT id, empresa_tio_fabinho_id, 'admin'
  FROM auth.users
  ON CONFLICT (user_id, empresa_id) DO NOTHING;
END $$;
