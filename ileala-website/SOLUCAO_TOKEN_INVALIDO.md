# 🔧 Solução: Token Sanity Inválido

## ❌ Erro Identificado

```
Error: project user not found for user ID "g-FTfZkEhDRfrP" in project "anyz9zel"
401 Unauthorized
```

**Causa:** O token está associado a um usuário que não existe ou não tem acesso ao projeto.

---

## ✅ Solução: Recriar o Token

### Passo 1: Deletar Token Antigo no Sanity

1. **Sanity Dashboard** → **API** → **Tokens**
2. Encontre o token **"Website ileala.ae"**
3. Clique no **ícone de lixeira** para deletar

### Passo 2: Criar Novo Token

1. Clique em **"+ Add API token"**
2. Configure:
   - **Name:** `Website ileala.ae`
   - **Permissions:**
     - ✅ **Media Library:** "Viewer" (radio button)
     - ✅ **Canvas:** "Viewer" (radio button)
     - ❌ **Manage SDK Apps:** (desmarcado)
     - ❌ **Deploy Studios:** (desmarcado)
3. Clique em **"Save token"**

### Passo 3: Copiar o Token

⚠️ **IMPORTANTE:** O token será mostrado **APENAS UMA VEZ** após criar.

1. **Copie o token completo** (começa com `sk...`)
2. **Cole em um lugar seguro** temporariamente

### Passo 4: Atualizar no Railway

1. **Railway Dashboard** → Service: `ileala-website` → **Variables**
2. Encontre `VITE_SANITY_TOKEN`
3. Clique em **"Edit"** (ou nos 3 pontos → Edit)
4. **Cole o novo token**
5. Clique em **"Save"**

### Passo 5: Force Redeploy

1. Railway Dashboard → Service: `ileala-website` → **Deployments**
2. Clique nos **3 pontos** (⋯) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o deploy concluir

### Passo 6: Testar

1. Acesse: `https://www.ileala.ae/shop`
2. Os produtos devem carregar agora ✅

---

## 🔍 Por Que Isso Aconteceu?

Possíveis causas:
- Token foi criado com um usuário que foi removido do projeto
- Token foi criado em outro projeto e copiado incorretamente
- Token expirou ou foi revogado
- Usuário associado ao token perdeu acesso ao projeto

---

## ✅ Checklist

- [ ] Token antigo deletado no Sanity
- [ ] Novo token criado com permissões "Viewer"
- [ ] Token copiado (começa com `sk...`)
- [ ] Token atualizado no Railway como `VITE_SANITY_TOKEN`
- [ ] Redeploy forçado no Railway
- [ ] Produtos carregam no site

---

## 🚨 Outros Erros no Console (Secundários)

### 1. Stripe Error
```
IntegrationError: Please call Stripe() with your publishable key
```
**Solução:** Adicione `VITE_STRIPE_PUBLISHABLE_KEY` no Railway (se usar pagamentos)

### 2. OAuth Warning
```
OAuth is not configured
```
**Solução:** Isso é normal se você não usa OAuth completo (pode ignorar)

### 3. Umami Error
```
ERR_HTTP2_PROTOCOL_ERROR
```
**Solução:** Erro de analytics (não afeta o site)

---

**Última atualização:** 21 de Novembro de 2025




