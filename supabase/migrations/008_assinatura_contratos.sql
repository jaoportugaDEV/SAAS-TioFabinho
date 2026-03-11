-- Assinatura digital: novas colunas em contratos e bucket storage para PDF/assinaturas

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS assinado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assinado_por_nome TEXT,
  ADD COLUMN IF NOT EXISTS assinatura_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_assinado_url TEXT;

COMMENT ON COLUMN public.contratos.assinado_at IS 'Data e hora da assinatura digital';
COMMENT ON COLUMN public.contratos.assinado_por_nome IS 'Nome do assinante (contratante)';
COMMENT ON COLUMN public.contratos.assinatura_url IS 'URL da imagem da assinatura no storage';
COMMENT ON COLUMN public.contratos.pdf_assinado_url IS 'URL do PDF assinado no storage';

-- Bucket para armazenar assinaturas e PDFs assinados (nome com underscore para evitar erro no Dashboard)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'contratos_assinados') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      gen_random_uuid(),
      'contratos_assinados',
      true,
      5242880,
      ARRAY['image/png', 'application/pdf']
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Execute o script supabase/scripts/criar-bucket-contratos.sql no SQL Editor do Supabase.';
END $$;

-- Políticas de storage: leitura e upload apenas para autenticados (bucket_id é UUID)
DROP POLICY IF EXISTS "Leitura autenticada contratos-assinados" ON storage.objects;
CREATE POLICY "Leitura autenticada contratos-assinados"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'contratos_assinados')
  );

DROP POLICY IF EXISTS "Upload autenticado contratos-assinados" ON storage.objects;
CREATE POLICY "Upload autenticado contratos-assinados"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'contratos_assinados')
  );
