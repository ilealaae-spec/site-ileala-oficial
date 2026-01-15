# 📸 Como Adicionar a Imagem do Pet Collection ao Projeto

## 🎯 Objetivo
Adicionar a imagem `pet_collection_logo.png` ao projeto para que apareça na página Pet Collection.

---

## 📍 Localização Correta
A imagem deve ser colocada em:
```
ileala-website/client/public/images/pet_collection_logo.png
```

---

## ✅ Método 1: Arrastar e Soltar (Mais Fácil)

### Passo 1: Encontrar a Pasta
1. Abra o Finder (macOS)
2. Navegue até: `/Users/elmabichara/site-ileala-oficial/ileala-website/client/public/images/`
3. Ou use o atalho: Pressione `Cmd + Shift + G` e cole o caminho acima

### Passo 2: Adicionar a Imagem
1. Encontre a imagem do logo da Pet Collection no seu computador
2. **Arraste e solte** a imagem para dentro da pasta `images/`
3. **Renomeie** a imagem para: `pet_collection_logo.png` (ou `.jpg`, `.webp` - qualquer formato funciona)

### Passo 3: Adicionar ao Git
Abra o terminal e execute:

```bash
cd /Users/elmabichara/site-ileala-oficial
git add ileala-website/client/public/images/pet_collection_logo.png
git commit -m "Add pet collection logo image"
git push
```

---

## ✅ Método 2: Via Terminal (Linha de Comando)

### Passo 1: Encontrar a Imagem
Encontre onde está a imagem do logo da Pet Collection no seu computador.

### Passo 2: Copiar para o Projeto
Execute no terminal:

```bash
# Exemplo: se a imagem estiver no Downloads
cp /Users/elmabichara/Downloads/pet_collection_logo.png /Users/elmabichara/site-ileala-oficial/ileala-website/client/public/images/pet_collection_logo.png

# OU se a imagem tiver outro nome:
cp /Users/elmabichara/Downloads/[nome-da-imagem].png /Users/elmabichara/site-ileala-oficial/ileala-website/client/public/images/pet_collection_logo.png
```

### Passo 3: Adicionar ao Git
```bash
cd /Users/elmabichara/site-ileala-oficial
git add ileala-website/client/public/images/pet_collection_logo.png
git commit -m "Add pet collection logo image"
git push
```

---

## ✅ Método 3: Via GitHub (Interface Web)

### Passo 1: Acessar o Repositório
1. Acesse: https://github.com/ilealaae-spec/site-ileala-oficial
2. Navegue até: `ileala-website` → `client` → `public` → `images`

### Passo 2: Adicionar Arquivo
1. Clique em **"Add file"** → **"Upload files"**
2. Arraste a imagem do logo da Pet Collection
3. **Renomeie** para: `pet_collection_logo.png`

### Passo 3: Commit
1. Role até o final da página
2. Digite a mensagem: `Add pet collection logo image`
3. Clique em **"Commit changes"**

---

## 🔍 Como Verificar se Funcionou

### 1. Verificar se a Imagem Está no Projeto
```bash
cd /Users/elmabichara/site-ileala-oficial/ileala-website/client/public/images
ls -lh pet_collection_logo.*
```

Deve aparecer algo como:
```
-rw-r--r--  1 elmabichara  staff   150K Jan  5 10:00 pet_collection_logo.png
```

### 2. Verificar no Git
```bash
cd /Users/elmabichara/site-ileala-oficial
git status
```

Deve mostrar:
```
new file:   ileala-website/client/public/images/pet_collection_logo.png
```

### 3. Testar Localmente (Opcional)
```bash
cd /Users/elmabichara/site-ileala-oficial/ileala-website/client
npm run dev
```

Acesse: http://localhost:5173/pet-collection

---

## 📝 Formatos Aceitos

A imagem pode estar em qualquer um destes formatos:
- ✅ `.png`
- ✅ `.jpg` / `.jpeg`
- ✅ `.webp` (recomendado - menor tamanho)

**Importante:** O código está procurando por `pet_collection_logo.png`, mas se você usar outro formato, me avise que eu ajusto o código!

---

## ⚠️ Problemas Comuns

### Problema 1: "Imagem não aparece"
**Solução:**
1. Verifique se o nome está correto: `pet_collection_logo.png`
2. Verifique se está na pasta correta: `ileala-website/client/public/images/`
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Aguarde 2-5 minutos após o push (deploy automático)

### Problema 2: "Erro ao fazer push"
**Solução:**
```bash
# Verificar status
git status

# Se houver conflitos, resolver primeiro
git pull origin main

# Tentar novamente
git push
```

### Problema 3: "Não encontro a imagem no meu computador"
**Solução:**
- Verifique a pasta Downloads
- Verifique a pasta Desktop
- Use o Spotlight (Cmd + Space) e procure por "pet" ou "collection"

---

## 🚀 Após Adicionar a Imagem

1. ✅ Imagem adicionada ao projeto
2. ✅ Commit feito
3. ✅ Push enviado
4. ⏳ Aguarde 2-5 minutos (deploy automático no Railway)
5. 🌐 Acesse: https://www.ileala.ae/pet-collection
6. 🎉 A imagem deve aparecer!

---

## 💡 Dica Extra

Se você quiser que eu ajude a adicionar a imagem via terminal, me diga:
1. Onde está a imagem no seu computador (ex: Downloads, Desktop)
2. Qual é o nome do arquivo

E eu posso executar os comandos para você! 😊

