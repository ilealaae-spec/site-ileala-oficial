# ✅ CHECKLIST PRÉ-DEPLOY - Migração Sanity → PostgreSQL

**Data:** 23 de Novembro de 2025  
**Status:** ✅ PRONTO PARA DEPLOY

---

## ✅ VERIFICAÇÕES FINAIS

### 1. Código Migrado ✅
- [x] Shop.tsx - migrado para tRPC
- [x] CollectionPage.tsx - migrado para tRPC
- [x] PetCollection.tsx - migrado para tRPC
- [x] Accessories.tsx - migrado para tRPC
- [x] NapkinRings.tsx - migrado para tRPC
- [x] TableEssentials.tsx - migrado para tRPC
- [x] HomeAccents.tsx - migrado para tRPC
- [x] SanityProducts.tsx - migrado para tRPC
- [x] SanityProductDetail.tsx - migrado para tRPC
- [x] SanityCart.tsx - migrado para usar carrinho do banco
- [x] ProductDetail.tsx - já estava usando tRPC

### 2. Configurações ✅
- [x] Dockerfile - Node.js 20.12.0 configurado
- [x] nixpacks.toml - atualizado
- [x] railway.json - configurado para usar Dockerfile
- [x] package.json - dependências corretas

### 3. Backend tRPC ✅
- [x] products.list - funcionando
- [x] products.bySlug - funcionando
- [x] products.byCollection - funcionando
- [x] cart.items - funcionando
- [x] cart.add - funcionando
- [x] cart.remove - funcionando
- [x] cart.update - funcionando
- [x] orders.create - funcionando
- [x] payment.createCheckoutSession - funcionando

---

## 🚀 INSTRUÇÕES PARA DEPLOY NO RAILWAY

### PASSO 1: Verificar Variáveis de Ambiente

No Railway Dashboard → Service `ileala-website` → Variables:

**Obrigatórias:**
- ✅ `DATABASE_URL` - PostgreSQL (Neon)
- ✅ `STRIPE_SECRET_KEY` - Chave secreta do Stripe
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook secret do Stripe
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Chave pública do Stripe
- ✅ `VITE_APP_URL` - URL do site (https://www.ileala.ae)
- ✅ `NODE_ENV=production`

**Opcionais (mas recomendadas):**
- `RESEND_API_KEY` - Para emails
- `CLOUDINARY_URL` - Para upload de imagens
- Outras variáveis específicas do seu setup

### PASSO 2: Limpar Cache do Build

1. Railway Dashboard → Service `ileala-website`
2. Settings → Build Settings
3. **Clear Build Cache**
4. Confirme a ação

### PASSO 3: Verificar Branch e Watch Paths

1. Railway Dashboard → Service `ileala-website`
2. Settings → Source
3. Verificar:
   - ✅ Branch: `main` (ou branch correto)
   - ✅ Watch Paths: **DEIXAR VAZIO** (ou configurar para `ileala-website/**`)

### PASSO 4: Fazer Deploy

**Opção A: Deploy Automático (Recomendado)**
1. Faça commit e push das mudanças:
   ```bash
   git add .
   git commit -m "Migração completa Sanity → PostgreSQL"
   git push origin main
   ```
2. O Railway deve detectar automaticamente e iniciar deploy

**Opção B: Deploy Manual**
1. Railway Dashboard → Service `ileala-website`
2. Deployments → **Deploy** → **Redeploy**
3. Selecionar commit mais recente
4. Aguardar build completar

### PASSO 5: Monitorar Deploy

1. Railway Dashboard → Deployments
2. Clicar no deploy em andamento
3. Verificar logs:
   - ✅ Build iniciado
   - ✅ Dependências instaladas
   - ✅ Build do Vite completado
   - ✅ Servidor iniciado
   - ❌ Sem erros

### PASSO 6: Verificar se Funcionou

Após deploy completar:

1. **Acessar site:** https://www.ileala.ae
2. **Verificar console do navegador (F12):**
   - ❌ Sem erros relacionados ao Sanity
   - ✅ Requisições para `/api/trpc/products.list`
3. **Testar funcionalidades:**
   - ✅ Página `/shop` mostra produtos
   - ✅ Página `/collections/:slug` mostra produtos
   - ✅ Página de produto individual funciona
   - ✅ Adicionar ao carrinho funciona
   - ✅ Carrinho mostra itens
   - ✅ Checkout funciona

---

## 🔍 TROUBLESHOOTING

### Se o deploy falhar:

1. **Verificar logs do build:**
   - Railway Dashboard → Deployments → Último deploy → Logs
   - Procurar por erros de compilação

2. **Erro comum: "crypto.hash is not a function"**
   - ✅ Já corrigido no Dockerfile (Node.js 20.12.0)
   - Se ainda ocorrer, limpar cache e fazer redeploy

3. **Erro: "Module not found"**
   - Verificar se todas as dependências estão no `package.json`
   - Limpar `node_modules` e reinstalar

4. **Site não atualiza:**
   - Limpar cache do navegador (Ctrl+Shift+R)
   - Verificar se deploy foi bem-sucedido
   - Verificar se variáveis de ambiente estão corretas

### Se produtos não aparecem:

1. **Verificar banco de dados:**
   - Conectar ao Neon PostgreSQL
   - Verificar se tabela `products` tem dados
   - Verificar se `active = 1` nos produtos

2. **Verificar tRPC:**
   - DevTools → Network → Procurar por `/api/trpc/products.list`
   - Verificar resposta da API

3. **Verificar variáveis de ambiente:**
   - `DATABASE_URL` está configurada?
   - URL está correta?

---

## 📋 CHECKLIST PÓS-DEPLOY

Após deploy bem-sucedido, verificar:

- [ ] Site carrega sem erros
- [ ] Produtos aparecem em `/shop`
- [ ] Produtos aparecem em `/collections/:slug`
- [ ] Página de produto individual funciona
- [ ] Imagens do Cloudinary aparecem
- [ ] Adicionar ao carrinho funciona
- [ ] Carrinho mostra itens corretos
- [ ] Checkout funciona
- [ ] Stripe checkout redireciona corretamente
- [ ] Sem erros no console do navegador
- [ ] Sem referências ao Sanity no código

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. **Testar todas as funcionalidades**
2. **Verificar performance**
3. **Monitorar logs por erros**
4. **Remover código antigo do Sanity (opcional)**
5. **Atualizar documentação**

---

**Status:** ✅ PRONTO PARA DEPLOY  
**Última atualização:** 23 de Novembro de 2025

