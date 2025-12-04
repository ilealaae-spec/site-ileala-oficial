# 🔍 Diagnóstico Completo: Integração Admin → Site

## 📊 Situação Atual:

### **1. Fluxo de Criação de Produto:**

```
Admin Panel (Frontend)
  ↓
submitProduct() → cria productData com name, slug, nameEN, namePT, etc.
  ↓
createMutation.mutate() → chama trpc.admin.products.create
  ↓
Backend (server/routers.ts)
  ↓
admin.products.create → valida input, cria produto no banco
  ↓
db.createProduct() → insere no PostgreSQL
  ↓
Retorna ID do produto
  ↓
Invalida cache
  ↓
Frontend recebe sucesso → mostra toast "Product created!"
```

### **2. Fluxo de Listagem de Produtos:**

```
Site Público (Frontend)
  ↓
trpc.products.list.useQuery()
  ↓
Backend (server/routers.ts)
  ↓
products.list → busca cache ou chama db.getAllProducts()
  ↓
db.getAllProducts() → SELECT * FROM products WHERE active = 1
  ↓
Retorna apenas produtos com active = 1
```

### **3. Problema Identificado:**

**O admin usa a mesma query do site público:**
- Admin: `trpc.products.list.useQuery()` 
- Site: `trpc.products.list.useQuery()`
- **Ambos filtram por `active = 1`**

**Mas o admin deveria ver TODOS os produtos (ativos e inativos)!**

## 🔴 Problemas Potenciais:

### **Problema 1: Admin não vê produtos inativos**
- **Causa**: Admin usa `trpc.products.list` que filtra `active = 1`
- **Impacto**: Se produto for criado com `active = 0` (erro), admin não vê
- **Solução**: Admin deve usar `trpc.admin.products.list` (se existir) ou criar

### **Problema 2: Cache não está sendo invalidado corretamente**
- **Causa**: Cache pode estar sendo servido mesmo após invalidação
- **Impacto**: Produto criado não aparece imediatamente
- **Solução**: Verificar se invalidação está funcionando

### **Problema 3: Produto criado mas com active = 0**
- **Causa**: Erro na criação ou validação
- **Impacto**: Produto existe no banco mas não aparece (filtrado)
- **Solução**: Verificar logs e garantir `active = 1`

### **Problema 4: Erro silencioso na criação**
- **Causa**: Erro não está sendo capturado ou mostrado
- **Impacto**: Usuário acha que criou, mas produto não foi criado
- **Solução**: Melhorar tratamento de erros

## 🔍 Checklist de Verificação:

### **1. Verificar se produto foi criado no banco:**

**No Admin:**
1. Após criar produto, verifique se aparece na lista
2. Se aparecer: produto foi criado ✅
3. Se não aparecer: produto não foi criado ou está inativo ❌

**No Console do Navegador (F12):**
1. Abra DevTools → Console
2. Crie um produto
3. Procure por erros em vermelho
4. Procure por logs `[Admin] Creating product:`

**No Railway (Deploy Logs):**
1. Acesse Railway → Deploy Logs
2. Procure por `[Admin] Creating product:`
3. Procure por `[Admin] Product created with ID:`
4. Procure por erros

### **2. Verificar se produto está ativo:**

**No Admin:**
1. Vá em Produtos
2. Encontre o produto criado
3. Clique em Editar
4. Verifique se checkbox "Active" está marcado

**No Banco (se tiver acesso SQL):**
```sql
SELECT id, name, nameEN, active, collection, category 
FROM products 
ORDER BY id DESC 
LIMIT 5;
```

### **3. Verificar se produto aparece no site:**

**No Site:**
1. Acesse `/shop` (lista geral)
2. Procure pelo produto
3. Se tiver `collection`, acesse `/collections/[collection-slug]`
4. Se tiver `category`, acesse `/category/[category-slug]`

**No Console do Navegador (F12):**
1. Abra DevTools → Network
2. Filtre por "trpc"
3. Procure por `products.list`
4. Veja a resposta - quantos produtos retornou?

### **4. Verificar cache:**

**Limpar cache do navegador:**
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

**Verificar cache no backend:**
- Cache é invalidado após criar produto
- Mas pode haver cache no cliente (tRPC)
- Aguarde 5 minutos ou force refresh

## 🛠️ Testes para Fazer:

### **Teste 1: Criar produto simples**
1. Acesse admin → Produtos
2. Clique em "Add Product"
3. Preencha APENAS:
   - Name (English): "Test Product"
   - Name (Portuguese): "Produto Teste"
   - Price: 100.00
   - Stock: 10
4. **NÃO preencha** collection, category, image
5. Clique em "Save Product"
6. Verifique:
   - ✅ Toast "Product created!" aparece?
   - ✅ Produto aparece na lista do admin?
   - ✅ Produto aparece em `/shop` no site?

### **Teste 2: Verificar logs**
1. Abra Railway → Deploy Logs
2. Crie um produto
3. Procure por:
   - `[Admin] Creating product:`
   - `[Admin] Product created with ID:`
   - Erros em vermelho

### **Teste 3: Verificar banco de dados**
Se tiver acesso SQL:
```sql
-- Ver último produto criado
SELECT * FROM products ORDER BY id DESC LIMIT 1;

-- Verificar se active = 1
SELECT id, name, nameEN, active FROM products WHERE id = [ID_DO_PRODUTO];
```

## 🚨 Possíveis Causas:

### **1. Produto não está sendo criado**
- **Sintoma**: Toast "Product created!" mas produto não aparece
- **Causa**: Erro silencioso na criação
- **Solução**: Verificar logs do Railway

### **2. Produto criado mas active = 0**
- **Sintoma**: Produto aparece no admin mas não no site
- **Causa**: Erro ao setar `active = 1`
- **Solução**: Editar produto e marcar "Active"

### **3. Produto criado mas sem collection/category**
- **Sintoma**: Produto não aparece em páginas específicas
- **Causa**: Filtro por collection/category não encontra produto
- **Solução**: Editar produto e preencher collection/category

### **4. Cache não invalidado**
- **Sintoma**: Produto criado mas não aparece imediatamente
- **Causa**: Cache ainda servindo dados antigos
- **Solução**: Aguardar 5 minutos ou limpar cache

### **5. Erro de autenticação**
- **Sintoma**: Erro "Unauthorized" ao criar
- **Causa**: Usuário não é admin ou sessão expirou
- **Solução**: Fazer login novamente

## 📋 Próximos Passos:

1. **Execute os testes acima**
2. **Verifique os logs do Railway**
3. **Verifique o console do navegador**
4. **Me informe:**
   - ✅ Produto aparece no admin após criar?
   - ✅ Produto aparece no site após criar?
   - ✅ Há erros no console?
   - ✅ Há erros nos logs do Railway?
   - ✅ Qual é a mensagem de erro (se houver)?

Com essas informações, posso identificar exatamente onde está o problema!

