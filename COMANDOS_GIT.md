# 🚀 Comandos para Git Commit e Push

## Execute estes comandos no terminal do Windows (PowerShell ou CMD)

### 1️⃣ Abrir Terminal no Diretório do Projeto
```
- Abra a pasta do projeto no Explorador de Arquivos
- Na barra de endereço, digite: cmd
- Pressione Enter
```

### 2️⃣ Inicializar Git (se ainda não inicializou)
```bash
git init
```

### 3️⃣ Adicionar Todos os Arquivos
```bash
git add .
```

### 4️⃣ Fazer Commit
```bash
git commit -m "feat: adicionar sistema de correção de valores de pagamentos

- Criado migration para corrigir valores zerados dos freelancers
- Adicionado script definitivo que corrige cadastros e festas
- Criada documentação completa do problema e solução
- Adicionados guias rápidos e checklists de execução
- Corrigido problema de novas festas aparecerem com R$ 0,00

Arquivos principais:
- corrigir-valores-definitivo.sql: Script SQL definitivo
- verificar-valores-freelancers.sql: Script de verificação
- Múltiplos guias de documentação (.md)
- Sistema de valores automáticos por função"
```

### 5️⃣ Adicionar Repositório Remoto (se ainda não adicionou)
```bash
git remote add origin <URL-DO-SEU-REPOSITORIO>
```
Substitua `<URL-DO-SEU-REPOSITORIO>` pela URL do seu repositório no GitHub/GitLab/etc.

### 6️⃣ Push para o Repositório
```bash
git push -u origin master
```

Ou se sua branch principal é `main`:
```bash
git push -u origin main
```

---

## ✅ Atalho: Todos os Comandos de Uma Vez

Se já tem git inicializado e remote configurado:

```bash
git add .
git commit -m "feat: adicionar sistema de correção de valores de pagamentos - Scripts SQL e documentação completa"
git push
```

---

## 🔍 Verificar Status

Para ver quais arquivos serão commitados:
```bash
git status
```

Para ver o histórico de commits:
```bash
git log --oneline
```

---

## 📁 Arquivos que Serão Commitados

- `corrigir-valores-definitivo.sql` ✅
- `verificar-valores-freelancers.sql` ✅
- `migration-corrigir-valores-freelancers.sql` ✅
- `!!! COMECE AQUI !!!.md` ✅
- `!!! URGENTE - NOVAS FESTAS R$ 0,00 !!!.md` ✅
- `LEIA-ME_CORRECAO_VALORES.md` ✅
- `GUIA_RAPIDO_CORRECAO.md` ✅
- `CHECKLIST_EXECUCAO.md` ✅
- `CORRECAO_VALORES_PAGAMENTOS.md` ✅
- `SOLUCAO_NOVAS_FESTAS_ZERADAS.md` ✅
- `RESUMO_CORRECAO_PAGAMENTOS.txt` ✅
- `INDICE_CORRECAO_VALORES.md` ✅
- `.gitignore` ✅

---

## 🆘 Problemas Comuns

### "fatal: not a git repository"
Execute: `git init`

### "fatal: No configured push destination"
Configure o remote: `git remote add origin <URL>`

### "Updates were rejected"
Faça pull primeiro: `git pull origin master --allow-unrelated-histories`
Depois push: `git push origin master`

---

**💡 Dica:** Copie e cole os comandos um por um no terminal!

