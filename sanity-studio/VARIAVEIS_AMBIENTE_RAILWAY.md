# Variáveis de Ambiente para Sanity Studio no Railway

## Variáveis Obrigatórias

O Sanity Studio precisa das seguintes variáveis de ambiente no Railway:

### 1. `SANITY_STUDIO_PROJECT_ID`
- **Valor:** `anyz9zel`
- **Descrição:** ID do projeto no Sanity.io

### 2. `SANITY_STUDIO_DATASET`
- **Valor:** `production`
- **Descrição:** Dataset do Sanity (production ou development)

### 3. `PORT` (Opcional - Railway define automaticamente)
- **Valor:** Railway define automaticamente
- **Descrição:** Porta onde o servidor irá rodar

### 4. `SANITY_STUDIO_PREVIEW_URL` (Opcional)
- **Valor:** `https://www.ileala.ae`
- **Descrição:** URL base para preview de documentos

## Como Adicionar no Railway

1. Acesse o serviço `ileala-sanity-studio` no Railway
2. Vá em **Settings** → **Variables**
3. Adicione as variáveis acima
4. Faça um redeploy

## Verificação

Após o deploy, o Sanity Studio deve estar acessível em:
- URL fornecida pelo Railway (ex: `ileala-sanity-studio.railway.app`)



