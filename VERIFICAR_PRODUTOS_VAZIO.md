# 🔍 Diagnóstico: Tabela `products` Vazia

## Problema Identificado

A query retornou **"No result"** - a tabela `products` está **vazia**!

Isso explica por que:
- ❌ Produtos não aparecem no site
- ❌ Produtos não aparecem no painel admin
- ❌ Nada funciona, mesmo com imagens corretas

## Verificações Necessárias

### 1. Verificar se a tabela existe e está vazia

```sql
-- Contar total de produtos
SELECT COUNT(*) as total_produtos FROM products;

-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### 2. Verificar se há produtos em outras tabelas (se existirem)

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 3. Verificar logs do Railway

No Railway → `ileala-admin` → Deploy Logs, procure por:
- `[DB] Product created successfully with ID:`
- `[Admin] Product created with ID:`
- Erros relacionados a `INSERT` ou `products`

### 4. Tentar criar um produto de teste diretamente no banco

```sql
-- Inserir produto de teste
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
  'Produto Teste',
  'Test Product',
  'Produto Teste',
  10000, -- 100.00 AED (em fils)
  1,     -- ativo
  10,    -- estoque
  NOW(),
  NOW()
) RETURNING id, name, "nameEN", "createdAt";
```

Se esta inserção funcionar, o problema está no código do servidor.

---

## Possíveis Causas

### 1. **Erro ao inserir no banco (mais provável)**
- O código do servidor pode estar falhando silenciosamente
- Verificar logs do Railway para erros de `INSERT`

### 2. **Tabela foi criada mas produtos não foram migrados**
- Produtos antigos podem estar em outra tabela
- Ou nunca foram migrados do Sanity

### 3. **Transação não foi commitada**
- Produtos podem ter sido inseridos mas a transação foi revertida
- Verificar se há `COMMIT` após `INSERT`

### 4. **Erro de conexão com o banco**
- O servidor pode não estar conectando ao banco correto
- Verificar variáveis de ambiente `DATABASE_URL` no Railway

---

## Próximos Passos

1. ✅ Execute a query 1 para confirmar que está vazia
2. ✅ Verifique os logs do Railway ao criar um produto
3. ✅ Tente criar um produto de teste diretamente no banco (query 4)
4. ✅ Se o teste funcionar, o problema está no código do servidor
5. ✅ Se o teste não funcionar, há um problema com a tabela ou permissões

---

## Solução Temporária

Se você precisa de produtos no site **agora**, você pode:

1. **Criar produtos manualmente no banco** (usando a query 4)
2. **Ou criar produtos pelo painel admin** e verificar os logs

Mas primeiro precisamos descobrir **por que** os produtos não estão sendo salvos!

