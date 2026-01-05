# 🔍 Verificar Tabelas no Neon

## 📋 Query 1: Ver TODAS as tabelas que existem no banco

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Execute esta query primeiro** para ver quais tabelas existem!

---

## 📋 Query 2: Ver se a tabela products existe (com diferentes nomes)

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name ILIKE '%product%' OR table_name ILIKE '%produto%')
ORDER BY table_name;
```

---

## 📋 Query 3: Ver estrutura de uma tabela (se existir com outro nome)

**Substitua `NOME_DA_TABELA` pelo nome que apareceu na Query 1:**

```sql
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'NOME_DA_TABELA'
ORDER BY ordinal_position;
```

---

## 📋 Query 4: Ver TODAS as colunas de TODAS as tabelas

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

---

## 🚨 Se a tabela products NÃO existir

Execute esta query para criar a tabela:

```sql
-- Criar tabela products
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "nameEN" VARCHAR(255) NOT NULL,
  "namePT" VARCHAR(255) NOT NULL,
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "price" INTEGER NOT NULL,
  "imageUrl" VARCHAR(512),
  "mainImage" VARCHAR(512),
  "mainImageAlt" VARCHAR(255),
  "images" TEXT,
  "salePrice" INTEGER,
  "descriptionEN_full" TEXT,
  "descriptionPT_full" TEXT,
  "material" VARCHAR(255),
  "dimensions" VARCHAR(255),
  "colors" VARCHAR(255),
  "careInstructionsEN" TEXT,
  "careInstructionsPT" TEXT,
  "weight" INTEGER,
  "sku" VARCHAR(100),
  "inStock" INTEGER DEFAULT 1,
  "stockQuantity" INTEGER DEFAULT 0,
  "isNew" INTEGER DEFAULT 0,
  "onSale" INTEGER DEFAULT 0,
  "seoTitle" VARCHAR(255),
  "seoDescription" TEXT,
  "collection" VARCHAR(100),
  "category" VARCHAR(100),
  "stock" INTEGER DEFAULT 0 NOT NULL,
  "featured" INTEGER DEFAULT 0 NOT NULL,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

---

## 🔍 Passos Recomendados

1. **Execute a Query 1** para ver todas as tabelas
2. **Me envie o resultado** para eu ver quais tabelas existem
3. **Se a tabela products não existir**, execute a Query 4 (criar tabela)
4. **Depois execute a query original** para verificar as imagens

