-- Locais de festa configuráveis por empresa
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS locais JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.empresas.locais IS 'Lista de nomes de locais para festas (ex: ["Unidade 1", "Unidade 2"])';
