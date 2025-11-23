# 🔍 Verificação Completa de Variáveis de Ambiente

**Data:** 23 de Novembro de 2025  
**Objetivo:** Verificar se todas as variáveis estão completas e corretas no Railway

---

## 📋 Passo 1: Variáveis Críticas (Obrigatórias)

**Sem essas, o servidor NÃO inicia.**

### ✅ 1.1 `DATABASE_URL`
- **Status:** 🔴 CRÍTICA
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Começa com `postgresql://`?
  - [ ] Contém `@` (separador de credenciais)?
  - [ ] Termina com `?sslmode=require`?
  - [ ] Não tem espaços extras no início/fim?
- **Onde encontrar valor:**
  - Neon Dashboard → Projeto → Connection Details → Connection String
- **Ação:** Se não existe ou está incorreta, adicionar/corrigir

### ✅ 1.2 `JWT_SECRET`
- **Status:** 🔴 CRÍTICA
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** String aleatória com pelo menos 32 caracteres
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Tem pelo menos 32 caracteres?
  - [ ] Não é um valor placeholder (ex: `your_secret_here`)?
  - [ ] Não tem espaços extras?
- **Como gerar (se necessário):**
  ```bash
  openssl rand -base64 32
  ```
- **Ação:** Se não existe ou é fraca, gerar nova chave

### ✅ 1.3 `NODE_ENV`
- **Status:** 🔴 CRÍTICA
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `production`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é exatamente `production` (minúsculo)?
  - [ ] Não tem espaços extras?
- **Ação:** Se não existe, adicionar com valor `production`

### ✅ 1.4 `PORT`
- **Status:** 🔴 CRÍTICA (mas Railway pode injetar automaticamente)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `3000`
- **Como verificar:**
  - [ ] Variável existe no Railway? (opcional, Railway pode injetar)
  - [ ] Se existe, valor é `3000`?
- **Ação:** Se não existe, pode deixar (Railway injeta automaticamente) ou adicionar `3000`

---

## 📋 Passo 2: Variáveis Importantes (Funcionalidades)

**Sem essas, funcionalidades específicas não funcionam.**

### ✅ 2.1 `STRIPE_SECRET_KEY`
- **Status:** 🟡 IMPORTANTE (se você tem pagamentos)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** `sk_live_...` (produção) ou `sk_test_...` (teste)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Começa com `sk_live_` ou `sk_test_`?
  - [ ] Tem pelo menos 50 caracteres?
  - [ ] Não tem espaços extras?
- **Onde encontrar valor:**
  - Stripe Dashboard → Developers → API keys → Secret key
- **Ação:** Se não existe e você tem pagamentos, adicionar

### ✅ 2.2 `STRIPE_WEBHOOK_SECRET`
- **Status:** 🟡 IMPORTANTE (se você tem pagamentos)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** `whsec_...`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Começa com `whsec_`?
  - [ ] Tem pelo menos 30 caracteres?
  - [ ] Não tem espaços extras?
- **Onde encontrar valor:**
  - Stripe Dashboard → Developers → Webhooks → Seu endpoint → Signing secret
- **Ação:** Se não existe e você tem pagamentos, adicionar

### ✅ 2.3 `RESEND_API_KEY`
- **Status:** 🟡 IMPORTANTE (se você envia emails)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** `re_...`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Começa com `re_`?
  - [ ] Tem pelo menos 30 caracteres?
  - [ ] Não tem espaços extras?
- **Onde encontrar valor:**
  - Resend Dashboard → API Keys → Sua chave
- **Ação:** Se não existe e você envia emails, adicionar

### ✅ 2.4 `SITE_URL`
- **Status:** 🟡 IMPORTANTE
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://www.ileala.ae` (com www)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `https://www.ileala.ae`?
  - [ ] Começa com `https://`?
  - [ ] Não termina com `/`?
  - [ ] Não tem espaços extras?
- **Ação:** Se não existe ou está incorreta, adicionar/corrigir

### ✅ 2.5 `GOOGLE_CLIENT_ID`
- **Status:** 🟡 IMPORTANTE (se você tem login Google)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** String longa (Google OAuth Client ID)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Não está vazia?
  - [ ] Não tem espaços extras?
- **Onde encontrar valor:**
  - Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
- **Ação:** Se não existe e você tem login Google, adicionar

### ✅ 2.6 `GOOGLE_CLIENT_SECRET`
- **Status:** 🟡 IMPORTANTE (se você tem login Google)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** String longa (Google OAuth Client Secret)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Não está vazia?
  - [ ] Não tem espaços extras?
- **Onde encontrar valor:**
  - Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client Secret
- **Ação:** Se não existe e você tem login Google, adicionar

---

## 📋 Passo 3: Variáveis Frontend (Build Time)

**Essas variáveis são usadas durante o BUILD. Todas começam com `VITE_`.**

### ✅ 3.1 `VITE_APP_TITLE`
- **Status:** 🟢 FRONTEND
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `Ile Ala`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `Ile Ala`?
- **Ação:** Se não existe, adicionar

### ✅ 3.2 `VITE_APP_ID`
- **Status:** 🟢 FRONTEND
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `ileala-prod`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `ileala-prod`?
- **Ação:** Se não existe, adicionar

### ✅ 3.3 `VITE_APP_LOGO`
- **Status:** 🟢 FRONTEND (Opcional)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://www.ileala.ae/logo.png` (ou URL do seu logo)
- **Como verificar:**
  - [ ] Variável existe no Railway? (opcional)
  - [ ] Se existe, URL é válida?
- **Ação:** Se não existe, pode adicionar ou deixar vazio

### ✅ 3.4 `VITE_APP_URL`
- **Status:** 🟢 FRONTEND
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://www.ileala.ae`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `https://www.ileala.ae`?
- **Ação:** Se não existe, adicionar

### ✅ 3.5 `VITE_SANITY_PROJECT_ID`
- **Status:** 🟢 FRONTEND
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `anyz9zel`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `anyz9zel`?
- **Onde encontrar valor:**
  - Sanity Dashboard → Project Settings → Project ID
- **Ação:** Se não existe ou está incorreta, adicionar/corrigir

### ✅ 3.6 `VITE_SANITY_DATASET`
- **Status:** 🟢 FRONTEND
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `production`
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é `production`?
- **Ação:** Se não existe, adicionar

### ✅ 3.7 `VITE_SANITY_TOKEN`
- **Status:** 🟢 FRONTEND (Opcional)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** String longa (token do Sanity)
- **Como verificar:**
  - [ ] Variável existe no Railway? (opcional)
  - [ ] Se existe, não está vazia?
- **Onde encontrar valor:**
  - Sanity Dashboard → API → Tokens → Criar token com permissões de leitura
- **Ação:** Se não existe, pode deixar vazio (não é obrigatório)

### ✅ 3.8 `VITE_SANITY_STUDIO_URL`
- **Status:** 🟢 FRONTEND (Opcional)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://www.ileala.ae/studio` (ou URL do seu Sanity Studio)
- **Como verificar:**
  - [ ] Variável existe no Railway? (opcional)
  - [ ] Se existe, URL é válida?
- **Ação:** Se não existe, pode adicionar ou deixar vazio

### ✅ 3.9 `VITE_STRIPE_PUBLISHABLE_KEY`
- **Status:** 🟢 FRONTEND (se você tem pagamentos)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** `pk_live_...` (produção) ou `pk_test_...` (teste)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Começa com `pk_live_` ou `pk_test_`?
  - [ ] Tem pelo menos 50 caracteres?
- **Onde encontrar valor:**
  - Stripe Dashboard → Developers → API keys → Publishable key
- **Ação:** Se não existe e você tem pagamentos, adicionar

### ✅ 3.10 `VITE_GOOGLE_CLIENT_ID`
- **Status:** 🟢 FRONTEND (se você tem login Google)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Formato esperado:** String longa (mesmo valor de `GOOGLE_CLIENT_ID`)
- **Como verificar:**
  - [ ] Variável existe no Railway?
  - [ ] Valor é igual a `GOOGLE_CLIENT_ID`?
- **Ação:** Se não existe e você tem login Google, adicionar (mesmo valor de `GOOGLE_CLIENT_ID`)

### ✅ 3.11 `VITE_OAUTH_PORTAL_URL`
- **Status:** 🟢 FRONTEND (Opcional)
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://placeholder.com` (ou URL real se você usa OAuth completo)
- **Como verificar:**
  - [ ] Variável existe no Railway? (opcional)
  - [ ] Se existe, URL é válida?
- **Ação:** Se não existe, pode adicionar `https://placeholder.com` ou deixar vazio

---

## 📋 Passo 4: Variáveis Opcionais (Funcionalidades Específicas)

**Apenas adicione se você usa essas funcionalidades.**

### ✅ 4.1 `OAUTH_SERVER_URL`
- **Status:** 🔵 OPCIONAL
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `https://placeholder.com` (ou URL real)
- **Ação:** Se não usa OAuth completo, pode deixar vazio ou adicionar placeholder

### ✅ 4.2 `OWNER_OPEN_ID`
- **Status:** 🔵 OPCIONAL
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Ação:** Se não usa OAuth completo, pode deixar vazio

### ✅ 4.3 `VITE_APP_ID` (Backend)
- **Status:** 🔵 OPCIONAL
- **Onde verificar:** Railway Dashboard → Settings → Variables
- **Valor esperado:** `ileala-prod` (mesmo valor de `VITE_APP_ID` frontend)
- **Ação:** Se não existe, pode adicionar (mesmo valor de `VITE_APP_ID`)

### ✅ 4.4 `BUILT_IN_FORGE_API_URL`
- **Status:** 🔵 OPCIONAL
- **Ação:** Se não usa Forge, deixar vazio

### ✅ 4.5 `BUILT_IN_FORGE_API_KEY`
- **Status:** 🔵 OPCIONAL
- **Ação:** Se não usa Forge, deixar vazio

### ✅ 4.6 `AWS_ACCESS_KEY_ID`
- **Status:** 🔵 OPCIONAL (se você usa S3 para uploads)
- **Ação:** Se não usa S3, deixar vazio

### ✅ 4.7 `AWS_SECRET_ACCESS_KEY`
- **Status:** 🔵 OPCIONAL (se você usa S3 para uploads)
- **Ação:** Se não usa S3, deixar vazio

### ✅ 4.8 `AWS_REGION`
- **Status:** 🔵 OPCIONAL (se você usa S3 para uploads)
- **Ação:** Se não usa S3, deixar vazio

### ✅ 4.9 `AWS_S3_BUCKET`
- **Status:** 🔵 OPCIONAL (se você usa S3 para uploads)
- **Ação:** Se não usa S3, deixar vazio

---

## 📊 Resumo de Verificação

### ✅ Checklist Final

#### 🔴 Críticas (Obrigatórias)
- [ ] `DATABASE_URL` - ✅ Configurada e correta
- [ ] `JWT_SECRET` - ✅ Configurada e forte (32+ caracteres)
- [ ] `NODE_ENV` - ✅ Configurada como `production`
- [ ] `PORT` - ✅ Configurada ou Railway injeta automaticamente

#### 🟡 Importantes (Funcionalidades)
- [ ] `STRIPE_SECRET_KEY` - ⚠️ Verificar se você tem pagamentos
- [ ] `STRIPE_WEBHOOK_SECRET` - ⚠️ Verificar se você tem pagamentos
- [ ] `RESEND_API_KEY` - ⚠️ Verificar se você envia emails
- [ ] `SITE_URL` - ✅ Deve ser `https://www.ileala.ae`
- [ ] `GOOGLE_CLIENT_ID` - ⚠️ Verificar se você tem login Google
- [ ] `GOOGLE_CLIENT_SECRET` - ⚠️ Verificar se você tem login Google

#### 🟢 Frontend (Build Time)
- [ ] `VITE_APP_TITLE` - ✅ Deve ser `Ile Ala`
- [ ] `VITE_APP_ID` - ✅ Deve ser `ileala-prod`
- [ ] `VITE_APP_URL` - ✅ Deve ser `https://www.ileala.ae`
- [ ] `VITE_SANITY_PROJECT_ID` - ✅ Deve ser `anyz9zel`
- [ ] `VITE_SANITY_DATASET` - ✅ Deve ser `production`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - ⚠️ Se você tem pagamentos
- [ ] `VITE_GOOGLE_CLIENT_ID` - ⚠️ Se você tem login Google

---

## 🎯 Como Verificar no Railway

1. Acesse [Railway Dashboard](https://railway.app)
2. Vá em seu projeto → **Settings → Variables**
3. Para cada variável acima:
   - Verifique se existe
   - Verifique se o valor está correto
   - Verifique se não tem espaços extras
   - Anote quais estão faltando

---

## 🔧 Como Corrigir

### Se uma variável está faltando:
1. No Railway Dashboard → Settings → Variables
2. Clique em **"New Variable"**
3. **Name:** Cole o nome exato (ex: `DATABASE_URL`)
4. **Value:** Cole o valor correto
5. Clique em **"Add"**

### Se uma variável está incorreta:
1. No Railway Dashboard → Settings → Variables
2. Encontre a variável
3. Clique nos três pontos (...) → **Edit**
4. Corrija o valor
5. Salve

### Se uma variável tem espaços extras:
1. Edite a variável
2. Remova espaços no início e fim
3. Salve

---

## ⚠️ Problemas Comuns

### 1. Variável existe mas está vazia
- **Solução:** Preencher com valor correto ou remover se opcional

### 2. Variável tem espaços extras
- **Solução:** Remover espaços no início e fim do valor

### 3. Variável tem valor placeholder
- **Solução:** Substituir por valor real (ex: `your_secret_here` → valor real)

### 4. Variável está em minúsculas quando deveria ser maiúsculas
- **Solução:** Nomes de variáveis são case-sensitive, verificar se está correto

### 5. Variável está faltando mas o código funciona
- **Solução:** Pode ser que tenha valor padrão no código, mas é melhor adicionar explicitamente

---

## 📝 Próximos Passos

Após verificar todas as variáveis:

1. ✅ Anotar quais estão faltando
2. ✅ Anotar quais estão incorretas
3. ✅ Corrigir todas no Railway
4. ✅ Fazer novo deploy
5. ✅ Testar funcionalidades críticas

---

**Última atualização:** 23 de Novembro de 2025

