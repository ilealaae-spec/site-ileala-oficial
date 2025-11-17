# Checklist: Variáveis de Ambiente no Vercel

**Data:** 17 de Novembro de 2025  
**Objetivo:** Adicionar todas as variáveis necessárias no Vercel

---

## 📋 Variáveis Que Você DEVE Adicionar no Vercel

Vá em: **https://vercel.com/ile-ala/ileala-website/settings/environment-variables**

### ✅ Variáveis Já Configuradas (Verificar se estão corretas)

1. ✅ `VITE_APP_TITLE` = `Ile Ala`
2. ✅ `VITE_SANITY_PROJECT_ID` = `anyz9zel`
3. ✅ `VITE_SANITY_DATASET` = `production`
4. ✅ `SITE_URL` = `https://ileala.ae`
5. ✅ `RESEND_API_KEY` = (seu valor real)

---

### ⚠️ Variáveis FALTANDO (Adicionar AGORA)

#### 🔴 CRÍTICAS (Sem essas o site quebra):

**6. `VITE_OAUTH_PORTAL_URL`**
- **Value:** `https://placeholder.com`
- **Environment:** Production, Preview, Development
- **Nota:** Valor temporário para evitar erro de URL inválida

**7. `VITE_APP_ID`**
- **Value:** `ileala-prod`
- **Environment:** Production, Preview, Development
- **Nota:** ID do aplicativo

---

#### 🟡 IMPORTANTES (Funcionalidades podem não funcionar):

**8. `DATABASE_URL`**
- **Value:** (sua connection string do Neon PostgreSQL)
- **Environment:** Production, Preview, Development
- **Formato:** `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`
- **Nota:** Necessário para autenticação, carrinho, pedidos

**9. `JWT_SECRET`**
- **Value:** (gere uma chave aleatória forte com 32+ caracteres)
- **Environment:** Production, Preview, Development
- **Exemplo:** `your_very_strong_random_secret_key_here_min_32_chars`
- **Nota:** Necessário para autenticação JWT

**10. `NODE_ENV`**
- **Value:** `production`
- **Environment:** Production
- **Nota:** Define o ambiente de execução

---

#### 🟢 OPCIONAIS (Funcionalidades específicas):

**11. `VITE_APP_LOGO`**
- **Value:** `https://ileala.ae/logo.png`
- **Environment:** Production, Preview, Development
- **Nota:** URL do logo do site

**12. `VITE_APP_URL`**
- **Value:** `https://www.ileala.ae`
- **Environment:** Production, Preview, Development
- **Nota:** URL base do aplicativo

**13. `VITE_SANITY_TOKEN`**
- **Value:** (seu token do Sanity se precisar de operações autenticadas)
- **Environment:** Production, Preview, Development
- **Nota:** Opcional - apenas se precisar criar/editar conteúdo via frontend

**14. `STRIPE_SECRET_KEY`**
- **Value:** `sk_live_...` (sua chave secreta do Stripe)
- **Environment:** Production
- **Nota:** Necessário para processar pagamentos

**15. `STRIPE_WEBHOOK_SECRET`**
- **Value:** `whsec_...` (seu webhook secret do Stripe)
- **Environment:** Production
- **Nota:** Necessário para receber notificações de pagamento

**16. `VITE_STRIPE_PUBLISHABLE_KEY`**
- **Value:** `pk_live_...` (sua chave pública do Stripe)
- **Environment:** Production, Preview, Development
- **Nota:** Necessário para mostrar formulário de pagamento

**17. `AWS_ACCESS_KEY_ID`**
- **Value:** (sua access key da AWS)
- **Environment:** Production, Preview, Development
- **Nota:** Necessário para upload de imagens no S3

**18. `AWS_SECRET_ACCESS_KEY`**
- **Value:** (sua secret key da AWS)
- **Environment:** Production, Preview, Development
- **Nota:** Necessário para upload de imagens no S3

**19. `AWS_REGION`**
- **Value:** `us-east-1` (ou sua região)
- **Environment:** Production, Preview, Development
- **Nota:** Região do bucket S3

**20. `AWS_S3_BUCKET`**
- **Value:** `ileala-uploads` (ou nome do seu bucket)
- **Environment:** Production, Preview, Development
- **Nota:** Nome do bucket S3 para uploads

---

## 🎯 Prioridade de Adição

### AGORA (para o site funcionar):
1. `VITE_OAUTH_PORTAL_URL` = `https://placeholder.com`
2. `VITE_APP_ID` = `ileala-prod`
3. `DATABASE_URL` = (sua connection string do Neon)
4. `JWT_SECRET` = (gere uma chave forte)

### DEPOIS (para funcionalidades completas):
5. Stripe keys (para pagamentos)
6. AWS keys (para uploads)
7. Outras opcionais conforme necessário

---

## 📝 Como Adicionar no Vercel

### Método 1: Interface Web (Recomendado para poucas variáveis)

1. Vá em https://vercel.com/ile-ala/ileala-website/settings/environment-variables
2. Para cada variável:
   - **Key:** Nome da variável (ex: `VITE_OAUTH_PORTAL_URL`)
   - **Value:** Valor da variável (ex: `https://placeholder.com`)
   - **Environments:** Selecione Production, Preview, Development
   - Clique em **Save**

### Método 2: Vercel CLI (Recomendado para muitas variáveis)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link ao projeto
cd /home/ubuntu/ileala-project/ileala-website
vercel link

# Adicionar variáveis
vercel env add VITE_OAUTH_PORTAL_URL production
vercel env add VITE_APP_ID production
# ... etc
```

### Método 3: Import .env (Mais Rápido)

1. Crie um arquivo temporário `vercel-env.txt` com:
```
VITE_OAUTH_PORTAL_URL=https://placeholder.com
VITE_APP_ID=ileala-prod
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
```

2. No Vercel Dashboard:
   - Clique em **Import .env**
   - Cole o conteúdo do arquivo
   - Selecione os ambientes
   - Clique em **Save**

---

## ✅ Checklist de Verificação

Após adicionar as variáveis:

- [ ] Todas as variáveis CRÍTICAS foram adicionadas
- [ ] Valores estão corretos (sem espaços extras, sem aspas)
- [ ] Ambientes corretos foram selecionados
- [ ] Clicou em **Save** para cada variável
- [ ] Aguardou a confirmação de salvamento

---

## 🚀 Próximo Passo

Depois de adicionar as variáveis, fazer deployment:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_9kBl0BrJDTtlOs74qtPaGTOJ1mEM/xc48bq3x5t"
```

Ou simplesmente fazer push no GitHub (se os webhooks estiverem funcionando).

---

## 🆘 Se Tiver Dúvidas

**Onde encontrar cada valor:**

- **DATABASE_URL:** Neon Dashboard → Connection String
- **JWT_SECRET:** Gere com: `openssl rand -base64 32`
- **Stripe Keys:** Stripe Dashboard → Developers → API Keys
- **AWS Keys:** AWS Console → IAM → Users → Security Credentials
- **Sanity Token:** Sanity Dashboard → API → Tokens

---

**Última atualização:** 17 de Novembro de 2025
