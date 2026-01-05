# 🔧 Como Configurar S3 no Railway para Upload de Imagens

## ❌ Problema Atual

Você está vendo o erro: **"Storage upload failed: The specified bucket is not valid."**

Isso significa que as variáveis de ambiente do AWS S3 não estão configuradas corretamente no Railway.

---

## ✅ Solução: Configurar Variáveis de Ambiente no Railway

### Passo 1: Obter Credenciais AWS S3

Se você **JÁ TEM** um bucket S3 na AWS:

1. Acesse [AWS Console](https://console.aws.amazon.com)
2. Vá em **IAM → Users → Security credentials**
3. Crie uma **Access Key** (se não tiver)
4. Anote:
   - **Access Key ID** (formato: `AKIA...`)
   - **Secret Access Key** (string longa)
   - **Região** do bucket (ex: `us-east-1`, `eu-west-1`)
   - **Nome do bucket** (ex: `ileala-uploads`)

### Passo 2: Criar Bucket S3 (se não tiver)

1. Acesse [AWS S3 Console](https://s3.console.aws.amazon.com)
2. Clique em **"Create bucket"**
3. Configure:
   - **Nome:** `ileala-uploads` (ou outro nome único)
   - **Região:** Escolha uma região próxima (ex: `us-east-1`)
   - **Block Public Access:** **DESMARQUE** todas as opções (para permitir acesso público às imagens)
   - **Bucket Versioning:** Opcional
4. Clique em **"Create bucket"**

### Passo 3: Configurar Permissões do Bucket

1. No bucket criado, vá em **"Permissions"**
2. Em **"Bucket policy"**, adicione:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ileala-uploads/*"
    }
  ]
}
```

**⚠️ IMPORTANTE:** Substitua `ileala-uploads` pelo nome do seu bucket!

### Passo 4: Configurar IAM User (para upload)

1. Vá em **IAM → Users → Create user**
2. Nome: `ileala-s3-uploader`
3. Em **"Set permissions"**, escolha **"Attach policies directly"**
4. Adicione a política: **"AmazonS3FullAccess"** (ou crie uma política customizada mais restrita)
5. Crie o usuário
6. Vá em **"Security credentials"** → **"Create access key"**
7. Escolha **"Application running outside AWS"**
8. Anote a **Access Key ID** e **Secret Access Key**

---

## 🚂 Passo 5: Adicionar Variáveis no Railway

1. Acesse [Railway Dashboard](https://railway.app)
2. Selecione seu projeto **ILE ALA**
3. Vá em **Settings → Variables**
4. Adicione as seguintes variáveis:

### Variáveis Obrigatórias:

| Nome da Variável | Valor | Exemplo |
|-----------------|-------|---------|
| `AWS_ACCESS_KEY_ID` | Sua Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Sua Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | Região do bucket | `us-east-1` |
| `AWS_S3_BUCKET` | Nome do bucket | `ileala-uploads` |

### Como Adicionar:

1. Clique em **"New Variable"**
2. Cole o **NOME** da variável (ex: `AWS_ACCESS_KEY_ID`)
3. Cole o **VALOR** da variável (ex: `AKIAIOSFODNN7EXAMPLE`)
4. Clique em **"Add"**
5. Repita para todas as 4 variáveis

---

## ✅ Passo 6: Verificar Configuração

Após adicionar as variáveis:

1. O Railway vai fazer **redeploy automático**
2. Aguarde 2-5 minutos
3. Tente fazer upload de uma imagem no painel admin
4. Se funcionar, você verá a imagem aparecer!

---

## 🔍 Verificar se Está Funcionando

### No Console do Railway:

1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Veja os **Logs**
4. Procure por: `[S3] Upload successful!`

### No Painel Admin:

1. Vá em **Products → Edit Product**
2. Clique em **"Upload"** na seção de imagens
3. Selecione uma imagem
4. Se aparecer **"Image uploaded successfully"**, está funcionando! ✅

---

## 🆘 Problemas Comuns

### Erro: "The specified bucket is not valid"

**Causa:** Nome do bucket incorreto ou bucket não existe

**Solução:**
- Verifique se o nome do bucket está correto em `AWS_S3_BUCKET`
- Verifique se o bucket existe na AWS Console
- Certifique-se de que está na região correta

### Erro: "Access Denied"

**Causa:** Credenciais sem permissão

**Solução:**
- Verifique se a Access Key tem permissão para S3
- Verifique se o IAM User tem a política `AmazonS3FullAccess`

### Erro: "InvalidAccessKeyId"

**Causa:** Access Key ID incorreto

**Solução:**
- Verifique se copiou a Access Key ID corretamente
- Certifique-se de que não há espaços extras

### Imagens não aparecem no site

**Causa:** Bucket não está público

**Solução:**
- Configure a Bucket Policy (Passo 3)
- Certifique-se de que Block Public Access está desabilitado

---

## 📝 Resumo Rápido

1. ✅ Criar bucket S3 na AWS
2. ✅ Configurar permissões públicas
3. ✅ Criar IAM User com Access Key
4. ✅ Adicionar 4 variáveis no Railway:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
5. ✅ Aguardar redeploy
6. ✅ Testar upload no painel admin

---

## 💡 Alternativa: Usar URL Externa

Se você não quiser configurar S3 agora, pode:

1. Fazer upload da imagem em um serviço externo (Imgur, Cloudinary, etc.)
2. Copiar a URL da imagem
3. Colar no campo **"Image URL"** no painel admin
4. Salvar o produto

**Serviços gratuitos:**
- [Imgur](https://imgur.com)
- [Cloudinary](https://cloudinary.com)
- [ImgBB](https://imgbb.com)

---

**Precisa de ajuda?** Verifique os logs do Railway para mais detalhes sobre o erro!

