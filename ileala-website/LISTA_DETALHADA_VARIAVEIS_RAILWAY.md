# 📋 Lista Detalhada de Variáveis de Ambiente para Railway

Este documento lista TODAS as variáveis que você precisa adicionar no Railway, com explicações detalhadas de cada uma.

---

## 🔴 SEÇÃO 1: VARIÁVEIS CRÍTICAS (Obrigatórias)

**Sem essas variáveis, o site NÃO funcionará.**

### 1. `DATABASE_URL`
- **O que é:** Connection string do banco de dados PostgreSQL (Neon)
- **Onde encontrar:** 
  - Acesse [Neon Dashboard](https://console.neon.tech)
  - Vá em seu projeto → **Connection Details**
  - Copie a **Connection String**
- **Formato:** `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`
- **Exemplo:** `postgresql://user:pass123@ep-cool-darkness-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require`
- **Importante:** Use a mesma connection string que está no Vercel
- **Prioridade:** 🔴 CRÍTICA

### 2. `JWT_SECRET`
- **O que é:** Chave secreta para criptografar tokens JWT (autenticação)
- **Onde encontrar:** 
  - Use a MESMA chave que está no Vercel
  - Ou gere uma nova com: `openssl rand -base64 32`
- **Formato:** String aleatória com pelo menos 32 caracteres
- **Exemplo:** `aB3$kL9mN2pQ5rS8tU1vW4xY7zA0bC6dE9fG2hI5jK8lM1nO4pQ7rS0tU3vW6xY9zA`
- **Importante:** NUNCA compartilhe essa chave publicamente
- **Prioridade:** 🔴 CRÍTICA

### 3. `NODE_ENV`
- **O que é:** Define o ambiente de execução
- **Valor:** `production`
- **Onde encontrar:** Valor fixo, não precisa buscar
- **Prioridade:** 🔴 CRÍTICA

### 4. `PORT`
- **O que é:** Porta onde o servidor vai rodar
- **Valor:** `3000`
- **Onde encontrar:** Valor fixo (Railway pode injetar automaticamente, mas é bom definir)
- **Prioridade:** 🔴 CRÍTICA

---

## 🟡 SEÇÃO 2: VARIÁVEIS IMPORTANTES (Funcionalidades principais)

**Sem essas, funcionalidades específicas não funcionarão.**

### 5. `STRIPE_SECRET_KEY`
- **O que é:** Chave secreta da API do Stripe para processar pagamentos
- **Onde encontrar:**
  - Acesse [Stripe Dashboard](https://dashboard.stripe.com)
  - Vá em **Developers → API keys**
  - Copie a **Secret key** (começa com `sk_live_` ou `sk_test_`)
- **Formato:** `sk_live_...` (produção) ou `sk_test_...` (teste)
- **Exemplo:** `sk_live_51AbC123dEf456gHi789jKl012mNo345pQr678sTu901vWx234yZ567`
- **Importante:** Use `sk_live_` para produção, `sk_test_` apenas para testes
- **Prioridade:** 🟡 IMPORTANTE (se você tem pagamentos)

### 6. `STRIPE_WEBHOOK_SECRET`
- **O que é:** Secret para validar webhooks do Stripe
- **Onde encontrar:**
  - Stripe Dashboard → **Developers → Webhooks**
  - Clique no seu webhook endpoint
  - Copie o **Signing secret** (começa com `whsec_`)
- **Formato:** `whsec_...`
- **Exemplo:** `whsec_1234567890abcdefghijklmnopqrstuvwxyz`
- **Prioridade:** 🟡 IMPORTANTE (se você tem pagamentos)

### 7. `RESEND_API_KEY`
- **O que é:** Chave da API do Resend para enviar emails
- **Onde encontrar:**
  - Acesse [Resend Dashboard](https://resend.com/api-keys)
  - Vá em **API Keys**
  - Copie sua chave (começa com `re_`)
- **Formato:** `re_...`
- **Exemplo:** `re_1234567890abcdefghijklmnopqrstuvwxyz`
- **Prioridade:** 🟡 IMPORTANTE (se você envia emails)

### 8. `SITE_URL`
- **O que é:** URL base do site
- **Valor:** `https://ileala.ae`
- **Onde encontrar:** Valor fixo do seu domínio
- **Prioridade:** 🟡 IMPORTANTE

---

## 🟢 SEÇÃO 3: VARIÁVEIS FRONTEND (Build Time)

**Essas variáveis são usadas durante o BUILD do frontend. Todas começam com `VITE_`.**

### 9. `VITE_APP_TITLE`
- **O que é:** Título do aplicativo
- **Valor:** `Ile Ala`
- **Prioridade:** 🟢 FRONTEND

### 10. `VITE_APP_ID`
- **O que é:** ID único do aplicativo
- **Valor:** `ileala-prod`
- **Prioridade:** 🟢 FRONTEND

### 11. `VITE_APP_LOGO`
- **O que é:** URL do logo do site
- **Valor:** `https://ileala.ae/logo.png`
- **Nota:** Ajuste se o logo estiver em outro lugar
- **Prioridade:** 🟢 FRONTEND

### 12. `VITE_APP_URL`
- **O que é:** URL completa do site
- **Valor:** `https://www.ileala.ae`
- **Prioridade:** 🟢 FRONTEND

### 13. `VITE_SANITY_PROJECT_ID`
- **O que é:** ID do projeto Sanity CMS
- **Valor:** `anyz9zel`
- **Onde encontrar:** Sanity Dashboard → Project Settings
- **Prioridade:** 🟢 FRONTEND

### 14. `VITE_SANITY_DATASET`
- **O que é:** Dataset do Sanity (production, staging, etc)
- **Valor:** `production`
- **Prioridade:** 🟢 FRONTEND

### 15. `VITE_SANITY_TOKEN`
- **O que é:** Token de autenticação do Sanity (opcional)
- **Onde encontrar:**
  - Sanity Dashboard → **API → Tokens**
  - Crie um token com permissões de leitura
- **Formato:** String longa
- **Nota:** Opcional - apenas se precisar de operações autenticadas
- **Prioridade:** 🟢 FRONTEND (Opcional)

### 16. `VITE_SANITY_STUDIO_URL`
- **O que é:** URL do Sanity Studio
- **Valor:** `https://ileala.ae/studio`
- **Nota:** Ajuste se o Studio estiver em outro lugar
- **Prioridade:** 🟢 FRONTEND

### 17. `VITE_STRIPE_PUBLISHABLE_KEY`
- **O que é:** Chave pública do Stripe (para o frontend)
- **Onde encontrar:**
  - Stripe Dashboard → **Developers → API keys**
  - Copie a **Publishable key** (começa com `pk_live_` ou `pk_test_`)
- **Formato:** `pk_live_...` ou `pk_test_...`
- **Exemplo:** `pk_live_51AbC123dEf456gHi789jKl012mNo345pQr678sTu901vWx234yZ567`
- **Prioridade:** 🟢 FRONTEND (se você tem pagamentos)

### 18. `VITE_OAUTH_PORTAL_URL`
- **O que é:** URL do portal OAuth
- **Valor:** `https://placeholder.com`
- **Nota:** Valor temporário se você não usa OAuth completo
- **Prioridade:** 🟢 FRONTEND

### 19. `OAUTH_SERVER_URL`
- **O que é:** URL do servidor OAuth
- **Valor:** `https://placeholder.com`
- **Nota:** Valor temporário se você não usa OAuth completo
- **Prioridade:** 🟡 IMPORTANTE

### 20. `OWNER_OPEN_ID`
- **O que é:** OpenID do proprietário (para OAuth)
- **Valor:** (deixe vazio se não usar OAuth completo)
- **Onde encontrar:** Dashboard do seu provedor OAuth
- **Prioridade:** 🟡 IMPORTANTE (Opcional)

---

## 🔵 SEÇÃO 4: VARIÁVEIS OPCIONAIS (Funcionalidades específicas)

**Apenas adicione se você usar essas funcionalidades.**

### 21. `AWS_ACCESS_KEY_ID`
- **O que é:** Access Key da AWS para S3
- **Onde encontrar:**
  - AWS Console → **IAM → Users → Security credentials**
  - Crie uma Access Key
- **Formato:** `AKIA...`
- **Prioridade:** 🔵 OPCIONAL (apenas se usar S3)

### 22. `AWS_SECRET_ACCESS_KEY`
- **O que é:** Secret Key da AWS para S3
- **Onde encontrar:** Mesmo lugar da Access Key
- **Formato:** String longa
- **Prioridade:** 🔵 OPCIONAL (apenas se usar S3)

### 23. `AWS_REGION`
- **O que é:** Região do bucket S3
- **Valor:** `us-east-1` (ou sua região)
- **Prioridade:** 🔵 OPCIONAL (apenas se usar S3)

### 24. `AWS_S3_BUCKET`
- **O que é:** Nome do bucket S3
- **Valor:** `ileala-uploads` (ou seu bucket)
- **Prioridade:** 🔵 OPCIONAL (apenas se usar S3)

### 25. `BUILT_IN_FORGE_API_URL`
- **O que é:** URL da API Forge (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

### 26. `BUILT_IN_FORGE_API_KEY`
- **O que é:** Chave da API Forge (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

### 27. `VITE_FRONTEND_FORGE_API_URL`
- **O que é:** URL da API Forge para frontend (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

### 28. `VITE_FRONTEND_FORGE_API_KEY`
- **O que é:** Chave da API Forge para frontend (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

### 29. `VITE_ANALYTICS_ENDPOINT`
- **O que é:** Endpoint de analytics (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

### 30. `VITE_ANALYTICS_WEBSITE_ID`
- **O que é:** ID do site no analytics (se usar)
- **Valor:** (deixe vazio se não usar)
- **Prioridade:** 🔵 OPCIONAL

---

## 📝 RESUMO RÁPIDO - ORDEM DE PRIORIDADE

### ✅ ADICIONE PRIMEIRO (Críticas):
1. `DATABASE_URL` - Connection string do Neon
2. `JWT_SECRET` - Chave secreta JWT
3. `NODE_ENV` = `production`
4. `PORT` = `3000`

### ✅ ADICIONE DEPOIS (Importantes):
5. `STRIPE_SECRET_KEY` - Se você tem pagamentos
6. `STRIPE_WEBHOOK_SECRET` - Se você tem pagamentos
7. `RESEND_API_KEY` - Se você envia emails
8. `SITE_URL` = `https://ileala.ae`

### ✅ ADICIONE TAMBÉM (Frontend):
9-19. Todas as variáveis `VITE_*` listadas acima

### ⚠️ ADICIONE SE PRECISAR (Opcionais):
20-30. Variáveis opcionais conforme você usa as funcionalidades

---

## 🎯 COMO ADICIONAR NO RAILWAY

1. Acesse [Railway Dashboard](https://railway.app)
2. Vá em seu projeto → **Settings → Variables**
3. Para cada variável:
   - Clique em **"New Variable"**
   - **Name:** Cole o nome (ex: `DATABASE_URL`)
   - **Value:** Cole o valor (ex: sua connection string)
   - Clique em **"Add"**
4. Repita para todas as variáveis

---

## 💡 DICA: ONDE ENCONTRAR OS VALORES NO VERCEL

Se você já tem as variáveis no Vercel, pode copiar de lá:

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Vá em seu projeto → **Settings → Environment Variables**
3. Copie cada variável e cole no Railway

---

## ✅ CHECKLIST FINAL

Após adicionar todas as variáveis:

- [ ] Todas as variáveis CRÍTICAS foram adicionadas
- [ ] Todas as variáveis IMPORTANTES foram adicionadas (se aplicável)
- [ ] Todas as variáveis FRONTEND foram adicionadas
- [ ] Valores estão corretos (sem espaços extras)
- [ ] Testei o deploy e o site está funcionando

---

**Última atualização:** Janeiro 2025

