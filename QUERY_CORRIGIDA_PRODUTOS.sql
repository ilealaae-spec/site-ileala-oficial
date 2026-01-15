-- Query corrigida para verificar produtos no banco
-- Execute esta query no Neon SQL Editor

-- 1. Verificar se a tabela products existe e contar produtos
SELECT COUNT(*) as total_produtos FROM products;

-- 2. Listar todos os produtos (últimos 10)
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  price,
  "imageUrl",
  active,
  stock,
  "createdAt",
  "updatedAt"
FROM products
ORDER BY "createdAt" DESC
LIMIT 10;

-- 3. Verificar apenas produtos ativos
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  price,
  "imageUrl",
  active,
  stock
FROM products
WHERE active = 1
ORDER BY "createdAt" DESC;

-- 4. Verificar produtos criados hoje
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  price,
  "imageUrl",
  active,
  stock,
  "createdAt"
FROM products
WHERE DATE("createdAt") = CURRENT_DATE
ORDER BY "createdAt" DESC;

-- 5. Verificar estrutura da tabela (para garantir que existe)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

