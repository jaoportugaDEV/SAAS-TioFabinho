-- Script para adicionar o status "encerrada_pendente" ao ENUM status_festa
-- Execute este script no SQL Editor do Supabase

-- IMPORTANTE: Execute os comandos na ordem abaixo

-- 1. Primeiro, verificar quais valores existem atualmente no ENUM
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'status_festa'::regtype 
ORDER BY enumsortorder;

-- 2. Adicionar o novo valor "encerrada_pendente" se não existir
-- Execute este comando (pode dar erro se já existir, mas é seguro):
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'encerrada_pendente' 
        AND enumtypid = 'status_festa'::regtype
    ) THEN
        ALTER TYPE status_festa ADD VALUE 'encerrada_pendente';
    END IF;
END $$;

-- 3. Verificar novamente para confirmar que foi adicionado
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'status_festa'::regtype 
ORDER BY enumsortorder;

-- Agora o sistema deve funcionar corretamente!

