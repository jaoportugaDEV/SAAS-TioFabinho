# 🎉 SaaS Tio Fabinho Buffet - Gestão de Festas

<div align="center">

**Sistema completo de gestão de festas e eventos**

*Desenvolvido especialmente para Tio Fabinho Buffet - Presidente Prudente, SP*

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

</div>

---

## 📋 Sobre o Projeto

Sistema web completo para gerenciamento de festas infantis, controle de equipe freelancer, orçamentos, contratos e área financeira. Desenvolvido com foco em **simplicidade**, **mobile-first** e **eficiência**.

## ✨ Funcionalidades Principais

### 🎊 Gestão de Festas
- ✅ Wizard multi-step para criar festas rapidamente
- ✅ Informações completas: data, tema, local, cliente
- ✅ Status personalizáveis (Planejamento, Confirmada, Concluída, etc.)
- ✅ Busca e filtros avançados

### 👥 Gestão de Freelancers
- ✅ Cadastro completo com foto
- ✅ Funções: Monitores, Cozinheiras, Fotógrafos, Garçons, Recepção, Outros
- ✅ Gerenciamento de dias disponíveis por freelancer
- ✅ Controle de ativos/inativos
- ✅ Informações de contato (WhatsApp, PIX)

### 📅 Calendário Visual
- ✅ Visualização mensal de festas agendadas
- ✅ Indicadores de disponibilidade de freelancers
- ✅ Navegação entre meses
- ✅ Sidebar com equipe ativa

### 📸 Galeria de Fotos
- ✅ Upload ilimitado de fotos por festa
- ✅ Armazenamento seguro no Supabase Storage
- ✅ Preview e download
- ✅ Organização por festa

### 💰 Área Financeira
- ✅ Dashboard com métricas do mês
- ✅ Controle de receitas e despesas
- ✅ Cálculo automático de lucro
- ✅ Margem de lucro e ticket médio
- ✅ Histórico financeiro

### 📝 Orçamentos e Contratos
- ✅ Criação de orçamentos detalhados
- ✅ Cálculo automático de totais
- ✅ Descontos e acréscimos
- ✅ Preparado para export PDF (em desenvolvimento)

### ✅ Checklist por Festa
- ✅ Tarefas personalizáveis
- ✅ Templates sugeridos
- ✅ Controle de conclusão

### 💬 Integração WhatsApp
- ✅ Templates de mensagens prontos
- ✅ Envio direto pelo WhatsApp Web
- ✅ Mensagens: Disponibilidade, Lembrete, Pagamento, Agradecimento

## 🛠️ Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/)
  - PostgreSQL (Banco de dados)
  - Storage (Fotos)
  - Auth (Autenticação)
- **Deploy**: [Vercel](https://vercel.com/)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Conta no Vercel (gratuita) - para deploy

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/tio-fabinho-saas.git
cd tio-fabinho-saas
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Supabase

Siga o guia detalhado em: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

Resumo:
1. Criar projeto no Supabase
2. Executar o SQL em `supabase-schema.sql`
3. Configurar Storage bucket
4. Criar usuário admin

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy

Siga o guia completo: **[DEPLOY.md](./DEPLOY.md)**

**Resumo rápido:**
1. Fazer push no GitHub
2. Conectar repositório no Vercel
3. Adicionar variáveis de ambiente
4. Deploy automático! 🎉

## 📖 Documentação

- **[GUIA_DE_USO.md](./GUIA_DE_USO.md)** - Como usar o sistema
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Configurar banco de dados
- **[DEPLOY.md](./DEPLOY.md)** - Fazer deploy no Vercel

## 📂 Estrutura do Projeto

```
tio-fabinho-saas/
├── app/                          # Rotas Next.js (App Router)
│   ├── (auth)/                   # Grupo de autenticação
│   │   └── login/                # Página de login
│   ├── dashboard/                # Dashboard protegido
│   │   ├── festas/               # Gestão de festas
│   │   ├── freelancers/          # Gestão de freelancers
│   │   ├── calendario/           # Calendário visual
│   │   ├── financeiro/           # Área financeira
│   │   ├── contratos/            # Contratos
│   │   └── orcamentos/           # Orçamentos
│   ├── actions/                  # Server Actions
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Layout raiz
├── components/                   # Componentes React
│   ├── ui/                       # Componentes UI base (shadcn)
│   ├── dashboard/                # Componentes do dashboard
│   ├── festas/                   # Componentes de festas
│   ├── freelancers/              # Componentes de freelancers
│   ├── whatsapp/                 # Templates WhatsApp
│   └── shared/                   # Componentes compartilhados
├── lib/                          # Utilitários
│   ├── supabase/                 # Configuração Supabase
│   ├── utils.ts                  # Funções utilitárias
│   └── pdf/                      # Geração de PDFs
├── types/                        # Tipos TypeScript
│   └── index.ts                  # Tipos principais
├── hooks/                        # React Hooks customizados
├── middleware.ts                 # Middleware Next.js (auth)
├── supabase-schema.sql           # Schema do banco de dados
└── tailwind.config.ts            # Configuração Tailwind
```

## 🎨 Design System

### Cores

- **Primária**: Vermelho vibrante (`#FF0000`) - Cor da marca Tio Fabinho
- **Complementares**: Branco, cinza claro, preto
- **Estados**: Verde (sucesso), Amarelo (atenção), Vermelho (erro)

### Responsividade

- **Mobile First**: Desenvolvido pensando primeiro em dispositivos móveis
- **Breakpoints**: sm, md, lg, xl (Tailwind padrão)
- **Touch-friendly**: Botões e áreas clicáveis otimizadas para touch

## 🔐 Segurança

- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) no banco
- ✅ Variáveis de ambiente protegidas
- ✅ Middleware de proteção de rotas
- ✅ Validação de uploads

## 📊 Banco de Dados

### Tabelas Principais

- `freelancers` - Equipe freelancer
- `festas` - Festas e eventos
- `festa_freelancers` - Relação N-N
- `festa_fotos` - Fotos das festas
- `orcamentos` - Orçamentos
- `contratos` - Contratos
- `checklist` - Tarefas
- `pagamentos_freelancers` - Pagamentos
- `mensagens_whatsapp` - Histórico de mensagens

## 🎯 Roadmap Futuro

- [ ] Geração de PDFs para contratos e orçamentos
- [ ] Gráficos avançados no dashboard
- [ ] Notificações push
- [ ] App mobile nativo
- [ ] Portal do cliente (visualizar sua festa)
- [ ] Portal do freelancer (ver agenda)
- [ ] Sistema de avaliações
- [ ] Relatórios avançados
- [ ] Integração com calendário do Google

## 👨‍💻 Desenvolvido por

Este projeto foi desenvolvido como solução completa de gestão para:

**Tio Fabinho Buffet**
Presidente Prudente - SP

## 📄 Licença

Este é um projeto privado desenvolvido especificamente para Tio Fabinho Buffet.

---

<div align="center">

**🎉 Feito com ❤️ para facilitar a gestão de festas! 🎊**

</div>

