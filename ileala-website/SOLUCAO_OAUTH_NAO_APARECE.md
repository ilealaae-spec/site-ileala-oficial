# 🔧 Solução: OAuth Google Não Aparece (Mesmo com Variável Configurada)

## 🎯 Problema

Você configurou `VITE_GOOGLE_CLIENT_ID` no Railway, mas o botão "Sign in with Google" ainda não aparece no site.

---

## 🔍 Causa Principal

**Variáveis `VITE_*` são injetadas no BUILD TIME, não no runtime!**

Isso significa:
- ✅ Se você adicionou a variável **ANTES** do build → Funciona
- ❌ Se você adicionou a variável **DEPOIS** do build → NÃO funciona até fazer novo build

---

## ✅ Solução Passo a Passo

### PASSO 1: Verificar se Variável Está Configurada

1. **Railway Dashboard** → Service: `ileala-website` → **Variables**
2. Procure por: `VITE_GOOGLE_CLIENT_ID`
3. Verifique:
   - ✅ **Existe?** Se não existe, adicione (veja Passo 2)
   - ✅ **Tem valor?** Deve ser algo como: `xxxxx.apps.googleusercontent.com`
   - ✅ **Não é placeholder?** Não deve conter "placeholder"

### PASSO 2: Adicionar Variável (Se Não Existe)

1. Railway Dashboard → Service: `ileala-website` → Variables
2. Clique em **"+ New Variable"**
3. Preencha:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Seu Client ID do Google (ex: `255111586030-mhha1srv0bpcj01njcmt6ioukiqql6m0.apps.googleusercontent.com`)
4. Clique em **"Add"**

### PASSO 3: Forçar Novo Build (CRÍTICO!)

**⚠️ IMPORTANTE:** Após adicionar/atualizar variáveis `VITE_*`, você DEVE fazer um novo build!

**Opção A: Redeploy Manual**
1. Railway Dashboard → Service: `ileala-website` → **Deployments**
2. Clique nos **3 pontos** (⋯) no último deploy
3. Clique em **"Redeploy"**
4. Aguarde o build completar (2-5 minutos)

**Opção B: Commit Vazio (Força Build)**
```bash
git commit --allow-empty -m "force rebuild for VITE_GOOGLE_CLIENT_ID"
git push
```

**Opção C: Aguardar Deploy Automático**
- Se você fez um commit recente, o Railway fará deploy automaticamente
- Aguarde o build completar

### PASSO 4: Verificar no Console do Navegador

1. Acesse: `https://www.ileala.ae/login`
2. Abra o **Console do Navegador** (F12 → Console)
3. Procure por mensagens:

**✅ Se está funcionando:**
```
[Google OAuth] Checking configuration...
[Google OAuth] VITE_GOOGLE_CLIENT_ID exists: true
[Google OAuth] VITE_GOOGLE_CLIENT_ID value: 255111586030-mhha1srv...
[Google OAuth] ✅ Google OAuth is configured!
[Login] ✅ Google OAuth button will be shown
```

**❌ Se NÃO está funcionando:**
```
[Google OAuth] Checking configuration...
[Google OAuth] VITE_GOOGLE_CLIENT_ID exists: false
[Google OAuth] VITE_GOOGLE_CLIENT_ID value: undefined
[Google OAuth] ❌ Google OAuth is NOT configured.
[Login] ⚠️ Google OAuth button will NOT be shown
```

### PASSO 5: Verificar se Botão Aparece

- ✅ **Aparece:** Botão "Sign in with Google" visível = Funcionando!
- ❌ **Não aparece:** Continue para Passo 6

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "Variável existe mas botão não aparece"

**Causa:** Variável foi adicionada depois do build.

**Solução:**
1. Force um novo build (Passo 3)
2. Aguarde build completar
3. Teste novamente

### Problema 2: "Console mostra 'undefined'"

**Causa:** Variável não está sendo capturada no build.

**Solução:**
1. Verifique se o nome está correto: `VITE_GOOGLE_CLIENT_ID` (com VITE_ no início)
2. Verifique se o valor não está vazio
3. Force um novo build
4. Verifique os logs do build no Railway

### Problema 3: "Console mostra 'placeholder'"

**Causa:** Variável tem valor placeholder.

**Solução:**
1. Railway Dashboard → Variables
2. Edite `VITE_GOOGLE_CLIENT_ID`
3. Substitua por seu Client ID real do Google Cloud Console
4. Force um novo build

### Problema 4: "Variável não aparece na lista"

**Causa:** Variável não foi adicionada.

**Solução:**
1. Adicione a variável (Passo 2)
2. Force um novo build (Passo 3)

---

## 📋 Checklist Completo

- [ ] `VITE_GOOGLE_CLIENT_ID` existe no Railway
- [ ] `VITE_GOOGLE_CLIENT_ID` tem valor (não vazio)
- [ ] `VITE_GOOGLE_CLIENT_ID` não contém "placeholder"
- [ ] Novo build foi feito após adicionar variável
- [ ] Console do navegador mostra "✅ Google OAuth is configured!"
- [ ] Botão "Sign in with Google" aparece na página de login
- [ ] Login com Google funciona corretamente

---

## 🔍 Como Verificar Variáveis no Build

**Railway Dashboard → Service: `ileala-website` → Build Logs**

Procure por:
- Variáveis sendo injetadas
- Erros relacionados a variáveis
- Mensagens de build bem-sucedido

---

## 💡 Dica Importante

**Variáveis `VITE_*` são diferentes de variáveis normais:**

- **Variáveis normais** (`GOOGLE_CLIENT_ID`, `DATABASE_URL`, etc.):
  - ✅ Disponíveis em runtime
  - ✅ Podem ser adicionadas a qualquer momento
  - ✅ Servidor reinicia automaticamente

- **Variáveis `VITE_*`** (`VITE_GOOGLE_CLIENT_ID`, `VITE_APP_TITLE`, etc.):
  - ⚠️ Disponíveis apenas em build time
  - ⚠️ Precisam estar configuradas ANTES do build
  - ⚠️ Requerem novo build após adicionar/atualizar

---

## ✅ Após Resolver

1. Botão "Sign in with Google" aparece na página de login
2. Console mostra mensagens de sucesso
3. Login com Google funciona corretamente

---

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique os logs do build:**
   - Railway Dashboard → Build Logs
   - Procure por erros

2. **Verifique o console do navegador:**
   - F12 → Console
   - Veja mensagens de erro

3. **Verifique se todas as variáveis estão corretas:**
   - `VITE_GOOGLE_CLIENT_ID` (frontend)
   - `GOOGLE_CLIENT_ID` (backend)
   - `GOOGLE_CLIENT_SECRET` (backend)

4. **Verifique o redirect URI no Google Cloud Console:**
   - Deve ser: `https://www.ileala.ae/api/oauth/google/callback`

