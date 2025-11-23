# Configurar Google OAuth

## Variáveis de Ambiente Necessárias no Railway

Para o Google OAuth funcionar, você precisa configurar as seguintes variáveis de ambiente no Railway:

### Frontend (VITE_*)
- **`VITE_GOOGLE_CLIENT_ID`**: O Client ID do Google OAuth (mesmo valor de `GOOGLE_CLIENT_ID`)
  - ⚠️ **IMPORTANTE**: Esta variável está faltando! Adicione ela agora.

### Backend (já configuradas ✅)
- **`GOOGLE_CLIENT_ID`**: O Client ID do Google OAuth ✅ (já configurado)
- **`GOOGLE_CLIENT_SECRET`**: O Client Secret do Google OAuth ✅ (já configurado)
- **`SITE_URL`**: `https://www.ileala.ae` (verificar se está configurado)

## Como Obter e Configurar as Credenciais do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto **"ile-ala-website"** (ou crie um novo se necessário)
3. **⚠️ IMPORTANTE: Vá em "APIs & Services" → "Credentials"** (não é no Centro de Verificação!)
4. Se você já tem um OAuth Client ID criado:
   - Clique no nome do OAuth Client ID (ex: "Ile Ala Website")
   - Role até a seção **"Authorized redirect URIs"**
   - **Verifique se esta URL está adicionada:**
     - `https://www.ileala.ae/api/oauth/google/callback` ⚠️ **OBRIGATÓRIO**
   - Se não estiver, clique em **"+ ADD URI"** e adicione
   - Clique em **"SAVE"** no final da página
5. Se você ainda não tem um OAuth Client ID:
   - Clique em **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Configure:
     - **Application type**: Web application
     - **Name**: Ile Ala Website
     - **Authorized JavaScript origins**: 
       - `https://www.ileala.ae`
     - **Authorized redirect URIs**:
       - `https://www.ileala.ae/api/oauth/google/callback` ⚠️ **OBRIGATÓRIO**
   - Clique em **"CREATE"**
6. Copie o **Client ID** e **Client Secret** (você verá uma tela com esses valores)

## Configurar no Railway

1. Acesse o serviço `ileala-website` no Railway
2. Vá em **Settings** → **Variables** (ou **Architecture** → **Variables**)
3. **Adicione a variável faltante:**
   - Clique em **"+ New Variable"** ou **"+ Add Variable"**
   - Nome: `VITE_GOOGLE_CLIENT_ID`
   - Valor: Copie o mesmo valor de `GOOGLE_CLIENT_ID` (que já está configurado)
     - Exemplo: `255111586030-mhha1srv0bpcj01njcmt6ioukiqql6m0.apps.googleusercontent.com`
   - Clique em **"Add"** ou **"Save"**
4. **Verifique se `SITE_URL` está configurado:**
   - Deve ser: `https://www.ileala.ae`
5. Faça um redeploy (ou aguarde o deploy atual terminar)

## Verificação

Após configurar:
1. O botão "Sign in with Google" deve aparecer na página de login
2. Ao clicar, deve redirecionar para o Google
3. Após autorizar, deve voltar para o site e fazer login automaticamente

## Troubleshooting

- Se o botão não aparecer: Verifique se `VITE_GOOGLE_CLIENT_ID` está configurado
- Se der erro ao clicar: Verifique se as URLs de callback estão corretas no Google Console
- Se não redirecionar: Verifique se `SITE_URL` está configurado como `https://www.ileala.ae`

