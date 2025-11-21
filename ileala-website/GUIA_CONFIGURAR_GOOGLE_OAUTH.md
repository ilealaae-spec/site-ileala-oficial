# 🔐 GUIA COMPLETO: Configurar Google OAuth

**Data:** 21 de Novembro de 2025  
**Objetivo:** Configurar login com Google usando Google Cloud Console

---

## 📋 PRÉ-REQUISITOS

- ✅ Conta no Google Cloud Console
- ✅ Acesso ao Railway Dashboard
- ✅ Domínio `ileala.ae` configurado

---

## 🔧 PASSO 1: Configurar no Google Cloud Console

### 1.1 Criar Projeto (se ainda não tiver)

1. Acesse: [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em **"Selecionar projeto"** → **"Novo projeto"**
3. Nome do projeto: `Ile Ala Website`
4. Clique em **"Criar"**

### 1.2 Ativar Google+ API

1. No menu lateral, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Google+ API"** ou **"People API"**
3. Clique em **"Ativar"**

### 1.3 Criar Credenciais OAuth 2.0

1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"+ CRIAR CREDENCIAIS"** → **"ID do cliente OAuth"**
3. Se pedir, configure a **Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo**
   - Nome do app: `ILE ALA`
   - Email de suporte: `contact@ileala.ae`
   - Domínios autorizados: `ileala.ae`
   - Clique em **"Salvar e continuar"**
   - Escopos: Adicione `email`, `profile`, `openid`
   - Clique em **"Salvar e continuar"**
   - Usuários de teste: Adicione seu email (opcional)
   - Clique em **"Salvar e continuar"**

4. Configure o **ID do cliente OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**
   - Nome: `ILE ALA Website`
   - **URIs de redirecionamento autorizados:**
     - `https://www.ileala.ae/api/oauth/callback`
     - `https://ileala.ae/api/oauth/callback`
     - `http://localhost:3000/api/oauth/callback` (para desenvolvimento)
   - Clique em **"Criar"**

5. **IMPORTANTE:** Copie:
   - **ID do cliente** (ex: `123456789-abc.apps.googleusercontent.com`)
   - **Segredo do cliente** (ex: `GOCSPX-abc123...`)

---

## 🔧 PASSO 2: Configurar Variáveis no Railway

**Railway Dashboard → Service: `ileala-website` → Variables**

Adicione/atualize as seguintes variáveis:

```
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu_secret_aqui
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=https://www.ileala.ae/api/oauth/google/callback
```

**Onde encontrar:**
- `GOOGLE_CLIENT_ID` = ID do cliente do Google Cloud Console (copiado no Passo 1.3)
- `GOOGLE_CLIENT_SECRET` = Segredo do cliente do Google Cloud Console (copiado no Passo 1.3)
- `VITE_GOOGLE_CLIENT_ID` = Mesmo ID do cliente (para o frontend)
- `GOOGLE_REDIRECT_URI` = URL de callback (deve corresponder ao configurado no Google Cloud Console)

**⚠️ IMPORTANTE:**
- O `GOOGLE_REDIRECT_URI` deve ser **exatamente igual** ao configurado no Google Cloud Console
- Use `https://www.ileala.ae` (com www) para produção
- Para desenvolvimento local, use `http://localhost:3000`

---

## ✅ IMPLEMENTAÇÃO COMPLETA

A implementação Google OAuth já foi criada! ✅

### O que foi implementado:

1. ✅ **Backend (`server/_core/googleOAuth.ts`)**
   - Rotas `/api/oauth/google` (inicia OAuth)
   - Rotas `/api/oauth/google/callback` (recebe callback)
   - Integração com banco de dados
   - Compatível com sistema de autenticação existente

2. ✅ **Frontend (`client/src/pages/Login.tsx`)**
   - Botão "Entrar com Google" atualizado
   - Usa Google OAuth diretamente
   - Aparece automaticamente quando configurado

3. ✅ **Funções auxiliares (`client/src/const.ts`)**
   - `getGoogleLoginUrl()` - Gera URL de autorização
   - `isGoogleOAuthAvailable()` - Verifica se está configurado

---

## 🧪 PASSO 3: Testar

### 3.1 Após adicionar variáveis no Railway:

1. Railway fará **redeploy automático**
2. Aguarde o deploy completar
3. Acesse: `https://www.ileala.ae/login`
4. Você deve ver o botão **"Entrar com Google"**

### 3.2 Testar login:

1. Clique em **"Entrar com Google"**
2. Você será redirecionado para Google
3. Faça login com sua conta Google
4. Autorize o acesso
5. Você será redirecionado de volta para o site
6. Deve estar logado automaticamente

---

## 🔍 TROUBLESHOOTING

### Problema: Botão Google não aparece

**Solução:**
- Verifique se `VITE_GOOGLE_CLIENT_ID` está configurado no Railway
- Verifique se não contém `placeholder.com`
- Faça redeploy do serviço

### Problema: Erro "redirect_uri_mismatch"

**Solução:**
- Verifique se o `GOOGLE_REDIRECT_URI` no Railway corresponde ao configurado no Google Cloud Console
- Deve ser exatamente: `https://www.ileala.ae/api/oauth/google/callback`
- Atualize no Google Cloud Console se necessário

### Problema: Erro "invalid_client"

**Solução:**
- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Verifique se não há espaços extras
- Copie e cole novamente do Google Cloud Console

### Problema: Email não verificado

**Solução:**
- O Google só permite login com emails verificados
- Verifique se o email da conta Google está verificado

---

## 📋 CHECKLIST FINAL

- [ ] Projeto criado no Google Cloud Console
- [ ] Google+ API ou People API ativada
- [ ] Credenciais OAuth 2.0 criadas
- [ ] URIs de redirecionamento configuradas no Google Cloud Console
- [ ] `GOOGLE_CLIENT_ID` adicionado no Railway
- [ ] `GOOGLE_CLIENT_SECRET` adicionado no Railway
- [ ] `VITE_GOOGLE_CLIENT_ID` adicionado no Railway
- [ ] `GOOGLE_REDIRECT_URI` adicionado no Railway (opcional, tem valor padrão)
- [ ] Railway fez redeploy
- [ ] Botão "Entrar com Google" aparece na página de login
- [ ] Login com Google funciona corretamente

---

## 🎯 RESULTADO ESPERADO

Após configurar tudo:

1. ✅ Botão "Entrar com Google" aparece na página de login
2. ✅ Clicar no botão redireciona para Google
3. ✅ Após autorizar, usuário é redirecionado de volta
4. ✅ Usuário está logado automaticamente
5. ✅ Dados do usuário são salvos no banco de dados
6. ✅ Sessão funciona normalmente

---

**Status:** Aguardando implementação  
**Última atualização:** 21 de Novembro de 2025

