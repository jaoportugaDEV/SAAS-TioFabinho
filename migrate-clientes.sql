-- Script de migração para criar clientes a partir de festas existentes
-- Execute este script APÓS criar a tabela clientes

-- Passo 1: Criar clientes a partir de festas existentes (deduplicação por telefone)
-- Este script pega os dados de cliente_nome e cliente_contato das festas
-- e cria registros únicos de clientes baseado no telefone
INSERT INTO clientes (nome, telefone, observacoes)
SELECT DISTINCT ON (cliente_contato)
  cliente_nome,
  cliente_contato,
  cliente_observacoes
FROM festas
WHERE cliente_contato IS NOT NULL
  AND cliente_contato != ''
  AND NOT EXISTS (
    SELECT 1 FROM clientes WHERE telefone = festas.cliente_contato
  )
ORDER BY cliente_contato, created_at DESC;

-- Passo 2: Atualizar festas com cliente_id
-- Vincula as festas existentes aos clientes recém-criados
UPDATE festas f
SET cliente_id = c.id
FROM clientes c
WHERE f.cliente_contato = c.telefone
  AND f.cliente_id IS NULL;

-- Passo 3: Verificar festas sem cliente_id (para debug)
SELECT 
  COUNT(*) as total_festas_sem_cliente,
  COUNT(CASE WHEN cliente_contato IS NULL OR cliente_contato = '' THEN 1 END) as festas_sem_contato
FROM festas 
WHERE cliente_id IS NULL;

-- Passo 4: Ver estatísticas da migração
SELECT 
  'Total de clientes criados' as metrica,
  COUNT(*) as quantidade
FROM clientes
UNION ALL
SELECT 
  'Total de festas vinculadas' as metrica,
  COUNT(*) as quantidade
FROM festas
WHERE cliente_id IS NOT NULL
UNION ALL
SELECT 
  'Total de festas não vinculadas' as metrica,
  COUNT(*) as quantidade
FROM festas
WHERE cliente_id IS NULL;

-- IMPORTANTE: Não remova as colunas antigas (cliente_nome, cliente_contato, cliente_observacoes)
-- por enquanto. Elas servirão como backup e compatibilidade.
-- Elas podem ser removidas no futuro após validação completa:
-- ALTER TABLE festas DROP COLUMN cliente_nome;
-- ALTER TABLE festas DROP COLUMN cliente_contato;
-- ALTER TABLE festas DROP COLUMN cliente_observacoes;
