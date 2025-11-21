# ✅ Checklist: Configurar Google OAuth

## 🎯 Objetivo
Fazer o botão "Sign in with Google" aparecer na página de login.

---

## 📋 Variáveis Necessárias no Railway

**Railway Dashboard → Service: `ileala-website` → Variables → New Variable**

### 1. `VITE_GOOGLE_CLIENT_ID` ⚠️ CRÍTICO (Frontend)
- **Valor:** Seu Client ID do Google Cloud Console
- **Formato:** `xxxxx.apps.googleusercontent.com`
- **Onde encontrar:** Google Cloud Console → Credentials → OAuth 2.0 Client ID
- **Por que:** Esta variável é usada pelo frontend para gerar o botão de login

### 2. `GOOGLE_CLIENT_ID` (Backend)
- **Valor:** Mesmo Client ID do Google Cloud Console
- **Formato:** `xxxxx.apps.googleusercontent.com`
- **Por que:** Esta variável é usada pelo backend para validar o token

### 3. `GOOGLE_CLIENT_SECRET` (Backend)
- **Valor:** Seu Client Secret do Google Cloud Console
- **Formato:** `GOCSPX-xxxxx`
- **Onde encontrar:** Google Cloud Console → Credentials → OAuth 2.0 Client ID → Show Secret
- **Por que:** Esta variável é usada pelo backend para trocar o código por token

### 4. `GOOGLE_REDIRECT_URI` (Opcional - Backend)
- **Valor:** `https://www.ileala.ae/api/oauth/google/callback`
- **Por que:** URL de callback após autenticação (pode ser inferida automaticamente)

---

## 🔍 Como Verificar se Está Configurado

### 1. Verificar no Railway
1. Acesse: Railway Dashboard → Service: `ileala-website` → Variables
2. Procure por:
   - ✅ `VITE_GOOGLE_CLIENT_ID` (deve ter valor)
   - ✅ `GOOGLE_CLIENT_ID` (deve ter valor)
   - ✅ `GOOGLE_CLIENT_SECRET` (deve ter valor)

### 2. Verificar no Site
1. Acesse: `https://www.ileala.ae/login`
2. Abra o Console do Navegador (F12 → Console)
3. Procure por mensagens:
   - ✅ `[Google OAuth] VITE_GOOGLE_CLIENT_ID: Configured` = Funcionando
   - ❌ `[Google OAuth] VITE_GOOGLE_CLIENT_ID: NOT CONFIGURED` = Falta configurar

### 3. Verificar se Botão Aparece
- ✅ **Aparece:** Botão "Sign in with Google" visível = Configurado corretamente
- ❌ **Não aparece:** Botão não visível = `VITE_GOOGLE_CLIENT_ID` não configurado

---

## 🚨 Problema Comum: Variável Não Aparece no Build

**Sintoma:** Variável configurada no Railway, mas botão não aparece.

**Causa:** Variáveis `VITE_*` são injetadas no **build time**, não no runtime.

**Solução:**
1. **Verifique se a variável está configurada:**
   - Railway Dashboard → Variables
   - Procure por `VITE_GOOGLE_CLIENT_ID`
   - Deve ter valor (não vazio)

2. **Force um novo build:**
   - Railway Dashboard → Service → Deployments
   - Clique em "Redeploy" ou faça um commit vazio
   - Aguarde o build completar

3. **Verifique os logs do build:**
   - Railway Dashboard → Service → Build Logs
   - Procure por erros relacionados a variáveis

---

## 📝 Passo a Passo Completo

### PASSO 1: Obter Credenciais do Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Selecione seu projeto
3. Vá em: **APIs & Services** → **Credentials**
4. Clique em **OAuth 2.0 Client ID**
5. Copie:
   - **Client ID** (ex: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (ex: `GOCSPX-abc123`)

### PASSO 2: Configurar Redirect URI no Google

1. No mesmo OAuth 2.0 Client ID, clique em **Edit**
2. Em **Authorized redirect URIs**, adicione:
   ```
   https://www.ileala.ae/api/oauth/google/callback
   ```
3. Clique em **Save**

### PASSO 3: Adicionar Variáveis no Railway

1. Acesse: Railway Dashboard → Service: `ileala-website` → Variables
2. Clique em **New Variable**
3. Adicione cada variável:

   **Variável 1:**
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: `seu_client_id.apps.googleusercontent.com`
   - Clique em **Add**

   **Variável 2:**
   - Name: `GOOGLE_CLIENT_ID`
   - Value: `seu_client_id.apps.googleusercontent.com` (mesmo valor)
   - Clique em **Add**

   **Variável 3:**
   - Name: `GOOGLE_CLIENT_SECRET`
   - Value: `GOCSPX-seu_secret`
   - Clique em **Add**

### PASSO 4: Aguardar Deploy

1. Railway fará deploy automaticamente
2. Aguarde o build completar (2-5 minutos)
3. Verifique se o deploy foi bem-sucedido

### PASSO 5: Testar

1. Acesse: `https://www.ileala.ae/login`
2. Verifique se o botão "Sign in with Google" aparece
3. Clique no botão e teste o login

---

## ✅ Checklist Final

- [ ] Credenciais obtidas do Google Cloud Console
- [ ] Redirect URI configurado no Google Cloud Console
- [ ] `VITE_GOOGLE_CLIENT_ID` adicionado no Railway
- [ ] `GOOGLE_CLIENT_ID` adicionado no Railway
- [ ] `GOOGLE_CLIENT_SECRET` adicionado no Railway
- [ ] Deploy completado com sucesso
- [ ] Botão "Sign in with Google" aparece na página de login
- [ ] Login com Google funciona corretamente

---

## 🆘 Problemas e Soluções

### "Botão não aparece"
- ✅ Verifique se `VITE_GOOGLE_CLIENT_ID` está configurado
- ✅ Force um novo build no Railway
- ✅ Verifique console do navegador para erros

### "Erro ao fazer login"
- ✅ Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- ✅ Verifique se redirect URI está configurado no Google Cloud Console
- ✅ Verifique logs do Railway para erros

### "Variável não funciona após adicionar"
- ✅ Variáveis `VITE_*` precisam de rebuild
- ✅ Force um novo deploy no Railway
- ✅ Aguarde o build completar

---

## 📚 Documentação Completa

Para mais detalhes, consulte: `GUIA_CONFIGURAR_GOOGLE_OAUTH.md`

