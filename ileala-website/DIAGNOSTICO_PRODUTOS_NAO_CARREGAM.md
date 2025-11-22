# 🔍 Diagnóstico: Produtos Não Carregam

## ❌ Problema

O site mostra "Failed to load products" na página `/shop`.

---

## 🔍 Possíveis Causas

### 1. Token Sanity Não Configurado ou Incorreto

**Sintoma:** "Failed to load products"

**Verificação:**
1. Railway Dashboard → Service: `ileala-website` → Variables
2. Verifique se `VITE_SANITY_TOKEN` existe
3. Verifique se o valor está correto (deve começar com `sk...`)

**Solução:**
- Se não existir, adicione o token do Sanity
- Se existir mas estiver incorreto, atualize com o token correto
- Force um redeploy após mudanças

### 2. Token Sem Permissões Corretas

**Sintoma:** Produtos não carregam, mas não há erro específico

**Verificação:**
- Token precisa ter permissões "Viewer" no Sanity
- Verifique no Sanity Dashboard → API → Tokens

**Solução:**
- Recrie o token com permissões "Viewer" para Media Library e Canvas

### 3. Project ID ou Dataset Incorretos

**Sintoma:** Erro de conexão com Sanity

**Verificação:**
1. Railway Dashboard → Variables
2. Verifique:
   - `VITE_SANITY_PROJECT_ID` = `anyz9zel`
   - `VITE_SANITY_DATASET` = `production`

**Solução:**
- Corrija os valores se estiverem incorretos
- Force redeploy

### 4. Deploy Não Concluído

**Sintoma:** Site ainda usando código antigo

**Verificação:**
1. Railway Dashboard → Service: `ileala-website` → Deployments
2. Verifique se o último deploy foi concluído
3. Verifique se está "Active"

**Solução:**
- Aguarde o deploy concluir
- Ou force um redeploy

### 5. Erro de CORS ou Rede

**Sintoma:** Erro de rede no console do navegador

**Verificação:**
1. Abra o console do navegador (F12)
2. Procure por erros relacionados a Sanity
3. Verifique se há erros de CORS ou rede

**Solução:**
- Verifique se o token está correto
- Verifique se o Project ID está correto

---

## 🔧 Passos para Resolver

### Passo 1: Verificar Variáveis no Railway

1. Railway Dashboard → Service: `ileala-website` → Variables
2. Verifique estas variáveis:
   - ✅ `VITE_SANITY_PROJECT_ID` = `anyz9zel`
   - ✅ `VITE_SANITY_DATASET` = `production`
   - ⚠️ `VITE_SANITY_TOKEN` = (deve começar com `sk...`)

### Passo 2: Verificar Logs do Railway

1. Railway Dashboard → Service: `ileala-website` → Logs
2. Procure por erros relacionados a Sanity:
   - `401 Unauthorized` → Token inválido
   - `403 Forbidden` → Token sem permissões
   - `Network error` → Problema de conexão

### Passo 3: Verificar Console do Navegador

1. Acesse: `https://www.ileala.ae/shop`
2. Abra o console (F12 → Console)
3. Procure por erros relacionados a Sanity
4. Copie os erros e verifique

### Passo 4: Testar Token no Sanity

1. Sanity Dashboard → API → Tokens
2. Verifique se o token "Website ileala.ae" existe
3. Se não existir ou estiver incorreto, crie um novo:
   - Permissões: "Viewer" para Media Library e Canvas
   - Copie o token
   - Cole no Railway como `VITE_SANITY_TOKEN`

### Passo 5: Force Redeploy

1. Railway Dashboard → Service: `ileala-website` → Deployments
2. Clique nos 3 pontos (⋯) no último deploy
3. Selecione "Redeploy"
4. Aguarde o deploy concluir

---

## ✅ Checklist de Verificação

- [ ] `VITE_SANITY_PROJECT_ID` = `anyz9zel` no Railway
- [ ] `VITE_SANITY_DATASET` = `production` no Railway
- [ ] `VITE_SANITY_TOKEN` existe no Railway
- [ ] Token começa com `sk...`
- [ ] Token tem permissões "Viewer" no Sanity
- [ ] Deploy do `ileala-website` está "Active"
- [ ] Não há erros nos logs do Railway
- [ ] Não há erros no console do navegador

---

## 🚨 Se Nada Funcionar

### Opção 1: Recriar Token

1. Sanity Dashboard → API → Tokens
2. Delete o token antigo
3. Crie um novo:
   - Name: "Website ileala.ae"
   - Permissões: "Viewer" para Media Library e Canvas
4. Copie o token
5. Railway → Variables → Edite `VITE_SANITY_TOKEN`
6. Cole o novo token
7. Force redeploy

### Opção 2: Verificar se Há Produtos no Sanity

1. Sanity Dashboard → Content
2. Verifique se há produtos criados
3. Se não houver, crie alguns produtos de teste

---

## 📝 Próximos Passos

1. Verifique as variáveis no Railway
2. Verifique os logs do Railway
3. Verifique o console do navegador
4. Se necessário, recrie o token
5. Force redeploy

---

**Última atualização:** 21 de Novembro de 2025




