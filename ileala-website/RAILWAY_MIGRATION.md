# 🚂 Migração do Backend para Railway

Este documento contém todas as informações necessárias para migrar o backend do Vercel para o Railway.

## 📋 Checklist de Migração

### 1. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `site-ileala-oficial`
6. Selecione o diretório `ileala-website`

### 2. Configurar Build e Deploy

O Railway detectará automaticamente:
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `pnpm run start`
- **Port**: Automático (Railway injeta `PORT`)

### 3. Configurar Variáveis de Ambiente

Adicione todas as variáveis abaixo no Railway:

**Settings → Variables → New Variable**

#### 🔴 CRÍTICAS (Obrigatórias)

```bash
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require

# JWT/Security
JWT_SECRET=your_very_strong_random_secret_key_here_min_32_chars

# Environment
NODE_ENV=production
PORT=3000
```

#### 🟡 IMPORTANTES (Funcionalidades principais)

```bash
# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_live_xxx_ou_sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx

# Site URL
SITE_URL=https://ileala.ae
```

#### 🟢 FRONTEND (Vite - Build Time)

```bash
# App
VITE_APP_TITLE=Ile Ala
VITE_APP_ID=ileala-prod
VITE_APP_LOGO=https://ileala.ae/logo.png
VITE_APP_URL=https://www.ileala.ae

# Sanity CMS
VITE_SANITY_PROJECT_ID=anyz9zel
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=seu_token_sanity_se_necessario
VITE_SANITY_STUDIO_URL=https://ileala.ae/studio

# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_ou_pk_test_xxx

# OAuth
VITE_OAUTH_PORTAL_URL=https://placeholder.com
OAUTH_SERVER_URL=https://placeholder.com
OWNER_OPEN_ID=seu_open_id

# Forge API (se usado)
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=seu_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.forge.com
VITE_FRONTEND_FORGE_API_KEY=seu_forge_api_key

# Analytics (se usado)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

#### 🔵 OPCIONAIS (Funcionalidades específicas)

```bash
# AWS S3 (Storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ileala-uploads

# OAuth (se não usar placeholder)
VITE_OAUTH_CLIENT_ID=seu_client_id
VITE_OAUTH_CLIENT_SECRET=seu_client_secret
```

### 4. Configurar Domínio

1. No Railway, vá em **Settings → Networking**
2. Clique em **Generate Domain** (para teste) ou **Add Custom Domain**
3. Para domínio customizado:
   - Adicione `ileala.ae` ou `www.ileala.ae`
   - Configure DNS conforme instruções do Railway
   - Aguarde propagação DNS (pode levar até 24h)

### 5. Configurar Banco de Dados

O Railway pode provisionar um PostgreSQL, mas como você já usa Neon:

**Opção A: Continuar usando Neon (Recomendado)**
- Use a mesma `DATABASE_URL` do Neon
- Nenhuma mudança necessária

**Opção B: Usar PostgreSQL do Railway**
1. No projeto Railway, clique em **+ New**
2. Selecione **Database → PostgreSQL**
3. Railway criará automaticamente a variável `DATABASE_URL`
4. Execute migrations: `pnpm run migrate`

### 6. Executar Migrations

Após o primeiro deploy:

```bash
# Via Railway CLI
railway run pnpm run migrate

# Ou via Railway Dashboard → Deployments → Run Command
```

### 7. Testar Deploy

1. Acesse o domínio gerado pelo Railway
2. Teste as rotas principais:
   - `GET /` - Página inicial
   - `GET /api/trpc/system.health` - Health check
   - `POST /api/create-emergency-admin` - Criar admin (se necessário)

### 8. Configurar Webhooks (Stripe)

Se usar Stripe, atualize o webhook URL:

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers → Webhooks**
3. Edite o endpoint existente
4. Atualize a URL para: `https://seu-dominio-railway.com/api/stripe/webhook`
5. Salve

## 📁 Estrutura de Arquivos

```
ileala-website/
├── railway.json          # Configuração Railway
├── package.json          # Scripts (start, build, etc.)
├── server/
│   └── _core/
│       └── index.ts      # Servidor Express principal
├── api/                  # Rotas Vercel (não usadas no Railway)
└── dist/                 # Build do frontend (gerado)
```

## 🔄 Diferenças Vercel vs Railway

| Aspecto | Vercel | Railway |
|---------|--------|---------|
| **Runtime** | Serverless Functions | Servidor Node.js contínuo |
| **Handler** | `export default function handler()` | Express app |
| **Port** | Automático | `process.env.PORT` |
| **Build** | Automático | `pnpm run build` |
| **Start** | Automático | `pnpm run start` |
| **Cold Start** | Sim (serverless) | Não (sempre rodando) |

## 🚨 Troubleshooting

### Erro: "Cannot find module"
- **Causa**: Dependências não instaladas
- **Solução**: Verifique se `pnpm install` está no build command

### Erro: "Port already in use"
- **Causa**: Porta hardcoded
- **Solução**: Use `process.env.PORT` (já configurado)

### Erro: "DATABASE_URL not found"
- **Causa**: Variável não configurada
- **Solução**: Adicione `DATABASE_URL` nas variáveis de ambiente

### Build falha
- **Causa**: Erros de TypeScript ou build
- **Solução**: Execute `pnpm run build` localmente primeiro

### Frontend não carrega
- **Causa**: Build não gerou `dist/public`
- **Solução**: Verifique se `vite build` está no build command

## 📝 Notas Importantes

1. **Rotas Vercel**: Os arquivos em `api/` não são usados no Railway. O servidor Express em `server/_core/index.ts` é o que roda.

2. **Static Files**: O servidor serve arquivos de `dist/public` em produção.

3. **Hot Reload**: Não funciona em produção. Use `railway logs` para ver logs.

4. **Health Check**: Railway verifica automaticamente se o servidor está respondendo na porta configurada.

5. **Rollback**: Railway mantém histórico de deploys. Você pode fazer rollback em **Deployments**.

## ✅ Verificação Final

Antes de considerar a migração completa:

- [ ] Servidor inicia sem erros
- [ ] Frontend carrega corretamente
- [ ] API tRPC responde (`/api/trpc/system.health`)
- [ ] OAuth callback funciona (`/api/oauth/callback`)
- [ ] Banco de dados conecta
- [ ] Emails são enviados (se configurado)
- [ ] Pagamentos funcionam (se configurado)
- [ ] Domínio customizado configurado (se aplicável)

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway Dashboard](https://railway.app/dashboard)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

**Última atualização**: 2025-01-XX
**Status**: ✅ Pronto para deploy

