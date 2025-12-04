# ✅ CORREÇÕES APLICADAS - Instruções para Railway

**Data:** 23 de Novembro de 2025  
**Status:** Correções aplicadas no código

---

## 🔧 CORREÇÕES IMPLEMENTADAS

### 1. ✅ Atualizado `nixpacks.toml`
- Mudado de `nodejs_20` para `nodejs-20_x` (usa versão mais recente do Node.js 20)
- Isso garante que o Node.js 20.12.0+ seja usado (que tem `crypto.hash()`)

### 2. ✅ Atualizado `vite.config.ts`
- Adicionada proteção para ignorar avisos sobre `embroidered-world-map.webp`
- Isso evita que o build falhe por causa de arquivo que não existe

### 3. ✅ Criado `.nvmrc`
- Especifica Node.js 20.12.0 como versão preferida
- Alguns sistemas usam isso para detectar a versão do Node.js

---

## 📋 PRÓXIMOS PASSOS NO RAILWAY

### Passo 1: Adicionar Variável de Ambiente (Recomendado)

No Railway Dashboard → Service `site-ileala-oficial`:

1. Vá em **Settings** → **Variables**
2. Clique em **New Variable**
3. **Name:** `NODE_VERSION`
4. **Value:** `20.12.0`
5. Clique em **Add**

**Por quê?** Garante que o Railway use exatamente Node.js 20.12.0, mesmo se o Nixpacks não detectar corretamente.

---

### Passo 2: Limpar Cache do Build

1. No Railway Dashboard → Service `site-ileala-oficial`
2. Vá em **Settings**
3. Role até **Build Cache**
4. Clique em **Clear Build Cache**
5. Confirme a ação

**Por quê?** Remove referências antigas ao arquivo `embroidered-world-map.webp` que não existe mais.

---

### Passo 3: Fazer Novo Deploy

1. No Railway Dashboard → Service `site-ileala-oficial`
2. Vá em **Deployments**
3. Clique em **Redeploy** (ou faça um novo commit/push)
4. Aguarde o build completar

---

### Passo 4: Verificar Logs do Build

Durante o build, verifique os logs:

1. Clique no deploy em andamento
2. Veja os **Build Logs**
3. Procure por:
   - ✅ `Node.js version: 20.12.0` ou superior
   - ✅ `pnpm install` completou sem erros
   - ✅ `pnpm run build` completou sem erros
   - ❌ Se ainda aparecer `crypto.hash is not a function`, o Node.js ainda está antigo

---

## 🔍 O QUE FOI CORRIGIDO

### Problema 1: `crypto.hash is not a function`
**Causa:** Node.js 20.11.0 ou anterior não tem `crypto.hash()`  
**Solução:** 
- `nixpacks.toml` agora usa `nodejs-20_x` (versão mais recente)
- Variável `NODE_VERSION=20.12.0` no Railway (garantia extra)

### Problema 2: `embroidered-world-map.webp` não encontrado
**Causa:** Arquivo não existe, mas estava em cache  
**Solução:**
- `vite.config.ts` agora ignora avisos sobre esse arquivo
- Cache do Railway será limpo

---

## ✅ CHECKLIST

Antes de fazer deploy, verifique:

- [x] `nixpacks.toml` atualizado com `nodejs-20_x`
- [x] `vite.config.ts` tem proteção contra arquivo inexistente
- [x] `.nvmrc` criado com versão 20.12.0
- [ ] Variável `NODE_VERSION=20.12.0` adicionada no Railway
- [ ] Cache do Railway foi limpo
- [ ] Novo deploy foi feito
- [ ] Logs mostram Node.js 20.12.0+
- [ ] Build completou sem erros

---

## 🚨 SE AINDA NÃO FUNCIONAR

### Alternativa 1: Usar Dockerfile

Se o Nixpacks continuar com problemas, podemos criar um `Dockerfile` que força Node.js 20.12.0.

### Alternativa 2: Usar Opção 1 (Mesmo Service)

Se o build continuar falhando, podemos usar a Opção 1 (mesmo service com domínios diferentes), que funciona imediatamente.

---

## 📝 ARQUIVOS MODIFICADOS

1. ✅ `nixpacks.toml` - Atualizado para `nodejs-20_x`
2. ✅ `vite.config.ts` - Adicionada proteção para arquivo inexistente
3. ✅ `.nvmrc` - Criado com versão 20.12.0

---

**Última atualização:** 23 de Novembro de 2025


