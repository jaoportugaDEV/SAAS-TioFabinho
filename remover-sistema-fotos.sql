-- =====================================================
-- SCRIPT PARA REMOVER SISTEMA DE FOTOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para remover completamente o sistema de fotos
-- e liberar espaço de armazenamento
-- =====================================================

-- 1. Remover índice da tabela festa_fotos
DROP INDEX IF EXISTS idx_festa_fotos_festa;

-- 2. Remover políticas RLS da tabela festa_fotos
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON festa_fotos;

-- 3. Remover tabela festa_fotos
DROP TABLE IF EXISTS festa_fotos CASCADE;

-- =====================================================
-- ATENÇÃO: PASSOS MANUAIS NECESSÁRIOS
-- =====================================================
-- 
-- Após executar este script, você precisa fazer MANUALMENTE no Supabase Dashboard:
--
-- 1. Vá em "Storage" no menu lateral
-- 2. Localize o bucket "festa-fotos" (se existir)
-- 3. Clique nos três pontinhos ao lado do bucket
-- 4. Selecione "Delete bucket"
-- 5. Confirme a exclusão
--
-- Isso vai liberar TODO o espaço usado pelas fotos! 🎉
-- =====================================================

-- Verificar se a tabela foi removida com sucesso
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'festa_fotos') THEN
        RAISE NOTICE '✅ Tabela festa_fotos removida com sucesso!';
    ELSE
        RAISE NOTICE '❌ Erro: Tabela festa_fotos ainda existe.';
    END IF;
END $$;
