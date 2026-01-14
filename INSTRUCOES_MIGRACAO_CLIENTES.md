# 📋 Instruções de Migração - Sistema de Clientes

## 🎯 Objetivo

Implementar o sistema de clientes no Buffet Tio Fabinho, permitindo histórico completo e gestão centralizada de clientes.

## ⚠️ IMPORTANTE - Ordem de Execução

Execute os scripts **nesta ordem exata** no SQL Editor do Supabase:

### 1️⃣ Criar Tabela de Clientes
**Arquivo:** `create-clientes-table.sql`

Este script irá:
- ✅ Criar a tabela `clientes` com todos os campos
- ✅ Criar índices para performance
- ✅ Habilitar Row Level Security (RLS)
- ✅ Adicionar coluna `cliente_id` na tabela `festas`
- ✅ Criar índice para `cliente_id`

**Tempo estimado:** 10-20 segundos

### 2️⃣ Migrar Dados Existentes
**Arquivo:** `migrate-clientes.sql`

Este script irá:
- ✅ Criar clientes automaticamente a partir das festas existentes
- ✅ Deduplica por telefone (clientes com mesmo telefone = mesmo registro)
- ✅ Vincular festas existentes aos clientes criados
- ✅ Mostrar estatísticas da migração

**Tempo estimado:** 30-60 segundos (depende da quantidade de festas)

## 📝 Passo a Passo

### Passo 1: Backup (Recomendado)
```sql
-- Fazer backup das festas antes da migração
CREATE TABLE festas_backup AS SELECT * FROM festas;
```

### Passo 2: Executar create-clientes-table.sql
1. Abra o SQL Editor do Supabase
2. Copie todo o conteúdo de `create-clientes-table.sql`
3. Cole no editor
4. Clique em "Run"
5. Aguarde confirmação de sucesso

### Passo 3: Executar migrate-clientes.sql
1. No mesmo SQL Editor
2. Copie todo o conteúdo de `migrate-clientes.sql`
3. Cole no editor
4. Clique em "Run"
5. Verifique as estatísticas mostradas

### Passo 4: Verificar Migração
```sql
-- Verificar quantos clientes foram criados
SELECT COUNT(*) as total_clientes FROM clientes;

-- Verificar quantas festas foram vinculadas
SELECT COUNT(*) as festas_vinculadas FROM festas WHERE cliente_id IS NOT NULL;

-- Ver exemplo de cliente com festas
SELECT 
  c.nome,
  c.telefone,
  COUNT(f.id) as total_festas
FROM clientes c
LEFT JOIN festas f ON f.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone
ORDER BY total_festas DESC
LIMIT 5;
```

## ✅ Validação

Após executar os scripts, verifique:

1. **Tabela clientes criada:**
   - Acesse "Table Editor" no Supabase
   - Verifique se a tabela "clientes" aparece
   - Deve ter registros criados (baseado nas festas)

2. **Coluna cliente_id em festas:**
   - Abra a tabela "festas"
   - Verifique se a coluna "cliente_id" existe
   - Algumas festas devem ter valores UUID preenchidos

3. **Dados migrados corretamente:**
   - Clientes foram criados sem duplicação
   - Festas estão vinculadas aos clientes corretos
   - Dados de nome e telefone correspondem

## 🔄 Rollback (Em caso de erro)

Se algo der errado, você pode reverter:

```sql
-- Remover coluna cliente_id
ALTER TABLE festas DROP COLUMN IF EXISTS cliente_id;

-- Excluir tabela clientes
DROP TABLE IF EXISTS clientes CASCADE;

-- Restaurar backup (se fez)
-- DROP TABLE festas;
-- ALTER TABLE festas_backup RENAME TO festas;
```

## 📊 Resultados Esperados

Após a migração bem-sucedida:

- ✅ Tabela `clientes` com N registros (onde N = número de telefones únicos nas festas)
- ✅ Todas as festas antigas vinculadas aos clientes correspondentes
- ✅ Sistema funcionando com clientes cadastrados e novos
- ✅ Histórico preservado

## 🎯 Próximos Passos

Após executar os scripts:

1. **Recarregue a aplicação** (Ctrl+R ou F5)
2. **Acesse** `/dashboard/clientes`
3. **Verifique** a lista de clientes
4. **Teste** criar uma nova festa selecionando um cliente existente
5. **Valide** o histórico de festas de cada cliente

## 💡 Dicas

- **Não execute os scripts mais de uma vez** (evita duplicação)
- **Faça backup antes** (segurança)
- **Verifique o ambiente** (Development ou Production)
- **Execute em horário de baixo uso** (se em produção)

## 🆘 Suporte

Em caso de dúvidas ou problemas:
- Verifique os logs do Supabase
- Consulte a documentação do projeto
- Reverta usando o rollback acima

## 📅 Data da Migração

- **Data:** _________
- **Executado por:** _________
- **Status:** [ ] Sucesso [ ] Erro
- **Observações:** ___________________

---

**✨ Após executar com sucesso, o sistema de clientes estará totalmente funcional!**
