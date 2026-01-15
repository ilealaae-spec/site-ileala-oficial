# 🔍 Diagnóstico Completo: Painel Admin - Fotos e Textos não aparecem no site

## 🎯 Problema Confirmado:
- ✅ Upload para S3 funciona (URL retornada)
- ✅ Frontend recebe URL corretamente
- ❌ Tabela `products` está vazia (`COUNT(*) = 0`)
- ❌ Não aparecem logs no Railway ao criar/atualizar produtos
- ❌ Produtos criados no painel não aparecem no site

---

## 📋 ETAPA 1: Verificar se a requisição está sendo enviada

### No Console do navegador (F12 → Console):
1. Limpe o console (Ctrl+L)
2. No painel admin:
   - Clique em "+ Add Product"
   - Preencha apenas:
     - Name (English): `Teste Diagnóstico`
     - Nome (Português): `Teste Diagnóstico`
     - Price: `100`
     - Stock: `10`
   - **NÃO faça upload de imagem ainda**
   - Clique em "Create"
3. Observe o console e procure por:
   - `[Admin] Submitting product:`
   - `[Admin] Product data to save:`
   - Erros em vermelho

**Me envie:** O que aparece no console?

---

## 📋 ETAPA 2: Verificar requisição na Network

### Na aba Network (F12 → Network):
1. Limpe as requisições
2. Crie o produto novamente (mesmo processo da Etapa 1)
3. Procure por requisição `admin.products.create`
4. Se aparecer, clique nela e veja:
   - **Status:** Qual é o status? (200, 400, 500, etc.)
   - **Payload:** O que está sendo enviado? (deve ter todos os campos)
   - **Response:** O que o servidor retornou?

**Me envie:**
- Apareceu a requisição `admin.products.create`?
- Qual foi o Status?
- O que aparece na Response?

---

## 📋 ETAPA 3: Verificar logs do Railway ao criar produto

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. Limpe o filtro (deixe vazio)
3. Role até o final (logs mais recentes)
4. **Crie um produto novo** no painel admin (mesmo processo da Etapa 1)
5. Observe os logs em tempo real
6. Procure por estas mensagens (em ordem):
   - `[Admin.Products.Create] Creating product:`
   - `[Admin.Products.Create] Product data to save:`
   - `[DB] Creating product:`
   - `[DB] Product created successfully with ID:`
   - `[Admin.Products.Create] Product created with ID:`
   - `[Admin.Products.Create] Verification - Product in DB:`

**Me envie:**
- Apareceu alguma dessas mensagens?
- Se apareceu, qual foi a última mensagem?
- Se não apareceu nada, me diga qual foi a última mensagem que apareceu nos logs (antes de criar o produto)
- Se apareceu algum erro, copie o erro completo

---

## 📋 ETAPA 4: Verificar conexão com banco

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. Filtre por "database" ou "DB" ou "migration" ou "Database"
3. Procure por mensagens como:
   - `[Migration] All database migrations completed successfully!`
   - `[Database] Connected successfully`
   - Erros relacionados a "database" ou "connection"

**Me envie:** O que aparece quando filtra por "database"?

---

## 📋 ETAPA 5: Verificar se há erros de autenticação

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. Filtre por "Auth" ou "Unauthorized" ou "admin" ou "role"
3. Procure por mensagens de erro de autenticação

**Me envie:** Aparecem erros de autenticação?

---

## 📋 ETAPA 6: Testar criação direta no banco

### No Neon SQL Editor:
Execute esta query para criar um produto de teste diretamente no banco:

```sql
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
  'produto-teste-sql-' || EXTRACT(EPOCH FROM NOW())::bigint,
  'Produto Teste SQL',
  'Test Product SQL',
  'Produto Teste SQL',
  10000, -- 100.00 AED (em fils)
  1,     -- ativo
  10,    -- estoque
  NOW(),
  NOW()
) RETURNING id, name, "nameEN", "createdAt";
```

**Me envie:**
- A query funcionou?
- Se funcionou, qual foi o ID retornado?
- Depois execute `SELECT COUNT(*) FROM products;` e me diga o resultado

---

## 📋 ETAPA 7: Verificar variável DATABASE_URL

### No Railway:
1. Railway → `ileala-admin` → Variables
2. Procure por `DATABASE_URL`
3. Verifique se o valor está correto:
   - Deve começar com `postgresql://`
   - Deve conter `ep-square-sound-adqymq6y-pooler` (endpoint correto)
   - Deve conter `neondb` (nome do banco)

**Me envie:** A `DATABASE_URL` está correta? (pode mascarar a senha)

---

## 🚨 Resumo do que preciso:

1. ✅ Console do navegador ao criar produto
2. ✅ Aba Network - requisição `admin.products.create`
3. ✅ Logs do Railway ao criar produto
4. ✅ Logs do Railway filtrados por "database"
5. ✅ Resultado da query SQL de teste (criar produto direto no banco)
6. ✅ Verificação da `DATABASE_URL`

Com essas informações, identifico exatamente onde está o problema!

