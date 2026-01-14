-- =====================================================
-- SCRIPT PARA REMOVER FOTÓGRAFO DA TABELA DE VALORES
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para remover o valor padrão da função "Fotógrafo"
-- da tabela valores_funcoes
-- =====================================================

-- 1. Remover o registro de fotógrafo da tabela valores_funcoes
DELETE FROM valores_funcoes WHERE funcao = 'fotografo';

-- 2. Verificar se foi removido com sucesso
DO $$
DECLARE
    contador INTEGER;
BEGIN
    SELECT COUNT(*) INTO contador 
    FROM valores_funcoes 
    WHERE funcao = 'fotografo';
    
    IF contador = 0 THEN
        RAISE NOTICE '✅ Registro de fotógrafo removido com sucesso!';
    ELSE
        RAISE NOTICE '❌ Erro: Registro de fotógrafo ainda existe na tabela.';
    END IF;
END $$;

-- 3. Listar valores restantes
SELECT 
    funcao,
    valor,
    updated_at
FROM valores_funcoes
ORDER BY funcao;
