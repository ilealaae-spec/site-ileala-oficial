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

## Como Obter as Credenciais do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: Ile Ala Website
   - **Authorized JavaScript origins**: 
     - `https://www.ileala.ae`
     - `https://ileala.ae`
   - **Authorized redirect URIs**:
     - `https://www.ileala.ae/api/oauth/google/callback` ⚠️ **OBRIGATÓRIO**
     - (O código sempre usa www.ileala.ae, então esta é a única URL necessária)
6. Copie o **Client ID** e **Client Secret**

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

