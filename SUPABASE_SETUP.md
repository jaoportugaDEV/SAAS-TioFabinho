# Configuração do Supabase

Este guia detalha o passo a passo para configurar o Supabase para o projeto.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Tio Fabinho Gestão Festas
   - **Database Password**: Escolha uma senha forte (salve-a!)
   - **Region**: South America (São Paulo)
   - **Pricing Plan**: Free (suficiente para começar)
5. Clique em "Create new project"
6. Aguarde alguns minutos até o projeto ser criado

## 2. Configurar Banco de Dados

1. No dashboard do seu projeto, vá em **SQL Editor** (menu lateral esquerdo)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Aguarde a confirmação de sucesso

## 3. Configurar Storage (Fotos)

1. No menu lateral, clique em **Storage**
2. Clique em "Create a new bucket"
3. Configure o bucket:
   - **Name**: `festa-fotos`
   - **Public bucket**: ✅ Marcado (para as fotos serem acessíveis)
4. Clique em "Create bucket"
5. Selecione o bucket `festa-fotos`
6. Clique em "Policies" (aba superior)
7. Crie uma política para **INSERT**:
   - **Policy name**: "Usuários autenticados podem fazer upload"
   - **Policy definition**: 
     ```sql
     (auth.role() = 'authenticated')
     ```
   - Target roles: `authenticated`
   - Clique em "Save"
8. O bucket já está configurado como público para leitura automaticamente

## 4. Criar Usuário Admin

1. No menu lateral, clique em **Authentication** > **Users**
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - **Email**: (email da dona do sistema)
   - **Password**: (senha forte para acesso)
   - **Auto Confirm User**: ✅ Marcado
4. Clique em "Create user"

## 5. Obter Credenciais

1. No menu lateral, clique em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL** (começa com `https://...supabase.co`)
   - **anon public** key (uma chave longa)

## 6. Configurar Variáveis de Ambiente

1. No projeto Next.js, crie um arquivo `.env.local` na raiz
2. Adicione as seguintes variáveis com os valores do passo anterior:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

3. Salve o arquivo
4. **IMPORTANTE**: Nunca commite o arquivo `.env.local` no Git

## 7. Testar Conexão

Execute o projeto:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e tente fazer login com o email e senha criados no passo 4.

## Pronto! ✅

Seu Supabase está configurado e pronto para uso!

## Custos e Limites (Plano Free)

- ✅ 500 MB de banco de dados
- ✅ 1 GB de storage para fotos
- ✅ 50.000 usuários autenticados por mês
- ✅ 2 GB de transferência de dados

**Quando crescer**: Plano Pro custa $25/mês e oferece muito mais recursos.

