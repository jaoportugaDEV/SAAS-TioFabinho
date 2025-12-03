# Instruções para Adicionar as Novas Funções

Foram adicionadas as funções **Garçom** e **Recepção** ao sistema. Para ativar completamente no banco de dados, siga os passos abaixo:

## 1. Execute a Migration no Supabase

Acesse o **SQL Editor** no dashboard do Supabase e execute o arquivo `migration-adicionar-funcoes.sql`:

```sql
-- Adicionar novas funções ao ENUM funcao_freelancer
ALTER TYPE funcao_freelancer ADD VALUE 'garcom';
ALTER TYPE funcao_freelancer ADD VALUE 'recepcao';
```

## 2. Arquivos Atualizados

Os seguintes arquivos foram atualizados para suportar as novas funções:

### Tipos TypeScript
- ✅ `types/index.ts` - Tipo `FuncaoFreelancer` atualizado

### Componentes de Freelancers
- ✅ `app/dashboard/freelancers/novo/page.tsx` - Formulário de novo freelancer
- ✅ `app/dashboard/freelancers/[id]/page.tsx` - Formulário de edição
- ✅ `app/dashboard/freelancers/page.tsx` - Listagem de freelancers
- ✅ `components/festas/step-freelancers.tsx` - Seleção de freelancers ao criar festa
- ✅ `components/festas/freelancer-manager.tsx` - Gerenciamento de equipe da festa
- ✅ `app/dashboard/calendario/page.tsx` - Visualização no calendário

### Schema do Banco de Dados
- ✅ `supabase-schema.sql` - ENUM atualizado (para novos deployments)
- ✅ `migration-adicionar-funcoes.sql` - Migration criada

## 3. Cores das Badges

As novas funções receberam as seguintes cores no sistema:

- **Garçom**: Laranja (`bg-orange-100 text-orange-800`)
- **Recepção**: Rosa (`bg-pink-100 text-pink-800`)

## 4. Verificação

Após executar a migration, você poderá:

1. Criar novos freelancers com as funções **Garçom** ou **Recepção**
2. Editar freelancers existentes para alterar para as novas funções
3. Filtrar e visualizar freelancers com essas funções em todas as telas do sistema

## 5. Funcionalidades Afetadas

Todas as funcionalidades que envolvem freelancers agora suportam as novas funções:

- ✅ Cadastro e edição de freelancers
- ✅ Seleção de equipe ao criar festas
- ✅ Gerenciamento de equipe nas festas
- ✅ Visualização no calendário
- ✅ Badges coloridas para identificação
- ✅ Filtros e buscas

## 6. Observações

- As funções seguem a ordem: Monitor, Cozinheira, Fotógrafo, Garçom, Recepção, Outros
- Os labels estão em português brasileiro
- O sistema é retrocompatível - freelancers existentes continuam funcionando normalmente

