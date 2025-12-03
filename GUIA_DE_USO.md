# 🎉 Guia de Uso - SaaS Tio Fabinho Buffet

Sistema completo de gestão de festas para Tio Fabinho Buffet - Presidente Prudente, SP.

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Cadastrar Freelancers](#cadastrar-freelancers)
3. [Criar Festas](#criar-festas)
4. [Gerenciar Fotos](#gerenciar-fotos)
5. [Calendário](#calendário)
6. [Área Financeira](#área-financeira)
7. [WhatsApp](#whatsapp)

---

## 🚀 Primeiros Passos

### 1. Fazer Login

1. Acesse o sistema pelo link fornecido
2. Digite seu email e senha
3. Clique em "Entrar"

> **Email e senha**: Foram criados durante a configuração do Supabase (ver `SUPABASE_SETUP.md`)

### 2. Conhecer o Dashboard

Após o login, você verá:
- **Festas do Mês**: Quantas festas estão agendadas
- **Freelancers Ativos**: Quantos membros da equipe estão cadastrados
- **Faturamento**: Total de receitas do mês
- **Próximas Festas**: Lista das festas mais próximas

---

## 👥 Cadastrar Freelancers

### Adicionar Novo Freelancer

1. Clique em **"Freelancers"** no menu lateral
2. Clique no botão **"Novo Freelancer"**
3. Preencha:
   - **Foto**: Clique em "Escolher Foto" para adicionar uma imagem
   - **Nome Completo**: Digite o nome do freelancer
   - **Função**: Selecione (Monitor, Cozinheira, Fotógrafo, Garçom, Recepção, Outros)
   - **WhatsApp**: Digite o número com DDD
   - **Chave PIX**: Para pagamentos
   - **Ativo**: Marque se está ativo
4. Clique em **"Salvar Freelancer"**

### Gerenciar Dias Disponíveis

Ao editar um freelancer:
1. Role até a seção **"Dias Disponíveis"**
2. Selecione uma data no calendário
3. Clique em **"Adicionar"**
4. Para remover: clique em "Remover" ao lado da data

> **Dica**: Atualize as datas disponíveis regularmente, especialmente durante férias da faculdade!

### Ações Rápidas

Na lista de freelancers, você pode:
- 📱 **WhatsApp**: Abre conversa direta
- ✏️ **Editar**: Modifica informações
- 🗑️ **Excluir**: Remove o freelancer (cuidado!)

---

## 🎊 Criar Festas

### Wizard de Criação (5 Passos)

1. **Clique em "Festas" > "Nova Festa"**

#### Passo 1: Informações Básicas
- **Título**: Ex: "Aniversário de 5 anos do João"
- **Data**: Selecione no calendário
- **Tema**: Ex: "Super-Heróis"
- **Local**: Ex: "Salão de Festas ABC"
- **Status**: Planejamento, Confirmada, etc.

#### Passo 2: Cliente
- **Nome do Cliente**: Nome completo
- **Contato**: WhatsApp/telefone
- **Observações**: Alergias, preferências, etc.

#### Passo 3: Selecionar Equipe
- Veja todos os freelancers disponíveis
- ✅ **Verde**: Disponível na data escolhida
- ⚠️ **Indisponível**: Não disponível na data
- Clique para selecionar/desselecionar

#### Passo 4: Orçamento
- **Adicionar Itens**:
  - Descrição (ex: "Decoração", "Bolo")
  - Quantidade
  - Valor Unitário
  - Clique em ➕ para adicionar
- **Desconto/Acréscimo**: Digite valores se necessário
- **Total**: Calculado automaticamente

#### Passo 5: Checklist
- Digite uma tarefa ou clique em sugestões
- Ex: "Confirmar bolo", "Comprar decoração"
- Adicione quantas quiser

**Clique em "Criar Festa" para finalizar!**

### Ver Detalhes da Festa

Após criar, você pode:
- Ver todas as informações
- Adicionar fotos
- Gerar contratos
- Marcar checklist como concluído
- Registrar pagamentos

---

## 📸 Gerenciar Fotos

### Upload de Fotos

1. Abra uma festa
2. Na galeria, clique em **"Adicionar Fotos"**
3. Selecione múltiplas fotos (até 10MB cada)
4. Aguarde o upload
5. ✅ Pronto! Fotos salvas

### Organizar Fotos

- **Ver**: Passe o mouse sobre a foto
- **Baixar**: Clique no ícone de download
- **Excluir**: Clique no X vermelho

> **Uso**: Envie as fotos para os clientes após a festa!

---

## 📅 Calendário

### Visualizar Festas

1. Clique em **"Calendário"** no menu
2. Veja as festas no mês
3. Use o seletor de mês para navegar

### Código de Cores

- 🟦 **Azul**: Dia com festa
- 🔴 **Vermelho**: Dia atual
- ⚪ **Branco**: Sem festas

### Sidebar

Mostra todos os freelancers ativos no momento.

---

## 💰 Área Financeira

### Dashboard Financeiro

Veja:
- **Receitas do Mês**: Total de orçamentos
- **Despesas do Mês**: Pagamentos de freelancers
- **Lucro**: Receitas - Despesas
- **Margem**: Porcentagem de lucro

### Como Funciona

Os valores são calculados automaticamente com base em:
- Orçamentos criados nas festas
- Pagamentos registrados para freelancers

> **Dica**: Mantenha tudo atualizado para relatórios precisos!

---

## 💬 WhatsApp

### Enviar Mensagens

1. Na lista de freelancers, clique em "WhatsApp"
2. **OU** ao editar um freelancer, use os templates

### Templates Disponíveis

1. **Confirmar Disponibilidade**
   - Para perguntar se pode trabalhar em uma data

2. **Lembrete de Festa**
   - Lembrar sobre festa no dia seguinte

3. **Pagamento Efetuado**
   - Confirmar que o PIX foi enviado

4. **Agradecimento**
   - Agradecer pelo trabalho

### Como Usar

1. Selecione um template (ou escreva sua própria mensagem)
2. Edite se necessário
3. Clique em **"Enviar pelo WhatsApp"**
4. O WhatsApp Web abrirá com a mensagem pronta
5. Clique em enviar no WhatsApp

---

## 🎯 Dicas de Uso

### ✅ Boas Práticas

1. **Cadastre freelancers primeiro** - Assim você pode adicioná-los às festas
2. **Atualize disponibilidade** - Sempre pergunte e atualize os dias disponíveis
3. **Fotos após a festa** - Adicione fotos para recordação e para mostrar aos clientes
4. **Use o checklist** - Não esqueça nenhuma tarefa importante
5. **Registre pagamentos** - Para ter controle financeiro preciso

### ⚠️ Cuidados

- **Não exclua festas antigas** - São seu histórico
- **Faça backup das fotos** - Baixe periodicamente
- **Confirme freelancers** - Use o WhatsApp para confirmar presença

### 📱 Acesso Mobile

O sistema é **100% responsivo**:
- Use no celular
- Use no tablet
- Use no computador

Tudo funciona perfeitamente em qualquer dispositivo!

---

## 🆘 Problemas Comuns

### Não Consigo Fazer Login

- Verifique email e senha
- Certifique-se que está usando o usuário criado no Supabase

### Upload de Foto Não Funciona

- Verifique o tamanho (máx 5-10MB)
- Use formatos: JPG, PNG, WebP

### Freelancer Não Aparece Como Disponível

- Verifique se adicionou a data na seção "Dias Disponíveis"
- Certifique-se que está ativo

### Valores Financeiros Errados

- Confirme que todos os orçamentos foram criados
- Verifique se registrou os pagamentos

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Revise este guia
2. Consulte `SUPABASE_SETUP.md` para questões de banco de dados
3. Consulte `DEPLOY.md` para questões de deploy

---

## 🎉 Aproveite!

Seu sistema está pronto para usar! Comece cadastrando seus freelancers e criando suas primeiras festas.

**Boa gestão! 🎊**

---

*Sistema desenvolvido especialmente para Tio Fabinho Buffet - Presidente Prudente, SP*

