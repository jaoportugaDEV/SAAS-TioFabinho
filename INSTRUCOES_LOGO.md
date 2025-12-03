# 🎨 Instruções para Adicionar a Logo

## Passo 1: Salvar a Logo

1. **Salve a imagem da logo** (a imagem vermelha do Tio Fabinho) que você compartilhou
2. **Renomeie o arquivo** para `logo.png`
3. **Mova o arquivo** para a pasta: `public/logo.png`

## Passo 2: O que foi implementado

A logo agora aparece em **3 lugares diferentes**:

### 1. 🔐 Página de Login
- Logo grande e centralizada (128x128 pixels)
- Fica acima do título "Tio Fabinho Buffet"
- Dá destaque visual à entrada do sistema

### 2. 📍 Canto Superior Esquerdo (Header)
- Logo pequena (40x40 pixels) sempre visível
- Ao lado do nome "Tio Fabinho Buffet"
- Funciona como marca da aplicação

### 3. 🎯 Centro do Topo (Desktop)
- Logo média (64x64 pixels) centralizada
- Visível apenas em telas grandes (desktop)
- Dá aquele "ar de coisa única" e profissional
- Fica acima da barra de navegação principal

## Comportamento Responsivo

- **Mobile**: Apenas logo no canto esquerdo (compacto)
- **Tablet**: Logo no canto + nome da empresa
- **Desktop**: Logo no canto + Logo centralizada no topo (visual premium)

## Formato da Imagem

- **Formato recomendado**: PNG com fundo transparente
- **Nome do arquivo**: `logo.png`
- **Localização**: `public/logo.png`

## Testando

Após salvar a logo na pasta `public`:

1. Reinicie o servidor de desenvolvimento (se estiver rodando)
2. Acesse a página de login
3. Entre no dashboard
4. Redimensione a janela para ver o comportamento responsivo

## Arquivos Modificados

✅ `components/shared/logo.tsx` - Componente atualizado para usar a imagem
✅ `app/(auth)/login/page.tsx` - Logo na tela de login
✅ `components/dashboard/header.tsx` - Logo no header (esquerda + centro)

## Próximos Passos

Se você quiser ajustar:
- **Tamanho**: Modifique os valores `width` e `height` nos componentes
- **Posicionamento**: Ajuste as classes do Tailwind CSS
- **Visibilidade**: Altere as classes `hidden` e `lg:flex`

