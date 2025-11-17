# 🚀 Ile Ala - Guia de Setup Completo

**Última atualização:** 17 de Novembro de 2025

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Local](#setup-local)
3. [Configuração de Serviços](#configuração-de-serviços)
4. [Deploy no Vercel](#deploy-no-vercel)
5. [Troubleshooting](#troubleshooting)
6. [Arquitetura](#arquitetura)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 10+ (ou npm/yarn)
- **Git** ([Download](https://git-scm.com/))
- Conta no **GitHub**
- Conta no **Vercel** (conectada ao GitHub)

### Serviços Externos (Opcional mas Recomendado):

- **Neon** (PostgreSQL) - [neon.tech](https://neon.tech)
- **Sanity** (CMS) - [sanity.io](https://sanity.io)
- **Stripe** (Pagamentos) - [stripe.com](https://stripe.com)
- **AWS S3** (Storage) - [aws.amazon.com/s3](https://aws.amazon.com/s3/)
- **Resend** (Email) - [resend.com](https://resend.com)

---

## 💻 Setup Local

### 1. Clone o Repositório

```bash
git clone https://github.com/ilealaae-spec/site-ileala-oficial.git
cd site-ileala-oficial/ileala-website
```

### 2. Instale as Dependências

```bash
pnpm install
```

Ou se preferir npm:

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha com seus valores reais:

```env
# === APP ===
VITE_APP_URL=http://localhost:5173
VITE_APP_TITLE=Ile Ala
VITE_APP_ID=ileala-dev
VITE_APP_LOGO=https://ileala.ae/logo.png

# === DATABASE (Neon PostgreSQL) ===
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require

# === SANITY CMS ===
VITE_SANITY_PROJECT_ID=anyz9zel
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=

# === STRIPE (Pagamentos) ===
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# === AWS S3 (File Storage) ===
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ileala-uploads

# === EMAIL (Resend) ===
RESEND_API_KEY=re_...

# === OAUTH (Opcional) ===
VITE_OAUTH_PORTAL_URL=https://placeholder.com
VITE_OAUTH_CLIENT_ID=
VITE_OAUTH_CLIENT_SECRET=

# === SECURITY ===
JWT_SECRET=your_very_strong_random_secret_key_here

# === ENVIRONMENT ===
NODE_ENV=development
SITE_URL=http://localhost:5173
```

### 4. Configure o Banco de Dados

Se estiver usando PostgreSQL (Neon):

```bash
# Gerar migrations
pnpm run db:push

# Ou rodar migrations manualmente
pnpm run migrate
```

### 5. Inicie o Servidor de Desenvolvimento

```bash
pnpm run dev
```

O site estará disponível em: **http://localhost:5173**

---

## 🔑 Configuração de Serviços

### Neon (PostgreSQL)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a **Connection String**
4. Cole em `DATABASE_URL` no `.env.local`

**Formato:**
```
postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require
```

### Sanity (CMS)

1. Crie uma conta em [sanity.io](https://sanity.io)
2. Crie um novo projeto
3. Anote o **Project ID** e **Dataset**
4. Configure em `.env.local`:
   - `VITE_SANITY_PROJECT_ID`
   - `VITE_SANITY_DATASET`

**Configurar Sanity Studio:**

```bash
cd ../sanity-studio
pnpm install
pnpm run dev
```

Acesse: **http://localhost:3333**

### Stripe (Pagamentos)

1. Crie uma conta em [stripe.com](https://stripe.com)
2. Vá em **Developers → API Keys**
3. Copie:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. Configure Webhooks:
   - Vá em **Developers → Webhooks**
   - Adicione endpoint: `https://ileala.ae/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`
   - Copie **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### AWS S3 (Storage)

1. Crie uma conta na [AWS](https://aws.amazon.com)
2. Crie um bucket S3
3. Configure IAM User com permissões S3
4. Copie:
   - **Access Key ID** → `AWS_ACCESS_KEY_ID`
   - **Secret Access Key** → `AWS_SECRET_ACCESS_KEY`
   - **Region** → `AWS_REGION`
   - **Bucket Name** → `AWS_S3_BUCKET`

### Resend (Email)

1. Crie uma conta em [resend.com](https://resend.com)
2. Vá em **API Keys**
3. Crie uma nova chave
4. Copie → `RESEND_API_KEY`

### JWT Secret

Gere uma chave aleatória forte:

```bash
openssl rand -base64 32
```

Ou use um gerador online: [randomkeygen.com](https://randomkeygen.com/)

---

## 🚀 Deploy no Vercel

### Método 1: Via GitHub (Recomendado)

1. Faça push do código para o GitHub
2. Vá em [vercel.com](https://vercel.com)
3. Clique em **Add New Project**
4. Selecione o repositório `site-ileala-oficial`
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `ileala-website`
   - **Build Command:** `npm run build`
   - **Output Directory:** `ileala-website/dist/public`
6. Adicione todas as variáveis de ambiente (veja [VERCEL_ENV_VARS_CHECKLIST.md](./VERCEL_ENV_VARS_CHECKLIST.md))
7. Clique em **Deploy**

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd ileala-website
vercel
```

### Configurar Deploy Hook

Para fazer deployments manuais:

1. Vá em **Settings → Git → Deploy Hooks**
2. Crie um novo hook:
   - **Name:** Manual Deploy
   - **Branch:** main
3. Copie a URL
4. Para fazer deploy:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/..."
```

---

## 🐛 Troubleshooting

### Erro: "TypeError: Failed to construct 'URL': Invalid URL"

**Causa:** Variáveis de ambiente `VITE_OAUTH_PORTAL_URL` ou `VITE_APP_ID` não estão configuradas.

**Solução:**
1. Adicione no Vercel:
   - `VITE_OAUTH_PORTAL_URL` = `https://placeholder.com`
   - `VITE_APP_ID` = `ileala-prod`
2. Faça um novo deployment

### Erro: "The specified Root Directory does not exist"

**Causa:** Configuração incorreta do Root Directory no Vercel.

**Solução:**
1. Vá em **Settings → Build and Deployment**
2. **Root Directory:** deixe VAZIO
3. **Output Directory:** `ileala-website/dist/public`
4. Salve e faça redeploy

### Vercel não detecta pushes do GitHub

**Causa:** Webhooks GitHub-Vercel não estão funcionando.

**Solução:**
1. Use Deploy Hook manual (veja acima)
2. Ou reconecte o repositório:
   - **Settings → Git → Disconnect**
   - Reconecte o repositório

### Erro de conexão com banco de dados

**Causa:** `DATABASE_URL` incorreta ou banco não acessível.

**Solução:**
1. Verifique a connection string no Neon
2. Certifique-se de incluir `?sslmode=require`
3. Teste a conexão:

```bash
psql "postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require"
```

### Site não carrega produtos do Sanity

**Causa:** `VITE_SANITY_PROJECT_ID` ou `VITE_SANITY_DATASET` incorretos.

**Solução:**
1. Verifique os valores no Sanity Dashboard
2. Certifique-se de ter conteúdo publicado no Sanity
3. Verifique CORS no Sanity:
   - **Settings → API → CORS Origins**
   - Adicione: `https://ileala.ae`, `http://localhost:5173`

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Frontend:**
- React 19
- Vite
- TailwindCSS
- Wouter (routing)
- TanStack Query

**Backend:**
- Express.js
- tRPC
- Drizzle ORM
- PostgreSQL (Neon)

**Serviços:**
- Vercel (Hosting + Serverless Functions)
- Neon (Database)
- Sanity (CMS)
- Stripe (Payments)
- AWS S3 (Storage)
- Resend (Email)

### Estrutura de Pastas

```
site-ileala-oficial/
├── ileala-website/          # Frontend + Backend
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── lib/
│   │   │   └── main.tsx
│   │   └── index.html
│   ├── server/              # Express backend
│   │   ├── _core/
│   │   ├── routers.ts
│   │   ├── db.ts
│   │   └── index.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── sanity-studio/           # Sanity CMS
│   ├── schemas/
│   ├── sanity.config.ts
│   └── package.json
└── README.md
```

### Fluxo de Deployment

```
┌─────────────┐
│  Git Push   │
│   (GitHub)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │ ← Detecta push (webhook)
│   Build     │
└──────┬──────┘
       │
       ├─→ Build Frontend (Vite)
       ├─→ Build Backend (esbuild)
       └─→ Deploy (Serverless Functions)
       │
       ▼
┌─────────────┐
│  Site Live  │
│ ileala.ae   │
└─────────────┘
```

---

## 📚 Comandos Úteis

```bash
# Desenvolvimento
pnpm run dev              # Inicia servidor de desenvolvimento
pnpm run build            # Build para produção
pnpm run start            # Inicia servidor de produção
pnpm run check            # Verifica tipos TypeScript
pnpm run format           # Formata código com Prettier
pnpm run test             # Roda testes

# Banco de Dados
pnpm run db:push          # Gera e aplica migrations
pnpm run migrate          # Roda migrations manualmente

# Vercel
vercel                    # Deploy para preview
vercel --prod             # Deploy para produção
vercel env ls             # Lista variáveis de ambiente
vercel logs               # Ver logs de produção
```

---

## 📞 Suporte

**Problemas?**
- Abra uma issue no GitHub
- Consulte a [documentação do Vercel](https://vercel.com/docs)
- Verifique os logs: `vercel logs`

**Recursos:**
- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação tRPC](https://trpc.io/)
- [Documentação Drizzle ORM](https://orm.drizzle.team/)
- [Documentação Sanity](https://www.sanity.io/docs)
- [Documentação Stripe](https://stripe.com/docs)

---

## 📝 Checklist de Setup

### Local:
- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] `.env.local` criado e preenchido
- [ ] Banco de dados configurado
- [ ] Servidor de desenvolvimento rodando (`pnpm run dev`)
- [ ] Site acessível em `http://localhost:5173`

### Vercel:
- [ ] Projeto conectado ao GitHub
- [ ] Root Directory configurado (vazio)
- [ ] Output Directory configurado (`ileala-website/dist/public`)
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Deploy bem-sucedido
- [ ] Site acessível em `https://ileala.ae`
- [ ] Deploy Hook criado (opcional)

### Serviços:
- [ ] Neon (Database) configurado
- [ ] Sanity (CMS) configurado
- [ ] Stripe (Payments) configurado (opcional)
- [ ] AWS S3 (Storage) configurado (opcional)
- [ ] Resend (Email) configurado (opcional)

---

**Pronto! Seu site Ile Ala deve estar funcionando perfeitamente!** 🎉

Se tiver alguma dúvida, consulte o [VERCEL_ENV_VARS_CHECKLIST.md](./VERCEL_ENV_VARS_CHECKLIST.md) ou [ARQUITETURA_SITE_ANALISE.md](./ARQUITETURA_SITE_ANALISE.md).
