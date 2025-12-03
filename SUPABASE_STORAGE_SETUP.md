# 📦 Configuração do Supabase Storage - Bucket de Fotos

Este guia te ajudará a configurar o bucket de storage no Supabase para armazenar fotos das festas.

## 🎯 Passo 1: Acessar o Storage no Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login e selecione seu projeto
3. No menu lateral esquerdo, clique em **"Storage"**

---

## 🎯 Passo 2: Criar o Bucket

### 2.1 Criar Novo Bucket

1. Clique no botão **"New bucket"** (canto superior direito)
2. Preencha os dados:

```
Name: festa-fotos
Public bucket: ✅ SIM (marque o checkbox)
```

3. Clique em **"Create bucket"**

⚠️ **IMPORTANTE:** O bucket **DEVE** ser público para as fotos serem acessíveis nas URLs.

### 2.2 Verificar Criação

Você deverá ver o bucket `festa-fotos` na lista de buckets com o ícone de **"Public"** ao lado.

---

## 🎯 Passo 3: Configurar Políticas de Acesso (RLS)

### 3.1 Acessar Políticas

1. Clique no bucket **"festa-fotos"**
2. Vá na aba **"Policies"** (ou "Políticas")
3. Clique em **"New Policy"**

### 3.2 Política: Permitir Upload (INSERT)

Crie uma política para permitir upload de fotos:

```sql
-- Nome da política
Allow authenticated users to upload

-- Operação
SELECT, INSERT

-- Target roles
authenticated

-- USING expression (deixe vazio ou use)
true

-- WITH CHECK expression (deixe vazio ou use)
true
```

Ou use a opção **"For full customization"** e cole:

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'festa-fotos');
```

### 3.3 Política: Permitir Leitura Pública (SELECT)

Crie uma política para permitir leitura pública:

```sql
-- Nome da política
Allow public read access

-- Operação
SELECT

-- Target roles
public, authenticated

-- USING expression
true
```

Ou use SQL:

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'festa-fotos');
```

### 3.4 Política: Permitir Delete (DELETE)

Crie uma política para permitir deletar fotos:

```sql
-- Nome da política
Allow authenticated users to delete

-- Operação
DELETE

-- Target roles
authenticated

-- USING expression
true
```

Ou use SQL:

```sql
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'festa-fotos');
```

---

## 🎯 Passo 4: Testar o Sistema

### 4.1 Iniciar o Servidor

```bash
npm run dev
```

### 4.2 Testar Upload

1. Acesse o sistema em http://localhost:3000
2. Vá para uma festa
3. Role até "Galeria de Fotos"
4. Clique em "Adicionar Fotos"
5. Selecione uma imagem
6. Aguarde o upload

### 4.3 Verificar no Supabase

1. Volte ao Dashboard do Supabase
2. Vá em **Storage > festa-fotos**
3. Você deverá ver uma pasta com o ID da festa
4. Dentro dela, a foto enviada

### 4.4 Testar Visualização

As fotos devem aparecer na galeria da festa automaticamente.

### 4.5 Testar Delete

1. Passe o mouse sobre uma foto
2. Clique no ícone de lixeira (X)
3. Confirme a exclusão
4. A foto deve desaparecer da galeria e do Storage

---

## 📊 Limites do Supabase Free

O Supabase Free oferece:

- ✅ **1 GB** de storage
- ✅ **2 GB** de bandwidth por mês
- ✅ **50 GB** de download total

### Quanto tempo dura?

**Estimativa para o Tio Fabinho:**
```
1 GB = 1.000 MB
Foto média: 500 KB = 0.5 MB

Capacidade: 1.000 MB ÷ 0.5 MB = 2.000 fotos

Com 30 fotos por festa:
2.000 ÷ 30 = ~66 festas

Duração: 66 festas ÷ 30 festas/ano = ~2 anos
```

### Quando Upgrade?

Considere o **Supabase Pro** (R$ 130-140/mês) quando:
- ❌ Atingir 800 MB de storage (80% do limite)
- ❌ Precisar de mais de 2 GB bandwidth/mês
- ✅ Quiser backups point-in-time
- ✅ Precisar de suporte prioritário

**Supabase Pro inclui:**
- ✅ 100 GB de storage
- ✅ 50 GB de bandwidth/mês
- ✅ Backups diários por 7 dias

---

## 🔍 Troubleshooting (Solução de Problemas)

### Problema: "Bucket not found" ou erro 404

**Solução:**
1. Verifique se o bucket se chama exatamente `festa-fotos` (com hífen)
2. Confirme que o bucket foi criado
3. Tente recriar o bucket

### Problema: "Permission denied" ao fazer upload

**Solução:**
1. Verifique se as políticas de RLS foram criadas
2. Confirme que o usuário está autenticado
3. Teste fazer logout e login novamente

### Problema: Fotos não aparecem (erro CORS)

**Solução:**
1. Verifique se o bucket é **público**
2. Confirme que a política de leitura pública existe
3. Limpe o cache do navegador (Ctrl + Shift + R)

### Problema: "File too large"

**Solução:**
- O limite atual é 10MB por foto
- Redimensione ou comprima a imagem antes do upload
- Pode alterar o limite em `components/festas/galeria-fotos.tsx`

---

## 🔐 Segurança

### Validações Implementadas

- ✅ **Tipo de arquivo:** Apenas imagens são aceitas
- ✅ **Tamanho:** Máximo 10MB por foto
- ✅ **Autenticação:** Apenas usuários logados podem fazer upload/delete
- ✅ **Nomenclatura:** Nomes de arquivo são gerados automaticamente

### Boas Práticas

1. **Não compartilhe** as chaves do Supabase publicamente
2. **Monitore** o uso de storage no dashboard
3. **Faça backups** periódicos (se necessário)
4. **Revise políticas** regularmente

---

## 📂 Estrutura de Pastas

As fotos são organizadas assim:

```
festa-fotos/
├── [id-da-festa-1]/
│   ├── abc123-1234567890.jpg
│   ├── def456-1234567891.png
│   └── ghi789-1234567892.jpg
├── [id-da-festa-2]/
│   └── ...
└── [id-da-festa-3]/
    └── ...
```

Cada festa tem sua própria pasta identificada pelo ID único.

---

## 🎨 Otimização de Imagens (Opcional)

Para economizar espaço, você pode:

### 1. Redimensionar no Frontend (antes do upload)

```typescript
// Adicionar função de resize em galeria-fotos.tsx
async function resizeImage(file: File): Promise<File> {
  // Usar canvas para redimensionar
  // Retornar arquivo menor
}
```

### 2. Usar Supabase Image Transformation

Supabase oferece transformação de imagens automática:

```typescript
// Ao buscar URL, adicione parâmetros
const { data } = supabase.storage
  .from('festa-fotos')
  .getPublicUrl(fileName, {
    transform: {
      width: 800,
      height: 600,
      resize: 'cover'
    }
  });
```

---

## ✅ Checklist Final

Antes de considerar o setup completo:

- [ ] Bucket `festa-fotos` criado
- [ ] Bucket configurado como **público**
- [ ] 3 políticas RLS criadas (SELECT, INSERT, DELETE)
- [ ] Upload de foto testado com sucesso
- [ ] Foto aparece na galeria
- [ ] Delete de foto funciona
- [ ] Foto aparece no Storage do Supabase

---

## 📝 SQL Completo (Alternativa Rápida)

Se preferir criar tudo via SQL, use este script no **SQL Editor** do Supabase:

```sql
-- Criar bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('festa-fotos', 'festa-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Leitura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public, authenticated
USING (bucket_id = 'festa-fotos');

-- Política: Upload autenticado
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'festa-fotos');

-- Política: Delete autenticado
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'festa-fotos');
```

---

## 🚀 Próximos Passos

Após configurar o storage:

1. ✅ Teste fazer upload de várias fotos
2. ✅ Verifique o tamanho usado no dashboard
3. ✅ Configure alertas de uso (se disponível)
4. ✅ Considere otimização de imagens (se necessário)

---

**🎉 Pronto! Seu Supabase Storage está configurado e pronto para uso!**

Para mais informações: https://supabase.com/docs/guides/storage

