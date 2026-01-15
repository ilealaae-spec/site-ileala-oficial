-- Query para verificar se imageUrl está salvo no banco
-- Execute esta query no Neon SQL Editor

-- 1. Verificar produtos da Pet Collection com suas imagens
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  CASE 
    WHEN "imageUrl" IS NULL THEN 'SEM IMAGEM'
    WHEN "imageUrl" = '' THEN 'IMAGEM VAZIA'
    WHEN LENGTH("imageUrl") < 10 THEN 'IMAGEM MUITO CURTA'
    WHEN "imageUrl" LIKE '%s3%' OR "imageUrl" LIKE '%amazonaws%' THEN 'IMAGEM S3 (CORRETA)'
    ELSE 'OUTRO TIPO: ' || LEFT("imageUrl", 50)
  END as status_imagem,
  active,
  "updatedAt"
FROM products
WHERE "nameEN" ILIKE '%dress%' OR "nameEN" ILIKE '%black%' OR category = 'Pet Collection'
ORDER BY "updatedAt" DESC
LIMIT 10;

-- 2. Verificar TODOS os produtos recentes e suas imagens
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  CASE 
    WHEN "imageUrl" IS NULL THEN 'SEM IMAGEM'
    WHEN "imageUrl" = '' THEN 'IMAGEM VAZIA'
    WHEN "imageUrl" LIKE '%s3%' OR "imageUrl" LIKE '%amazonaws%' THEN 'IMAGEM S3 (CORRETA)'
    ELSE 'OUTRO TIPO'
  END as status_imagem,
  active,
  "updatedAt"
FROM products
ORDER BY "updatedAt" DESC
LIMIT 20;

-- 3. Contar produtos com e sem imagens
SELECT 
  COUNT(*) as total_produtos,
  COUNT("imageUrl") as produtos_com_imagem,
  COUNT(*) - COUNT("imageUrl") as produtos_sem_imagem
FROM products
WHERE active = 1;

-- 4. Verificar produto específico (substitua o ID pelo ID do produto que você editou)
-- SELECT 
--   id,
--   name,
--   "nameEN",
--   "slug",
--   "imageUrl",
--   LENGTH("imageUrl") as url_length,
--   active,
--   "updatedAt"
-- FROM products
-- WHERE id = [ID_DO_PRODUTO];  -- Substitua pelo ID do produto

