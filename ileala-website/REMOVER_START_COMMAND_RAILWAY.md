# 🚨 IMPORTANTE: Remover Custom Start Command no Railway

**Problema:** O Railway ainda está tentando executar `cd ileala-website && pnpm run start`, causando o erro "The executable `cd` could not be found."

---

## ✅ SOLUÇÃO: Remover Custom Start Command

### Passo 1: Acessar Settings

1. No Railway Dashboard → Service `site-ileala-oficial`
2. Clique na aba **"Settings"** (no topo, ao lado de "Deployments")

### Passo 2: Encontrar "Custom Start Command"

1. Role a página para baixo
2. Procure pela seção **"Custom Start Command"** ou **"Deploy"**
3. Deve mostrar um campo com: `cd ileala-website && pnpm run start`

### Passo 3: Remover o Comando

1. **DELETE** o conteúdo do campo "Custom Start Command"
2. **Deixe o campo VAZIO**
3. **Salve** as alterações (pode ter um botão "Save" ou salvar automaticamente)

---

## 🔍 ONDE ENCONTRAR

Na página de **Settings**, procure por:

- **"Custom Start Command"** (mais comum)
- **"Start Command"**
- **"Deploy"** → **"Start Command"**
- **"Deploy Settings"** → **"Start Command"**

---

## ✅ APÓS REMOVER

1. O Railway deve reiniciar o service automaticamente
2. Ou faça um **Redeploy** manual:
   - Vá em **Deployments**
   - Clique em **"Redeploy"** (ou "Restart")

---

## 📋 VERIFICAÇÃO

Após remover, verifique os logs:

**✅ SUCESSO:**
- Container criado sem erro
- `pnpm run start` executou (sem `cd`)
- Servidor rodando

**❌ SE AINDA FALHAR:**
- Verifique se o campo está realmente vazio
- Verifique se salvou as alterações
- Me avise qual erro aparece

---

## 🎯 POR QUE ISSO RESOLVE

- O **Custom Start Command** no dashboard **sobrescreve** o `ENTRYPOINT` do Dockerfile
- O comando `cd ileala-website && pnpm run start` não funciona no container Alpine
- Removendo o comando, o Railway usa o `ENTRYPOINT` do Dockerfile, que já está correto

---

**Última atualização:** 23 de Novembro de 2025


