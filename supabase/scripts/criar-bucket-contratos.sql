-- Criar bucket para contratos assinados
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole o script abaixo > Run

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT gen_random_uuid(), 'contratos_assinados', true, 5242880, ARRAY['image/png', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'contratos_assinados');
