# 🔍 Diagnóstico: Imagens Não Aparecem no Painel Admin e Site

## ✅ Correções Aplicadas

1. ✅ Substituído `<img>` por `<LazyImage>` no painel admin (melhor tratamento de erros)
2. ✅ Adicionado feedback visual quando imagem não existe
3. ✅ Logs de debug no console do navegador

---

## 🔍 Como Diagnosticar o Problema

### Passo 1: Verificar Console do Navegador

1. Abra o painel admin: https://www.ileala.ae/admin
2. Pressione **F12** (ou Cmd+Option+I no Mac)
3. Vá na aba **Console**
4. Procure por erros relacionados a imagens:
   - `Failed to load image`
   - `CORS error`
   - `403 Forbidden`
   - `404 Not Found`

### Passo 2: Verificar se a URL Está Sendo Salva

1. No painel admin, edite um produto
2. Abra o Console (F12)
3. Procure por logs:
   - `[Admin] Uploading image: ...`
   - `[Admin] Image uploaded successfully: ...`
   - `[Admin] Product data to save: ...`

### Passo 3: Verificar URL da Imagem

1. No painel admin, clique em "Editar" em um produto
2. Veja o campo "Image URL"
3. Copie a URL
4. Cole no navegador e pressione Enter
5. Se aparecer erro 403 ou 404, o problema é com o S3

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: Erro 403 Forbidden

**Causa:** Bucket S3 não está configurado para acesso público

**Solução:**
1. Acesse o AWS Console
2. Vá em S3 → Seu bucket (`ileala-uploads`)
3. Vá em **Permissions** → **Bucket Policy**
4. Adicione esta política:

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

### Problema 2: Erro CORS

**Causa:** CORS não está configurado no bucket

**Solução:**
1. Acesse o AWS Console
2. Vá em S3 → Seu bucket → **Permissions** → **CORS**
3. Adicione esta configuração:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Problema 3: URL Incorreta

**Causa:** URL do S3 está sendo gerada incorretamente

**Verificar:**
1. Abra o Console do navegador (F12)
2. Procure por: `[S3] Upload attempt:`
3. Verifique se a URL está no formato:
   ```
   https://ileala-uploads.s3.us-east-1.amazonaws.com/products/...
   ```

### Problema 4: Variáveis de Ambiente Não Configuradas

**Verificar no Railway:**
1. Acesse: https://railway.app
2. Vá no seu projeto
3. Vá em **Variables**
4. Verifique se existem:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`

---

## 🧪 Teste Rápido

### Teste 1: Verificar se Upload Funciona

1. No painel admin, clique em "Adicionar Produto"
2. Selecione uma imagem
3. Abra o Console (F12)
4. Procure por logs de upload
5. Se aparecer erro, copie a mensagem

### Teste 2: Verificar URL no Banco de Dados

Execute este SQL no Neon:

```sql
SELECT id, name, "imageUrl" 
FROM products 
WHERE "imageUrl" IS NOT NULL 
LIMIT 5;
```

Verifique se:
- ✅ As URLs começam com `https://`
- ✅ As URLs apontam para o S3
- ✅ As URLs não são do Sanity (`cdn.sanity.io`)

---

## 📋 Checklist de Verificação

- [ ] Console do navegador não mostra erros
- [ ] URL da imagem está sendo salva no banco
- [ ] URL da imagem é acessível (abre no navegador)
- [ ] Bucket S3 está configurado para acesso público
- [ ] CORS está configurado no bucket
- [ ] Variáveis de ambiente estão configuradas no Railway
- [ ] Imagem aparece no preview do formulário
- [ ] Imagem aparece na lista de produtos do admin
- [ ] Imagem aparece no site público

---

## 🆘 Se Nada Funcionar

1. **Verifique os logs do Railway:**
   - Acesse: https://railway.app
   - Vá em **Deployments** → Clique no último deploy
   - Veja os logs para erros de upload

2. **Teste upload manual:**
   - Tente fazer upload de uma imagem pequena (< 1MB)
   - Veja se o erro persiste

3. **Verifique permissões do bucket:**
   - Certifique-se de que o bucket permite leitura pública
   - Verifique se as credenciais AWS estão corretas

---

## 📞 Informações para Debug

Se precisar de ajuda, me envie:

1. **Screenshot do Console** (F12 → Console)
2. **URL de uma imagem** que não está aparecendo
3. **Mensagem de erro** completa (se houver)
4. **Logs do Railway** (se possível)

