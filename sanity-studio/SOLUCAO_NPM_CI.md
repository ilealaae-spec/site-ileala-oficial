# 🔧 Solução: Railway Usando npm ci em Workspace

## 🎯 Problema

O Railway está detectando automaticamente que o projeto é um **workspace npm** (porque há `package.json` na raiz com `workspaces`) e está tentando usar `npm ci` em vez de `npm install`.

**Erro:**
```
npm error Clean install a project
npm error Usage: npm ci
ERROR: failed to build: failed to solve: process "npm ci" did not complete successfully: exit code: 1
```

---

## ✅ Solução Aplicada

### 1. Configurações no Railway

**Railway Dashboard → Service: `ileala-sanity-studio` → Settings**

**IMPORTANTE:** Configure o **Root Directory**:
- **Root Directory:** `sanity-studio`
- Isso faz o Railway rodar todos os comandos dentro de `sanity-studio/`, não na raiz

### 2. Arquivos de Configuração

#### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

[phases.install]
cmds = [
  "rm -f package-lock.json || true",
  "rm -f ../package-lock.json || true",
  "npm config set package-lock false",
  "npm config set prefer-offline false",
  "npm config set ci false",
  "npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund"
]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l $PORT"
```

#### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "rm -f package-lock.json && npm config set package-lock false && npm install --no-package-lock --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT"
  }
}
```

#### `.npmrc`
```
package-lock=false
prefer-offline=false
legacy-peer-deps=true
fund=false
audit=false
```

---

## 🔧 Passo a Passo no Railway

### PASSO 1: Configurar Root Directory

1. **Railway Dashboard** → Service: `ileala-sanity-studio`
2. Clique em **"Settings"** (ou **"⚙️ Settings"**)
3. Procure por **"Root Directory"** ou **"Source"**
4. Configure: **`sanity-studio`**
5. Clique em **"Save"**

**O que isso faz:**
- Railway roda todos os comandos dentro de `sanity-studio/`
- Não detecta mais o workspace na raiz
- Usa o `package.json` de `sanity-studio/` diretamente

### PASSO 2: Verificar Build Command

1. Ainda em **Settings**
2. Verifique se **"Build Command"** está vazio (deixe vazio para usar `nixpacks.toml`)
3. Ou configure manualmente:
   ```
   rm -f package-lock.json && npm install --no-package-lock --legacy-peer-deps && npm run build
   ```

### PASSO 3: Aguardar Deploy

1. Railway fará deploy automaticamente após salvar
2. Ou force um redeploy:
   - **Deployments** → 3 pontos (⋯) → **"Redeploy"**

---

## 🚨 Se Ainda Não Funcionar

### Opção A: Usar Dockerfile (Mais Controle)

Crie `sanity-studio/Dockerfile`:
```dockerfile
FROM node:20

WORKDIR /app

# Copy package files
COPY package.json ./
COPY .npmrc ./

# Install dependencies (not ci)
RUN npm config set package-lock false && \
    npm install --no-package-lock --legacy-peer-deps

# Copy source
COPY . .

# Build
RUN npm run build

# Start
CMD ["npx", "serve", "-s", "dist", "-l", "$PORT"]
```

### Opção B: Remover Workspace da Raiz (Não Recomendado)

**⚠️ ATENÇÃO:** Isso pode afetar outros serviços!

1. Edite `package.json` na raiz
2. Remova ou comente `workspaces`:
   ```json
   {
     "workspaces": []
   }
   ```

---

## ✅ Verificação

Após configurar, verifique nos **Build Logs**:

**✅ Deve aparecer:**
```
$ npm install --no-package-lock --legacy-peer-deps
```

**❌ NÃO deve aparecer:**
```
$ npm ci
```

---

## 📝 Checklist

- [ ] Root Directory configurado como `sanity-studio` no Railway
- [ ] `nixpacks.toml` configurado corretamente
- [ ] `railway.json` configurado corretamente
- [ ] `.npmrc` configurado corretamente
- [ ] Build logs mostram `npm install` (não `npm ci`)
- [ ] Build completa com sucesso
- [ ] Sanity Studio acessível

---

## 🆘 Ainda Não Funciona?

1. **Verifique Root Directory:**
   - Railway Dashboard → Settings → Root Directory
   - Deve ser: `sanity-studio`

2. **Force Redeploy:**
   - Deployments → Redeploy

3. **Verifique Build Logs:**
   - Procure por `npm ci` (não deve aparecer)
   - Procure por `npm install` (deve aparecer)

4. **Verifique Variáveis:**
   - `SANITY_STUDIO_PROJECT_ID`
   - `SANITY_STUDIO_DATASET`
   - `NODE_ENV=production`

