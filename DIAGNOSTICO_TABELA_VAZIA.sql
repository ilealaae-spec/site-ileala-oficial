-- ============================================
-- DIAGNÓSTICO: TABELA PRODUCTS VAZIA
-- ============================================
-- 
-- PROBLEMA: A tabela products está vazia, mas os logs mostram
--           que produtos foram criados (ID: 37, etc.)
--
-- POSSÍVEIS CAUSAS:
-- 1. Produtos estão sendo criados em outro banco
-- 2. Transações não estão sendo commitadas
-- 3. Produtos estão sendo deletados após criação
-- 4. Conexão do servidor está apontando para banco errado
--
-- ============================================

-- 1. CONTAR TOTAL DE PRODUTOS
SELECT COUNT(*) as total_produtos FROM products;

-- 2. VER TODOS OS PRODUTOS (se houver)
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  active,
  "createdAt",
  "updatedAt"
FROM products
ORDER BY "createdAt" DESC;

-- 3. VER ESTRUTURA DA TABELA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 4. VERIFICAR SE HÁ OUTRAS TABELAS COM PRODUTOS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%product%'
ORDER BY table_name;

-- 5. VER ÚLTIMOS IDs USADOS (para verificar se há sequência)
SELECT 
  last_value,
  is_called
FROM products_id_seq;

-- 6. VERIFICAR SEQUÊNCIA DO ID
SELECT 
  setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products), false) as sequencia_atual;

-- 7. TENTAR CRIAR PRODUTO DE TESTE DIRETAMENTE
-- ⚠️ Execute esta query para testar se a inserção funciona
INSERT INTO products (
  "slug",
  "name",
  "nameEN",
  "namePT",
  "price",
  "active",
  "stock",
  "createdAt",
  "updatedAt"
) VALUES (
  'produto-teste-' || EXTRACT(EPOCH FROM NOW())::bigint,
  'Produto Teste SQL',
  'Test Product SQL',
  'Produto Teste SQL',
  10000, -- 100.00 AED (em fils)
  1,     -- ativo
  10,    -- estoque
  NOW(),
  NOW()
) RETURNING id, name, "nameEN", "slug", "createdAt";

-- 8. VERIFICAR SE O PRODUTO DE TESTE FOI CRIADO
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "createdAt"
FROM products
WHERE "slug" LIKE 'produto-teste-%'
ORDER BY "createdAt" DESC
LIMIT 5;

