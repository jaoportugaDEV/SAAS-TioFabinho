# 💰 Onde Aparecem os Valores Configurados

## ✅ Locais Onde os Valores São Exibidos

### 1️⃣ **Página de Configurações** 
📍 `/dashboard/configuracoes`

**O que mostra:**
- ✅ Todos os valores configurados por função
- ✅ Permite editar e salvar alterações
- ✅ Histórico de última atualização

**Exemplo:**
```
Monitor: R$ 50,00
Cozinheira: R$ 80,00
Garçom: R$ 60,00
...
```

---

### 2️⃣ **Página de Edição do Freelancer**
📍 `/dashboard/freelancers/[id]`

**O que mostra:**
- ✅ Valor configurado para a função do freelancer (somente leitura)
- ✅ Card destacado em verde com o valor
- ✅ Botão para ir para Configurações e alterar valores
- ✅ Mensagem explicativa

**Exemplo:**
```
┌─────────────────────────────────┐
│ Valor por Festa                 │
│                                 │
│ Valor configurado para          │
│ esta função:                    │
│                                 │
│ R$ 50,00        [Alterar Valores]│
└─────────────────────────────────┘

💡 O valor é definido pela função em Configurações
```

**Como funciona:**
- Quando você muda a função do freelancer, o valor é atualizado automaticamente
- O valor não pode ser editado aqui - apenas em Configurações
- Link direto para Configurações caso precise alterar

---

### 3️⃣ **Gerenciador de Freelancers na Festa**
📍 `/dashboard/festas/[id]` - Seção "Equipe da Festa"

**O que mostra:**
- ✅ Valor de cada freelancer adicionado à festa
- ✅ Card verde com informações do valor
- ✅ Mensagem indicando que é "valor fixo da função"

**Exemplo:**
```
┌─────────────────────────────────┐
│ João Silva                      │
│ Monitor                         │
│                                 │
│ $ Valor: R$ 50,00              │
│ Valor fixo da função Monitor   │
└─────────────────────────────────┘
```

**Como funciona:**
- Quando você adiciona um freelancer à festa, o sistema:
  1. Busca a função do freelancer (ex: Monitor)
  2. Consulta o valor configurado para Monitor
  3. Define automaticamente o `valor_acordado` com esse valor
- O valor NÃO pode ser editado manualmente
- Se precisar mudar, altere em Configurações ANTES de adicionar o freelancer

---

### 4️⃣ **Página de Pagamentos**
📍 `/dashboard/pagamentos`

**O que mostra:**
- ✅ Valor a pagar para cada freelancer
- ✅ Nome, função e valor destacado
- ✅ Chave PIX para copiar
- ✅ Checkbox para marcar como pago

**Exemplo:**
```
┌────────────────────────────────────┐
│ [✓] Maria Santos                  │
│     Cozinheira                     │
│                         R$ 80,00   │
│                                    │
│ PIX: maria@example.com  [Copiar]   │
│ □ Marcar como pago                 │
└────────────────────────────────────┐
```

**Como funciona:**
- Mostra o `valor_acordado` que foi definido quando o freelancer foi adicionado à festa
- Esse valor foi baseado na função dele no momento da adição
- Quando você marca como pago, esse valor entra nas despesas do mês

---

### 5️⃣ **Seção de Pagamentos na Festa**
📍 `/dashboard/festas/[id]` - Seção "Pagamentos de Freelancers"

**O que mostra:**
- ✅ Status de pagamento de cada freelancer
- ✅ Valor individual destacado em verde
- ✅ Total de pagamentos da festa
- ✅ Badge de status (Pendente/Parcial/Completo)

**Exemplo:**
```
┌────────────────────────────────────┐
│ Pagamentos de Freelancers          │
│                   [⏰ Pendente]    │
├────────────────────────────────────┤
│ ○ João Silva                       │
│   Pagamento pendente    R$ 50,00   │
│                                    │
│ ✓ Maria Santos                     │
│   Pagamento confirmado  R$ 80,00   │
├────────────────────────────────────┤
│ Total de Pagamentos     R$ 130,00  │
└────────────────────────────────────┘
```

---

### 6️⃣ **Página Financeiro (Despesas)**
📍 `/dashboard/financeiro`

**O que mostra:**
- ✅ Total de despesas do mês
- ✅ Valores dos freelancers que foram marcados como pagos
- ✅ Cálculo automático de lucro

**Exemplo:**
```
┌────────────────────────────────┐
│ Despesas do Mês                │
│                                │
│ R$ 260,00                      │
│                                │
│ Pagamentos de freelancers      │
└────────────────────────────────┘
```

**Como funciona:**
- Busca registros da tabela `pagamentos_freelancers` do mês atual
- Quando você marca um freelancer como pago na página de Pagamentos:
  1. Cria registro em `pagamentos_freelancers` com o valor
  2. Esse valor aparece automaticamente aqui nas despesas
  3. Afeta o cálculo de lucro do mês

---

## 🔄 Fluxo Completo dos Valores

```
1. CONFIGURAR
   └─> /dashboard/configuracoes
       Define: Monitor = R$ 50,00

2. CRIAR/EDITAR FREELANCER
   └─> /dashboard/freelancers/[id]
       Mostra: "Valor para Monitor: R$ 50,00"

3. ADICIONAR À FESTA
   └─> /dashboard/festas/[id]
       Sistema define automaticamente: valor_acordado = R$ 50,00

4. VISUALIZAR PAGAMENTO
   └─> /dashboard/pagamentos
       Mostra: "João Silva - R$ 50,00"

5. MARCAR COMO PAGO
   └─> Cria registro em pagamentos_freelancers
       valor = R$ 50,00

6. VER DESPESAS
   └─> /dashboard/financeiro
       Soma: R$ 50,00 nas despesas do mês
```

---

## 📊 Tabelas do Banco Envolvidas

### `valores_funcoes`
```
funcao       | valor
-------------+--------
monitor      | 50.00
cozinheira   | 80.00
garcom       | 60.00
...
```
→ Fonte dos valores configurados

### `festa_freelancers`
```
festa_id | freelancer_id | valor_acordado | status_pagamento
---------+---------------+----------------+-----------------
abc123   | freelancer1   | 50.00          | pendente
```
→ Valores definidos quando freelancer é adicionado à festa

### `pagamentos_freelancers`
```
festa_id | freelancer_id | valor  | data_pagamento
---------+---------------+--------+---------------
abc123   | freelancer1   | 50.00  | 2024-01-15
```
→ Registros criados quando marca como pago (usado para calcular despesas)

---

## ⚠️ Regras Importantes

### ✅ **O que é automático:**
- ✅ Valor definido ao adicionar freelancer à festa
- ✅ Valor copiado para pagamentos quando marca como pago
- ✅ Despesas calculadas automaticamente no financeiro

### ❌ **O que NÃO é possível:**
- ❌ Editar valor individual de um freelancer em uma festa
- ❌ Valores diferentes para mesmo freelancer em festas diferentes
- ❌ Editar valor na página de pagamentos

### 💡 **Como fazer ajustes:**
- Se precisar de valor especial:
  1. Vá em Configurações
  2. Altere o valor da função temporariamente
  3. Adicione o freelancer à festa
  4. Volte o valor ao normal em Configurações

---

**Desenvolvido com ❤️ para o Tio Fabinho Buffet**

