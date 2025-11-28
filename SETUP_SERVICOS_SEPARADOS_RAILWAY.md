# 🚀 Guia: Configurar Site e Admin Separados no Railway

## 📋 Objetivo

Ter **DOIS serviços completamente separados** no Railway:
- **Serviço 1**: Site Principal (`www.ileala.ae`) - para clientes
- **Serviço 2**: Painel Admin (`admin.ileala.ae`) - para administradores

**Vantagens:**
- ✅ Se um der problema, o outro continua funcionando
- ✅ Deploys independentes
- ✅ Escalabilidade separada
- ✅ Isolamento de problemas

---

## 🎯 Passo a Passo

### **PASSO 1: Verificar Serviço Atual**

1. Acesse o Railway Dashboard
2. Veja qual serviço está rodando atualmente
3. Anote o nome do serviço (provavelmente `site-ileala-oficial`)

---

### **PASSO 2: Criar Segundo Serviço (Admin)**

1. No Railway Dashboard, clique em **"New"** → **"GitHub Repo"**
2. Selecione o mesmo repositório: `site-ileala-oficial`
3. Nome do serviço: `ileala-admin` (ou `admin-panel`)
4. Clique em **"Deploy"**

---

### **PASSO 3: Configurar Variáveis de Ambiente - SITE PRINCIPAL**

No serviço do **site principal** (`www.ileala.ae`):

```bash
# Domínio
SITE_URL=https://www.ileala.ae
VITE_APP_URL=https://www.ileala.ae

# Outras variáveis (mantenha as que já tem)
DATABASE_URL=...
JWT_SECRET=...
# ... etc
```

---

### **PASSO 4: Configurar Variáveis de Ambiente - ADMIN**

No serviço do **admin** (`admin.ileala.ae`):

```bash
# Domínio (DIFERENTE!)
SITE_URL=https://admin.ileala.ae
VITE_APP_URL=https://admin.ileala.ae

# IMPORTANTE: Desabilitar OAuth no admin
VITE_OAUTH_PORTAL_URL=
OAUTH_SERVER_URL=
VITE_APP_ID=

# Outras variáveis (mesmas do site principal)
DATABASE_URL=... (MESMO banco de dados)
JWT_SECRET=... (MESMO secret)
# ... etc
```

**⚠️ IMPORTANTE:**
- `DATABASE_URL` deve ser o **MESMO** nos dois serviços (mesmo banco)
- `JWT_SECRET` deve ser o **MESMO** nos dois serviços (mesma autenticação)
- `SITE_URL` e `VITE_APP_URL` devem ser **DIFERENTES** (domínios diferentes)

---

### **PASSO 5: Configurar Domínios**

#### **Site Principal:**
1. No serviço do site principal
2. Vá em **"Settings"** → **"Networking"**
3. Adicione domínio: `www.ileala.ae`
4. Configure DNS conforme instruções do Railway

#### **Admin:**
1. No serviço do admin
2. Vá em **"Settings"** → **"Networking"**
3. Adicione domínio: `admin.ileala.ae`
4. Configure DNS conforme instruções do Railway

---

### **PASSO 6: Configurar Build (Opcional)**

Ambos os serviços podem usar o **mesmo Dockerfile** (já está configurado).

Se quiser personalizar, você pode criar:
- `Dockerfile` (padrão - usado por ambos)
- `Dockerfile.admin` (específico para admin - se necessário)

---

### **PASSO 7: Testar**

1. **Site Principal:**
   - Acesse: `https://www.ileala.ae`
   - Deve funcionar normalmente para clientes

2. **Admin:**
   - Acesse: `https://admin.ileala.ae/login`
   - Faça login com: `ceo@ileala.ae` / `IleAla@2025`
   - Deve redirecionar para `/admin`

---

## 🔧 Configuração de Variáveis Detalhada

### **Variáveis COMUNS (mesmas nos dois serviços):**

```bash
# Banco de dados (MESMO)
DATABASE_URL=postgresql://...

# Autenticação (MESMO)
JWT_SECRET=...

# Stripe (MESMO)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
VITE_STRIPE_PUBLISHABLE_KEY=...

# Resend (MESMO)
RESEND_API_KEY=...

# Sanity (MESMO)
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=...
VITE_SANITY_TOKEN=...

# Node
NODE_ENV=production
PORT=3000
```

### **Variáveis DIFERENTES:**

#### **Site Principal:**
```bash
SITE_URL=https://www.ileala.ae
VITE_APP_URL=https://www.ileala.ae
VITE_OAUTH_PORTAL_URL=https://... (se usar OAuth)
OAUTH_SERVER_URL=https://... (se usar OAuth)
```

#### **Admin:**
```bash
SITE_URL=https://admin.ileala.ae
VITE_APP_URL=https://admin.ileala.ae
VITE_OAUTH_PORTAL_URL= (VAZIO - desabilitado)
OAUTH_SERVER_URL= (VAZIO - desabilitado)
```

---

## ✅ Checklist Final

- [ ] Dois serviços criados no Railway
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Domínios configurados (`www.ileala.ae` e `admin.ileala.ae`)
- [ ] DNS configurado corretamente
- [ ] Site principal funcionando
- [ ] Admin funcionando e isolado
- [ ] Login admin funcionando

---

## 🆘 Troubleshooting

### **Problema: Admin não carrega**
- Verifique se `SITE_URL` está correto: `https://admin.ileala.ae`
- Verifique se o domínio está configurado no Railway

### **Problema: Login não funciona**
- Verifique se `JWT_SECRET` é o mesmo nos dois serviços
- Verifique se `DATABASE_URL` é o mesmo nos dois serviços

### **Problema: OAuth ainda aparece no admin**
- Certifique-se de que `VITE_OAUTH_PORTAL_URL` está **VAZIO** no serviço admin
- Certifique-se de que `OAUTH_SERVER_URL` está **VAZIO** no serviço admin

---

## 📝 Notas Importantes

1. **Banco de Dados Compartilhado**: Ambos os serviços usam o mesmo banco de dados. Isso é intencional para que os dados sejam sincronizados.

2. **Autenticação Compartilhada**: Ambos usam o mesmo `JWT_SECRET`, então um login em um serviço funciona no outro.

3. **Deploys Independentes**: Você pode fazer deploy de um serviço sem afetar o outro.

4. **Custos**: Railway cobra por serviço. Ter dois serviços = dois custos separados.

---

## 🎉 Pronto!

Agora você tem dois serviços completamente separados e independentes!

