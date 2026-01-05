# 🔍 Queries SQL para Verificar Imagens no Neon

## 📋 Query 1: Ver TODOS os produtos com suas imagens

```sql
SELECT 
  id,
  name,
  "imageUrl",
  LENGTH("imageUrl") as url_length,
  active,
  "updatedAt"
FROM products
ORDER BY "updatedAt" DESC
LIMIT 20;
```

**O que verificar:**
- ✅ `imageUrl` não deve ser `NULL`
- ✅ `imageUrl` deve começar com `https://ileala-uploads.s3.amazonaws.com/`
- ✅ `url_length` deve ser maior que 50 caracteres
- ✅ `active` deve ser `1` para aparecer no site

---

## 📋 Query 2: Ver um produto ESPECÍFICO (substitua PRODUCT_ID)

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  LENGTH("imageUrl") as url_length,
  active,
  collection,
  "updatedAt"
FROM products
WHERE id = PRODUCT_ID;
```

**Como usar:**
1. Vá no painel admin → Products
2. Veja o ID do produto que você editou (geralmente aparece na URL ou no card)
3. Substitua `PRODUCT_ID` pelo número do ID
4. Exemplo: `WHERE id = 1;`

---

## 📋 Query 3: Ver produtos SEM imagem (para identificar problemas)

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  active,
  collection,
  "updatedAt"
FROM products
WHERE "imageUrl" IS NULL 
   OR "imageUrl" = ''
   OR "imageUrl" LIKE '%sanity%'
ORDER BY "updatedAt" DESC;
```

**O que verificar:**
- Se aparecer produtos aqui, significa que eles não têm imagem ou têm URL do Sanity
- Esses produtos precisam ter uma imagem nova enviada

---

## 📋 Query 4: Ver produtos COM imagem do S3 (para confirmar que está funcionando)

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  active,
  collection,
  "updatedAt"
FROM products
WHERE "imageUrl" IS NOT NULL 
  AND "imageUrl" LIKE 'https://ileala-uploads.s3.amazonaws.com/%'
  AND active = 1
ORDER BY "updatedAt" DESC
LIMIT 10;
```

**O que verificar:**
- ✅ Deve mostrar produtos com imagens do S3
- ✅ Se aparecer produtos aqui, significa que o upload está funcionando!

---

## 📋 Query 5: Atualizar um produto específico (se necessário)

**⚠️ USE COM CUIDADO! Apenas se souber o que está fazendo!**

```sql
-- Primeiro, veja o produto atual
SELECT id, name, "imageUrl" FROM products WHERE id = PRODUCT_ID;

-- Se a URL estiver errada, você pode atualizar manualmente (substitua a URL)
UPDATE products 
SET "imageUrl" = 'https://ileala-uploads.s3.amazonaws.com/products/SUA_IMAGEM.jpg',
    "updatedAt" = NOW()
WHERE id = PRODUCT_ID;

-- Verifique se foi atualizado
SELECT id, name, "imageUrl" FROM products WHERE id = PRODUCT_ID;
```

---

## 🚀 Como Usar no Neon

1. **Acesse [Neon Console](https://console.neon.tech)**
2. **Selecione seu projeto**
3. **Vá em "SQL Editor"** (no menu lateral)
4. **Cole uma das queries acima**
5. **Clique em "Run"** ou pressione `Ctrl+Enter`
6. **Veja os resultados**

---

## 📝 O Que Fazer com os Resultados

### Se `imageUrl` está `NULL` ou vazio:
- ❌ A imagem não foi salva no banco
- ✅ Tente fazer upload novamente no painel admin

### Se `imageUrl` tem uma URL do S3:
- ✅ A imagem foi salva corretamente!
- ✅ Teste a URL diretamente no navegador
- ✅ Se a URL funcionar, o problema pode ser cache do frontend

### Se `imageUrl` tem uma URL do Sanity:
- ❌ A imagem ainda está no Sanity (antiga)
- ✅ Faça upload de uma nova imagem no painel admin

---

## 🔗 Testar URL da Imagem

Depois de pegar a URL do banco:

1. **Copie a URL** do campo `imageUrl`
2. **Cole no navegador** e pressione Enter
3. **Deve mostrar a imagem** diretamente

**Se não mostrar:**
- ❌ Problema de permissões do S3
- ❌ URL incorreta
- ❌ Imagem não foi realmente enviada para o S3

