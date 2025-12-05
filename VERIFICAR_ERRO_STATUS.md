# 🔍 Verificar Erro ao Alterar Status de Festa

## O que foi corrigido no código:

1. ✅ Adicionado tipo `cancelada` no TypeScript (faltava)
2. ✅ Melhorado tratamento de erros com mensagens claras
3. ✅ Adicionado logs no console para debug
4. ✅ Validação do status atual antes de tentar alterar

## 📝 Como testar agora:

1. Abra o navegador com DevTools (F12)
2. Vá em Console
3. Tente mudar o status de uma festa
4. Veja as mensagens no console:
   - "Alterando status de X para Y"
   - "Status atualizado com sucesso" OU mensagem de erro

## 🔧 Se ainda der erro, verifique no Supabase:

### 1. Verificar Tabela `festas`:
```sql
-- Execute no SQL Editor do Supabase para verificar o tipo:
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'festas' AND column_name = 'status';
```

### 2. Verificar se o ENUM tem os valores corretos:
```sql
-- Ver valores do ENUM:
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'status_festa'::regtype 
ORDER BY enumsortorder;
```

Deve retornar:
- planejamento
- confirmada
- encerrada_pendente
- encerrada
- cancelada

### 3. Verificar Políticas RLS:
```sql
-- Ver políticas da tabela festas:
SELECT * FROM pg_policies WHERE tablename = 'festas';
```

Deve ter uma política permitindo UPDATE para usuários autenticados.

### 4. Se precisar recriar a política:
```sql
-- Remover política antiga (se existir)
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados" ON festas;

-- Criar política correta
CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON festas 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

## 🐛 Possíveis causas do erro:

1. **RLS (Row Level Security) bloqueando**: Políticas não permitem UPDATE
2. **ENUM desatualizado**: Valores do ENUM no banco não correspondem ao código
3. **Usuário não autenticado**: Sessão expirou
4. **Permissões do Supabase**: Service role ou anon key com permissões limitadas

## 📱 Teste no Console do Navegador:

Execute isso no console quando estiver logado:
```javascript
// Ver sessão atual
const { data: { session } } = await supabase.auth.getSession();
console.log('Sessão:', session);

// Tentar atualizar manualmente
const { data, error } = await supabase
  .from('festas')
  .update({ status: 'confirmada' })
  .eq('id', 'ID_DA_FESTA_AQUI')
  .select();
  
console.log('Resultado:', data);
console.log('Erro:', error);
```

## ✅ Se tudo estiver correto:

O erro aparecerá como um **alert** na tela com a mensagem específica do erro, e também no console do navegador com detalhes completos.

---

**Próximo passo**: Tente mudar o status agora e me envie a mensagem de erro que aparecer (tanto no alert quanto no console).

