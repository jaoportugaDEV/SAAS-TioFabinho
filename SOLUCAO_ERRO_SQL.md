# 🔧 Solução do Erro SQL - Check Constraint

## ❌ Erro Encontrado

```
ERROR: 23514: check constraint "clientes_identificador_obrigatorio" 
of relation "clientes" is violated by some row
```

## 🎯 Causa do Problema

O script original tentava adicionar uma **constraint CHECK** que exigia:
```sql
CHECK (email IS NOT NULL OR cpf_cnpj IS NOT NULL)
```

Porém, o banco de dados já tem **clientes antigos** que não possuem nem email nem cpf_cnpj, violando essa regra.

---

## ✅ Solução Implementada

### Estratégia Modificada:

1. **MANTER** ✅
   - Constraints UNIQUE (evita duplicação)
   - Índices para performance
   - Comentários explicativos

2. **REMOVER** ❌
   - Constraint CHECK obrigatória
   - Permite clientes antigos sem identificadores

3. **VALIDAR NO CÓDIGO** ✅
   - lib/validators.ts valida NOVOS clientes
   - Exige pelo menos um identificador ao criar
   - Clientes antigos continuam funcionando

---

## 🚀 Como Resolver

### Passo 1: Use o Script Correto

Execute o arquivo **`update-clientes-identificadores-unicos-v2.sql`** (Versão 2)

**NÃO use** o arquivo `update-clientes-identificadores-unicos.sql` (versão 1 com erro)

### Passo 2: Execute no Supabase

1. Acesse **Supabase Dashboard**
2. Vá em **SQL Editor**
3. New Query
4. Abra `update-clientes-identificadores-unicos-v2.sql`
5. Copie **TODO** o conteúdo
6. Cole no editor
7. **Run** (Ctrl+Enter)
8. Verifique se mostra "✅ Script executado com SUCESSO!"

---

## 📊 Diferenças Entre Versões

### Versão 1 (COM ERRO) ❌
```sql
-- Tentava forçar pelo menos um identificador
ALTER TABLE clientes 
ADD CONSTRAINT clientes_identificador_obrigatorio 
CHECK (
  (email IS NOT NULL AND email != '') OR 
  (cpf_cnpj IS NOT NULL AND cpf_cnpj != '')
) NOT VALID;

-- Mesmo com NOT VALID, a validação falhava
ALTER TABLE clientes VALIDATE CONSTRAINT clientes_identificador_obrigatorio;
```

### Versão 2 (CORRIGIDA) ✅
```sql
-- NÃO adiciona constraint CHECK
-- Permite clientes antigos sem identificadores
-- Validação apenas no código para novos clientes

-- Apenas UNIQUE constraints
ALTER TABLE clientes ADD CONSTRAINT clientes_email_unique UNIQUE (email);
ALTER TABLE clientes ADD CONSTRAINT clientes_cpf_cnpj_unique UNIQUE (cpf_cnpj);
```

---

## 🎯 Como Funciona Agora

### Clientes Antigos (Sem Identificadores)
- ✅ Continuam funcionando normalmente
- ✅ Sistema mostra alerta visual
- ✅ Sugere adicionar identificadores
- ✅ Não quebra nada

### Clientes Novos
- ✅ Validação no código (lib/validators.ts)
- ✅ Exige pelo menos Email OU CPF/CNPJ
- ✅ Mensagem de erro clara
- ✅ Previne duplicação (UNIQUE)

### Busca e Seleção
- ✅ Funciona com ou sem identificadores
- ✅ Prioridade: CPF/CNPJ → Email → Telefone
- ✅ Mostra todos os identificadores disponíveis
- ✅ Diferencia clientes com nomes iguais

---

## 📋 Checklist de Validação

Após executar o script V2, verifique:

```sql
-- 1. Verificar constraints criadas
SELECT conname FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass
  AND conname IN ('clientes_email_unique', 'clientes_cpf_cnpj_unique');

-- Deve retornar 2 linhas:
-- ✅ clientes_email_unique
-- ✅ clientes_cpf_cnpj_unique
```

```sql
-- 2. Verificar que NÃO existe constraint CHECK
SELECT conname FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass
  AND conname = 'clientes_identificador_obrigatorio';

-- Deve retornar VAZIO (0 linhas)
-- ✅ Correto!
```

```sql
-- 3. Verificar índices
SELECT indexname FROM pg_indexes 
WHERE tablename = 'clientes'
  AND indexname IN ('idx_clientes_email', 'idx_clientes_cpf_cnpj');

-- Deve retornar 2 linhas:
-- ✅ idx_clientes_email
-- ✅ idx_clientes_cpf_cnpj
```

---

## 🎉 Conclusão

**Problema:** Constraint CHECK quebrava com clientes antigos  
**Solução:** Remover constraint CHECK, validar apenas no código  
**Resultado:** Sistema funciona para clientes antigos E novos!

---

**Status:** ✅ RESOLVIDO  
**Script Correto:** `update-clientes-identificadores-unicos-v2.sql`  
**Data:** Janeiro 2026
