# 🧹 Como Limpar Cache no Railway

**Service:** `site-ileala-oficial`

---

## 📍 ONDE ENCONTRAR A OPÇÃO DE LIMPAR CACHE

A opção de limpar cache pode estar em **2 lugares diferentes** no Railway:

---

## 🔍 OPÇÃO 1: Na Página de Settings (Mais Comum)

1. **Você já está na página certa!** (Settings do service `site-ileala-oficial`)

2. **Role a página para baixo** até encontrar uma seção chamada:
   - **"Build Cache"** ou
   - **"Cache"** ou
   - **"Clear Build Cache"**

3. Se encontrar, clique no botão **"Clear Build Cache"** ou **"Clear Cache"**

---

## 🔍 OPÇÃO 2: Na Página de Deployments

Se não encontrar na página de Settings:

1. Clique na aba **"Deployments"** (ao lado de "Settings" no topo)

2. Procure por:
   - Um botão **"Clear Cache"** ou
   - Um menu de 3 pontos (⋯) ao lado de um deploy
   - Ou uma opção **"Redeploy with Clean Cache"**

---

## 🔍 OPÇÃO 3: Na Seção "Danger" (Configurações Avançadas)

1. Na página de **Settings**, role até o final

2. Procure por uma seção chamada **"Danger"** ou **"Danger Zone"**

3. Dentro dessa seção, pode haver uma opção para limpar cache

---

## 🎯 ALTERNATIVA: Fazer Redeploy (Força Limpeza)

Se não encontrar a opção de limpar cache, você pode fazer um **Redeploy** que também limpa o cache:

1. Vá na aba **"Deployments"** (no topo, ao lado de "Settings")

2. Clique no botão **"Redeploy"** ou **"New Deploy"**

3. Isso vai fazer um novo build do zero, limpando o cache automaticamente

---

## 📸 ONDE PROCURAR NA SUA TELA

Na página de Settings que você está vendo:

1. **Role para baixo** - a opção pode estar mais abaixo na página
2. **Procure por seções como:**
   - "Build Cache"
   - "Cache"
   - "Build Settings"
   - "Advanced"

3. **Ou vá direto para Deployments:**
   - Clique em **"Deployments"** no topo
   - Clique em **"Redeploy"** (isso também limpa o cache)

---

## ✅ RECOMENDAÇÃO

**Se não encontrar a opção de limpar cache:**

1. Vá em **"Deployments"** (aba no topo)
2. Clique em **"Redeploy"**
3. Isso vai fazer um build novo do zero, que é o mesmo efeito de limpar cache

**É a forma mais simples e funciona igual!** ✅

---

## 🚀 PRÓXIMO PASSO

Depois de limpar cache (ou fazer redeploy):

1. Aguarde o build iniciar
2. Veja os logs do build
3. Verifique se aparece `Node.js version: 20.12.0`

---

**Última atualização:** 23 de Novembro de 2025


