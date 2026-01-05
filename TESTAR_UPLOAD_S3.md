# ✅ Testar Upload S3 - Checklist Completo

## ✅ Situação Atual

Você tem configurado no Railway:
- ✅ `AWS_ACCESS_KEY_ID`: `AKIAX3U4ZIJCXE34PFP4`
- ✅ `AWS_SECRET_ACCESS_KEY`: `ibMK7VLiQBKy3dzDJrARXGHuaS6z5q3WldT7IKDF`
- ⚠️ `AWS_REGION`: (precisa verificar se é `us-east-1`)
- ⚠️ `AWS_S3_BUCKET`: (precisa verificar se é `ileala-uploads`)

---

## 🔍 Passo 1: Verificar Todas as Variáveis no Railway

1. **No Railway Dashboard:**
   - Vá em **Settings → Variables**
   - Verifique cada variável:

### Variáveis que DEVEM estar assim:

| Variável | Valor Correto | Como Verificar |
|----------|---------------|----------------|
| `AWS_ACCESS_KEY_ID` | `AKIAX3U4ZIJCXE34PFP4` | Clique no ícone de olho para revelar |
| `AWS_SECRET_ACCESS_KEY` | `ibMK7VLiQBKy3dzDJrARXGHuaS6z5q3WldT7IKDF` | ✅ Já está visível |
| `AWS_REGION` | `us-east-1` | Clique no ícone de olho para revelar |
| `AWS_S3_BUCKET` | `ileala-uploads` | Clique no ícone de olho para revelar |

2. **Se alguma estiver diferente:**
   - Clique no **ícone de lápis** (✏️) ao lado da variável
   - Corrija o valor
   - Clique em **"Save"**

---

## 🔍 Passo 2: Verificar Permissões do Bucket S3

### 2.1 Verificar Block Public Access

1. **No AWS S3 Console:**
   - Vá em `ileala-uploads` → **Permissions**
   - Role até **"Block public access (bucket settings)"**
   - Deve estar **DESABILITADO** (todas as 4 opções desmarcadas)
   - Se estiver habilitado, clique em **"Edit"** e desmarque tudo

### 2.2 Verificar Bucket Policy

1. **Na mesma aba "Permissions"**
2. **Role até "Bucket policy"**
3. **Deve ter esta política:**

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

4. **Se não tiver ou estiver diferente:**
   - Clique em **"Edit"**
   - Cole a política acima
   - Clique em **"Save changes"**

---

## ✅ Passo 3: Testar Upload no Painel Admin

1. **Aguarde 2-5 minutos** após qualquer mudança (para o Railway fazer redeploy)

2. **Acesse o painel admin:**
   - Vá em `admin.ileala.ae` (ou `www.ileala.ae/admin`)
   - Faça login

3. **Vá em Products → Edit Product** (ou Add Product)

4. **Na seção de imagens:**
   - Clique em **"Upload"**
   - Selecione uma imagem do seu computador
   - Aguarde o upload

5. **Resultados possíveis:**
   - ✅ **"Image uploaded successfully"** = Funcionou! 🎉
   - ❌ **"Storage upload failed: ..."** = Ainda há problema (veja Passo 4)

---

## 🔍 Passo 4: Verificar Logs do Railway

Se o upload falhar:

1. **No Railway Dashboard:**
   - Vá em **Deployments**
   - Clique no deploy mais recente
   - Clique em **"Logs"**

2. **Procure por erros que começam com `[S3]`:**

### Erros Comuns e Soluções:

**Erro: "InvalidAccessKeyId"**
```
[S3] Upload error: InvalidAccessKeyId
```
**Solução:**
- Verifique se `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4` (exatamente igual)

**Erro: "SignatureDoesNotMatch"**
```
[S3] Upload error: SignatureDoesNotMatch
```
**Solução:**
- Verifique se `AWS_SECRET_ACCESS_KEY` está completa (40 caracteres)
- Não pode ter espaços no início ou fim
- Se necessário, recrie a Access Key

**Erro: "The specified bucket is not valid"**
```
[S3] Upload error: The specified bucket is not valid
```
**Solução:**
- Verifique se `AWS_S3_BUCKET` = `ileala-uploads` (exatamente igual, sem espaços)
- Verifique se `AWS_REGION` = `us-east-1` (região onde o bucket foi criado)

**Erro: "Access Denied"**
```
[S3] Upload error: Access Denied
```
**Solução:**
- Verifique se o IAM User tem `AdministratorAccess` (você já tem ✅)
- Verifique se o bucket tem Block Public Access desabilitado
- Verifique se a Bucket Policy está configurada

**Erro: "NoSuchBucket"**
```
[S3] Upload error: NoSuchBucket
```
**Solução:**
- Verifique se o bucket `ileala-uploads` existe na região `us-east-1`
- Verifique se o nome do bucket está correto

---

## 🔍 Passo 5: Testar URL Pública

Para verificar se as permissões estão corretas:

1. **No S3 Console:**
   - Vá em `ileala-uploads` → `products/`
   - Clique em qualquer imagem
   - Copie a **"Object URL"** (exemplo: `https://ileala-uploads.s3.us-east-1.amazonaws.com/products/...`)

2. **Cole no navegador:**
   - Se a imagem aparecer = Permissões OK! ✅
   - Se aparecer "Access Denied" = Precisa configurar Bucket Policy ❌

---

## 📝 Checklist Final

Antes de testar, verifique:

- [ ] `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4` ✅
- [ ] `AWS_SECRET_ACCESS_KEY` = `ibMK7VLiQBKy3dzDJrARXGHuaS6z5q3WldT7IKDF` ✅
- [ ] `AWS_REGION` = `us-east-1` ⚠️ Verificar
- [ ] `AWS_S3_BUCKET` = `ileala-uploads` ⚠️ Verificar
- [ ] Block Public Access desabilitado ✅
- [ ] Bucket Policy configurada ✅
- [ ] IAM User tem `AdministratorAccess` ✅
- [ ] Aguardou redeploy (2-5 min)
- [ ] Testou upload no painel admin
- [ ] Verificou logs do Railway (se falhou)

---

## 🚀 Próximos Passos

1. **Verifique `AWS_REGION` e `AWS_S3_BUCKET` no Railway**
2. **Teste o upload no painel admin**
3. **Se falhar, verifique os logs do Railway**
4. **Me envie o erro exato que aparecer nos logs**

---

**Depois de verificar tudo, teste o upload e me diga o resultado!** 🎯

