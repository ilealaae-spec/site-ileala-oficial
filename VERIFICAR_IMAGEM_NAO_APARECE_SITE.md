# 🔍 Verificar Por Que Imagem Não Aparece no Site

## ✅ Status Atual:
- ✅ Upload da imagem: Status 200
- ✅ Atualização do produto: Status 200 (não mais 502!)
- ❌ Imagem não aparece no site público

---

## 📋 ETAPA 1: Verificar se imageUrl está no Banco

### Execute esta query no Neon SQL Editor:

```sql
-- Verificar produtos da Pet Collection com suas imagens
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
```

**Me envie:**
- O campo `imageUrl` está preenchido?
- Qual é o valor do `status_imagem`?
- Se `imageUrl` está preenchido, qual é o início da URL? (pode mascarar parte)

---

## 📋 ETAPA 2: Verificar Query Pública de Produtos

### No Console do navegador (F12 → Console):
1. Vá para o site público: `ileala.ae/pet-collection`
2. Abra o Console (F12 → Console)
3. Cole este código e pressione Enter:

```javascript
fetch('/api/trpc/products.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22active%22%3A1%7D%7D%7D')
  .then(r => r.json())
  .then(data => {
    const products = data[0]?.result?.data?.json || [];
    console.log('Total de produtos:', products.length);
    
    // Procurar produtos da Pet Collection
    const petProducts = products.filter(p => 
      p.nameEN?.toLowerCase().includes('dress') || 
      p.category === 'Pet Collection'
    );
    
    console.log('Produtos da Pet Collection:', petProducts.length);
    petProducts.forEach(p => {
      console.log('Produto:', {
        id: p.id,
        name: p.nameEN,
        imageUrl: p.imageUrl,
        imageUrlLength: p.imageUrl?.length,
        hasImage: !!p.imageUrl,
      });
    });
  })
  .catch(err => console.error('Erro:', err));
```

**Me envie:**
- Quantos produtos retornaram?
- Os produtos "BlackDress" e "Picnic Dress" aparecem?
- O campo `imageUrl` está preenchido nos produtos retornados?
- Se `imageUrl` está preenchido, qual é o valor?

---

## 📋 ETAPA 3: Verificar Cache

### O cache pode estar retornando dados antigos. Vamos forçar invalidação:

1. **No site público**, abra o Console (F12 → Console)
2. **Cole este código** para limpar o cache do navegador:

```javascript
// Limpar cache do navegador
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('Cache limpo!');
});

// Recarregar página sem cache
location.reload(true);
```

3. **Ou simplesmente**: Pressione **Ctrl+Shift+R** (Windows) ou **Cmd+Shift+R** (Mac) para recarregar sem cache

**Me envie:**
- A imagem apareceu após limpar o cache?

---

## 📋 ETAPA 4: Verificar Logs do Railway

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. **Filtre por "Products API"** ou "imageUrl" ou "cache"
3. **Procure por mensagens** como:
   - `[Products API] Fetched from database:`
   - `[Products API] First product imageUrl:`
   - `[Products API] Returning cached products:`

**Me envie:**
- Aparecem logs da query pública de produtos?
- O que aparece no log `First product imageUrl:`?
- Aparece `Returning cached products:`? (pode ser cache antigo)

---

## 📋 ETAPA 5: Verificar se a Imagem Está Acessível

### Se o `imageUrl` está no banco, vamos verificar se a imagem está acessível:

1. **Copie a URL** do campo `imageUrl` do banco (da query da ETAPA 1)
2. **Cole no navegador** e pressione Enter
3. **A imagem abre?** Se não, pode ser problema de permissões do S3

**Me envie:**
- A URL da imagem abre no navegador?
- Se não abre, qual é a mensagem de erro? (404, 403, etc.)

---

## 📋 ETAPA 6: Verificar Componente de Imagem no Frontend

### Verificar se o componente está exibindo corretamente:

1. **No site público**, abra o Console (F12 → Console)
2. **Procure por erros** relacionados a imagens
3. **Na aba Network**, filtre por "Img" ou o nome do arquivo da imagem
4. **Veja se há requisições** para carregar as imagens

**Me envie:**
- Há erros no console relacionados a imagens?
- Aparecem requisições para carregar imagens na aba Network?
- Se aparecem, qual é o Status? (200, 404, 403, etc.)

---

## 🚨 Resumo do que preciso:

1. ✅ O `imageUrl` está salvo no banco? (query SQL - ETAPA 1)
2. ✅ A query pública retorna o `imageUrl`? (console do navegador - ETAPA 2)
3. ✅ O cache foi limpo? (teste visual - ETAPA 3)
4. ✅ O que aparece nos logs do Railway? (ETAPA 4)
5. ✅ A URL da imagem abre no navegador? (ETAPA 5)
6. ✅ Há erros no console ou Network? (ETAPA 6)

Com essas informações, identifico exatamente onde está o problema!

