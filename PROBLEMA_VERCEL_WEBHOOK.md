# Problema: Vercel Não Está Detectando Novos Commits

## Status Atual
- ✅ Deployment 8c1cENQGU está Ready (mas é código antigo)
- ❌ Vercel NÃO está detectando novos commits do GitHub
- ❌ Site está com erro: "TypeError: Failed to construct 'URL': Invalid URL"

## Commits Feitos (Não Detectados pelo Vercel)
1. `33e7c1cd` - fix: add try-catch to getLoginUrl to handle missing OAuth env vars
2. `c44e8368` - chore: trigger Vercel deployment with fixed const.ts (commit vazio)
3. `127e9b65` - docs: add comment to force Vercel rebuild

## Problema Identificado
**O Vercel NÃO está recebendo webhooks do GitHub!**

### Configurações Verificadas
- ✅ Repositório conectado: `ilealaae-spec/site-ileala-oficial`
- ✅ Connected 1h ago
- ✅ Pull Request Comments: Enabled
- ❌ Commit Comments: Disabled
- ✅ deployment_status Events: Enabled
- ✅ repository_dispatch Events: Enabled

### Possíveis Causas
1. Webhook do GitHub não configurado corretamente
2. Permissões insuficientes na integração
3. Problema temporário no Vercel

## Solução Proposta
**Usar Deploy Hook para fazer deployment manual!**

Deploy Hooks são URLs únicas que permitem fazer deployment de um branch específico sem depender de webhooks do GitHub.

### Passos
1. Criar um Deploy Hook em Settings > Git > Deploy Hooks
2. Usar a URL do Deploy Hook para fazer POST e triggerar deployment
3. Ou fazer deployment manual via CLI do Vercel

## Código Corrigido (Já no GitHub)
O arquivo `ileala-website/client/src/const.ts` já tem o try-catch correto:

```typescript
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // If OAuth is not configured, return a placeholder URL
  if (!oauthPortalUrl || !appId) {
    console.warn('OAuth is not configured...');
    return '#';
  }
  
  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error('Failed to construct login URL:', error);
    return '#';
  }
};
```

## Próximos Passos
1. ✅ Criar Deploy Hook
2. ✅ Fazer deployment via Deploy Hook
3. ✅ Verificar se o site funciona
4. ✅ Investigar problema de webhook depois
