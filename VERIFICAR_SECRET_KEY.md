# ✅ Verificar e Corrigir Secret Key no Railway

## ✅ Situação Atual

Você encontrou a Access Key:
- **Access Key ID:** `AKIAX3U4ZIJCXE34PFP4` ✅
- **Usuário:** `amplify-cli-user`
- **Permissões:** `AdministratorAccess` (tem todas as permissões) ✅
- **Status:** Usada há 19 horas ✅

## ⚠️ Problema Provável

A **Secret Access Key** no Railway pode estar:
- ❌ Incorreta
- ❌ Incompleta (cortada)
- ❌ Com espaços extras

---

## 🔧 Solução: Verificar e Atualizar Secret Key

### Passo 1: Ver Secret Key no IAM

1. **No AWS Console:**
   - Vá em **IAM → Users → amplify-cli-user**
   - Clique na aba **"Security credentials"** (Credenciais de segurança)

2. **Role até "Access keys"**

3. **Encontre a chave `AKIAX3U4ZIJCXE34PFP4`**

4. **⚠️ IMPORTANTE:**
   - A Secret Key **não pode ser vista novamente** depois de criada
   - Se você não tem a Secret Key salva, terá que criar uma nova Access Key

5. **Se você tem a Secret Key salva:**
   - Pule para o Passo 2

6. **Se você NÃO tem a Secret Key:**
   - Você precisa criar uma nova Access Key
   - Veja o guia: `CRIAR_NOVA_ACCESS_KEY.md`

---

### Passo 2: Atualizar Secret Key no Railway

1. **Acesse Railway Dashboard:**
   - Vá em [railway.app](https://railway.app)
   - Selecione seu projeto **ILE ALA**
   - Selecione o serviço **ileala-admin**

2. **Vá em Settings → Variables**

3. **Encontre `AWS_SECRET_ACCESS_KEY`**

4. **Clique nos 3 pontinhos (⋯) à direita**

5. **Clique em "Edit"**

6. **Cole a Secret Key:**
   - Certifique-se de copiar **TUDO** (é uma string longa)
   - Não deixe espaços no início ou fim
   - Não corte a string

7. **Clique em "Save"**

---

### Passo 3: Verificar Outras Variáveis

Certifique-se de que todas estão corretas:

| Variável | Valor Esperado | Status |
|----------|---------------|--------|
| `AWS_ACCESS_KEY_ID` | `AKIAX3U4ZIJCXE34PFP4` | ✅ |
| `AWS_SECRET_ACCESS_KEY` | (string longa) | ⚠️ Verificar |
| `AWS_REGION` | `us-east-1` | ✅ |
| `AWS_S3_BUCKET` | `ileala-uploads` | ✅ |

---

### Passo 4: Verificar Permissões do Bucket

Já verificamos:
- ✅ Bucket Policy configurada (permite `s3:GetObject` para `*`)
- ✅ Block Public Access desabilitado

Agora verifique se o bucket está acessível:

1. **No S3 Console:**
   - Vá em `ileala-uploads`
   - Clique em uma imagem na pasta `products/`
   - Copie a **"Object URL"**
   - Cole no navegador
   - Se a imagem aparecer = Permissões OK! ✅
   - Se aparecer "Access Denied" = Ainda precisa configurar ❌

---

## ✅ Passo 5: Testar Upload

Após atualizar a Secret Key:

1. **Aguarde 2-5 minutos** (Railway vai fazer redeploy)

2. **Teste no painel admin:**
   - Vá em **Products → Edit Product**
   - Clique em **"Upload"** na seção de imagens
   - Selecione uma imagem
   - Se aparecer **"Image uploaded successfully"** = Funcionou! ✅

3. **Verifique os logs do Railway:**
   - Vá em **Deployments → Logs**
   - Procure por:
     - ✅ `[S3] Upload successful!` = Funcionando!
     - ❌ `[S3] Upload error:` = Ainda há problema

---

## 🆘 Se Ainda Não Funcionar

### Verificar Logs do Railway:

1. Vá em **Railway → Deployments → Logs**
2. Procure por erros que começam com `[S3]`
3. Os erros vão mostrar exatamente o problema

### Erros Comuns:

**"InvalidAccessKeyId"**
- Access Key ID incorreta
- Solução: Verifique se `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4`

**"SignatureDoesNotMatch"**
- Secret Access Key incorreta ou incompleta
- Solução: 
  - Verifique se copiou a Secret Key completa
  - Não pode ter espaços no início ou fim
  - Se não tiver a Secret Key, crie uma nova Access Key

**"The specified bucket is not valid"**
- Nome do bucket incorreto
- Solução: Verifique se `AWS_S3_BUCKET` = `ileala-uploads` (exatamente igual)

**"Access Denied"**
- IAM User sem permissões (mas você tem `AdministratorAccess`, então não é isso)
- Bucket sem permissões públicas
- Solução: Verifique Bucket Policy

---

## 📝 Checklist Final

- [ ] Secret Key verificada/corrigida no Railway
- [ ] `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4` ✅
- [ ] `AWS_SECRET_ACCESS_KEY` = (string longa completa) ⚠️
- [ ] `AWS_REGION` = `us-east-1` ✅
- [ ] `AWS_S3_BUCKET` = `ileala-uploads` ✅
- [ ] Bucket Policy configurada ✅
- [ ] Block Public Access desabilitado ✅
- [ ] Aguardou redeploy do Railway (2-5 min)
- [ ] Testou upload no painel admin
- [ ] Verificou logs do Railway

---

## 💡 Se Não Tiver a Secret Key

Se você não tem a Secret Key salva, você tem 2 opções:

### Opção 1: Criar Nova Access Key

1. No IAM → Users → amplify-cli-user → Security credentials
2. Clique em "Create access key"
3. Copie Access Key ID e Secret Access Key
4. Atualize ambas no Railway

### Opção 2: Usar a Outra Access Key

Você tem outra Access Key: `AKIAX3U4ZIJCS65VUDMM`
- Mas ela nunca foi usada
- Você precisaria da Secret Key dela também

**Recomendação:** Crie uma nova Access Key e atualize no Railway.

---

**Depois de verificar/corrigir a Secret Key no Railway, teste novamente o upload!** 🚀

