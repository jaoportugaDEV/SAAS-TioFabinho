-- ============================================
-- Script para Adicionar Identificadores Únicos em Clientes
-- Versão 2: SEM Constraint CHECK (compatível com clientes antigos)
-- ============================================
-- 
-- O que este script faz:
-- ✅ Adiciona constraint UNIQUE no campo email
-- ✅ Adiciona constraint UNIQUE no campo cpf_cnpj
-- ✅ Cria índices para performance
-- ❌ NÃO adiciona constraint CHECK obrigatória
--    (permite clientes antigos sem identificadores)
--
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- PASSO 1: VERIFICAR DUPLICADOS (IMPORTANTE!)
-- ============================================
-- Execute estas queries ANTES de continuar para verificar se há duplicados:

-- Verificar emails duplicados
SELECT 
  email, 
  COUNT(*) as quantidade,
  STRING_AGG(id::text, ', ') as ids
FROM clientes 
WHERE email IS NOT NULL AND email != ''
GROUP BY email 
HAVING COUNT(*) > 1;

-- Verificar CPF/CNPJ duplicados
SELECT 
  cpf_cnpj, 
  COUNT(*) as quantidade,
  STRING_AGG(id::text, ', ') as ids
FROM clientes 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj 
HAVING COUNT(*) > 1;

-- ⚠️ Se houver resultados acima, corrija manualmente antes de continuar!

-- ============================================
-- PASSO 2: ADICIONAR CONSTRAINTS UNIQUE
-- ============================================

-- Remover constraints antigas se existirem (para re-executar o script)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_email_unique;
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_cpf_cnpj_unique;

-- Adicionar constraint UNIQUE no email
-- NULL é permitido (clientes antigos ou que não forneceram email)
ALTER TABLE clientes 
ADD CONSTRAINT clientes_email_unique UNIQUE (email);

-- Adicionar constraint UNIQUE no cpf_cnpj
-- NULL é permitido (clientes antigos ou que não forneceram cpf/cnpj)
ALTER TABLE clientes 
ADD CONSTRAINT clientes_cpf_cnpj_unique UNIQUE (cpf_cnpj);

-- ============================================
-- PASSO 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Remover índices antigos se existirem
DROP INDEX IF EXISTS idx_clientes_email;
DROP INDEX IF EXISTS idx_clientes_cpf_cnpj;

-- Índice no email (apenas quando não é NULL)
CREATE INDEX idx_clientes_email ON clientes(email) 
WHERE email IS NOT NULL AND email != '';

-- Índice no cpf_cnpj (apenas quando não é NULL)
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

-- ============================================
-- PASSO 4: ADICIONAR COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN clientes.email 
IS 'Email do cliente (único quando fornecido, usado como identificador)';

COMMENT ON COLUMN clientes.cpf_cnpj 
IS 'CPF (11 dígitos) ou CNPJ (14 dígitos) do cliente (único quando fornecido, armazenado sem formatação)';

COMMENT ON CONSTRAINT clientes_email_unique ON clientes 
IS 'Email deve ser único no sistema. NULL permitido para clientes antigos.';

COMMENT ON CONSTRAINT clientes_cpf_cnpj_unique ON clientes 
IS 'CPF/CNPJ deve ser único no sistema. NULL permitido para clientes antigos.';

-- ============================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================

-- Verificar constraints criadas
SELECT 
  conname as nome_constraint,
  contype as tipo,
  pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass
  AND conname IN ('clientes_email_unique', 'clientes_cpf_cnpj_unique')
ORDER BY conname;

-- Verificar índices criados
SELECT 
  indexname as nome_indice,
  indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'clientes'
  AND indexname IN ('idx_clientes_email', 'idx_clientes_cpf_cnpj')
ORDER BY indexname;

-- ============================================
-- PASSO 6: ESTATÍSTICAS
-- ============================================

-- Total de clientes
SELECT 
  'Total de clientes' as metrica,
  COUNT(*) as quantidade
FROM clientes

UNION ALL

-- Clientes com email
SELECT 
  'Clientes com Email' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE email IS NOT NULL AND email != ''

UNION ALL

-- Clientes com CPF/CNPJ
SELECT 
  'Clientes com CPF/CNPJ' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''

UNION ALL

-- Clientes com ambos
SELECT 
  'Clientes com Email E CPF/CNPJ' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE (email IS NOT NULL AND email != '') 
  AND (cpf_cnpj IS NOT NULL AND cpf_cnpj != '')

UNION ALL

-- Clientes com pelo menos um
SELECT 
  'Clientes com pelo menos um identificador' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE (email IS NOT NULL AND email != '') 
   OR (cpf_cnpj IS NOT NULL AND cpf_cnpj != '')

UNION ALL

-- Clientes SEM identificadores (antigos)
SELECT 
  'Clientes SEM identificadores (antigos)' as metrica,
  COUNT(*) as quantidade
FROM clientes
WHERE (email IS NULL OR email = '') 
  AND (cpf_cnpj IS NULL OR cpf_cnpj = '');

-- ============================================
-- RESUMO FINAL
-- ============================================

SELECT 
  '✅ Script executado com SUCESSO!' as status,
  '2 constraints UNIQUE criadas' as constraints,
  '2 índices criados' as indices,
  'Clientes antigos SEM identificadores permitidos' as compatibilidade,
  'Validação "pelo menos um" feita apenas no código' as validacao_novos;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. CLIENTES ANTIGOS: Podem não ter email nem cpf_cnpj
--    - Sistema mostra alerta visual
--    - Sugestão para adicionar identificadores
--    - Continua funcionando normalmente
--
-- 2. CLIENTES NOVOS: Validação no código
--    - lib/validators.ts valida antes de criar
--    - Exige pelo menos Email OU CPF/CNPJ
--    - Mensagem de erro clara
--
-- 3. UNICIDADE GARANTIDA:
--    - Impossível duplicar Email
--    - Impossível duplicar CPF/CNPJ
--    - Constraint no banco garante integridade
--
-- 4. BUSCA INTELIGENTE:
--    - Prioridade: CPF/CNPJ → Email → Telefone
--    - Índices otimizam performance
--    - Funciona com ou sem identificadores
--
-- ============================================
