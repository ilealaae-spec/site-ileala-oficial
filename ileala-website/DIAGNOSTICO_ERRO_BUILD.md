# 🔍 Diagnóstico do Erro de Build

**Service:** `site-ileala-oficial`  
**Status:** Build falhou  
**Erro:** `ELIFECYCLE Command failed with exit code 1`

---

## 📋 O QUE VERIFICAR NOS LOGS

Nos logs do build que você mostrou, preciso verificar:

### 1. Versão do Node.js
Procure nos logs por:
- `Node.js version: X.X.X`
- Ou `node -v` ou `node --version`

**O que esperar:**
- ✅ Node.js 20.12.0 ou superior (correto)
- ❌ Node.js 20.11.0 ou inferior (causa do erro `crypto.hash`)

### 2. Erro específico
Procure nos logs por:
- `crypto.hash is not a function` ← Se aparecer, é o problema do Node.js
- `embroidered-world-map.webp` ← Se aparecer, é cache antigo
- Outros erros do Vite/Rollup

---

## 🔧 PRÓXIMOS PASSOS

### Passo 1: Verificar versão do Node.js nos logs

1. Nos logs do build, procure por `Node.js version` ou `node -v`
2. Me diga qual versão aparece

**Se aparecer Node.js 20.11.0 ou inferior:**
- A variável `NODE_VERSION=20.12.0` não está sendo respeitada
- Precisamos usar Dockerfile ao invés de Nixpacks

**Se aparecer Node.js 20.12.0 ou superior:**
- O problema é outro (não é `crypto.hash`)
- Preciso ver o erro específico nos logs

---

### Passo 2: Verificar se o erro é `crypto.hash`

Nos logs, procure por:
- `crypto.hash is not a function`
- `TypeError: crypto.hash is not a function`

**Se aparecer:**
- Confirma que é problema de versão do Node.js
- Solução: Usar Dockerfile

**Se NÃO aparecer:**
- O erro é outro
- Preciso ver o erro completo nos logs

---

## 🚀 SOLUÇÃO ALTERNATIVA: Dockerfile

Se o Nixpacks não está respeitando a versão do Node.js, vamos criar um Dockerfile que força Node.js 20.12.0.

**Vantagens:**
- ✅ Garante versão exata do Node.js
- ✅ Mais controle sobre o ambiente de build
- ✅ Funciona independente do Nixpacks

---

## 📝 O QUE PRECISO DE VOCÊ

1. **Nos logs do build, procure por:**
   - Versão do Node.js (procure por `Node.js` ou `node -v`)
   - Erro específico (procure por `crypto.hash` ou outros erros)

2. **Me diga:**
   - Qual versão do Node.js aparece?
   - Qual é o erro específico que aparece?

Com essas informações, posso criar a solução exata para o seu problema!

---

**Última atualização:** 23 de Novembro de 2025


