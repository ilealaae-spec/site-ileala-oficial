# ✅ Checklist: Variáveis de Ambiente - Serviços Separados

## 📋 Situação Atual

Você já tem **DOIS serviços separados** no Railway:
- ✅ **`site-ileala-oficial`** → `admin.ileala.ae` (Admin)
- ✅ **`ileala-website`** → `www.ileala.ae` (Site Principal)

---

## 🔍 Verificação Necessária

### **SERVIÇO 1: `site-ileala-oficial` (Admin - `admin.ileala.ae`)**

Vá em: Railway Dashboard → `site-ileala-oficial` → Settings → Variables

#### ✅ Variáveis que DEVEM estar assim:

```bash
# DOMÍNIO (CRÍTICO - deve ser admin.ileala.ae)
SITE_URL=https://admin.ileala.ae
VITE_APP_URL=https://admin.ileala.ae

# OAUTH (DEVE estar VAZIO ou desabilitado)
VITE_OAUTH_PORTAL_URL=
OAUTH_SERVER_URL=
VITE_APP_ID=

# BANCO DE DADOS (MESMO do site principal)
DATABASE_URL=postgresql://... (MESMO valor)

# AUTENTICAÇÃO (MESMO do site principal)
JWT_SECRET=... (MESMO valor)

# OUTRAS (mesmas do site principal)
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
VITE_STRIPE_PUBLISHABLE_KEY=...
RESEND_API_KEY=...
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=...
VITE_SANITY_TOKEN=...
```

---

### **SERVIÇO 2: `ileala-website` (Site Principal - `www.ileala.ae`)**

Vá em: Railway Dashboard → `ileala-website` → Settings → Variables

#### ✅ Variáveis que DEVEM estar assim:

```bash
# DOMÍNIO (CRÍTICO - deve ser www.ileala.ae)
SITE_URL=https://www.ileala.ae
VITE_APP_URL=https://www.ileala.ae

# OAUTH (pode estar configurado se usar)
VITE_OAUTH_PORTAL_URL=https://... (ou vazio se não usar)
OAUTH_SERVER_URL=https://... (ou vazio se não usar)
VITE_APP_ID=ileala-prod (ou vazio se não usar)

# BANCO DE DADOS (MESMO do admin)
DATABASE_URL=postgresql://... (MESMO valor)

# AUTENTICAÇÃO (MESMO do admin)
JWT_SECRET=... (MESMO valor)

# OUTRAS (mesmas do admin)
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
VITE_STRIPE_PUBLISHABLE_KEY=...
RESEND_API_KEY=...
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=...
VITE_SANITY_TOKEN=...
```

---

## ⚠️ PONTOS CRÍTICOS

### 1. **SITE_URL e VITE_APP_URL**
- ❌ **ERRADO**: Ambos com `https://www.ileala.ae`
- ✅ **CORRETO**: 
  - Admin: `https://admin.ileala.ae`
  - Site: `https://www.ileala.ae`

### 2. **OAuth no Admin**
- ❌ **ERRADO**: `VITE_OAUTH_PORTAL_URL` configurado no admin
- ✅ **CORRETO**: `VITE_OAUTH_PORTAL_URL` **VAZIO** no admin

### 3. **Banco de Dados e JWT**
- ✅ **CORRETO**: Mesmos valores nos dois serviços (compartilhados)

---

## 🧪 Como Testar

### **Teste 1: Site Principal**
1. Acesse: `https://www.ileala.ae`
2. Deve carregar normalmente
3. Login deve funcionar (pode usar OAuth se configurado)

### **Teste 2: Admin**
1. Acesse: `https://admin.ileala.ae/login`
2. Deve mostrar formulário de login (NÃO OAuth)
3. Faça login com: `ceo@ileala.ae` / `IleAla@2025`
4. Deve redirecionar para `https://admin.ileala.ae/admin`
5. **NÃO** deve redirecionar para `www.ileala.ae`

---

## 🔧 Se Algo Não Funcionar

### **Problema: Admin redireciona para site principal**
- ✅ Verifique se `SITE_URL=https://admin.ileala.ae` no serviço admin
- ✅ Verifique se `VITE_APP_URL=https://admin.ileala.ae` no serviço admin

### **Problema: OAuth aparece no admin**
- ✅ Verifique se `VITE_OAUTH_PORTAL_URL` está **VAZIO** no serviço admin
- ✅ Verifique se `OAUTH_SERVER_URL` está **VAZIO** no serviço admin

### **Problema: Login não funciona**
- ✅ Verifique se `JWT_SECRET` é o **MESMO** nos dois serviços
- ✅ Verifique se `DATABASE_URL` é o **MESMO** nos dois serviços

---

## 📝 Checklist Rápido

- [ ] `SITE_URL` correto em cada serviço
- [ ] `VITE_APP_URL` correto em cada serviço
- [ ] OAuth desabilitado no admin (`VITE_OAUTH_PORTAL_URL` vazio)
- [ ] `DATABASE_URL` igual nos dois serviços
- [ ] `JWT_SECRET` igual nos dois serviços
- [ ] Domínios configurados corretamente no Railway
- [ ] Teste do site principal funcionando
- [ ] Teste do admin funcionando e isolado

---

## ✅ Resultado Esperado

Após configurar corretamente:

1. **Site Principal** (`www.ileala.ae`):
   - Funciona normalmente para clientes
   - Pode usar OAuth se configurado
   - Independente do admin

2. **Admin** (`admin.ileala.ae`):
   - Funciona apenas com login direto (email/senha)
   - NÃO usa OAuth
   - NÃO redireciona para site principal
   - Completamente isolado

3. **Isolamento**:
   - Se um serviço der problema, o outro continua funcionando
   - Deploys independentes
   - Escalabilidade separada

---

## 🎯 Próximos Passos

1. Verifique as variáveis de ambiente em cada serviço
2. Corrija se necessário
3. Faça redeploy se mudou variáveis
4. Teste ambos os serviços
5. Confirme que estão funcionando de forma independente



