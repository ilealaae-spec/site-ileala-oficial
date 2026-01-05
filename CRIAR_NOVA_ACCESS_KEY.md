# 🔑 Como Criar Nova Access Key e Atualizar Railway

## ❌ Problema Identificado

A Access Key `AKIAX3U4ZIJCXE34PFP4` configurada no Railway **não existe** no seu IAM.

Você tem apenas uma Access Key: `AKIAX3U4ZIJC2ZQT2GL4`

---

## ✅ Solução: Criar Nova Access Key

### Opção 1: Usar a Access Key Existente (Mais Rápido)

Se a chave `AKIAX3U4ZIJC2ZQT2GL4` tem permissões S3, você pode usá-la:

1. **No IAM Console:**
   - Vá em **Users** → Encontre o usuário que tem essa chave
   - Verifique se tem a política `AmazonS3FullAccess` ou permissões S3

2. **Se tiver permissões:**
   - Vá em **Security credentials** → **Access keys**
   - Clique na chave `AKIAX3U4ZIJC2ZQT2GL4`
   - Clique em **"Show"** para ver a Secret Key
   - Copie a Secret Key

3. **No Railway:**
   - Vá em **Settings → Variables**
   - Atualize:
     - `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJC2ZQT2GL4`
     - `AWS_SECRET_ACCESS_KEY` = (cole a Secret Key que você copiou)

---

### Opção 2: Criar Nova Access Key (Recomendado)

#### Passo 1: Criar Nova Access Key no IAM

1. **No AWS Console:**
   - Vá em **IAM → Users**
   - Encontre o usuário (ou crie um novo se necessário)
   - Clique no usuário

2. **Vá em "Security credentials" tab**

3. **Role até "Access keys"**

4. **Clique em "Create access key"**

5. **Escolha o caso de uso:**
   - Selecione **"Application running outside AWS"**
   - Clique em **"Next"**

6. **Configure permissões (se necessário):**
   - Se o usuário já tem `AmazonS3FullAccess`, pode pular
   - Se não, adicione a política `AmazonS3FullAccess`

7. **Clique em "Create access key"**

8. **⚠️ IMPORTANTE: Copie AGORA:**
   - **Access Key ID**: `AKIA...` (exemplo: `AKIAX3U4ZIJCXE34PFP4`)
   - **Secret Access Key**: `wJalr...` (string longa)
   
   **⚠️ ATENÇÃO:** A Secret Key só aparece UMA VEZ! Se fechar, terá que criar outra!

9. **Clique em "Done"**

---

#### Passo 2: Atualizar Variáveis no Railway

1. **Acesse Railway Dashboard:**
   - Vá em [railway.app](https://railway.app)
   - Selecione seu projeto **ILE ALA**
   - Selecione o serviço **ileala-admin**

2. **Vá em Settings → Variables**

3. **Atualize as variáveis:**

   **a) Atualizar `AWS_ACCESS_KEY_ID`:**
   - Encontre a variável `AWS_ACCESS_KEY_ID`
   - Clique nos **3 pontinhos** (⋯) à direita
   - Clique em **"Edit"**
   - Cole a nova Access Key ID (ex: `AKIAX3U4ZIJCXE34PFP4`)
   - Clique em **"Save"**

   **b) Atualizar `AWS_SECRET_ACCESS_KEY`:**
   - Encontre a variável `AWS_SECRET_ACCESS_KEY`
   - Clique nos **3 pontinhos** (⋯) à direita
   - Clique em **"Edit"**
   - Cole a nova Secret Access Key (a string longa que você copiou)
   - Clique em **"Save"**

4. **Verifique as outras variáveis:**
   - `AWS_REGION` = `us-east-1` ✅
   - `AWS_S3_BUCKET` = `ileala-uploads` ✅

---

#### Passo 3: Verificar Permissões do IAM User

1. **No IAM Console:**
   - Vá em **Users** → Clique no usuário que tem a nova Access Key

2. **Vá em "Permissions" tab**

3. **Verifique se tem:**
   - ✅ `AmazonS3FullAccess` OU
   - ✅ Uma política customizada com:
     - `s3:PutObject`
     - `s3:PutObjectAcl`
     - `s3:GetObject`
     - `s3:ListBucket`

4. **Se não tiver:**
   - Clique em **"Add permissions"**
   - Selecione **"Attach policies directly"**
   - Procure por **"AmazonS3FullAccess"**
   - Marque e clique em **"Add permissions"**

---

## ✅ Passo 4: Testar

Após atualizar as variáveis:

1. **O Railway vai fazer redeploy automático** (aguarde 2-5 minutos)

2. **Teste no painel admin:**
   - Vá em **Products → Edit Product**
   - Clique em **"Upload"** na seção de imagens
   - Selecione uma imagem
   - Se aparecer **"Image uploaded successfully"** = Funcionou! ✅

3. **Verifique os logs do Railway:**
   - Vá em **Deployments → Logs**
   - Procure por `[S3] Upload successful!`

---

## 🆘 Se Ainda Não Funcionar

### Verificar Logs do Railway:

1. Vá em **Railway → Deployments → Logs**
2. Procure por erros que começam com `[S3]`
3. Os erros vão mostrar exatamente o problema

### Erros Comuns:

**"InvalidAccessKeyId"**
- Access Key ID incorreta
- Solução: Verifique se copiou corretamente no Railway

**"SignatureDoesNotMatch"**
- Secret Access Key incorreta
- Solução: Verifique se copiou a Secret Key completa (sem espaços)

**"Access Denied"**
- IAM User sem permissões
- Solução: Adicione `AmazonS3FullAccess` ao IAM User

---

## 📝 Checklist Final

- [ ] Nova Access Key criada no IAM
- [ ] Access Key ID copiada
- [ ] Secret Access Key copiada (antes de fechar a janela!)
- [ ] `AWS_ACCESS_KEY_ID` atualizada no Railway
- [ ] `AWS_SECRET_ACCESS_KEY` atualizada no Railway
- [ ] IAM User tem `AmazonS3FullAccess`
- [ ] Bucket Policy configurada (já está ✅)
- [ ] Block Public Access desabilitado (já está ✅)
- [ ] Testou upload no painel admin
- [ ] Verificou logs do Railway

---

**Depois de criar a nova Access Key e atualizar no Railway, teste novamente o upload!** 🚀

