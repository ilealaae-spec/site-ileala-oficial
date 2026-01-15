-- Verificar produtos e suas imagens
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
    WHEN "imageUrl" LIKE '%cloudinary%' THEN 'IMAGEM CLOUDINARY (ANTIGA)'
    WHEN "imageUrl" LIKE '%sanity%' THEN 'IMAGEM SANITY (ANTIGA)'
    ELSE 'OUTRO TIPO: ' || LEFT("imageUrl", 50)
  END as status_imagem,
  price,
  active,
  "createdAt",
  "updatedAt"
FROM products
WHERE "nameEN" ILIKE '%dress%' OR "nameEN" ILIKE '%black%' OR "nameEN" ILIKE '%pink%' OR "nameEN" ILIKE '%picnic%'
ORDER BY "createdAt" DESC
LIMIT 10;

