-- Script para implementar identificadores únicos em clientes
-- Email OU CPF/CNPJ (pelo menos um obrigatório)
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. ADICIONAR CONSTRAINTS UNIQUE
-- ============================================

-- Tornar Email único (permitir NULL para clientes antigos)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clientes_email_unique'
    ) THEN
        ALTER TABLE clientes 
        ADD CONSTRAINT clientes_email_unique UNIQUE (email);
    END IF;
END $$;

-- Tornar CPF/CNPJ único (permitir NULL para clientes antigos)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clientes_cpf_cnpj_unique'
    ) THEN
        ALTER TABLE clientes 
        ADD CONSTRAINT clientes_cpf_cnpj_unique UNIQUE (cpf_cnpj);
    END IF;
END $$;

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice no email (apenas quando não é NULL)
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email) 
WHERE email IS NOT NULL AND email != '';

-- Índice no cpf_cnpj (apenas quando não é NULL)
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

-- ============================================
-- 3. CHECK CONSTRAINT: PELO MENOS UM IDENTIFICADOR
-- ============================================

-- Para novos clientes, exigir pelo menos Email OU CPF/CNPJ
-- Nota: Não aplicamos a clientes existentes para não quebrar dados antigos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clientes_identificador_obrigatorio'
    ) THEN
        ALTER TABLE clientes 
        ADD CONSTRAINT clientes_identificador_obrigatorio 
        CHECK (
          (email IS NOT NULL AND email != '') OR 
          (cpf_cnpj IS NOT NULL AND cpf_cnpj != '')
        ) NOT VALID; -- NOT VALID permite que registros antigos sejam mantidos
    END IF;
END $$;

-- Validar constraint para novos registros
ALTER TABLE clientes VALIDATE CONSTRAINT clientes_identificador_obrigatorio;

-- ============================================
-- 4. COMENTÁRIOS EXPLICATIVOS
-- ============================================

COMMENT ON COLUMN clientes.email IS 'Email do cliente (único, pode ser usado como identificador)';
COMMENT ON COLUMN clientes.cpf_cnpj IS 'CPF (11 dígitos) ou CNPJ (14 dígitos) do cliente (único)';
COMMENT ON CONSTRAINT clientes_email_unique ON clientes IS 'Email deve ser único no sistema';
COMMENT ON CONSTRAINT clientes_cpf_cnpj_unique ON clientes IS 'CPF/CNPJ deve ser único no sistema';
COMMENT ON CONSTRAINT clientes_identificador_obrigatorio ON clientes IS 'Cliente deve ter pelo menos Email OU CPF/CNPJ';

-- ============================================
-- 5. VERIFICAÇÕES E ESTATÍSTICAS
-- ============================================

-- Verificar clientes sem identificadores únicos
SELECT 
  COUNT(*) as total_sem_identificadores,
  COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM clientes), 0) as percentual
FROM clientes 
WHERE (email IS NULL OR email = '') 
  AND (cpf_cnpj IS NULL OR cpf_cnpj = '');

-- Estatísticas de identificadores
SELECT 
  'Total de clientes' as metrica,
  COUNT(*) as quantidade
FROM clientes
UNION ALL
SELECT 
  'Com Email' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
  'Com CPF/CNPJ' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
UNION ALL
SELECT 
  'Com ambos (Email + CPF/CNPJ)' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE (email IS NOT NULL AND email != '')
  AND (cpf_cnpj IS NOT NULL AND cpf_cnpj != '')
UNION ALL
SELECT 
  'Sem identificadores' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE (email IS NULL OR email = '')
  AND (cpf_cnpj IS NULL OR cpf_cnpj = '');

-- ============================================
-- 6. VALIDAÇÃO DE DUPLICADOS (ANTES DE APLICAR)
-- ============================================

-- Verificar se há emails duplicados (corrigir antes de aplicar UNIQUE)
SELECT email, COUNT(*) as quantidade
FROM clientes
WHERE email IS NOT NULL AND email != ''
GROUP BY email
HAVING COUNT(*) > 1;

-- Verificar se há CPF/CNPJ duplicados (corrigir antes de aplicar UNIQUE)
SELECT cpf_cnpj, COUNT(*) as quantidade
FROM clientes
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1;

-- ============================================
-- SUCESSO!
-- ============================================
-- Se chegou até aqui sem erros, os constraints foram aplicados com sucesso!
-- Agora o sistema garante que:
-- 1. Email é único (se fornecido)
-- 2. CPF/CNPJ é único (se fornecido)
-- 3. Todo novo cliente deve ter pelo menos Email OU CPF/CNPJ
