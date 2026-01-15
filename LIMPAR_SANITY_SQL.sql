-- ============================================
-- LIMPAR URLs DO SANITY DO BANCO DE DADOS
-- ============================================
-- 
-- PROBLEMA: Produtos antigos têm URLs do Sanity (cdn.sanity.io)
-- SOLUÇÃO: Limpar essas URLs para que você possa fazer upload de novas imagens
--
-- ⚠️ ATENÇÃO: Após executar, você precisará fazer upload de novas imagens
--    para os produtos afetados no painel admin.
--
-- ============================================

-- 1. VER QUANTOS PRODUTOS TÊM URLs DO SANITY
SELECT 
  COUNT(*) as total_produtos_sanity,
  COUNT(CASE WHEN active = 1 THEN 1 END) as produtos_ativos_sanity
FROM products
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';

-- 2. VER LISTA DE PRODUTOS COM URLs DO SANITY
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

-- 3. LIMPAR URLs DO SANITY (DEFINIR COMO NULL)
-- ⚠️ EXECUTE ESTA QUERY PARA LIMPAR AS URLs
UPDATE products
SET 
  "imageUrl" = NULL,
  "updatedAt" = NOW()
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';

-- 4. VERIFICAR SE A LIMPEZA FUNCIONOU (deve retornar 0)
SELECT 
  COUNT(*) as produtos_com_sanity
FROM products
WHERE "imageUrl" LIKE '%sanity%'
   OR "imageUrl" LIKE '%cdn.sanity.io%';

-- 5. VER PRODUTOS SEM IMAGEM (após limpeza)
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

