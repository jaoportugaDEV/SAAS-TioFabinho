# Sistema de Valores Automáticos por Função

## 📋 Visão Geral

Sistema que preenche automaticamente o valor padrão de cada freelancer baseado na sua função, permitindo edição manual para bônus individuais.

---

## 💰 Valores por Função

### Valores Fixos Configurados:

- **Monitor**: R$ 50,00
- **Cozinheira**: R$ 80,00
- **Recepção**: R$ 50,00
- **Garçom**: R$ 60,00
- **Fotógrafo**: R$ 0,00 (editável manualmente)
- **Outros**: R$ 0,00 (editável manualmente)

---

## 🎯 Como Funciona

### 1. Ao Criar um Novo Freelancer

1. Selecione a função (ex: Monitor)
2. O campo "Valor Padrão por Festa" é preenchido automaticamente com R$ 50,00
3. Você pode editar esse valor se quiser dar um bônus específico
4. O valor editado fica salvo para aquele freelancer

**Exemplo:**
- Função: Monitor → Valor: R$ 50,00 (automático)
- Se quiser dar bônus: Edite para R$ 60,00 → Salva R$ 60,00

### 2. Ao Editar um Freelancer Existente

1. Se trocar a função (ex: de Monitor para Garçom)
2. O valor é atualizado automaticamente para o valor da nova função
3. Aparece uma mensagem informando o novo valor
4. Você pode editar novamente se quiser

**Exemplo:**
- João era Monitor (R$ 50,00)
- Trocar para Garçom → Valor atualizado para R$ 60,00 automaticamente
- Se quiser bônus: Edite para R$ 70,00 antes de salvar

### 3. Em Festas e Pagamentos

- Ao adicionar freelancer a uma festa, usa o `valor_padrao` dele
- O valor pode ser editado na página da festa (para ajustes pontuais)
- Na página de Pagamentos, mostra o valor acordado

---

## 🔧 Arquivos Modificados

### Novo Arquivo:
- `lib/constants.ts` - Constantes com valores por função

### Arquivos Atualizados:
- `app/dashboard/freelancers/novo/page.tsx` - Preenchimento automático ao criar
- `app/dashboard/freelancers/[id]/page.tsx` - Atualização automática ao editar função

---

## 💡 Casos de Uso

### Caso 1: Freelancer Padrão
```
Função: Monitor
Valor: R$ 50,00 (automático)
Uso: Em todas as festas receberá R$ 50,00
```

### Caso 2: Freelancer com Bônus Fixo
```
Função: Monitor
Valor: R$ 65,00 (editado manualmente)
Uso: Em todas as festas receberá R$ 65,00
Motivo: Freelancer mais experiente
```

### Caso 3: Ajuste por Festa
```
Função: Monitor
Valor Padrão: R$ 50,00
Festa Específica: R$ 70,00 (editado na festa)
Motivo: Festa maior, trabalho extra
```

### Caso 4: Fotógrafo ou Outros
```
Função: Fotógrafo
Valor: R$ 0,00 (padrão)
Defina manualmente: R$ 200,00
Motivo: Valor varia muito, precisa definir caso a caso
```

---

## 📊 Fluxo Completo

```
1. Criar Freelancer
   ↓
   Selecionar Função (ex: Garçom)
   ↓
   Sistema preenche R$ 60,00 automaticamente
   ↓
   (Opcional) Editar para R$ 70,00 (dar bônus)
   ↓
   Salvar

2. Adicionar a uma Festa
   ↓
   Sistema usa o valor_padrao do freelancer (R$ 70,00)
   ↓
   (Opcional) Editar valor apenas nesta festa
   ↓
   Festa acontece

3. Pagar Freelancer
   ↓
   Vai para "Pagamentos Pendentes"
   ↓
   Mostra valor acordado (R$ 70,00)
   ↓
   Copiar PIX e pagar
   ↓
   Marcar como pago
```

---

## 🎨 Feedback Visual

### Ao Criar:
- Texto explicativo mostra valor padrão da função
- Exemplo: "Valor padrão para monitor: R$ 50,00. Você pode editar para dar bônus."

### Ao Editar Função:
- Mensagem azul aparece quando troca função
- Exemplo: "💡 Valor atualizado automaticamente para R$ 60,00. Você pode editá-lo abaixo."

### Campo Sempre Editável:
- Você pode sempre mudar o valor manualmente
- O valor editado sobrescreve o automático

---

## ✅ Regras de Negócio

1. **Valores são sugestões**: Todos os valores podem ser editados manualmente
2. **Por função, não por freelancer**: O sistema sugere baseado na função
3. **Bônus permanente**: Se editar o valor do freelancer, ele mantém esse valor
4. **Bônus por festa**: Pode dar bônus específico em uma festa sem alterar o padrão
5. **Funções sem valor fixo**: Fotógrafo e Outros começam em R$ 0,00

---

## 🔄 Alteração de Valores Padrão

Para alterar os valores padrão do sistema, edite o arquivo:

`lib/constants.ts`

```typescript
export const VALORES_PADRAO_POR_FUNCAO: Record<FuncaoFreelancer, number> = {
  monitor: 50.00,      // ← Altere aqui
  cozinheira: 80.00,   // ← Altere aqui
  recepcao: 50.00,     // ← Altere aqui
  garcom: 60.00,       // ← Altere aqui
  fotografo: 0.00,
  outros: 0.00,
};
```

**Importante**: Isso não afeta freelancers já cadastrados, apenas novos cadastros.

---

## 💾 Estrutura do Banco

Os valores ficam salvos em:

```sql
-- Tabela freelancers
valor_padrao DECIMAL(10,2)  -- Valor que o freelancer receberá

-- Tabela festa_freelancers
valor_acordado DECIMAL(10,2)  -- Valor específico naquela festa
```

---

## 🎉 Benefícios

✅ **Agilidade**: Não precisa digitar valores repetitivos  
✅ **Padronização**: Valores consistentes por função  
✅ **Flexibilidade**: Sempre pode dar bônus individuais  
✅ **Transparência**: Sistema mostra valor padrão vs. customizado  
✅ **Controle**: Edita onde e quando quiser  

---

**Desenvolvido com ❤️ para Tio Fabinho Buffet**

