# 🔍 Diagnóstico Completo: Service ACTIVE mas retorna 404

**Service:** `site-ileala-oficial`  
**Status:** ACTIVE mas retorna 404 Not Found

---

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. Caminho dos Static Files Incorreto

**Diferença nos logs:**
- `ileala-website`: `/app/dist/public` ✅
- `site-ileala-oficial`: `/app/ileala-website/dist/public` ❌

**Causa:** O código em `vite.ts` linha 52-53 calcula o caminho como:
```typescript
const projectRoot = path.resolve(import.meta.dirname, "..", "..");
const distPath = path.resolve(projectRoot, "dist", "public");
```

No Dockerfile, o `WORKDIR` está em `/app/ileala-website`, então:
- `import.meta.dirname` = `/app/ileala-website/server/_core`
- `projectRoot` = `/app/ileala-website`
- `distPath` = `/app/ileala-website/dist/public` ✅ (correto!)

**Mas o problema pode ser:** O Railway pode estar usando Nixpacks ao invés do Dockerfile!

---

### 2. Railway Pode Estar Usando Nixpacks

**Configuração atual:**
- Builder: Nixpacks
- Root Directory: `/ileala-website`
- Custom Build Command: `cd ileala-website && pnpm install...`
- Custom Start Command: `cd ileala-website && pnpm run start`

**Problema:** Criamos um Dockerfile, mas o Railway pode estar usando Nixpacks ainda!

**Solução:** Verificar se o Railway está usando Dockerfile ou Nixpacks.

---

### 3. Porta Configurada Incorretamente

**Configuração:**
- Variável `PORT=8080`
- Railway mostra: "Port 8000 · Metal Edge"

**Problema:** 
- O código usa `process.env.PORT || "3000"` (linha 246)
- O Railway pode estar injetando `PORT` diferente
- O Railway mostra "Port 8000" mas você configurou 8080

**Solução:** Remover variável `PORT` e deixar Railway injetar automaticamente.

---

### 4. Service Não Está Exposto

**Erro:** "Not Found - The train has not arrived at the station"

**Causa:** O service não está **exposto/publicado** no Railway.

**Solução:** Expor o service (Generate Domain ou toggle Public).

---

### 5. Mensagens de Servidor Não Aparecem

**Problema:** Logs não mostram "Server running on http://localhost:XXXX/"

**Possíveis causas:**
- Logger pode não estar funcionando
- Servidor pode não estar iniciando
- Logs podem estar sendo filtrados

**Verificação:** Procurar nos logs por qualquer mensagem de servidor.

---

## ✅ SOLUÇÕES

### Solução 1: Verificar se Railway Está Usando Dockerfile

1. **No Railway Dashboard:**
   - Service `site-ileala-oficial` → Settings
   - Seção **"Build"**
   - Verificar **"Builder"**:
     - ✅ Deve ser **"Dockerfile"**
     - ❌ Se for **"Nixpacks"**, mudar para Dockerfile

2. **Se estiver Nixpacks:**
   - Mudar para **"Dockerfile"**
   - Fazer redeploy

---

### Solução 2: Remover Variável PORT

1. **Settings → Variables:**
   - Encontrar `PORT`
   - **DELETE** a variável
   - Deixar Railway injetar automaticamente

2. **Por quê:**
   - O Railway injeta `PORT` automaticamente
   - O código já usa `process.env.PORT || "3000"`
   - Não precisa configurar manualmente

---

### Solução 3: Expor o Service

1. **Na página principal do service:**
   - Procure por **"Generate Domain"** ou **"Networking"**
   - Clique em **"Generate Domain"**
   - Ou ative toggle **"Public"**

2. **Adicionar domínio customizado:**
   - **"Add Custom Domain"**
   - Digite: `admin.ileala.ae`
   - Configure DNS conforme instruções

---

### Solução 4: Verificar Caminho dos Static Files

O caminho `/app/ileala-website/dist/public` está **correto** para o Dockerfile!

**Se o Railway estiver usando Nixpacks:**
- O caminho pode estar diferente
- Mudar para Dockerfile resolve

---

## 🔍 VERIFICAÇÕES NECESSÁRIAS

### 1. Verificar Builder no Railway

1. Settings → Build → Builder
2. Deve ser: **"Dockerfile"**
3. Se for "Nixpacks", mudar para "Dockerfile"

### 2. Verificar se Service Está Exposto

1. Na página principal do service
2. Deve aparecer um domínio (ex: `site-ileala-oficial-production.up.railway.app`)
3. Se não aparecer, clicar em "Generate Domain"

### 3. Verificar Variável PORT

1. Settings → Variables
2. Se `PORT` existir, **DELETE**
3. Deixar Railway injetar automaticamente

### 4. Verificar Logs Completos

1. Deploy Logs → Procure por:
   - `Server running on http://localhost:XXXX/`
   - `Health check available at http://localhost:XXXX/health`
   - Qualquer mensagem de erro

---

## 📋 CHECKLIST DE CORREÇÃO

- [ ] Builder está como **"Dockerfile"** (não Nixpacks)
- [ ] Variável `PORT` foi **removida** (deixar Railway injetar)
- [ ] Service está **exposto** (domínio gerado ou toggle Public)
- [ ] Domínio customizado `admin.ileala.ae` adicionado
- [ ] DNS configurado (se usando domínio customizado)
- [ ] Logs mostram "Server running on http://localhost:XXXX/"
- [ ] Health check funciona: `/health`
- [ ] Site carrega no domínio

---

## 🎯 ORDEM DE AÇÕES

1. ✅ **Verificar Builder** → Deve ser Dockerfile
2. ✅ **Remover PORT** → Deixar Railway injetar
3. ✅ **Expor Service** → Generate Domain
4. ✅ **Adicionar Domínio** → admin.ileala.ae
5. ✅ **Fazer Redeploy** → Aplicar mudanças
6. ✅ **Testar** → Health check e site

---

**Última atualização:** 23 de Novembro de 2025




