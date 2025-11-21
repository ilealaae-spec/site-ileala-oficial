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

## 🔧 PASSO 2: Instalar Dependências

Vou criar uma implementação que usa Google OAuth diretamente. Primeiro, vamos verificar as dependências:

```bash
cd ileala-website
npm install google-auth-library
```

---

## 🔧 PASSO 3: Criar Implementação Google OAuth

Vou criar uma nova rota OAuth que usa Google diretamente, mantendo compatibilidade com o sistema existente.

---

## 🔧 PASSO 4: Configurar Variáveis no Railway

**Railway Dashboard → Service: `ileala-website` → Variables**

Adicione/atualize:

```
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu_secret_aqui
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
```

**Onde encontrar:**
- `GOOGLE_CLIENT_ID` = ID do cliente do Google Cloud Console
- `GOOGLE_CLIENT_SECRET` = Segredo do cliente do Google Cloud Console
- `VITE_GOOGLE_CLIENT_ID` = Mesmo ID do cliente (para o frontend)

---

## 🔧 PASSO 5: Atualizar Frontend

O botão Google já existe, mas precisa ser atualizado para usar Google OAuth diretamente.

---

## ✅ PRÓXIMOS PASSOS

Após seguir este guia, vou:
1. ✅ Criar a implementação Google OAuth no backend
2. ✅ Atualizar o frontend para usar Google OAuth
3. ✅ Testar a integração

---

**Status:** Aguardando implementação  
**Última atualização:** 21 de Novembro de 2025

