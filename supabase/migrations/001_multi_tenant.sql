-- Multi-Tenancy: empresas, user_empresas, empresa_id em todas as tabelas, RLS por empresa
-- Executar no SQL Editor do Supabase (ou via Supabase CLI)

-- =============================================================================
-- 1. Tabela empresas (uma linha por buffet)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  cor_primaria VARCHAR(7) DEFAULT '#DC2626',
  cnpj VARCHAR(18),
  razao_social VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. Tabela user_empresas (mapeamento usuário ↔ empresa)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_empresas (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_user_empresas_user_id ON public.user_empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_empresas_empresa_id ON public.user_empresas(empresa_id);

-- =============================================================================
-- 3. Adicionar coluna empresa_id (nullable para migração segura)
-- =============================================================================
ALTER TABLE public.festas ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.parcelas_pagamento ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.pagamentos_freelancers ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.despesas_gerais ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;

-- clientes e valores_funcoes podem ter sido criados fora do schema original
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
    ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'valores_funcoes') THEN
    ALTER TABLE public.valores_funcoes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Índices para performance em empresa_id
CREATE INDEX IF NOT EXISTS idx_festas_empresa_id ON public.festas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_freelancers_empresa_id ON public.freelancers(empresa_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_empresa_id ON public.orcamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_pagamento_empresa_id ON public.parcelas_pagamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_freelancers_empresa_id ON public.pagamentos_freelancers(empresa_id);
CREATE INDEX IF NOT EXISTS idx_checklist_empresa_id ON public.checklist(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contratos_empresa_id ON public.contratos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_despesas_gerais_empresa_id ON public.despesas_gerais(empresa_id);

-- =============================================================================
-- 4. Habilitar RLS em empresas e user_empresas
-- =============================================================================
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_empresas ENABLE ROW LEVEL SECURITY;

-- Empresas: usuário só vê empresas às quais está vinculado
CREATE POLICY "Usuário vê apenas suas empresas"
  ON public.empresas FOR ALL
  USING (
    id IN (SELECT empresa_id FROM public.user_empresas WHERE user_id = auth.uid())
  );

-- User_empresas: usuário só vê seus próprios vínculos
CREATE POLICY "Usuário vê apenas seus vínculos"
  ON public.user_empresas FOR ALL
  USING (user_id = auth.uid());

-- =============================================================================
-- 5. Remover políticas antigas e criar novas (por empresa)
-- Permite empresa_id IS NULL durante a migração (dados ainda não atribuídos)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.user_empresa_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.user_empresas WHERE user_id = auth.uid();
$$;

-- Função auxiliar: usuário pode acessar linha com esse empresa_id (inclui NULL durante migração)
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_id_val UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.role() = 'authenticated' AND (
    empresa_id_val IS NULL OR empresa_id_val IN (SELECT public.user_empresa_ids())
  );
$$;

-- Festas
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.festas;
CREATE POLICY "Acesso festas por empresa"
  ON public.festas FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Freelancers
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.freelancers;
CREATE POLICY "Acesso freelancers por empresa"
  ON public.freelancers FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Orcamentos
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.orcamentos;
CREATE POLICY "Acesso orcamentos por empresa"
  ON public.orcamentos FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Parcelas
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.parcelas_pagamento;
CREATE POLICY "Acesso parcelas por empresa"
  ON public.parcelas_pagamento FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Pagamentos freelancers
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.pagamentos_freelancers;
CREATE POLICY "Acesso pagamentos_freelancers por empresa"
  ON public.pagamentos_freelancers FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Checklist
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.checklist;
CREATE POLICY "Acesso checklist por empresa"
  ON public.checklist FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Contratos
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.contratos;
CREATE POLICY "Acesso contratos por empresa"
  ON public.contratos FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Despesas gerais
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.despesas_gerais;
CREATE POLICY "Acesso despesas_gerais por empresa"
  ON public.despesas_gerais FOR ALL
  USING (public.user_can_access_empresa(empresa_id))
  WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));

-- Tabelas sem empresa_id: escopo via festas.empresa_id (só altera se a tabela existir)
-- festa_freelancers
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.festa_freelancers;
CREATE POLICY "Acesso festa_freelancers por empresa da festa"
  ON public.festa_freelancers FOR ALL
  USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.festas f
      WHERE f.id = festa_freelancers.festa_id
      AND (f.empresa_id IS NULL OR f.empresa_id IN (SELECT public.user_empresa_ids()))
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.festas f
      WHERE f.id = festa_freelancers.festa_id
      AND f.empresa_id IN (SELECT public.user_empresa_ids())
    )
  );

-- festa_fotos (pode não existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festa_fotos') THEN
    DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.festa_fotos;
    CREATE POLICY "Acesso festa_fotos por empresa da festa"
      ON public.festa_fotos FOR ALL
      USING (
        auth.role() = 'authenticated' AND EXISTS (
          SELECT 1 FROM public.festas f
          WHERE f.id = festa_fotos.festa_id
          AND (f.empresa_id IS NULL OR f.empresa_id IN (SELECT public.user_empresa_ids()))
        )
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND EXISTS (
          SELECT 1 FROM public.festas f
          WHERE f.id = festa_fotos.festa_id
          AND f.empresa_id IN (SELECT public.user_empresa_ids())
        )
      );
  END IF;
END $$;

-- mensagens_whatsapp (pode não existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mensagens_whatsapp') THEN
    DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.mensagens_whatsapp;
    CREATE POLICY "Acesso mensagens_whatsapp por empresa da festa"
      ON public.mensagens_whatsapp FOR ALL
      USING (
        auth.role() = 'authenticated' AND (
          festa_id IS NULL OR EXISTS (
            SELECT 1 FROM public.festas f
            WHERE f.id = mensagens_whatsapp.festa_id
            AND (f.empresa_id IS NULL OR f.empresa_id IN (SELECT public.user_empresa_ids()))
          )
        )
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND (
          festa_id IS NULL OR EXISTS (
            SELECT 1 FROM public.festas f
            WHERE f.id = mensagens_whatsapp.festa_id
            AND f.empresa_id IN (SELECT public.user_empresa_ids())
          )
        )
      );
  END IF;
END $$;

-- despesas_festas (pode não existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'despesas_festas') THEN
    DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.despesas_festas;
    CREATE POLICY "Acesso despesas_festas por empresa da festa"
      ON public.despesas_festas FOR ALL
      USING (
        auth.role() = 'authenticated' AND EXISTS (
          SELECT 1 FROM public.festas f
          WHERE f.id = despesas_festas.festa_id
          AND (f.empresa_id IS NULL OR f.empresa_id IN (SELECT public.user_empresa_ids()))
        )
      )
      WITH CHECK (
        auth.role() = 'authenticated' AND EXISTS (
          SELECT 1 FROM public.festas f
          WHERE f.id = despesas_festas.festa_id
          AND f.empresa_id IN (SELECT public.user_empresa_ids())
        )
      );
  END IF;
END $$;

-- Clientes (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
    DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.clientes;
    CREATE POLICY "Acesso clientes por empresa"
      ON public.clientes FOR ALL
      USING (public.user_can_access_empresa(empresa_id))
      WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));
  END IF;
END $$;

-- Valores_funcoes (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'valores_funcoes') THEN
    DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON public.valores_funcoes;
    CREATE POLICY "Acesso valores_funcoes por empresa"
      ON public.valores_funcoes FOR ALL
      USING (public.user_can_access_empresa(empresa_id))
      WITH CHECK (empresa_id IN (SELECT public.user_empresa_ids()));
  END IF;
END $$;
