-- Queries para verificar se a tabela products existe e está acessível

-- 1. Verificar se a tabela products existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'products'
ORDER BY table_schema;

-- 2. Verificar estrutura da tabela products
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Contar registros na tabela products (sem filtros)
SELECT COUNT(*) as total_registros FROM products;

-- 4. Verificar se há algum produto (mesmo que inativo)
SELECT 
  id,
  name,
  "nameEN",
  active,
  "createdAt",
  "updatedAt"
FROM products
ORDER BY "createdAt" DESC
LIMIT 10;

-- 5. Verificar todas as tabelas no banco
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

