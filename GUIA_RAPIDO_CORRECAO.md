# 🚨 GUIA RÁPIDO: Corrigir Valores R$ 0,00 nos Pagamentos

## ⚡ Solução em 3 Passos

### 📍 PASSO 1: Entrar no Supabase
```
1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto "Tio Fabinho"
3. Menu lateral → SQL Editor
```

### 📍 PASSO 2: Executar o Script
```
1. Abra o arquivo: migration-corrigir-valores-freelancers.sql
2. Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em "RUN" (botão verde)
5. Aguarde aparecer "Success. No rows returned"
```

### 📍 PASSO 3: Verificar
```
1. Volte para o sistema
2. Acesse: Pagamentos
3. Verifique se os valores apareceram corretamente
```

---

## ✅ Valores que Serão Preenchidos

| Função      | Valor    |
|-------------|----------|
| Monitor     | R$ 50,00 |
| Cozinheira  | R$ 80,00 |
| Recepção    | R$ 50,00 |
| Garçom      | R$ 60,00 |
| Fotógrafo   | R$ 0,00  |
| Outros      | R$ 0,00  |

> **Nota:** Fotógrafo e Outros ficam em R$ 0,00 pois variam muito.  
> Você pode editar manualmente o valor deles depois!

---

## 🎯 Resultado Final

### ❌ ANTES (Problema)
![Pagamentos mostrando R$ 0,00 para todos]

**Problema:**
- Freelancers com R$ 0,00
- Dona precisa lembrar os valores
- Confusão na hora de pagar

### ✅ DEPOIS (Corrigido)
![Pagamentos mostrando valores corretos]

**Solução:**
- ✅ João (Monitor): R$ 50,00
- ✅ Maria (Cozinheira): R$ 80,00
- ✅ Pedro (Garçom): R$ 60,00
- ✅ Ana (Recepção): R$ 50,00

---

## 🤔 Perguntas Frequentes

### ❓ E se eu quiser mudar esses valores?

**Para mudar o valor padrão de um freelancer:**
1. Vá em **Freelancers**
2. Clique no freelancer
3. Edite o campo **"Valor Padrão por Festa"**
4. Salve

**Para mudar apenas em uma festa específica:**
1. Vá na **Festa** → Editar
2. Na seção **Freelancers**, clique em editar valor
3. Altere o valor apenas para aquela festa

---

### ❓ E as festas antigas?

✅ **Sim!** O script corrige automaticamente:
- Todos os freelancers existentes
- Todas as festas já cadastradas
- Valores de pagamentos pendentes

---

### ❓ Posso executar o script mais de uma vez?

✅ **Sim!** É seguro executar novamente.
- Só atualiza valores que estão zerados
- Não sobrescreve valores que já foram definidos manualmente

---

### ❓ E se eu tiver um fotógrafo com valor definido?

Você precisa editar manualmente:

1. **Opção 1 - Valor padrão para todos os eventos:**
   - Freelancers → Editar Fotógrafo
   - Defina "Valor Padrão": R$ 200,00
   - Salve

2. **Opção 2 - Valor específico em uma festa:**
   - Festa → Editar
   - Freelancers → Editar valor do fotógrafo
   - Defina o valor para aquela festa

---

## 🆘 Deu Erro?

### Se aparecer erro no SQL Editor:

**Erro:** "relation freelancers does not exist"
- **Solução:** Verifique se está no projeto correto

**Erro:** "column valor_padrao does not exist"
- **Solução:** Execute primeiro a migration: `migration-pagamentos-pix.sql`

**Erro:** "permission denied"
- **Solução:** Verifique se você é admin do projeto

---

### Se após executar ainda aparecer R$ 0,00:

1. **Recarregue a página** (Ctrl+F5)
2. **Limpe o cache** do navegador
3. **Faça logout e login** novamente
4. **Verifique no Supabase:**
   ```sql
   SELECT nome, funcao, valor_padrao FROM freelancers;
   ```

---

## 📱 Precisa de Ajuda?

Leia a documentação completa em:
📄 **CORRECAO_VALORES_PAGAMENTOS.md**

Ou entre em contato com o desenvolvedor! 💪

---

**⏰ Tempo estimado: 2 minutos**  
**🎯 Dificuldade: Fácil**  
**✅ Resultado: 100% Automático**

