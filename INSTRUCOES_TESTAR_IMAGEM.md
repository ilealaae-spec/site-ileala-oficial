# 📸 Instruções para Testar Upload de Imagem

## ✅ Correções Aplicadas:
1. ✅ `imageUrl` agora é explicitamente incluído no `updateData` e `createData`
2. ✅ `formData` é atualizado com `imageUrl` após upload bem-sucedido
3. ✅ Logs detalhados para rastrear `imageUrl` em todas as etapas

---

## 🧪 TESTE 1: Adicionar Imagem em Produto Existente

### Passos:
1. **Aguarde o deploy** no Railway (2-3 minutos)
2. **Recarregue a página** do admin (`ileala.ae/admin`)
3. **Edite um produto** que não tem imagem (ex: "Picnic Dress" ou "BlackDress")
4. **Clique na aba "Imagens"** no modal de edição
5. **Faça upload de uma imagem**:
   - Clique em "Upload" ou selecione um arquivo
   - Aguarde o upload completar
6. **Clique em "Salvar Produto"** (ou "Atualizar")
7. **Verifique no console** (F12 → Console):
   - Deve aparecer: `[Admin] Image uploaded successfully:`
   - Deve aparecer: `[Admin] Image URL:` com a URL do S3
   - Deve aparecer: `[Admin] Calling updateMutation.mutate with:` com `imageUrlIncluded: true`

### Verificar no Banco (Neon SQL Editor):
Execute esta query:

```sql
SELECT 
  id,
  name,
  "nameEN",
  "imageUrl",
  LENGTH("imageUrl") as url_length,
  "updatedAt"
FROM products
WHERE "nameEN" ILIKE '%dress%' OR "nameEN" ILIKE '%pet%'
ORDER BY "updatedAt" DESC
LIMIT 5;
```

**Verifique:**
- O campo `imageUrl` está preenchido?
- A URL começa com `https://ileala-uploads.s3`?
- O `updatedAt` é recente (últimos minutos)?

---

## 🧪 TESTE 2: Verificar no Site Público

### Passos:
1. **Aguarde 1-2 minutos** após salvar o produto (para cache invalidar)
2. **Vá para o site público**: `ileala.ae/pet-collection`
3. **Recarregue a página** (Ctrl+F5 ou Cmd+Shift+R para forçar reload)
4. **Verifique se a imagem aparece** no produto

### Se a imagem ainda não aparecer:
1. **Abra o Console** (F12 → Console)
2. **Procure por erros** relacionados a imagens
3. **Verifique a Network tab**:
   - Filtre por "images" ou o nome do arquivo
   - Veja se a requisição da imagem retorna 200 ou erro 404/403

---

## 🧪 TESTE 3: Verificar Logs do Railway

### No Railway:
1. Railway → `ileala-admin` → Deploy Logs
2. **Filtre por "image"** ou "upload" ou "S3"
3. **Procure por mensagens** como:
   - `[Admin] Image uploaded successfully:`
   - `[S3] Upload successful!`
   - `[Admin.Products.Update] Product updated, verification:`
   - `[Admin] WARNING: imageUrl mismatch!` (se aparecer, há problema)

**Me envie:**
- Aparecem logs de upload de imagem?
- Aparece algum erro?
- O que aparece na verificação após update?

---

## 🚨 Se a Imagem Ainda Não Aparecer:

### Verificar no Banco:
Execute esta query para ver o produto específico:

```sql
SELECT 
  id,
  name,
  "nameEN",
  "slug",
  "imageUrl",
  active,
  "updatedAt"
FROM products
WHERE id = [ID_DO_PRODUTO]  -- Substitua pelo ID do produto
```

**Me envie:**
- O `imageUrl` está preenchido?
- Qual é o valor do `imageUrl`? (pode mascarar parte da URL)
- O `active` está como `1`?

### Verificar URL da Imagem:
1. **Copie a URL** do campo `imageUrl` do banco
2. **Cole no navegador** e pressione Enter
3. **A imagem abre?** Se não, pode ser problema de permissões do S3

---

## 📋 Resumo do que preciso:

1. ✅ A imagem foi enviada com sucesso? (console do navegador)
2. ✅ O `imageUrl` está salvo no banco? (query SQL)
3. ✅ A imagem aparece no site público? (teste visual)
4. ✅ Há erros no console ou Network? (DevTools)
5. ✅ O que aparece nos logs do Railway? (filtro por "image")

Com essas informações, identifico exatamente onde está o problema!

