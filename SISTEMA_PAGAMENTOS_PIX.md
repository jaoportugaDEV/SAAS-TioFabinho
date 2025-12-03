# Sistema de Pagamentos PIX para Freelancers

## 📋 Visão Geral

Sistema completo para gerenciar pagamentos de freelancers via PIX, com valores padrão configuráveis, gestão automática de pagamentos pendentes e controle visual de status.

---

## 🚀 Funcionalidades Implementadas

### 1. **Configuração de Valor Padrão por Freelancer**

- Cada freelancer possui um campo `valor_padrao` configurável
- Definido ao cadastrar ou editar um freelancer
- Este valor é usado automaticamente ao adicionar o freelancer a uma festa

**Como usar:**
1. Acesse **Freelancers** no menu
2. Ao criar/editar um freelancer, defina o "Valor Padrão por Festa"
3. Este valor será aplicado automaticamente em todas as festas

---

### 2. **Atribuição Automática de Valores**

- Ao adicionar um freelancer a uma festa, o sistema automaticamente:
  - Busca o `valor_padrao` do freelancer
  - Preenche o campo `valor_acordado` na relação festa-freelancer
  - Permite edição manual caso necessário

**Como editar o valor:**
1. Na página de detalhes da festa
2. Na seção "Equipe da Festa"
3. Clique em "Editar" ao lado do valor exibido
4. Altere o valor e clique em "Salvar"

---

### 3. **Página de Pagamentos Pendentes**

Nova página dedicada exclusivamente para gerenciar pagamentos de freelancers.

**Como funciona:**
- Festas aparecem automaticamente após a data/horário programado
- Lista todos os freelancers com seus valores e chaves PIX
- Interface simples para copiar PIX e confirmar pagamentos

**Como usar:**
1. Acesse **Pagamentos** no menu lateral
2. Visualize as festas com pagamentos pendentes
3. Para cada freelancer:
   - Clique em **"Copiar"** para copiar a chave PIX
   - Realize o pagamento no app do seu banco
   - Marque a caixinha ✓ para confirmar o pagamento
4. Quando todos forem pagos, a festa sai da lista automaticamente

---

### 4. **Indicadores Visuais**

#### Na Listagem de Festas:
- Badge de status de pagamento ao lado do status da festa
- **Vermelho**: Pagamento Pendente (nenhum freelancer pago)
- **Amarelo**: Pagamento Parcial (alguns pagos)
- **Verde**: Pagamento Completo (todos pagos)

#### Na Página de Detalhes da Festa:
- Seção dedicada "Pagamentos de Freelancers"
- Mostra status individual de cada freelancer
- Exibe total de pagamentos
- Link direto para "Pagamentos Pendentes" se houver pendências

---

## 🗄️ Estrutura do Banco de Dados

### Alterações Implementadas:

#### Tabela `freelancers`:
```sql
valor_padrao DECIMAL(10,2) DEFAULT 0
```

#### Tabela `festas`:
```sql
horario VARCHAR(10)
status_pagamento_freelancers ENUM('pendente', 'parcial', 'pago') DEFAULT 'pendente'
```

#### Tabela `festa_freelancers`:
```sql
valor_acordado DECIMAL(10,2) DEFAULT 0
status_pagamento VARCHAR(20) DEFAULT 'pendente'
```

#### Tabela `pagamentos_freelancers`:
```sql
pago BOOLEAN DEFAULT false
data_pagamento DATE NULL (agora é nullable)
```

---

## 🔧 Instalação e Configuração

### Passo 1: Executar Migration

Execute o arquivo `migration-pagamentos-pix.sql` no SQL Editor do Supabase:

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `migration-pagamentos-pix.sql`
4. Execute o script

### Passo 2: Atualizar Dados Existentes (Opcional)

Se você já tem freelancers cadastrados, defina valores padrão para eles:

```sql
-- Exemplo: definir valor padrão de R$ 150 para todos os monitores
UPDATE freelancers 
SET valor_padrao = 150.00 
WHERE funcao = 'monitor';

-- Defina valores para outras funções conforme necessário
UPDATE freelancers SET valor_padrao = 200.00 WHERE funcao = 'fotografo';
UPDATE freelancers SET valor_padrao = 120.00 WHERE funcao = 'garcom';
-- etc...
```

### Passo 3: Verificar Funcionamento

1. Acesse o sistema
2. Crie ou edite um freelancer e defina um valor padrão
3. Adicione este freelancer a uma festa
4. Verifique se o valor foi preenchido automaticamente
5. Após a data da festa, vá em **Pagamentos** para ver a festa listada

---

## 📊 Fluxo de Trabalho

### Fluxo Completo do Sistema:

```
1. Cadastrar Freelancer
   ↓
   Definir Valor Padrão (ex: R$ 150)
   ↓
2. Criar Festa
   ↓
   Adicionar Freelancers à Festa
   ↓
   Sistema preenche automaticamente os valores
   ↓
   (Opcional) Editar valor específico se necessário
   ↓
3. Festa Acontece
   ↓
   Sistema detecta automaticamente que a data passou
   ↓
4. Ir para "Pagamentos Pendentes"
   ↓
   Copiar PIX de cada freelancer
   ↓
   Realizar pagamento no banco
   ↓
   Marcar como pago no sistema
   ↓
5. Status Atualizado Automaticamente
   ↓
   Quando todos pagos: Festa sai da lista
```

---

## 🎯 Regras de Negócio

### Detecção Automática de Pagamentos Pendentes:

Uma festa aparece em "Pagamentos Pendentes" quando:
- A data da festa já passou
- Possui freelancers vinculados
- Status de pagamento é "pendente" ou "parcial"

Se a festa tem horário definido:
- Verifica data + horário completo
- Exemplo: Festa dia 15/12 às 14h só aparece após 15/12 14:00

### Cálculo de Status de Pagamento:

- **Pendente**: Nenhum freelancer foi pago
- **Parcial**: Pelo menos um freelancer pago, mas não todos
- **Pago**: Todos os freelancers foram pagos

### Atualização Automática:

O sistema recalcula automaticamente o status geral da festa sempre que:
- Um pagamento individual é marcado/desmarcado
- Um freelancer é adicionado/removido da festa

---

## 💡 Dicas de Uso

### Para Otimizar o Processo:

1. **Configure valores padrão realistas** para cada função
2. **Use o horário das festas** para controle mais preciso
3. **Marque pagamentos imediatamente** após realizá-los
4. **Revise regularmente** a página de pagamentos pendentes
5. **Ajuste valores individuais** quando necessário (ex: hora extra)

### Boas Práticas:

- ✅ Sempre defina um valor padrão ao cadastrar freelancers
- ✅ Confirme o valor antes de adicionar à festa
- ✅ Marque como pago apenas após transferência confirmada
- ✅ Use a função copiar PIX para evitar erros
- ✅ Mantenha as chaves PIX atualizadas no cadastro

---

## 🐛 Solução de Problemas

### Festa não aparece em Pagamentos Pendentes?

**Possíveis causas:**
- A data/horário da festa ainda não passou
- Festa não tem freelancers vinculados
- Status de pagamento já está como "pago"
- Verifique se o horário está configurado corretamente

### Valor não é preenchido automaticamente?

**Solução:**
- Verifique se o freelancer tem `valor_padrao` configurado
- Se migrou de versão antiga, execute UPDATE para definir valores
- Recarregue a página após adicionar o freelancer

### Status não atualiza?

**Solução:**
- Recarregue a página
- Verifique console do navegador para erros
- Confirme que a migration foi executada corretamente

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `migration-pagamentos-pix.sql` - Migration do banco de dados
- `app/actions/pagamentos.ts` - Server actions para pagamentos
- `app/dashboard/pagamentos/page.tsx` - Página de pagamentos pendentes

### Arquivos Modificados:
- `types/index.ts` - Tipos TypeScript atualizados
- `app/actions/festas.ts` - Atualizada função de adicionar freelancer
- `components/festas/freelancer-manager.tsx` - Adicionada edição de valores
- `components/dashboard/sidebar.tsx` - Adicionado link "Pagamentos"
- `app/dashboard/festas/page.tsx` - Adicionado badge de status de pagamento
- `app/dashboard/festas/[id]/page.tsx` - Adicionada seção de pagamentos
- `app/dashboard/freelancers/novo/page.tsx` - Campo valor padrão
- `app/dashboard/freelancers/[id]/page.tsx` - Campo valor padrão

---

## 🎉 Conclusão

O sistema está completo e pronto para uso! Agora você pode:

✅ Configurar valores padrão por freelancer  
✅ Gerenciar valores de forma automática e manual  
✅ Visualizar pagamentos pendentes automaticamente  
✅ Copiar chaves PIX facilmente  
✅ Confirmar pagamentos com um clique  
✅ Acompanhar status visual em todo o sistema  

**Próximos passos sugeridos:**
1. Execute a migration no Supabase
2. Configure valores padrão para freelancers existentes
3. Teste o fluxo completo com uma festa
4. Ajuste valores conforme necessário para seu negócio

---

**Desenvolvido com ❤️ para Tio Fabinho Buffet**

