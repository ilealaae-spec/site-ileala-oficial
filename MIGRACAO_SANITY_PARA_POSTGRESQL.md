# 🚀 Migração Sanity → PostgreSQL - Status e Próximos Passos

**Data:** 23 de Novembro de 2025  
**Status:** Em Progresso ✅

---

## ✅ O QUE JÁ FOI MIGRADO

### 1. Shop.tsx ✅
- **Antes:** Buscava produtos do Sanity CMS
- **Agora:** Usa `trpc.products.list.useQuery()` para buscar do PostgreSQL
- **Mudanças:**
  - Removidas importações do Sanity
  - Adaptado para usar estrutura de dados do PostgreSQL
  - Preço convertido de fils para AED (1 AED = 100 fils)
  - Suporte a múltiplos idiomas (nameEN, namePT, descriptionEN, descriptionPT)
  - Links atualizados para `/shop/:slug` ao invés de `/sanity-products/:slug`

### 2. CollectionPage.tsx ✅
- **Antes:** Buscava produtos do Sanity e filtrava por coleção
- **Agora:** Usa `trpc.products.byCollection.useQuery()` para buscar do PostgreSQL
- **Mudanças:**
  - Removidas importações do Sanity
  - Conversão de slug para nome de coleção ("la-mer" → "La Mer")
  - Adaptado para estrutura de dados do PostgreSQL
  - Links atualizados para `/shop/:slug`

### 3. ProductDetail.tsx ✅
- **Status:** JÁ ESTAVA usando tRPC!
- Usa `trpc.products.bySlug.useQuery()` e `trpc.products.byId.useQuery()`
- Funciona com rotas `/shop/:slug` e `/product/:id`

---

## ⚠️ O QUE AINDA PRECISA SER MIGRADO

### 1. Páginas de Coleção Específicas
Estas páginas ainda podem estar usando Sanity:
- `PetCollection.tsx`
- `Accessories.tsx`
- `NapkinRings.tsx`
- `TableEssentials.tsx`
- `HomeAccents.tsx`

**Ação necessária:** Verificar cada uma e migrar para usar `trpc.products.byCollection.useQuery()` ou `trpc.products.list.useQuery()` com filtro.

### 2. SanityProducts.tsx e SanityProductDetail.tsx
- Estas páginas ainda usam Sanity
- **Decisão:** Manter para compatibilidade ou remover completamente?

### 3. SanityCart.tsx
- Pode estar usando produtos do Sanity
- **Ação:** Verificar e migrar para usar carrinho do banco de dados

### 4. Referências ao Sanity no código
- `client/src/lib/sanity.ts` - ainda existe
- `client/src/components/SanityVisualEditing.tsx` - componente de visual editing
- Importações do Sanity em vários arquivos

**Ação:** Decidir se vamos:
- **Opção A:** Remover completamente (recomendado)
- **Opção B:** Manter para compatibilidade temporária

---

## 🔧 CONFIGURAÇÕES DO RAILWAY

### Dockerfile ✅
- **Status:** Configurado corretamente
- **Node.js:** 20.12.0 (corrige erro `crypto.hash`)
- **Builder:** DOCKERFILE (configurado em railway.json)

### nixpacks.toml ✅
- **Status:** Atualizado (mas não será usado se Dockerfile estiver presente)
- **Node.js:** nodejs_20 (com variável NODE_VERSION = "20.12.0")

### railway.json ✅
- **Status:** Configurado para usar DOCKERFILE
- **Restart Policy:** ON_FAILURE (10 retries)

---

## 🚨 PROBLEMA PRINCIPAL: DEPLOYMENT NO RAILWAY

### Situação Atual:
- ❌ Railway não está fazendo deploy do código novo
- ❌ Watch Paths não está funcionando
- ❌ Site público ainda mostra código antigo do Sanity

### Possíveis Causas:
1. **Watch Paths configurado incorretamente**
   - Railway pode estar monitorando apenas certas pastas
   - Solução: Remover Watch Paths ou configurar para monitorar tudo

2. **Cache do build**
   - Railway pode estar usando cache antigo
   - Solução: Limpar cache do build no Railway Dashboard

3. **Branch incorreto**
   - Railway pode estar deployando branch errado
   - Solução: Verificar qual branch está configurado

4. **Webhook do GitHub não funcionando**
   - Railway pode não estar recebendo notificações do GitHub
   - Solução: Verificar webhooks no GitHub e reconectar repositório

### Ações Recomendadas (URGENTE):

1. **No Railway Dashboard:**
   - Ir em Settings → Clear Build Cache
   - Verificar qual branch está configurado
   - Verificar Watch Paths (remover se necessário)
   - Fazer Deploy Manual → Redeploy

2. **No GitHub:**
   - Verificar se commits estão sendo feitos
   - Verificar webhooks (Settings → Webhooks)
   - Fazer um commit de teste para forçar deploy

3. **Verificar Logs:**
   - Railway Dashboard → Deployments → Ver logs do último deploy
   - Verificar se há erros de build

---

## 📋 CHECKLIST DE MIGRAÇÃO

### Frontend (Páginas)
- [x] Shop.tsx
- [x] CollectionPage.tsx
- [x] ProductDetail.tsx (já estava OK)
- [ ] PetCollection.tsx
- [ ] Accessories.tsx
- [ ] NapkinRings.tsx
- [ ] TableEssentials.tsx
- [ ] HomeAccents.tsx
- [ ] SanityProducts.tsx (decidir: remover ou manter)
- [ ] SanityProductDetail.tsx (decidir: remover ou manter)
- [ ] SanityCart.tsx

### Backend (tRPC)
- [x] products.list ✅
- [x] products.featured ✅
- [x] products.byId ✅
- [x] products.bySlug ✅
- [x] products.byCollection ✅

### Configurações
- [x] Dockerfile (Node.js 20.12.0) ✅
- [x] nixpacks.toml ✅
- [x] railway.json ✅
- [ ] Variáveis de ambiente no Railway
- [ ] Watch Paths (remover ou corrigir)

### Limpeza
- [ ] Remover importações do Sanity
- [ ] Remover `client/src/lib/sanity.ts` (ou manter para compatibilidade)
- [ ] Remover `SanityVisualEditing.tsx` (ou manter)
- [ ] Atualizar rotas no App.tsx se necessário

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Curto Prazo (HOJE):
1. ✅ Migrar Shop.tsx e CollectionPage.tsx (FEITO)
2. 🚨 **Resolver problema de deployment no Railway** (URGENTE)
3. 🚨 **Testar se produtos aparecem no site público** (URGENTE)
4. Verificar outras páginas de coleção

### Médio Prazo (Esta Semana):
1. Migrar páginas de coleção restantes
2. Decidir sobre SanityProducts.tsx e SanityProductDetail.tsx
3. Remover referências ao Sanity (ou manter para compatibilidade)
4. Testar carrinho de compras
5. Testar checkout com Stripe

### Longo Prazo:
1. Otimizar performance
2. Revisar segurança
3. Testar responsividade
4. Documentação completa

---

## 📝 NOTAS TÉCNICAS

### Estrutura de Dados

**Sanity (antigo):**
```typescript
{
  _id: string;
  name: string;
  slug: { current: string };
  price: number; // em AED
  mainImage: { asset: { _ref: string } };
}
```

**PostgreSQL (novo):**
```typescript
{
  id: number;
  slug: string;
  name: string;
  nameEN: string;
  namePT: string;
  price: number; // em fils (1 AED = 100 fils)
  imageUrl: string; // URL do Cloudinary
  collection: string;
  category: string;
  stock: number;
  featured: 0 | 1;
  active: 0 | 1;
}
```

### Conversões Necessárias

1. **Preço:** `priceInAED = priceInFils / 100`
2. **Slug:** `product.slug` (string direta, não `slug.current`)
3. **ID:** `String(product.id)` (número → string)
4. **Imagem:** `product.imageUrl` (URL direta do Cloudinary)
5. **Nome:** Usar `getProductName()` para suportar múltiplos idiomas

---

## 🔗 LINKS ÚTEIS

- Railway Dashboard: https://railway.app
- Neon Database: https://neon.tech
- Cloudinary: https://cloudinary.com
- GitHub Repository: (verificar URL)

---

**Última atualização:** 23 de Novembro de 2025

