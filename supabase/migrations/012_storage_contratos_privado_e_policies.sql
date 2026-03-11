-- Hardening: bucket de contratos privado e políticas por empresa (ownership por prefixo)

-- Tornar bucket privado (acesso apenas via signed URL ou políticas RLS)
UPDATE storage.buckets
SET public = false
WHERE name = 'contratos_assinados';

-- Remover políticas antigas e criar políticas com prefixo por empresa
DROP POLICY IF EXISTS "Leitura autenticada contratos-assinados" ON storage.objects;
DROP POLICY IF EXISTS "Upload autenticado contratos-assinados" ON storage.objects;

-- Leitura: usuário só vê objetos cujo primeiro segmento do path (empresa_id) pertence às suas empresas
CREATE POLICY "Leitura contratos por empresa"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'contratos_assinados')
    AND split_part(name, '/', 1)::uuid IN (SELECT public.user_empresa_ids())
  );

-- Upload: usuário só pode inserir em paths que começam com seu empresa_id
CREATE POLICY "Upload contratos por empresa"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'contratos_assinados')
    AND split_part(name, '/', 1)::uuid IN (SELECT public.user_empresa_ids())
  );
