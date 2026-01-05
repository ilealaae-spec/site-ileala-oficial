# 🔍 Como Verificar Logs S3 no Railway

## 📋 Passo a Passo

### 1. Acessar os Logs

1. **No Railway Dashboard:**
   - Vá em **Deployments**
   - Clique no deploy mais recente (o que está "Active")
   - Clique na aba **"Deploy Logs"** ou **"HTTP Logs"**

### 2. Fazer Upload de Teste

1. **Em outra aba/janela:**
   - Acesse `admin.ileala.ae`
   - Vá em **Products → Edit Product**
   - Clique em **"Upload"** na seção de imagens
   - Selecione uma imagem

### 3. Verificar os Logs em Tempo Real

**Procure por estas mensagens nos logs:**

#### ✅ Se funcionar, você verá:
```
[S3] Upload attempt: { bucket: 'ileala-uploads', region: 'us-east-1', ... }
[S3] Sending PutObjectCommand...
[S3] Upload successful!
```

#### ❌ Se falhar, você verá:
```
[S3] Upload attempt: { ... }
[S3] Upload error: ...
[S3] Error details: { name: '...', message: '...' }
```

### 4. Erros Comuns e Soluções

#### Erro: "InvalidAccessKeyId"
```
[S3] Upload error: InvalidAccessKeyId
```
**Solução:**
- Verifique se `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4` no Railway

#### Erro: "SignatureDoesNotMatch"
```
[S3] Upload error: SignatureDoesNotMatch
```
**Solução:**
- Verifique se `AWS_SECRET_ACCESS_KEY` está completa (40 caracteres)
- Não pode ter espaços no início ou fim

#### Erro: "The specified bucket is not valid"
```
[S3] Upload error: The specified bucket is not valid
```
**Possíveis causas:**
1. Nome do bucket incorreto
2. Bucket não existe na região especificada
3. Credenciais não têm acesso ao bucket
4. Região incorreta

**Solução:**
- Verifique se `AWS_S3_BUCKET` = `ileala-uploads` (exatamente igual)
- Verifique se `AWS_REGION` = `us-east-1`
- Verifique se o bucket existe no S3 Console

#### Erro: "Access Denied"
```
[S3] Upload error: Access Denied
```
**Solução:**
- Verifique se o IAM User tem `AdministratorAccess` (você já tem ✅)
- Verifique se o bucket tem Block Public Access desabilitado
- Verifique se a Bucket Policy está configurada

---

## 🔍 Informações Importantes nos Logs

Quando você fizer upload, os logs devem mostrar:

```javascript
[S3] Upload attempt: {
  bucket: 'ileala-uploads',
  region: 'us-east-1',
  key: 'products/...',
  contentType: 'image/jpeg',
  hasAccessKey: true,
  hasSecretKey: true,
  accessKeyPrefix: 'AKIAX3U4'  // Primeiros 8 caracteres da Access Key
}
```

**Se algum desses valores estiver errado, você saberá qual é o problema!**

---

## 📝 Checklist de Verificação

Antes de verificar os logs, confirme:

- [ ] `AWS_ACCESS_KEY_ID` = `AKIAX3U4ZIJCXE34PFP4` ✅
- [ ] `AWS_SECRET_ACCESS_KEY` = (string completa de 40 caracteres) ⚠️
- [ ] `AWS_REGION` = `us-east-1` ✅
- [ ] `AWS_S3_BUCKET` = `ileala-uploads` ✅
- [ ] Bucket existe no S3 Console ✅
- [ ] Bucket Policy configurada ✅
- [ ] Block Public Access desabilitado ✅

---

## 🚀 Próximos Passos

1. **Abra os logs do Railway** (Deploy Logs ou HTTP Logs)
2. **Tente fazer upload** de uma imagem no painel admin
3. **Observe os logs em tempo real**
4. **Me envie:**
   - A mensagem de erro completa que aparecer
   - Ou uma captura de tela dos logs

Com essas informações, vou conseguir identificar exatamente qual é o problema! 🎯

