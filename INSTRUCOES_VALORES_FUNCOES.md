# 🎉 Sistema de Valores por Função

## ✅ Alterações Implementadas

### 1. **Tabela no Banco de Dados**

Foi criada a tabela `valores_funcoes` no banco de dados para armazenar os valores fixos de cada função de freelancer.

**Execute este script no SQL Editor do Supabase:**

```sql
-- Ver arquivo: migration-valores-funcoes.sql
```

### 2. **Página de Configurações**

Foi criada uma nova página em `/dashboard/configuracoes` onde a dona do buffet pode:

- ✅ Ver todos os valores por função
- ✅ Editar os valores de cada função
- ✅ Salvar as alterações
- ✅ Ver quando foi a última atualização de cada valor

**Funcionalidades:**
- Interface intuitiva com cards coloridos por função
- Validação de valores (apenas números positivos)
- Feedback visual ao salvar
- Mensagens informativas sobre como funciona o sistema

### 3. **Remoção da Edição Manual de Valores**

Foi removida a funcionalidade de editar valores individuais dos freelancers nas festas:

- ❌ Removido o botão "Editar" do valor acordado
- ✅ Agora o valor é apenas exibido (não editável)
- ✅ Mostra uma mensagem indicando que é o "valor fixo da função"

### 4. **Sistema Automático de Valores**

Quando um freelancer é adicionado a uma festa:

1. O sistema busca a **função** do freelancer (monitor, cozinheira, fotógrafo, etc.)
2. Consulta a tabela `valores_funcoes` para obter o **valor configurado** para essa função
3. Define automaticamente o `valor_acordado` com base na função
4. Não é mais necessário editar valores manualmente

### 5. **Link no Menu Lateral**

Foi adicionado um novo item no menu de navegação:

- 📌 Nome: "Configurações"
- 🔧 Ícone: Settings (engrenagem)
- 📍 Localização: No final do menu, após "Orçamentos"

---

## 📋 Como Usar

### Para a Dona do Buffet:

#### 1️⃣ **Configurar Valores Padrão**

1. Acesse o menu lateral e clique em **"Configurações"**
2. Veja a lista de funções com seus valores atuais
3. Altere os valores conforme necessário
4. Clique em **"Salvar Alterações"**

#### 2️⃣ **Adicionar Freelancer a uma Festa**

1. Entre em uma festa
2. Clique em **"Adicionar"** na seção "Equipe da Festa"
3. Selecione um freelancer
4. O valor será definido **automaticamente** com base na função dele
5. Pronto! Não precisa editar o valor manualmente

#### 3️⃣ **Ver Valores na Página de Pagamentos**

Quando for pagar os freelancers:
- Os valores mostrados são os que foram definidos automaticamente quando o freelancer foi adicionado
- Ao marcar como "pago", esse valor será registrado nas despesas do mês

---

## 🔄 Fluxo Completo

```
1. Dona configura valores por função em "Configurações"
   ↓
2. Adiciona freelancer a uma festa
   ↓
3. Sistema busca a função do freelancer
   ↓
4. Define o valor_acordado automaticamente
   ↓
5. Após a festa, marca pagamento como realizado
   ↓
6. Valor entra automaticamente nas "Despesas do Mês" no Financeiro
```

---

## 📊 Valores Padrão Iniciais

Os seguintes valores foram configurados por padrão:

| Função       | Valor Padrão |
|-------------|--------------|
| Monitor     | R$ 50,00     |
| Cozinheira  | R$ 80,00     |
| Recepção    | R$ 50,00     |
| Garçom      | R$ 60,00     |
| Fotógrafo   | R$ 0,00      |
| Outros      | R$ 0,00      |

> ⚠️ **Nota:** Você pode alterar esses valores a qualquer momento em "Configurações"

---

## ⚠️ Observações Importantes

### ✅ **O que as alterações afetam:**
- ✅ Novos freelancers adicionados a festas
- ✅ Festas criadas após a alteração dos valores

### ❌ **O que NÃO é afetado:**
- ❌ Freelancers já adicionados a festas existentes
- ❌ Pagamentos já registrados
- ❌ Valores acordados de festas antigas

### 💡 **Dicas:**
- Se precisar de um valor especial para alguma situação, configure temporariamente o valor da função, adicione o freelancer, e depois volte ao valor normal
- Valores zerados (R$ 0,00) podem indicar freelancers que trabalham por outras formas de pagamento ou acordos especiais

---

## 🛠️ Arquivos Modificados

1. **Banco de Dados:**
   - `migration-valores-funcoes.sql` - Nova tabela

2. **Páginas:**
   - `app/dashboard/configuracoes/page.tsx` - Nova página de configurações

3. **Componentes:**
   - `components/festas/freelancer-manager.tsx` - Removida edição manual
   - `components/dashboard/sidebar.tsx` - Adicionado link de configurações

4. **Actions:**
   - `app/actions/festas.ts` - Atualizado para buscar valores da tabela

---

## ✨ Benefícios

1. **Centralização:** Todos os valores configurados em um único lugar
2. **Consistência:** Mesmos valores para todos os freelancers da mesma função
3. **Simplicidade:** Não precisa lembrar quanto pagar cada função
4. **Flexibilidade:** Pode alterar valores a qualquer momento
5. **Automação:** Valores definidos automaticamente ao adicionar freelancers
6. **Rastreabilidade:** Histórico de quando cada valor foi atualizado

---

## 🎯 Próximos Passos

1. Execute o script SQL para criar a tabela no banco
2. Acesse "Configurações" e ajuste os valores conforme necessário
3. Adicione freelancers às festas e veja os valores sendo definidos automaticamente
4. Gerencie pagamentos normalmente - tudo continuará funcionando!

---

**Desenvolvido com ❤️ para o Tio Fabinho Buffet**

