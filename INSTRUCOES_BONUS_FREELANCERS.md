# 💰 Sistema de Bônus para Freelancers - Instruções de Uso

## 📋 Passo a Passo para Ativação

### 1️⃣ Executar Script SQL no Supabase

Antes de usar o sistema de bônus, você precisa executar o script SQL no Supabase:

1. Acesse o **Supabase Dashboard** (https://supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **"New Query"**
5. Copie todo o conteúdo do arquivo `add-bonus-freelancers.sql`
6. Cole no editor SQL
7. Clique em **"Run"** ou pressione `Ctrl+Enter`
8. Aguarde a confirmação de sucesso ✅

**Importante:** Execute o script ANTES de usar qualquer funcionalidade de bônus no sistema!

---

## 🎯 Como Usar o Sistema de Bônus

### Adicionar/Editar Bônus em uma Festa

O bônus pode ser adicionado ou editado em **dois momentos**:

#### Opção 1: Na Página de Detalhes da Festa

1. Acesse **Dashboard → Festas → [Selecione uma festa]**
2. Role até a seção **"Equipe da Festa"**
3. Clique no botão **"Editar Valor"** ao lado do freelancer desejado
4. No dialog que abrir:
   - **Valor do Bônus**: Digite o valor adicional (ex: 50.00)
   - **Motivo do Bônus** (opcional): Ex: "Horas extras", "Excelente trabalho"
   - Veja o **Preview** do valor total (Valor Base + Bônus)
5. Clique em **"Salvar Bônus"**

#### Opção 2: Na Tela de Pagamentos

1. Acesse **Dashboard → Pagamentos**
2. Localize a festa e o freelancer
3. Clique no botão **"Editar Valor/Bônus"**
4. Preencha os campos e salve (mesmo processo acima)

**Nota:** Você só pode editar o bônus enquanto o pagamento NÃO foi marcado como pago.

---

## 💡 Funcionalidades do Sistema

### ✅ O que o Sistema Faz

1. **Exibição Clara**: Mostra sempre "Valor Base + Bônus = Total"
2. **Motivo Opcional**: Você pode adicionar ou não um motivo para o bônus
3. **Sugestão Automática**: Para bônus > R$ 50, o sistema sugere adicionar um motivo
4. **Validação**: Não permite valores negativos
5. **Contabilização Automática**: O bônus é incluído automaticamente em:
   - Total de pagamentos da festa
   - Relatório financeiro
   - Despesas com freelancers
6. **Indicador Visual**: Freelancers com bônus aparecem com um ícone 💰
7. **Histórico**: O motivo do bônus fica registrado no pagamento

### 📊 Visualizações

#### Modo Compacto (Listas)
```
💰 R$ 250,00  ℹ️
```
- Mostra o total com ícone de bônus
- Hover no ℹ️ mostra o motivo

#### Modo Detalhado (Detalhes/Pagamentos)
```
🟢 Com Bônus
Valor Base:  R$ 200,00
Bônus:      + R$ 50,00
ℹ️ Horas extras
─────────────────────
Total:       R$ 250,00
```

---

## 🔄 Fluxo Completo de Uso

### Exemplo Prático

1. **Criar/Vincular Freelancer à Festa**
   - Freelancer "João" vinculado com valor base R$ 200,00

2. **Adicionar Bônus (durante ou após a festa)**
   - Acesse a festa ou vá em Pagamentos
   - Clique em "Editar Valor/Bônus" para João
   - Digite bônus de R$ 50,00
   - Motivo: "Trabalhou 2 horas extras"
   - Salve

3. **Visualizar na Lista**
   - João aparecerá com: 💰 R$ 250,00

4. **Efetuar Pagamento**
   - Na tela de Pagamentos
   - Copie o PIX de João
   - Faça o pagamento de **R$ 250,00** (total)
   - Marque como pago ✅

5. **Verificar no Financeiro**
   - O valor de R$ 250,00 será contabilizado automaticamente
   - No relatório PDF, aparecerá nas despesas com freelancers

---

## ⚠️ Observações Importantes

### ✅ Pode Fazer
- Adicionar bônus antes ou depois da festa
- Editar o bônus quantas vezes quiser antes de marcar como pago
- Deixar o motivo em branco (é opcional)
- Adicionar bônus de R$ 0 (para remover um bônus existente)

### ❌ Não Pode Fazer
- Adicionar bônus negativo (sistema valida)
- Editar bônus depois que o pagamento foi marcado como pago
- Ver bônus em festas antigas (precisa executar o script SQL primeiro)

---

## 📈 Benefícios para o Negócio

1. **Flexibilidade**: Recompense bom desempenho facilmente
2. **Transparência**: Sempre sabe o que é base e o que é extra
3. **Controle**: Todo bônus tem um motivo registrado
4. **Automação**: Tudo é contabilizado automaticamente
5. **Histórico**: Referência futura para decisões

---

## 🐛 Problemas Comuns

### "Erro ao salvar bônus"
**Causa**: Script SQL não foi executado
**Solução**: Execute o arquivo `add-bonus-freelancers.sql` no Supabase

### "Não consigo editar o bônus"
**Causa**: Pagamento já foi marcado como pago
**Solução**: Bônus só pode ser editado antes do pagamento. Desmarque o pagamento se necessário.

### "Bônus não aparece no financeiro"
**Causa**: Cache ou dados não atualizados
**Solução**: Atualize a página (F5)

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique se executou o script SQL
2. Atualize a página (F5)
3. Limpe o cache do navegador
4. Entre em contato com o desenvolvedor

---

**Versão:** 1.0
**Data:** Janeiro 2026
**Implementado por:** Sistema de Gestão Tio Fabinho
