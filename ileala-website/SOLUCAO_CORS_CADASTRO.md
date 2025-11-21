# 🔧 SOLUÇÃO: Erro CORS no Cadastro

**Data:** 21 de Novembro de 2025  
**Problema:** Erro de CORS bloqueando requisições de cadastro

---

## 🔍 PROBLEMA IDENTIFICADO

O erro no console mostra:
```
Access to fetch at 'https://site-ileala-oficial.onrender.com/auth.register?batch=1' 
from origin 'https://www.ileala.ae' has been blocked by CORS policy
```

**Causa:**
- A variável `VITE_API_URL` está configurada para apontar para `https://site-ileala-oficial.onrender.com` (Render)
- O backend está no Railway, não no Render
- O frontend está tentando fazer requisições para um servidor diferente, causando erro de CORS

---

## ✅ SOLUÇÃO

### Opção 1: Remover VITE_API_URL (Recomendado)

Como o frontend e backend estão no mesmo servidor (Railway), não precisa de URL absoluta.

**Railway Dashboard → Service: `ileala-website` → Variables**

1. **Remova ou deixe vazio** a variável `VITE_API_URL`
2. O código já tem fallback: `import.meta.env.VITE_API_URL || "/api/trpc"`
3. Sem `VITE_API_URL`, usará caminho relativo `/api/trpc` (mesmo servidor)

### Opção 2: Configurar VITE_API_URL Corretamente

Se quiser manter a variável, configure para o Railway:

**Railway Dashboard → Service: `ileala-website` → Variables**

Atualize `VITE_API_URL` para:
```
VITE_API_URL=https://www.ileala.ae/api/trpc
```

**OU** (se Railway usar domínio diferente):
```
VITE_API_URL=https://ileala-website-production.up.railway.app/api/trpc
```

---

## 🔧 CORREÇÃO NO CÓDIGO

Já adicionei configuração de CORS no servidor para garantir que funcione mesmo se houver requisições cross-origin.

**Arquivo:** `server/_core/index.ts`

Adicionei middleware CORS que permite requisições de:
- `https://www.ileala.ae`
- `https://ileala.ae`
- `http://localhost:3000` (desenvolvimento)
- `http://localhost:5173` (desenvolvimento)

---

## 📋 PASSOS PARA CORRIGIR

### 1. Verificar Variável VITE_API_URL

**Railway Dashboard → Service: `ileala-website` → Variables**

- [ ] Verifique se `VITE_API_URL` existe
- [ ] Se existir e apontar para Render, **REMOVA** ou **ATUALIZE**
- [ ] Se não existir, deixe assim (código usa fallback)

### 2. Redeploy

Após alterar variáveis:
- Railway fará redeploy automático
- Aguarde o deploy completar

### 3. Testar Novamente

1. Acesse: `https://www.ileala.ae/register`
2. Abra Console (F12)
3. Tente cadastrar
4. Não deve mais aparecer erro de CORS

---

## 🎯 RESULTADO ESPERADO

Após corrigir:

- ✅ Sem erro de CORS no console
- ✅ Requisições vão para `/api/trpc` (mesmo servidor)
- ✅ Cadastro funciona normalmente
- ✅ Sem erros de rede

---

## ⚠️ IMPORTANTE

**A variável `VITE_API_URL` é injetada no build time!**

Se você alterar `VITE_API_URL` no Railway:
1. Railway precisa fazer **novo build**
2. Não é suficiente apenas redeploy
3. Pode precisar fazer commit vazio para forçar rebuild

**Recomendação:** Remova `VITE_API_URL` e deixe o código usar o fallback `/api/trpc`.

---

**Status:** ✅ Código corrigido - Aguardando remoção/atualização de `VITE_API_URL`  
**Última atualização:** 21 de Novembro de 2025, 16:00

