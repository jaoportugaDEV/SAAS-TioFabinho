# Guia de Deploy - Vercel

Este guia mostra como fazer o deploy do sistema no Vercel.

## Pré-requisitos

1. ✅ Projeto Next.js pronto
2. ✅ Supabase configurado (siga `SUPABASE_SETUP.md`)
3. ✅ Conta no GitHub
4. ✅ Conta no Vercel (gratuita)

## Passo 1: Subir Código no GitHub

### 1.1 Criar Repositório no GitHub

1. Acesse [https://github.com/new](https://github.com/new)
2. Nome do repositório: `tio-fabinho-saas`
3. Deixe como **Private** (recomendado)
4. **NÃO** adicione README, .gitignore ou licença
5. Clique em "Create repository"

### 1.2 Enviar Código para o GitHub

No terminal, execute:

```bash
# Inicializar git (se ainda não inicializou)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Projeto inicial - SaaS Tio Fabinho Buffet"

# Adicionar repositório remoto (substitua SEU-USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU-USUARIO/tio-fabinho-saas.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

## Passo 2: Deploy no Vercel

### 2.1 Conectar Vercel ao GitHub

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em "Sign Up" ou "Login"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seus repositórios

### 2.2 Importar Projeto

1. No dashboard do Vercel, clique em "Add New..." > "Project"
2. Procure pelo repositório `tio-fabinho-saas`
3. Clique em "Import"

### 2.3 Configurar Projeto

Na página de configuração:

**Framework Preset**: Next.js (já detectado automaticamente)

**Root Directory**: `.` (raiz do projeto)

**Build Command**: `npm run build` (já pré-configurado)

**Output Directory**: `.next` (já pré-configurado)

### 2.4 Configurar Variáveis de Ambiente

**IMPORTANTE**: Clique em "Environment Variables" e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

➡️ **Onde encontrar essas chaves?**
- Acesse seu projeto no Supabase
- Vá em **Settings** > **API**
- Copie a **Project URL** e a **anon public** key

### 2.5 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos (o Vercel vai buildar e fazer deploy)
3. ✅ Deploy concluído!

## Passo 3: Acessar o Sistema

Após o deploy, você verá:

```
🎉 Congratulations!
Your project is live at: https://tio-fabinho-saas.vercel.app
```

**Acesse o link e faça login!**

## Domínio Personalizado (Opcional)

Se quiser usar um domínio próprio (ex: `sistema.tiofabinhobuffet.com.br`):

### 1. No Vercel

1. No dashboard do projeto, vá em **Settings** > **Domains**
2. Clique em "Add"
3. Digite seu domínio
4. Copie os registros DNS fornecidos

### 2. No seu Provedor de Domínio

1. Acesse o painel do seu provedor (Registro.br, GoDaddy, etc.)
2. Adicione os registros DNS que o Vercel forneceu
3. Aguarde propagação (pode levar até 48h, mas geralmente 10-30 min)

## Deploy Automático

✨ **Benefício**: Toda vez que você fizer `git push`, o Vercel automaticamente faz um novo deploy!

```bash
# Fazer alterações no código...

git add .
git commit -m "Descrição das alterações"
git push

# Vercel detecta e faz deploy automático! 🚀
```

## Monitoramento

### Ver Logs

1. Acesse o dashboard do Vercel
2. Clique no projeto
3. Vá na aba **"Deployments"**
4. Clique em qualquer deploy para ver os logs

### Ver Analytics

O Vercel Free Plan inclui:
- ✅ Analytics básico
- ✅ Web Vitals
- ✅ Logs de erros

## Solução de Problemas

### Build Falhou?

**Erro comum: TypeScript**
- Verifique se não há erros de tipo no código
- Execute `npm run build` localmente primeiro

**Erro comum: Variáveis de Ambiente**
- Confirme que adicionou as variáveis do Supabase
- Verifique se não há espaços extras

### Deploy Funcionou mas Login Não Funciona?

1. Verifique se as variáveis de ambiente estão corretas
2. Teste as credenciais do Supabase
3. Verifique o console do navegador (F12) para erros

### Imagens Não Carregam?

1. Verifique se o bucket do Supabase está público
2. Confirme as políticas de acesso no Supabase

## Custos

### Vercel Free Plan:
- ✅ **Gratuito** para sempre
- ✅ Deploy ilimitados
- ✅ 100GB de banda por mês
- ✅ SSL automático
- ✅ Deploy automático

### Quando Crescer (Vercel Pro - $20/mês):
- Mais banda
- Analytics avançado
- Suporte prioritário

## Próximos Passos

Após o deploy:

1. ✅ Faça login no sistema
2. ✅ Cadastre os freelancers
3. ✅ Comece a criar festas
4. ✅ Compartilhe o link com a dona do buffet

## Ajuda

Se tiver problemas:
1. Verifique os logs no Vercel
2. Consulte a documentação: [vercel.com/docs](https://vercel.com/docs)
3. Verifique o Supabase: [supabase.com/docs](https://supabase.com/docs)

---

**🎉 Parabéns! Seu sistema está no ar!**

