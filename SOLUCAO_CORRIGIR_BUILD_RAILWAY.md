# 🔧 SOLUÇÃO: Corrigir Build no Railway (Opção 2)

**Objetivo:** Corrigir o erro `crypto.hash is not a function` para fazer o build funcionar no service separado.

---

## 📋 PASSO A PASSO

### Passo 1: Atualizar `nixpacks.toml` para Node.js 20.12.0+

O problema é que `nodejs_20` no Nixpacks pode usar uma versão antiga (20.11.0 ou anterior) que não tem `crypto.hash()`.

**Solução:** Especificar versão exata do Node.js.

**Arquivo:** `ileala-website/nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "pnpm"]

[phases.install]
cmds = ["pnpm install --no-frozen-lockfile"]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "pnpm run start"
```

**OU** usar variável de ambiente no Railway:

No Railway Dashboard → Service `site-ileala-oficial` → Settings → Variables:
- **Name:** `NODE_VERSION`
- **Value:** `20.12.0`

---

### Passo 2: Adicionar proteção no `vite.config.ts`

Adicionar tratamento para arquivos que não existem:

**Arquivo:** `ileala-website/vite.config.ts`

Adicionar após a linha 11 (depois de `const plugins`):

```typescript
// ... código existente ...

const plugins = [react(), tailwindcss(), vitePluginManusRuntime()];

// Proteção contra arquivos que não existem
const viteConfig = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(__dirname),
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Force new hash for every build to prevent cache issues
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
      onwarn(warning, warn) {
        // Ignorar avisos de módulos externos e imports dinâmicos durante o build
        if (warning.code === 'EXTERNAL_MODULE' || 
            warning.code === 'UNRESOLVED_IMPORT' ||
            (warning.message && warning.message.includes('@sentry/react')) ||
            (warning.message && warning.message.includes('embroidered-world-map.webp'))) {
          return;
        }
        warn(warning);
      },
    },
    // ... resto do código existente ...
  },
  // ... resto do código existente ...
});

export default viteConfig;
```

---

### Passo 3: Limpar Cache no Railway

1. Acesse Railway Dashboard
2. Vá em **Service `site-ileala-oficial`**
3. **Settings** → **Clear Build Cache**
4. Clique em **Clear Cache**

---

### Passo 4: Fazer Novo Deploy

1. No Railway Dashboard → Service `site-ileala-oficial`
2. **Deploy** → **Redeploy**
3. Aguarde o build completar

---

### Passo 5: Verificar Logs

Se o erro persistir, verifique os logs:

1. Railway Dashboard → Service `site-ileala-oficial`
2. **Deployments** → Clique no último deploy
3. Veja os **Build Logs**

**O que procurar:**
- ✅ `Node.js version: 20.12.0` ou superior
- ✅ `pnpm install` completou sem erros
- ✅ `pnpm run build` completou sem erros
- ❌ Se ainda aparecer `crypto.hash is not a function`, o Node.js ainda está antigo

---

## 🔍 ALTERNATIVA: Usar Dockerfile

Se o Nixpacks continuar usando Node.js antigo, você pode criar um `Dockerfile`:

**Arquivo:** `ileala-website/Dockerfile`

```dockerfile
FROM node:20.12.0-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY .pnpmrc ./

# Instalar dependências
RUN pnpm install --no-frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm run build

# Start
CMD ["pnpm", "run", "start"]
```

**E atualizar `railway.json`:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "pnpm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] `nixpacks.toml` atualizado com `nodejs-20_x` ou variável `NODE_VERSION=20.12.0`
- [ ] `vite.config.ts` tem proteção contra arquivos inexistentes
- [ ] Cache do Railway foi limpo
- [ ] Novo deploy foi feito
- [ ] Logs mostram Node.js 20.12.0+
- [ ] Build completou sem erros

---

## 🚨 SE AINDA NÃO FUNCIONAR

**Última opção:** Usar a **Opção 1** (mesmo service com domínios diferentes), que funciona imediatamente sem precisar corrigir o build.

---

**Última atualização:** 23 de Novembro de 2025

