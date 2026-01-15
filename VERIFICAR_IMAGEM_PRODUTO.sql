-- Query para verificar se a imagem foi salva no produto
-- Execute esta query no Neon SQL Editor

-- 1. Verificar produtos da Pet Collection com suas imagens
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  LENGTH("imageUrl") as url_length,
  active,
  category,
  collection,
  "updatedAt"
FROM products
WHERE category = 'Pet Collection' OR collection = 'Pet Collection' OR "nameEN" ILIKE '%pet%' OR "nameEN" ILIKE '%dress%'
ORDER BY "updatedAt" DESC
LIMIT 10;

-- 2. Verificar produtos recentes (últimos 5) e suas imagens
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  CASE 
    WHEN "imageUrl" IS NULL THEN 'SEM IMAGEM'
    WHEN "imageUrl" = '' THEN 'IMAGEM VAZIA'
    WHEN "imageUrl" LIKE '%sanity%' THEN 'IMAGEM SANITY (ANTIGA)'
    WHEN "imageUrl" LIKE '%s3%' OR "imageUrl" LIKE '%amazonaws%' THEN 'IMAGEM S3 (CORRETA)'
    ELSE 'OUTRO TIPO'
  END as tipo_imagem,
  active,
  "updatedAt"
FROM products
ORDER BY "updatedAt" DESC
LIMIT 5;

-- 3. Verificar produtos sem imagem
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  active,
  "updatedAt"
FROM products
WHERE "imageUrl" IS NULL OR "imageUrl" = ''
ORDER BY "updatedAt" DESC;

