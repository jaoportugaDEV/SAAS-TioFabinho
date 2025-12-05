# 🎯 Dois Tipos de Status "Encerrada"

## 📋 Implementação Concluída

Sistema inteligente que diferencia festas encerradas com base no status dos pagamentos:

1. **Encerrada - Pag. Pendente** 🟠 → Festa aconteceu mas ainda faltam pagamentos
2. **Encerrada** ⚫ → Festa aconteceu e TODOS os pagamentos foram feitos

## 🎯 Lógica de Status

### Fluxo Completo

```
Planejamento
    ↓
Confirmada
    ↓
(Festa acontece baseado na data/hora)
    ↓
    ├─→ Tem pagamentos pendentes? → Encerrada - Pag. Pendente 🟠
    │       ↓
    │   (Todos os pagamentos são feitos)
    │       ↓
    └─→ Todos pagamentos completos → Encerrada ⚫
```

### Critérios de Avaliação

**Para status "Encerrada - Pag. Pendente" (encerrada_pendente):**
- Data/hora da festa já passou
- **OU** Cliente não pagou tudo (`status_pagamento_cliente != 'pago_total'`)
- **OU** Freelancers não receberam tudo (`status_pagamento_freelancers != 'pago'`)

**Para status "Encerrada" (encerrada):**
- Data/hora da festa já passou
- **E** Cliente pagou tudo (`status_pagamento_cliente == 'pago_total'`)
- **E** Freelancers receberam tudo (`status_pagamento_freelancers == 'pago'`)

## 🎨 Visual dos Status

### Na Interface:

| Status | Badge | Cor | Ícone |
|--------|-------|-----|-------|
| Planejamento | `Planejamento` | Azul | - |
| Confirmada | `Confirmada` | Verde | - |
| Encerrada - Pag. Pendente | `Encerrada - Pag. Pendente` | Laranja | ⚠️ AlertCircle |
| Encerrada | `Encerrada` | Cinza | ✅ CheckCircle |

### Filtros na Página de Festas:

```
[Todos] [Planejamento] [Confirmada] [⚠️ Encerrada - Pag. Pendente] [✅ Encerrada]
```

## 💻 Implementação Técnica

### 1. Schema do Banco de Dados

**`supabase-schema.sql`**
```sql
CREATE TYPE status_festa AS ENUM (
  'planejamento', 
  'confirmada', 
  'encerrada_pendente',  -- NOVO
  'encerrada',           -- NOVO
  'cancelada'
);
```

### 2. Types TypeScript

**`types/index.ts`**
```typescript
export type StatusFesta = 
  | 'planejamento' 
  | 'confirmada' 
  | 'encerrada_pendente' 
  | 'encerrada';
```

### 3. Função de Auto-Update Inteligente

**`app/actions/auto-update-status.ts`**

```typescript
export async function autoUpdateFestaStatus() {
  // Busca festas confirmadas
  const festas = await supabase
    .from("festas")
    .select("id, data, horario, status_pagamento_freelancers, status_pagamento_cliente")
    .eq("status", "confirmada");

  for (const festa of festas) {
    // Verifica se a festa já aconteceu
    if (dataFesta < now) {
      // Define status baseado nos pagamentos
      const clientePagou = festa.status_pagamento_cliente === 'pago_total';
      const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';
      
      const novoStatus = (clientePagou && freelancersReceberam) 
        ? 'encerrada' 
        : 'encerrada_pendente';
      
      // Atualiza
      await supabase
        .from("festas")
        .update({ status: novoStatus })
        .eq("id", festa.id);
    }
  }
}
```

### 4. Função de Verificação de Pagamentos Completos

**`app/actions/auto-update-status.ts`**

```typescript
export async function checkAndUpdatePagamentosCompletos() {
  // Busca festas com status "encerrada_pendente"
  const festas = await supabase
    .from("festas")
    .select("id, status_pagamento_freelancers, status_pagamento_cliente")
    .eq("status", "encerrada_pendente");

  for (const festa of festas) {
    const clientePagou = festa.status_pagamento_cliente === 'pago_total';
    const freelancersReceberam = festa.status_pagamento_freelancers === 'pago';

    // Se todos os pagamentos foram feitos, atualizar para "encerrada"
    if (clientePagou && freelancersReceberam) {
      await supabase
        .from("festas")
        .update({ status: "encerrada" })
        .eq("id", festa.id);
    }
  }
}
```

### 5. Integração nas Páginas

**Página de Pagamentos** - Verifica automaticamente:
```typescript
const loadFestas = async () => {
  // Verifica e atualiza status
  await checkAndUpdatePagamentosCompletos();
  // Carrega festas
  const result = await getFestasPagamentosPendentes();
};
```

## 🔄 Transições Automáticas

### Quando a Festa Acontece

1. Sistema detecta que data/hora passou
2. Verifica status dos pagamentos:
   - Cliente pagou? ✅/❌
   - Freelancers receberam? ✅/❌
3. Define status:
   - Se ambos ✅ → `encerrada`
   - Se algum ❌ → `encerrada_pendente`

### Quando Pagamentos são Completados

1. Usuário marca pagamento como feito
2. Sistema verifica se todos foram pagos
3. Se sim, atualiza automaticamente:
   - `encerrada_pendente` → `encerrada`

## 🎬 Exemplo de Uso

### Cenário 1: Festa com Pagamentos Pendentes

```
Festa: Aniversário João
Data: 01/12/2025 ✅ (já passou)
Cliente pagou: ❌ Não (parcela pendente)
Freelancers receberam: ❌ Não

Status: Encerrada - Pag. Pendente 🟠
```

### Cenário 2: Cliente Paga

```
Cliente paga última parcela ✅

Sistema verifica:
- Cliente pagou: ✅ Sim
- Freelancers receberam: ❌ Não

Status: Ainda "Encerrada - Pag. Pendente" 🟠
Badge vermelho aparece: "Pagar Freelancers!"
```

### Cenário 3: Freelancers Recebem

```
Dona paga todos os freelancers ✅

Sistema verifica automaticamente:
- Cliente pagou: ✅ Sim
- Freelancers receberam: ✅ Sim

Status atualiza para: "Encerrada" ⚫
Badge de alerta desaparece
```

## 📁 Arquivos Modificados

### Schema e Types
- ✅ [`supabase-schema.sql`](supabase-schema.sql) - ENUM atualizado
- ✅ [`supabase-migration-status-encerrada.sql`](supabase-migration-status-encerrada.sql) - Script de migração
- ✅ [`types/index.ts`](types/index.ts) - Tipos TypeScript

### Lógica de Negócio
- ✅ [`app/actions/auto-update-status.ts`](app/actions/auto-update-status.ts) - Funções inteligentes

### Interface
- ✅ [`app/dashboard/festas/page.tsx`](app/dashboard/festas/page.tsx) - Listagem com dois filtros
- ✅ [`app/dashboard/festas/[id]/page.tsx`](app/dashboard/festas/[id]/page.tsx) - Detalhes
- ✅ [`components/festas/status-selector.tsx`](components/festas/status-selector.tsx) - Seletor
- ✅ [`app/dashboard/calendario/page.tsx`](app/dashboard/calendario/page.tsx) - Calendário
- ✅ [`app/dashboard/pagamentos/page.tsx`](app/dashboard/pagamentos/page.tsx) - Pagamentos

## ✨ Benefícios

1. ✅ **Diferenciação Clara** - Sabe quais festas precisam de atenção
2. 🎯 **Filtros Específicos** - Encontra facilmente festas em cada situação
3. 🤖 **Automação Total** - Status muda sozinho quando pagamentos completos
4. 📊 **Melhor Gestão** - Visão clara do que está pendente vs completo
5. 🔍 **Rastreabilidade** - Histórico completo de cada festa

## 🎨 Comparação Visual

### Antes (1 status):
```
Encerrada ← Tudo misturado
```

### Agora (2 status):
```
Encerrada - Pag. Pendente 🟠 ← Precisa atenção
Encerrada ⚫ ← Tudo resolvido
```

## 🚀 Para Usar

### 1. Banco de Dados Novo
Execute o arquivo [`supabase-schema.sql`](supabase-schema.sql) completo.

### 2. Banco de Dados Existente
Execute o arquivo [`supabase-migration-status-encerrada.sql`](supabase-migration-status-encerrada.sql) no SQL Editor do Supabase.

### 3. Sistema Funciona Automaticamente
- Festas confirmadas viram "Encerrada - Pag. Pendente" quando a data passa
- Quando todos os pagamentos são feitos, vira "Encerrada" automaticamente
- Filtros permitem visualizar cada tipo separadamente

---

**✨ Sistema implementado e funcionando!**

**Agora você tem controle total sobre o status das festas baseado nos pagamentos!** 🎉💰

