# ✅ Correção do Deploy no Vercel - Frontend Estático

## 🎯 Problema Resolvido

O erro `Function Runtimes must have a valid version` foi corrigido removendo a configuração de funções serverless do `vercel.json`, já que o backend agora está no Railway.

## 📝 Mudanças Realizadas

### 1. `vercel.json` Simplificado

**ANTES:**
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "installCommand": "pnpm install",
  "functions": {
    "api/trpc.ts": {
      "runtime": "nodejs20.x"  // ❌ Isso causava o erro
    }
  },
  "rewrites": [...]
}
```

**DEPOIS:**
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [...]
}
```

### 2. Frontend Configurado para Railway

O frontend agora usa a variável `VITE_API_URL` para conectar ao backend no Railway:

```typescript
// client/src/main.tsx
url: import.meta.env.VITE_API_URL || "/api/trpc",
```

## 🔧 Configuração Necessária no Vercel

### Variável de Ambiente Obrigatória

Adicione no Vercel Dashboard → Settings → Environment Variables:

**`VITE_API_URL`**
- **Valor:** `https://ileala-website-production.up.railway.app/api/trpc`
- **Environments:** Production, Preview, Development
- **Importante:** Use a URL completa do Railway com `/api/trpc` no final

### Outras Variáveis

Todas as outras variáveis `VITE_*` que você já tem no Vercel continuam funcionando normalmente.

## 🚀 Como Funciona Agora

1. **Frontend no Vercel:**
   - Serve apenas arquivos estáticos (HTML, CSS, JS)
   - Domínio: `https://ileala.ae`

2. **Backend no Railway:**
   - Processa todas as requisições da API
   - URL: `https://ileala-website-production.up.railway.app`
   - Rotas: `/api/trpc`, `/api/oauth/callback`, etc.

3. **Comunicação:**
   - Frontend faz requisições para `VITE_API_URL` (Railway)
   - CORS configurado no Railway para aceitar requisições de `ileala.ae`

## ✅ Checklist de Deploy

Após fazer essas mudanças:

- [ ] `vercel.json` está simplificado (sem `functions`)
- [ ] Variável `VITE_API_URL` adicionada no Vercel
- [ ] Build do frontend funciona (`pnpm run build`)
- [ ] Deploy no Vercel funciona sem erros
- [ ] Frontend consegue se conectar ao backend Railway
- [ ] Teste de login/registro funciona

## 🔍 Verificação

Após o deploy, teste:

1. Acesse `https://ileala.ae`
2. Abra o DevTools (F12) → Network
3. Tente fazer login ou qualquer ação que use a API
4. Verifique se as requisições estão indo para o Railway:
   - Deve aparecer: `https://ileala-website-production.up.railway.app/api/trpc/...`

## 🆘 Troubleshooting

### Erro: "Failed to fetch"
- **Causa:** CORS não configurado no Railway
- **Solução:** Verifique se o Railway aceita requisições de `ileala.ae`

### Erro: "API endpoint not found"
- **Causa:** `VITE_API_URL` não configurada ou incorreta
- **Solução:** Verifique a variável no Vercel Dashboard

### Frontend não carrega
- **Causa:** Build falhou
- **Solução:** Verifique os logs do deploy no Vercel

---

**Última atualização:** Janeiro 2025

