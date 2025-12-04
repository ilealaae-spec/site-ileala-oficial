# 🔍 Diagnóstico Técnico Completo

## 📋 Problemas Reportados:

1. **Imagens do painel admin não aparecem no site**
2. **Site está na versão antiga (não atualiza)**

---

## 🔴 PROBLEMA 1: Imagens Não Aparecem no Site

### **Fluxo Técnico de Upload de Imagens:**

```
1. Admin seleciona arquivo
   ↓
2. FileReader converte para base64
   ↓
3. Frontend chama: trpc.admin.uploadImage.mutateAsync()
   ↓
4. Backend recebe: { fileName, fileData (base64), contentType }
   ↓
5. Backend decodifica base64 → Buffer
   ↓
6. Backend valida: validateUpload() + validateImageBuffer()
   ↓
7. Backend gera key: `products/${timestamp}-${filename}`
   ↓
8. Backend chama: storagePut(key, buffer, contentType)
   ↓
9. storagePut() → S3Client.send(PutObjectCommand)
   ↓
10. S3 retorna sucesso
   ↓
11. Backend gera URL: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
   ↓
12. Backend retorna: { url, key }
   ↓
13. Frontend recebe URL e salva em productData.imageUrl
   ↓
14. Frontend chama: trpc.admin.products.create.mutate()
   ↓
15. Backend salva produto no PostgreSQL com imageUrl
   ↓
16. Site busca produtos via trpc.products.list
   ↓
17. Site renderiza <img src={product.imageUrl} />
```

### **Pontos de Falha Identificados:**

#### **A. Variáveis de Ambiente S3 Não Configuradas**
**Arquivo:** `server/storage.ts`
```typescript
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
```

**Problema:**
- Se `AWS_ACCESS_KEY_ID` ou `AWS_SECRET_ACCESS_KEY` estiverem vazios, upload falha silenciosamente
- URL é gerada mas arquivo não é enviado para S3

**Verificação:**
```bash
# No Railway, verifique se estas variáveis estão configuradas:
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=ileala-uploads
```

#### **B. Permissões do Bucket S3**
**Problema:**
- Bucket pode não ter permissão de escrita
- Bucket pode não ter permissão de leitura pública
- Política de bucket pode estar incorreta

**Verificação:**
1. Acesse AWS Console → S3 → `ileala-uploads`
2. Verifique:
   - ✅ Permissões de escrita para a IAM user
   - ✅ Permissões de leitura pública (ou CloudFront/CDN)
   - ✅ CORS configurado corretamente

#### **C. URL Gerada Incorreta**
**Arquivo:** `server/storage.ts:54`
```typescript
const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
```

**Problema:**
- Se `AWS_REGION` estiver errado, URL não funciona
- Se bucket estiver em região diferente, URL não funciona
- Formato de URL pode estar incorreto para alguns buckets

**Verificação:**
- Teste a URL gerada diretamente no navegador
- Verifique se retorna 200 OK ou 403 Forbidden

#### **D. Erro Silencioso no Upload**
**Arquivo:** `server/routers.ts:1318-1352`
```typescript
try {
  // ... upload logic
} catch (error) {
  console.error('[S3] Upload error:', error);
  throw new Error(`Storage upload failed: ${error.message}`);
}
```

**Problema:**
- Erro pode não estar sendo capturado no frontend
- Toast de erro pode não estar aparecendo

**Verificação:**
- Verifique logs do Railway (Deploy Logs)
- Procure por `[S3] Upload error:`
- Procure por `Storage upload failed`

#### **E. Cache do Cliente (tRPC)**
**Problema:**
- tRPC pode estar servindo cache antigo
- Produto criado mas cache não invalidado

**Solução:**
- Limpar cache do navegador
- Aguardar 5 minutos (cache TTL)
- Forçar refresh (Ctrl+Shift+R)

---

## 🔴 PROBLEMA 2: Site na Versão Antiga

### **Fluxo de Build e Deploy:**

```
1. Código commitado no GitHub
   ↓
2. Railway detecta commit (ou trigger manual)
   ↓
3. Railway executa: Dockerfile ou nixpacks.toml
   ↓
4. Build: pnpm install + pnpm run build
   ↓
5. Vite build gera: dist/public/
   ↓
6. Dockerfile copia dist/public para container
   ↓
7. Railway inicia: pnpm run start
   ↓
8. Server serve arquivos de dist/public
   ↓
9. Cliente acessa site → recebe arquivos de dist/public
```

### **Pontos de Falha Identificados:**

#### **A. Build Não Está Sendo Executado**
**Arquivo:** `Dockerfile`
```dockerfile
RUN pnpm run build
```

**Problema:**
- Build pode estar falhando silenciosamente
- Build pode não estar sendo executado
- Cache do build pode estar servindo versão antiga

**Verificação:**
1. Railway → Build Logs
2. Procure por:
   - `[BUILD] Cleaning cache...`
   - `vite build`
   - `Build completed`
   - Erros em vermelho

#### **B. Arquivos Não Estão em dist/public/**
**Arquivo:** `vite.config.ts` (precisa verificar)

**Problema:**
- Vite pode estar gerando em `dist/` em vez de `dist/public/`
- Server pode estar procurando no lugar errado

**Verificação:**
```bash
# No Railway, após build:
ls -la dist/
ls -la dist/public/
```

#### **C. Server Servindo Arquivos Errados**
**Arquivo:** `server/_core/vite.ts` - função `serveStatic()`

**Problema:**
- Server pode estar servindo de diretório errado
- Server pode estar em modo desenvolvimento

**Verificação:**
- Railway → Deploy Logs
- Procure por: `[Server] Using static files (production mode)`
- Procure por: `distPath: /app/dist/public`

#### **D. Cache do Navegador**
**Problema:**
- Navegador pode estar servindo arquivos em cache
- Service Worker pode estar ativo

**Solução:**
- Limpar cache do navegador (Ctrl+Shift+R)
- Modo anônimo
- Hard refresh

#### **E. Railway Não Está Fazendo Deploy**
**Problema:**
- Watch paths podem estar incorretos
- Railway pode não estar detectando commits

**Verificação:**
1. Railway → Settings → Source
2. Verifique:
   - ✅ Repositório conectado
   - ✅ Branch: `main`
   - ✅ Watch paths: `ileala-website/**` (ou vazio para tudo)

---

## 🔧 Verificações Técnicas Necessárias:

### **1. Verificar Variáveis de Ambiente S3:**

**No Railway:**
1. Acesse `ileala-website` service
2. Vá em **Variables**
3. Verifique:
   ```
   AWS_ACCESS_KEY_ID=xxx (não vazio)
   AWS_SECRET_ACCESS_KEY=xxx (não vazio)
   AWS_REGION=us-east-1 (ou região correta)
   AWS_S3_BUCKET=ileala-uploads (nome correto)
   ```

**Teste:**
```bash
# No Railway, execute:
echo $AWS_ACCESS_KEY_ID
echo $AWS_S3_BUCKET
```

### **2. Verificar Logs de Upload:**

**No Railway:**
1. Acesse Deploy Logs
2. Faça upload de uma imagem no admin
3. Procure por:
   - `[S3] Upload attempt:`
   - `[S3] Upload successful!`
   - `[S3] Upload error:`

### **3. Verificar Build:**

**No Railway:**
1. Acesse Build Logs
2. Procure por:
   - `[BUILD] Cleaning cache...`
   - `vite build`
   - `Build completed`
   - `dist/public/` criado

### **4. Verificar Deploy:**

**No Railway:**
1. Acesse Deploy Logs
2. Procure por:
   - `[Server] Using static files (production mode)`
   - `distPath: /app/dist/public`
   - `index.html found in build directory`

### **5. Verificar URL da Imagem:**

**No Admin:**
1. Crie um produto com imagem
2. Edite o produto
3. Copie a URL da imagem
4. Cole no navegador
5. Verifique:
   - ✅ Retorna 200 OK → Imagem existe
   - ❌ Retorna 403 Forbidden → Permissão S3
   - ❌ Retorna 404 Not Found → Arquivo não existe

### **6. Verificar Banco de Dados:**

**SQL (se tiver acesso):**
```sql
-- Ver últimos produtos criados
SELECT id, name, nameEN, imageUrl, active, createdAt 
FROM products 
ORDER BY id DESC 
LIMIT 5;

-- Ver produtos com imagem
SELECT id, nameEN, imageUrl 
FROM products 
WHERE imageUrl IS NOT NULL 
AND imageUrl != ''
ORDER BY id DESC 
LIMIT 10;

-- Ver produtos sem imagem
SELECT id, nameEN, imageUrl 
FROM products 
WHERE imageUrl IS NULL 
OR imageUrl = ''
ORDER BY id DESC 
LIMIT 10;
```

---

## 🚨 Checklist de Diagnóstico:

### **Para Imagens:**

- [ ] Variáveis S3 configuradas no Railway?
- [ ] Logs mostram `[S3] Upload successful!`?
- [ ] URL da imagem abre no navegador?
- [ ] Produto tem `imageUrl` preenchido no banco?
- [ ] Site está buscando `product.imageUrl` corretamente?

### **Para Versão Antiga:**

- [ ] Build está sendo executado?
- [ ] `dist/public/` está sendo criado?
- [ ] Server está servindo de `dist/public/`?
- [ ] `NODE_ENV=production` no Railway?
- [ ] Cache do navegador limpo?

---

## 📊 Próximos Passos:

1. **Execute as verificações acima**
2. **Me informe:**
   - ✅ Variáveis S3 estão configuradas?
   - ✅ Logs mostram upload bem-sucedido?
   - ✅ URL da imagem funciona?
   - ✅ Build está sendo executado?
   - ✅ Server está em modo produção?
   - ✅ Qual é a mensagem de erro (se houver)?

Com essas informações, posso identificar exatamente onde está o problema!

