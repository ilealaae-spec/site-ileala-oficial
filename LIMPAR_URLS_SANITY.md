# 🔧 Limpar URLs do Sanity do Banco de Dados

## Problema Identificado

Produtos antigos no banco ainda têm URLs do Sanity (`cdn.sanity.io`). O componente `LazyImage` detecta essas URLs e mostra um placeholder em vez de carregar a imagem, fazendo com que as imagens não apareçam no site.

## Solução

### 1. Verificar quantos produtos têm URLs do Sanity

Execute esta query no **Neon SQL Editor**:

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  active,
  "updatedAt"
FROM products
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%'
ORDER BY id;
```

**Resultado esperado:** Lista de produtos com URLs do Sanity.

---

### 2. Ver quantos produtos são afetados

```sql
SELECT 
  COUNT(*) as total_produtos_sanity,
  COUNT(CASE WHEN active = 1 THEN 1 END) as produtos_ativos_sanity
FROM products
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';
```

---

### 3. Limpar URLs do Sanity (definir como NULL)

⚠️ **ATENÇÃO:** Esta operação remove as URLs do Sanity. Você precisará fazer upload de novas imagens para esses produtos no painel admin.

```sql
-- Limpar URLs do Sanity (definir como NULL)
UPDATE products
SET 
  "imageUrl" = NULL,
  "updatedAt" = NOW()
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';
```

**Resultado esperado:** 
```
UPDATE X
```
(Onde X é o número de produtos atualizados)

---

### 4. Verificar se a limpeza funcionou

```sql
-- Verificar se ainda há URLs do Sanity
SELECT 
  COUNT(*) as produtos_com_sanity
FROM products
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';
```

**Resultado esperado:** `0` (zero produtos com URLs do Sanity)

---

### 5. Ver produtos sem imagem (após limpeza)

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  active
FROM products
WHERE "imageUrl" IS NULL
   OR "imageUrl" = ''
ORDER BY id;
```

---

## Próximos Passos

Após limpar as URLs do Sanity:

1. ✅ **Acesse o painel admin** → Products
2. ✅ **Para cada produto sem imagem:**
   - Clique em "Edit"
   - Vá na aba "Images"
   - Faça upload de uma nova imagem
   - Clique em "Update"
3. ✅ **Verifique no site público** se as imagens aparecem

---

## Alternativa: Manter URLs do Sanity (NÃO RECOMENDADO)

Se você quiser manter as URLs do Sanity temporariamente (para referência), você pode criar uma coluna de backup:

```sql
-- Criar coluna de backup (opcional)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS "imageUrlSanity" VARCHAR(512);

-- Fazer backup das URLs do Sanity antes de limpar
UPDATE products
SET "imageUrlSanity" = "imageUrl"
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';

-- Agora limpar as URLs do Sanity
UPDATE products
SET 
  "imageUrl" = NULL,
  "updatedAt" = NOW()
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';
```

⚠️ **Nota:** URLs do Sanity não funcionam mais no site. O componente `LazyImage` bloqueia essas URLs automaticamente.

---

## Checklist

- [ ] Execute a query 1 para ver produtos com Sanity
- [ ] Execute a query 2 para contar quantos são
- [ ] Execute a query 3 para limpar URLs do Sanity
- [ ] Execute a query 4 para verificar se funcionou
- [ ] Execute a query 5 para ver produtos sem imagem
- [ ] Faça upload de novas imagens no painel admin
- [ ] Verifique no site público se as imagens aparecem

