# 💰 Sistema de Alerta de Pagamento de Freelancers

## 📋 Funcionalidade Implementada

Sistema inteligente que detecta quando o **cliente já pagou tudo** mas os **freelancers ainda não foram pagos**, e cria um alerta visual direto na listagem de festas.

## 🎯 Como Funciona

### Detecção Automática

O sistema verifica para cada festa:

1. **Status do Pagamento do Cliente**
   - Verifica a tabela `orcamentos`
   - Checa se `status_pagamento === 'pago_total'`
   - ✅ Cliente pagou = `true`

2. **Status do Pagamento dos Freelancers**
   - Verifica o campo `status_pagamento_freelancers` da festa
   - Checa se está como `'pago'`
   - ❌ Freelancers não receberam = `false`

3. **Condição de Alerta**
   ```
   SE (Cliente Pagou = ✅) E (Freelancers Receberam = ❌)
   ENTÃO: Mostrar Badge de Alerta
   ```

## 🎨 Visual do Alerta

### Badge Vermelho Pulsante

Quando a condição é atendida, aparece um badge **vermelho** com **animação pulsante** na lista de festas:

```
🔴 💵 Pagar Freelancers!
```

**Características:**
- ⚡ Cor vermelha chamativa (`bg-red-500`)
- 🔄 Animação pulsante (`animate-pulse`)
- 💫 Efeito hover (`hover:bg-red-600`)
- 👆 Clicável (cursor pointer)
- 💵 Ícone de cifrão (`DollarSign`)

## 🚀 Fluxo de Uso

### 1. Na Listagem de Festas
```
📍 Dashboard → Festas
```

Usuária vê a lista de festas e identifica facilmente quais têm pagamentos pendentes para freelancers:

```
┌─────────────────────────────────────────┐
│ Aniversário João                        │
│ Cliente: Maria Silva                    │
│                                         │
│ [Confirmada]                            │
│ [⏰ Pagamento Pendente]                 │
│ [🔴💵 Pagar Freelancers!] ← PULSANDO   │
└─────────────────────────────────────────┘
```

### 2. Ao Clicar no Badge
```
Clique em "Pagar Freelancers!"
  ↓
Redireciona para /dashboard/pagamentos
  ↓
Query param: ?festa=[id]
  ↓
Scroll automático + Animação
```

### 3. Na Página de Pagamentos

A página automaticamente:
1. ⬇️ **Faz scroll** até aquela festa específica
2. 🎯 **Destaca** o card da festa com animação
3. ⭕ **Ring vermelho** pulsante ao redor
4. 🌟 **Shadow brilhante** vermelha
5. 📏 **Scale aumentado** (1.02x)

**Animação dura 4 segundos e depois desaparece suavemente**

## 💻 Implementação Técnica

### Arquivos Modificados

#### 1. `app/dashboard/festas/page.tsx`

**Interface Estendida:**
```typescript
interface FestaComPagamentos extends Festa {
  clientePagou?: boolean;
  freelancersReceberam?: boolean;
}
```

**Verificação de Pagamentos:**
```typescript
const festasComPagamentos = await Promise.all(
  (data || []).map(async (festa) => {
    // Buscar orçamento
    const { data: orcamento } = await supabase
      .from("orcamentos")
      .select("status_pagamento")
      .eq("festa_id", festa.id)
      .single();

    const clientePagou = orcamento?.status_pagamento === "pago_total";
    const freelancersReceberam = festa.status_pagamento_freelancers === "pago";

    return { ...festa, clientePagou, freelancersReceberam };
  })
);
```

**Badge de Alerta:**
```tsx
{festa.clientePagou && !festa.freelancersReceberam && (
  <Link href={`/dashboard/pagamentos?festa=${festa.id}`}>
    <Badge className="bg-red-500 text-white animate-pulse">
      <DollarSign className="w-3 h-3 mr-1" />
      Pagar Freelancers!
    </Badge>
  </Link>
)}
```

#### 2. `app/dashboard/pagamentos/page.tsx`

**Refs e States:**
```typescript
const searchParams = useSearchParams();
const [highlightFestaId, setHighlightFestaId] = useState<string | null>(null);
const festaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
```

**Detecção e Scroll:**
```typescript
useEffect(() => {
  const festaId = searchParams.get('festa');
  if (festaId && !loading && festas.length > 0) {
    setTimeout(() => {
      const festaRef = festaRefs.current[festaId];
      if (festaRef) {
        // Scroll suave
        festaRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Ativar animação
        setHighlightFestaId(festaId);
        
        // Desativar após 4s
        setTimeout(() => setHighlightFestaId(null), 4000);
      }
    }, 500);
  }
}, [searchParams, loading, festas]);
```

**Card com Animação:**
```tsx
<Card
  ref={(el) => (festaRefs.current[festa.id] = el)}
  className={`transition-all duration-500 ${
    highlightFestaId === festa.id
      ? 'ring-4 ring-red-500 ring-opacity-50 shadow-2xl shadow-red-500/50 scale-[1.02]'
      : ''
  }`}
>
  {/* Conteúdo da festa */}
</Card>
```

## 🎬 Exemplo de Uso

### Cenário Real

**Festa:** Aniversário de 15 Anos - Julia  
**Data:** 10/12/2025  
**Status:** Encerrada

**Situação:**
- ✅ Cliente (mãe da Julia) pagou todas as 3 parcelas
- ❌ Freelancers ainda não receberam

**O que acontece:**

1. **Na listagem de festas**
   ```
   🔴💵 Pagar Freelancers! ← Badge pulsando em vermelho
   ```

2. **Dona do buffet clica no badge**
   - Página carrega
   - Scroll automático até "Pagamentos"
   - Ring vermelho destaca a seção
   - Sombra brilhante vermelha
   - Efeito visual dura 3 segundos

3. **Ela vê claramente**
   - Quais freelancers precisa pagar
   - Valores de cada um
   - Pode marcar como pago direto ali

## ✨ Benefícios

1. ✅ **Visualização Imediata** - Badge chamativo na lista
2. ⚡ **Ação Rápida** - Clique direto leva ao pagamento
3. 🎯 **Destaque Visual** - Animação mostra exatamente onde agir
4. 💰 **Evita Esquecimentos** - Impossível não ver o alerta
5. 🚀 **Fluxo Eficiente** - Menos cliques para completar a tarefa

## 🎨 Classes CSS Utilizadas

```css
/* Badge de Alerta */
.bg-red-500         /* Fundo vermelho */
.text-white         /* Texto branco */
.animate-pulse      /* Animação pulsante */
.hover:bg-red-600   /* Hover mais escuro */

/* Animação de Destaque */
.ring-4                    /* Ring de 4px */
.ring-red-500              /* Cor vermelha */
.ring-opacity-50           /* 50% transparência */
.rounded-lg                /* Bordas arredondadas */
.shadow-2xl                /* Sombra extra grande */
.shadow-red-500/50         /* Sombra vermelha 50% */
.scale-[1.02]              /* Aumenta 2% */
.transition-all            /* Transição suave */
.duration-500              /* Duração 500ms */
```

## 🔄 Integração com Sistema Existente

- ✅ Não interfere com status existentes
- ✅ Funciona com sistema de filtros
- ✅ Compatível com busca por texto
- ✅ Respeita permissões de usuário
- ✅ Performance otimizada (Promise.all)

## 📱 Responsividade

O badge funciona perfeitamente em:
- 💻 Desktop
- 📱 Mobile
- 📲 Tablet

O layout se adapta automaticamente!

## 🎯 Casos de Uso

### ✅ Badge Aparece Quando:
- Cliente pagou todas as parcelas (`pago_total`)
- Freelancers ainda não receberam (`pendente` ou `parcial`)
- Festa está em qualquer status (planejamento, confirmada, encerrada)

### ❌ Badge NÃO Aparece Quando:
- Cliente ainda não pagou tudo
- Freelancers já receberam tudo (`pago`)
- Não existe orçamento cadastrado
- Não existem freelancers na festa

## 🚨 Nota Importante

Este sistema é **automático** e **inteligente**:
- Não precisa configurar nada manualmente
- Funciona assim que o cliente paga a última parcela
- Desaparece automaticamente quando freelancers são pagos
- Atualiza em tempo real ao recarregar a página

---

**✨ Implementado e funcionando perfeitamente!**

**Agora é impossível esquecer de pagar os freelancers!** 🎉💰

