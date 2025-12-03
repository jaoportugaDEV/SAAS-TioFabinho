# 📸 Configuração do Cloudinary - Guia Completo

Este guia te ajudará a configurar o Cloudinary para armazenar fotos das festas gratuitamente (25GB).

## 🎯 Passo 1: Obter Credenciais do Cloudinary

### 1.1 Acessar o Dashboard

Acesse: https://console.cloudinary.com/

Faça login com sua conta recém-criada.

### 1.2 Pegar as Credenciais

Na página inicial do Dashboard, você verá um card **"Product Environment Credentials"** com:

- **Cloud name:** `dxxxxx` (exemplo)
- **API Key:** `123456789012345` (exemplo)
- **API Secret:** `aBcDeFgHiJkLmNoPqRsTuVwXyZ` (exemplo)

⚠️ **Anote o Cloud Name** - você vai precisar!

---

## 🎯 Passo 2: Criar Upload Preset (Unsigned)

### 2.1 Acessar Settings

1. Clique no ícone de **engrenagem** (⚙️) no canto superior direito
2. Ou acesse: https://console.cloudinary.com/settings

### 2.2 Ir para Upload

1. No menu lateral, clique em **"Upload"**
2. Role até a seção **"Upload presets"**

### 2.3 Criar Novo Preset

1. Clique em **"Add upload preset"**
2. Configure assim:

```
Upload preset name: festa_fotos_preset
Signing Mode: Unsigned ⚠️ (IMPORTANTE!)
Folder: tio-fabinho/festas
```

3. **Outras configurações (opcional mas recomendado):**

```
Access mode: Public
Unique filename: true (ativado)
Overwrite: false
```

4. Clique em **"Save"**

### 2.4 Confirmar Preset

Volte à lista de presets e confirme que `festa_fotos_preset` está lá com **Signing Mode: Unsigned**.

---

## 🎯 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Abrir arquivo .env.local

Na raiz do projeto, abra ou crie o arquivo `.env.local`

### 3.2 Adicionar Variáveis

Adicione estas linhas **substituindo pelos seus valores**:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=festa_fotos_preset
```

**Exemplo real:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=festa_fotos_preset
```

### 3.3 Salvar e Reiniciar

1. Salve o arquivo `.env.local`
2. Pare o servidor Next.js (Ctrl + C)
3. Inicie novamente: `npm run dev`

---

## ✅ Passo 4: Testar a Integração

### 4.1 Iniciar o Sistema

```bash
npm run dev
```

### 4.2 Testar Upload

1. Acesse uma festa no sistema
2. Role até a seção **"Galeria de Fotos"**
3. Clique em **"Adicionar Fotos"**
4. Selecione uma ou várias imagens
5. Aguarde o upload

### 4.3 Verificar no Cloudinary

1. Volte ao Dashboard do Cloudinary
2. Clique em **"Media Library"** no menu lateral
3. Você deverá ver uma pasta `tio-fabinho/festas/[id-da-festa]`
4. As fotos estarão lá!

### 4.4 Testar Exibição

As fotos devem aparecer na galeria da festa automaticamente.

---

## 🔍 Troubleshooting (Solução de Problemas)

### Problema: "Cloudinary não está configurado corretamente"

**Solução:**
1. Verifique se o arquivo `.env.local` está na raiz do projeto
2. Confirme que as variáveis começam com `NEXT_PUBLIC_`
3. Reinicie o servidor (`npm run dev`)

### Problema: "Upload failed" ou erro 400

**Solução:**
1. Confirme que o preset é **Unsigned**
2. Verifique se o nome do preset está correto: `festa_fotos_preset`
3. Tente criar um novo preset

### Problema: Fotos não aparecem

**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros
3. Confirme que as URLs das fotos começam com `https://res.cloudinary.com/`

### Problema: "Image too large"

**Solução:**
- O limite atual é 10MB por foto
- Redimensione ou comprima a imagem antes do upload

---

## 📊 Limites do Plano Free

O Cloudinary Free oferece:

- ✅ **25 GB** de storage
- ✅ **25 GB** de bandwidth por mês
- ✅ **25.000** transformações por mês
- ✅ **500** vídeos (até 10MB cada)

### Quanto tempo dura?

**Estimativa para o Tio Fabinho:**
```
30 festas/ano × 30 fotos × 500KB = 450 MB/ano

25 GB ÷ 450 MB = ~55 ANOS! 🎉
```

Ou seja: **você nunca vai precisar pagar!**

---

## 🎨 Funcionalidades Extras (Automáticas)

O Cloudinary faz automaticamente:

- ✅ **Otimização** de imagens (menor tamanho, mesma qualidade)
- ✅ **CDN Global** (carregamento rápido em qualquer lugar)
- ✅ **Formatos modernos** (WebP quando suportado)
- ✅ **Responsive images** (tamanho certo para cada dispositivo)
- ✅ **Backup** automático

---

## 🔐 Segurança

### Dados Sensíveis

- ⚠️ **NUNCA** commite o arquivo `.env.local` no Git
- ⚠️ **NUNCA** compartilhe seu API Secret
- ✅ O Cloud Name é público (pode compartilhar)
- ✅ O Upload Preset unsigned é seguro para uso público

### .gitignore

Confirme que seu `.gitignore` contém:

```
.env.local
.env*.local
```

---

## 📚 Recursos Adicionais

- **Dashboard:** https://console.cloudinary.com/
- **Documentação:** https://cloudinary.com/documentation
- **Media Library:** https://console.cloudinary.com/media_library
- **Upload Presets:** https://console.cloudinary.com/settings/upload

---

## ✨ Resumo Rápido

1. ✅ Pegue o **Cloud Name** no Dashboard
2. ✅ Crie um **Upload Preset** (unsigned) chamado `festa_fotos_preset`
3. ✅ Adicione as variáveis no `.env.local`
4. ✅ Reinicie o servidor
5. ✅ Teste fazendo upload de uma foto

**Pronto! Seu sistema agora usa o Cloudinary! 🚀**

---

## 💡 Dica Pro

Se futuramente você quiser deletar fotos do Cloudinary também (não só do banco), você pode:

1. Criar uma API route no Next.js
2. Usar o API Secret para autenticar
3. Chamar a API de delete do Cloudinary

Mas isso é **totalmente opcional** - com 25GB você tem espaço de sobra!

---

**🎉 Parabéns! Sua integração com Cloudinary está completa!**

