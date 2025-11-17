# Investigação das Configurações do Vercel

**Data:** 2025-11-17 11:48 UTC
**Projeto:** ileala-website
**Team:** Ile Ala

## Problema Identificado

O novo commit `1b7b06fb` ("chore: force rebuild - add timestamp comment") **NÃO APARECE** na lista de deployments do Vercel, mesmo após push bem-sucedido para o GitHub.

## Configurações Verificadas

### Git Settings (https://vercel.com/ile-ala/ileala-website/settings/git)

**Connected Git Repository:**
- Repository: `ilealaae-spec/site-ileala-oficial` ✅
- Connected: 2d ago
- Status: "Seamlessly create Deployments for any commits pushed to your Git repository"

**Vercel for Git:**
- Pull Request Comments: ✅ Enabled
- Commit Comments: ❌ Disabled
- deployment_status Events: ✅ Enabled
- repository_dispatch Events: ✅ Enabled

**Deploy Hooks:**
- Name: Manual Deploy Hook
- Branch: main
- URL: `https://api.vercel.com/v1/integrations/deploy/prj_9kBl0BrJDTtlOs74qtPaGTOJ1mEM/xc48bq3x5t`

**Ignored Build Step:**
- Behavior: **Automatic** (dropdown)
- Description: "When a commit is pushed to the Git repository that is connected with your Project, its SHA will determine if a new Build has to be issued. If the SHA was deployed before, no new Build will be issued."
- Customization: "You can customize this behavior with a command that exits with code 1 (new Build needed) or code 0."

## Deployments Atuais

**Deployment mais recente (Auhwna6Aq):**
- Status: 🔴 Error
- Duration: 37s
- Branch: main
- Commit: `bb11b03` - "docs: add complete setup guide and Vercel env vars checklist"
- Triggered: 8m ago via Deploy Hook

**Deployment atual em produção (8c1cENQGU):**
- Status: ✅ Ready (Current)
- Duration: 43s
- Redeploy of 9RVys68V8
- Triggered: 2d ago by ilealaae-spec

## Hipóteses

1. **Vercel não está detectando novos commits automaticamente**
   - O commit `1b7b06fb` foi feito há ~10 minutos mas não aparece na lista
   - Pode haver um problema com o webhook do GitHub

2. **Deploy Hook expirado**
   - O Deploy Hook retornou erro 404 quando tentamos usar
   - Pode precisar ser recriado

3. **Ignored Build Step pode estar bloqueando**
   - Configuração está em "Automatic"
   - Pode estar ignorando commits baseado em algum critério

## Próximos Passos

1. ✅ Criar novo Deploy Hook
2. ✅ Triggerar deployment manualmente
3. ✅ Verificar se o deployment é detectado
4. ✅ Investigar logs do deployment com erro (Auhwna6Aq)
5. ✅ Verificar webhooks do GitHub
