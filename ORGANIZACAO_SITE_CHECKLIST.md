# 📋 Checklist de Organização do Site

## ✅ Problemas Corrigidos

### 1. Preços Errados
- ✅ **CategoryPage.tsx** - Corrigido para converter de fils para AED
- ✅ **Todas as outras páginas** - Já estavam convertendo corretamente

### 2. Menu Duplicado
- ✅ **Header.tsx** - Adicionada verificação para evitar duplicação
- ⚠️ **Nota**: O menu mostra `/collections` (página de apresentação) E categorias do banco (dinâmicas)
- 💡 **Solução**: Se quiser remover a duplicação, escolha uma opção:
  - **Opção A**: Remover link fixo "Collections" e manter apenas categorias dinâmicas
  - **Opção B**: Manter "Collections" e remover categorias dinâmicas do menu (mostrar em dropdown)

### 3. Produtos Inativos
- ✅ **getProductsByCollection** - Agora filtra apenas produtos ativos (`active = 1`)
- ✅ **getProductsByCategory** - Agora filtra apenas produtos ativos (`active = 1`)

## 🔍 Verificações Necessárias

### 1. Integração com Painel Admin

**Como verificar:**
1. Acesse `admin.ileala.ae`
2. Crie um produto novo no painel admin
3. Verifique se aparece no site público (`www.ileala.ae`)

**O que verificar:**
- ✅ Produto aparece na lista de produtos (`/shop`)
- ✅ Produto aparece na coleção correta (`/collections/la-mer`)
- ✅ Produto aparece na categoria correta (`/category/...`)
- ✅ Preço está correto (convertido de fils para AED)
- ✅ Imagem aparece corretamente

### 2. Coleções

**Problema relatado:** "La Mer tem um produto e página está trocada"

**Como verificar:**
1. Acesse `/collections/la-mer`
2. Verifique se produtos aparecem corretamente
3. Verifique se o nome da coleção está correto

**Possíveis causas:**
- Nome da coleção no banco não corresponde ao slug (`la-mer` → `La Mer`)
- Produtos não têm `collection` definido corretamente no banco
- Cache ainda ativo

### 3. Napkin Rings

**Problema relatado:** "Produtos napkin rings sumiram"

**Como verificar:**
1. Acesse `/napkin-rings`
2. Verifique se produtos aparecem
3. Verifique no painel admin se há produtos com `collection = "Napkin Rings"`

**Possíveis causas:**
- Produtos não têm `collection` definido como "Napkin Rings"
- Produtos estão inativos (`active = 0`)
- Cache ainda ativo

### 4. Pet Collection

**Problema relatado:** "Pet collection apareceu mas não está correto"

**Como verificar:**
1. Acesse `/pet-collection`
2. Verifique se produtos aparecem
3. Verifique no painel admin se há produtos com `category = "pet-collection"`

**Possíveis causas:**
- Produtos não têm `category` definido como "pet-collection"
- Produtos estão inativos
- Cache ainda ativo

## 🛠️ Próximos Passos

### 1. Limpar Cache
Após o deploy:
- Limpar cache do navegador (Ctrl+Shift+Delete)
- Ou usar modo anônimo

### 2. Verificar Dados no Banco

**No painel admin (`admin.ileala.ae`):**
1. Verificar produtos:
   - Todos têm `collection` definido?
   - Todos têm `category` definido?
   - Todos estão `active = 1`?
   - Preços estão em fils (ex: 36000 = 360 AED)?

2. Verificar categorias:
   - Categorias estão `active = 1`?
   - Slugs estão corretos?

### 3. Organizar Menu

**Decisão necessária:**
- Manter `/collections` fixo no menu?
- Ou remover e mostrar apenas categorias dinâmicas?

**Recomendação:**
- Manter `/collections` como página de apresentação das coleções
- Mostrar categorias dinâmicas do banco no menu
- Se houver duplicação, criar dropdown "Collections" com submenu

## 📝 Notas Importantes

1. **Preços no Banco**: Sempre em **fils** (1 AED = 100 fils)
   - Exemplo: 360 AED = 36000 fils no banco

2. **Produtos Ativos**: Apenas produtos com `active = 1` aparecem no site público

3. **Cache**: Pode levar alguns minutos para atualizar após mudanças no admin

4. **Integração Admin**: Produtos criados no admin aparecem imediatamente no site (se `active = 1`)

## 🆘 Se Problemas Persistirem

1. **Verificar logs do Railway:**
   - Railway Dashboard → `ileala-website` → Deploy Logs
   - Verificar erros

2. **Verificar console do navegador:**
   - F12 → Console
   - Verificar erros de API

3. **Verificar dados no banco:**
   - Painel admin → Produtos
   - Verificar se dados estão corretos

4. **Limpar cache:**
   - Limpar cache do navegador
   - Limpar cache do Railway (se possível)

