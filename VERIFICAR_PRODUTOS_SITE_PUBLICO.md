# ✅ Verificar se Produtos Aparecem no Site Público

## 🎯 Status Atual:
- ✅ Painel admin funcionando
- ✅ Produtos aparecem na lista do admin
- ✅ Requisições retornando Status 200
- ❓ Produtos aparecem no site público?
- ❓ Produtos estão salvos no banco de dados?

---

## 📋 ETAPA 1: Verificar no Site Público

### 1. Abra o site público:
- Vá para: `https://ileala.ae` (ou `https://www.ileala.ae`)
- **NÃO** use `/admin`

### 2. Verifique as páginas de produtos:
- **Homepage:** Os produtos aparecem na seção de produtos?
- **Napkin Rings:** Vá para `/napkin-rings` - os produtos aparecem?
- **Collections:** Vá para `/collections` - as coleções aparecem?
- **Shop:** Procure por "Boho" ou "Teste 2" - aparece algo?

**Me envie:**
- Os produtos aparecem no site público?
- Se não aparecem, qual página você testou?

---

## 📋 ETAPA 2: Verificar no Banco de Dados (Neon SQL Editor)

### Execute esta query:

```sql
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
```

**Me envie:**
- Quantos produtos aparecem?
- Os produtos "Teste 2", "Boho Nature Napkin Ring", "Rustic Napkin Rings" aparecem?
- O campo `active` está como `1` (ativo)?
- O campo `imageUrl` está preenchido?

---

## 📋 ETAPA 3: Verificar Produtos Ativos

### Execute esta query para ver apenas produtos ativos:

```sql
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
```

**Me envie:**
- Quantos produtos ativos aparecem?
- Todos os produtos que você vê no admin aparecem aqui?

---

## 📋 ETAPA 4: Verificar Query Pública de Produtos

### No Console do navegador (F12 → Console):
1. Vá para o site público (não o admin)
2. Abra o Console (F12)
3. Cole este código e pressione Enter:

```javascript
fetch('/api/trpc/products.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22active%22%3A1%7D%7D%7D')
  .then(r => r.json())
  .then(data => {
    console.log('Produtos públicos:', data);
    console.log('Total de produtos:', data[0]?.result?.data?.json?.length || 0);
  })
  .catch(err => console.error('Erro:', err));
```

**Me envie:**
- O que aparece no console?
- Quantos produtos retornaram?
- Aparecem os produtos que você criou?

---

## 📋 ETAPA 5: Verificar Logs do Railway

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. Filtre por "products" ou "DB" ou "create"
3. Procure por mensagens recentes como:
   - `[Admin.Products.Create] Creating product:`
   - `[DB] Creating product:`
   - `[DB] Product created successfully with ID:`

**Me envie:**
- Aparecem logs de criação de produtos?
- Se aparecem, qual foi a última mensagem?
- Se não aparecem, qual foi a última mensagem nos logs (antes de criar)?

---

## 🚨 Resumo do que preciso:

1. ✅ Produtos aparecem no site público? (qual página testou)
2. ✅ Quantos produtos aparecem no banco? (query SQL)
3. ✅ Quantos produtos ativos aparecem? (query SQL)
4. ✅ O que retorna a query pública? (console do navegador)
5. ✅ O que aparece nos logs do Railway?

Com essas informações, identifico exatamente onde está o problema!

