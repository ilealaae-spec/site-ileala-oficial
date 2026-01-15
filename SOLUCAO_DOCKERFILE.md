# 🐳 Solução com Dockerfile - Força Node.js 20.12.0

**Status:** ✅ Dockerfile criado na raiz do repositório

---

## 📋 O QUE FOI FEITO

### 1. ✅ Criado `Dockerfile` na raiz
- Arquivo: `/Dockerfile` (na raiz do repositório)
- Força Node.js 20.12.0 (que tem `crypto.hash()`)
- Configurado para trabalhar com a estrutura `ileala-website/`

### 2. ✅ Atualizado `railway.json`
- Mudado de `NIXPACKS` para `DOCKERFILE`
- Start command ajustado para `pnpm --dir ileala-website run start`

---

## 🚀 PRÓXIMOS PASSOS

### Passo 1: Fazer Commit e Push

```bash
git add Dockerfile ileala-website/railway.json
git commit -m "fix: usar Dockerfile para forçar Node.js 20.12.0"
git push
```

### Passo 2: No Railway Dashboard

1. Vá em **Settings** do service `site-ileala-oficial`
2. Verifique se o **Builder** mudou para **"Dockerfile"**
   - Se ainda estiver "Nixpacks", o Railway vai detectar automaticamente o Dockerfile após o push

### Passo 3: Fazer Deploy

1. Vá em **Deployments**
2. Clique em **Redeploy** (ou aguarde o push automático)
3. Aguarde o build completar

---

## ✅ O QUE O DOCKERFILE FAZ

1. **Usa Node.js 20.12.0** (garantido pela imagem `node:20.12.0-alpine`)
2. **Instala pnpm 10.4.1** globalmente
3. **Copia arquivos** de configuração do `ileala-website/`
4. **Instala dependências** com `pnpm install --no-frozen-lockfile`
5. **Copia código** completo do `ileala-website/`
6. **Faz build** com `pnpm run build`
7. **Inicia servidor** com `pnpm run start`

---

## 🔍 VERIFICAÇÃO

Após o deploy, verifique os logs:

**✅ SUCESSO:**
- `Node.js version: 20.12.0` (ou superior)
- `pnpm install` completou sem erros
- `pnpm run build` completou sem erros
- `Build completed successfully`

**❌ SE AINDA FALHAR:**
- Verifique os logs completos
- Me avise qual erro aparece

---

## 📝 ESTRUTURA

```
site-ileala-oficial/          ← Raiz do repositório
├── Dockerfile                ← NOVO: Dockerfile na raiz
├── ileala-website/
│   ├── railway.json          ← ATUALIZADO: usa DOCKERFILE
│   ├── package.json
│   └── ...
└── ...
```

---

## 🎯 VANTAGENS DO DOCKERFILE

✅ **Garante versão exata** do Node.js (20.12.0)  
✅ **Mais controle** sobre o ambiente de build  
✅ **Funciona independente** do Nixpacks  
✅ **Reproduzível** - mesmo ambiente sempre  

---

**Última atualização:** 23 de Novembro de 2025




