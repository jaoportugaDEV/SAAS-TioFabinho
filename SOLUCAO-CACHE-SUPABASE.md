# 🔧 SOLUÇÃO: Cache do Supabase Travado

## ❌ Problema Atual

Erro ao criar festas:
```
Could not find the 'entrada' column of 'orcamentos' in the schema cache
```

**Causa:** O PostgREST (API do Supabase) não atualizou o cache mesmo após executar os scripts SQL.

---

## ✅ SOLUÇÃO 1: Restart do Projeto (MAIS GARANTIDA)

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/liewdzmzoyeycwymtdju/settings/general

2. **Pause o Projeto:**
   - Role até o FINAL da página
   - Clique no botão **"Pause project"** (vermelho)
   - ⏳ Aguarde 30-60 segundos até aparecer que está pausado

3. **Despause o Projeto:**
   - Clique em **"Unpause project"** ou **"Resume project"**
   - ⏳ Aguarde 1-2 minutos para reiniciar completamente
   - O projeto vai "acordar" e recarregar tudo

4. **Teste Novamente:**
   - Volte ao navegador (http://localhost:3000)
   - Tente criar uma nova festa com parcelamento
   - ✅ Deve funcionar!

---

## ✅ SOLUÇÃO 2: Dropar e Recriar Colunas (ALTERNATIVA)

Se não quiser pausar o projeto, execute este SQL:

```sql
-- 1. Dropar as colunas problemáticas
ALTER TABLE orcamentos 
DROP COLUMN IF EXISTS forma_pagamento CASCADE,
DROP COLUMN IF EXISTS quantidade_parcelas CASCADE,
DROP COLUMN IF EXISTS entrada CASCADE;

-- 2. Recriar as colunas
ALTER TABLE orcamentos 
ADD COLUMN forma_pagamento VARCHAR(20) DEFAULT 'avista' NOT NULL,
ADD COLUMN quantidade_parcelas INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN entrada DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- 3. Forçar reload do PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 4. Verificar se criou
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orcamentos' 
  AND column_name IN ('forma_pagamento', 'quantidade_parcelas', 'entrada');
```

Depois de executar:
- Aguarde 10-20 segundos
- Tente criar a festa novamente

---

## ✅ SOLUÇÃO 3: Aguardar o Cache Expirar

Se nenhuma das anteriores funcionar:
- Aguarde 10-15 minutos
- O cache do PostgREST expira automaticamente
- Tente novamente depois

---

## 📊 Como Verificar se Funcionou

Após executar uma das soluções, execute este SQL para verificar:

```sql
-- Verificar estrutura da tabela
\d orcamentos;

-- OU

SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'orcamentos' 
ORDER BY ordinal_position;
```

Deve mostrar as colunas: `forma_pagamento`, `quantidade_parcelas`, `entrada`

---

## 🎯 Ordem Recomendada

1. ✅ **Tente SOLUÇÃO 1 (Restart)** - Mais garantida
2. ✅ Se não funcionar, tente **SOLUÇÃO 2 (Dropar e Recriar)**
3. ✅ Em último caso, **SOLUÇÃO 3 (Aguardar)**

---

## 📞 Me Avise

Depois de executar uma das soluções, me avise:
- ✅ Funcionou! As festas são criadas normalmente
- ❌ Ainda dá erro (me mande o novo erro se houver)

