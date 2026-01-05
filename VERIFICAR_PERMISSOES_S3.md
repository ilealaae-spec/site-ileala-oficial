# ✅ Verificar Permissões do Bucket S3

## 🔍 Situação Atual

Você já tem:
- ✅ Bucket S3 criado: `ileala-uploads`
- ✅ 113 imagens na pasta `products/`
- ✅ Variáveis configuradas no Railway:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`: `us-east-1`
  - `AWS_S3_BUCKET`: `ileala-uploads`

## ⚠️ Problema Possível

O erro "The specified bucket is not valid" geralmente acontece quando:
1. **Block Public Access** está habilitado
2. **Bucket Policy** não está configurada
3. **IAM User** não tem permissões corretas

---

## 🔧 Passo 1: Verificar Block Public Access

1. No AWS S3 Console, vá em **ileala-uploads**
2. Clique na aba **"Permissions"** (Permissões)
3. Role até **"Block public access (bucket settings)"**
4. Clique em **"Edit"**
5. **DESMARQUE TODAS AS 4 OPÇÕES:**
   - ❌ Block all public access
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public and cross-account access to buckets and objects through any public bucket or access point policies
6. Clique em **"Save changes"**
7. Digite `confirm` e clique em **"Confirm"**

---

## 🔧 Passo 2: Configurar Bucket Policy

1. Ainda na aba **"Permissions"**
2. Role até **"Bucket policy"**
3. Clique em **"Edit"**
4. Cole a seguinte política (substitua `ileala-uploads` se seu bucket tiver outro nome):

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
    },
    {
      "Sid": "AllowPutObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::540420948549:user/ileala-s3-uploader"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::ileala-uploads/*"
    }
  ]
}
```

**⚠️ IMPORTANTE:**
- Substitua `ileala-uploads` pelo nome do seu bucket
- Substitua `540420948549` pelo seu Account ID (vejo que é esse no seu console)
- Substitua `ileala-s3-uploader` pelo nome do seu IAM User (ou remova essa parte se não souber)

**Versão Simplificada (se não souber o IAM User):**

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

5. Clique em **"Save changes"**

---

## 🔧 Passo 3: Verificar Permissões do IAM User

1. Vá em **IAM → Users**
2. Encontre o usuário que tem a Access Key (`AKIAX3U4ZIJCXE34PFP4`)
3. Clique no usuário
4. Vá em **"Permissions"**
5. Verifique se tem uma política que permite:
   - `s3:PutObject`
   - `s3:PutObjectAcl`
   - `s3:GetObject`
   - `s3:ListBucket`

**Se não tiver, adicione a política:**

1. Clique em **"Add permissions" → "Attach policies directly"**
2. Procure por **"AmazonS3FullAccess"** (ou crie uma política customizada)
3. Marque e clique em **"Add permissions"**

**Política Customizada (mais segura):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ileala-uploads",
        "arn:aws:s3:::ileala-uploads/*"
      ]
    }
  ]
}
```

---

## ✅ Passo 4: Testar Upload

Após configurar tudo:

1. **Aguarde 1-2 minutos** (para as mudanças propagarem)
2. Vá no **painel admin** → **Products** → **Edit Product**
3. Tente fazer **upload de uma imagem**
4. Se funcionar, você verá: **"Image uploaded successfully"** ✅

---

## 🔍 Verificar se Está Funcionando

### No Console do Railway:

1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Veja os **Logs**
4. Procure por:
   - ✅ `[S3] Upload successful!` = Funcionando!
   - ❌ `[S3] Upload error:` = Ainda há problema

### Testar URL Pública:

1. No S3 Console, clique em uma imagem
2. Copie a **"Object URL"**
3. Cole no navegador
4. Se a imagem aparecer = Permissões OK! ✅
5. Se aparecer "Access Denied" = Ainda precisa configurar permissões ❌

---

## 🆘 Se Ainda Não Funcionar

### Verificar Logs do Railway:

1. Vá em **Railway → Deployments → Logs**
2. Procure por erros que começam com `[S3]`
3. Os erros vão mostrar exatamente o que está errado

### Erros Comuns:

**"Access Denied"**
- IAM User não tem permissões
- Solução: Adicione `AmazonS3FullAccess` ao IAM User

**"The specified bucket is not valid"**
- Nome do bucket incorreto
- Solução: Verifique se `AWS_S3_BUCKET` no Railway está exatamente igual ao nome do bucket

**"InvalidAccessKeyId"**
- Access Key incorreta
- Solução: Verifique se copiou a Access Key corretamente no Railway

---

## 📝 Checklist Final

- [ ] Block Public Access está **DESABILITADO**
- [ ] Bucket Policy está configurada (permite `s3:GetObject` para `*`)
- [ ] IAM User tem permissões S3 (`AmazonS3FullAccess` ou política customizada)
- [ ] Variáveis no Railway estão corretas:
  - [ ] `AWS_ACCESS_KEY_ID` = Access Key do IAM User
  - [ ] `AWS_SECRET_ACCESS_KEY` = Secret Key do IAM User
  - [ ] `AWS_REGION` = `us-east-1` (ou sua região)
  - [ ] `AWS_S3_BUCKET` = `ileala-uploads` (exatamente igual)
- [ ] Testou upload no painel admin
- [ ] Verificou logs do Railway

---

**Depois de configurar tudo, teste novamente o upload no painel admin!** 🚀

