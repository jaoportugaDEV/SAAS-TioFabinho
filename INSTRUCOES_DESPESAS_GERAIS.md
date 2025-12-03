# Instruções: Despesas Gerais e Relatórios PDF

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Despesas Gerais
- Adicionar despesas gerais do negócio (não vinculadas a festas)
- Listar despesas do mês
- Excluir despesas
- Cálculo automático no dashboard financeiro

### 2. Geração de Relatórios PDF
Três tipos de relatórios mensais:
- **Relatório de Despesas**: Lista todas despesas (freelancers + gerais) do mês
- **Relatório de Festas**: Lista festas realizadas com valores
- **Relatório de Freelancers**: Lista pagamentos de freelancers agrupados por nome

### 3. Melhorias no Financeiro
- Filtro de mês/ano para visualizar períodos diferentes
- Cards separados para despesas de freelancers e despesas gerais
- Botões grandes e intuitivos para download de PDFs
- Layout organizado e temático (cores da empresa)

---

## 📝 Passo a Passo para Ativar

### 1. Executar Migration no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `migration-despesas-gerais.sql`
6. Clique em **Run** para executar

### 2. Verificar se a Tabela foi Criada

No SQL Editor, execute:

```sql
SELECT * FROM despesas_gerais LIMIT 1;
```

Se não houver erro, a tabela foi criada com sucesso!

### 3. Testar no Sistema

1. Execute o projeto localmente:
   ```bash
   npm run dev
   ```

2. Acesse o dashboard e vá em **Financeiro**

3. Teste as funcionalidades:
   - [ ] Adicionar uma despesa geral clicando em "Nova Despesa"
   - [ ] Verificar se aparece na lista
   - [ ] Verificar se o valor é somado nas métricas
   - [ ] Excluir uma despesa
   - [ ] Trocar o mês no filtro e verificar que as despesas mudam
   - [ ] Gerar PDF de Despesas (deve baixar automaticamente)
   - [ ] Gerar PDF de Festas (deve baixar automaticamente)
   - [ ] Gerar PDF de Freelancers (deve baixar automaticamente)

---

## 🎨 Design e Usabilidade

### Cores Utilizadas
- **Vermelho Primário**: #FF0000 (cor da empresa)
- **Verde**: Para receitas e relatório de festas
- **Laranja/Vermelho**: Para despesas
- **Azul**: Para relatório de freelancers

### Layout
- Métricas no topo (4 cards)
- Seção de PDFs destacada (fundo vermelho claro)
- Lista de despesas gerais
- Resumo financeiro ao final
- Dica informativa

### Botões de PDF
- Grandes (altura de 96px)
- Ícone de download
- Texto descritivo
- Cores diferenciadas por tipo

---

## 📊 Dados dos PDFs

Todos os PDFs incluem:
- ✅ Cabeçalho com logo e nome da empresa (fundo vermelho)
- ✅ Título do relatório
- ✅ Período selecionado (mês e ano)
- ✅ Data de geração
- ✅ Dados organizados e formatados
- ✅ Totais calculados
- ✅ Rodapé com informações da empresa

---

## 🔍 Estrutura dos Arquivos Criados/Modificados

### Novos Arquivos
- `migration-despesas-gerais.sql` - Migration do banco de dados
- `app/actions/despesas.ts` - Actions para CRUD de despesas gerais
- `components/ui/dialog.tsx` - Componente de dialog modal
- `components/financeiro/adicionar-despesa-dialog.tsx` - Dialog para adicionar despesa
- `lib/pdf-generator.ts` - Funções de geração de PDFs
- `INSTRUCOES_DESPESAS_GERAIS.md` - Este arquivo

### Arquivos Modificados
- `types/index.ts` - Adicionada interface `DespesaGeral`
- `app/dashboard/financeiro/page.tsx` - Atualizado com todas funcionalidades

---

## ❓ Resolução de Problemas

### Erro ao adicionar despesa
- Verifique se a migration foi executada corretamente
- Verifique se as políticas RLS estão ativas
- Verifique se está autenticado no sistema

### PDF não está sendo gerado
- Verifique o console do navegador para erros
- Certifique-se de que há dados no mês selecionado
- A biblioteca jsPDF já está instalada no projeto

### Despesas não aparecem no financeiro
- Verifique se a despesa foi criada na data do mês selecionado
- Tente trocar o mês no filtro e voltar

---

## 🚀 Próximos Passos (Opcional)

Sugestões de melhorias futuras:
- Adicionar categorias customizadas para despesas gerais
- Permitir editar despesas (já tem a função criada)
- Adicionar gráficos de evolução mensal
- Exportar relatórios em Excel
- Adicionar notas/observações às despesas

---

## 📞 Suporte

Se tiver alguma dúvida ou problema:
1. Verifique este documento primeiro
2. Consulte os comentários no código
3. Verifique os logs do console do navegador
4. Entre em contato com o desenvolvedor

---

**Desenvolvido para Tio Fabinho Buffet** 🎉

