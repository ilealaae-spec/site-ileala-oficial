# 🔄 Como Reativar o Serviço no Railway

## 🚨 Problema

O serviço `site-ileala-oficial` está com status **"Removed"** (parado) no Railway.

---

## ✅ Solução: Reativar o Serviço

### **Passo 1: Acessar o Railway Dashboard**

1. Acesse: https://railway.app
2. Faça login na sua conta
3. Selecione o projeto: **gregarious-prosperity**

---

### **Passo 2: Localizar o Serviço**

1. No menu lateral esquerdo, procure por: **`site-ileala-oficial`**
2. Você verá que está com status **"Removed"** ou **"Stopped"**

---

### **Passo 3: Reativar o Serviço**

**Opção A: Redeploy (Recomendado)**
1. Clique no serviço **`site-ileala-oficial`**
2. Vá na aba **"Deployments"** ou **"Deploys"**
3. Clique no botão **"Redeploy"** ou **"Deploy"**
4. Aguarde 2-5 minutos até o deploy completar

**Opção B: Gerar Novo Deploy**
1. Clique no serviço **`site-ileala-oficial`**
2. Vá na aba **"Settings"**
3. Procure por **"Deploy"** ou **"Redeploy"**
4. Clique em **"Redeploy"** ou **"Generate Deploy"**

**Opção C: Verificar se há Deploy Pendente**
1. Vá na aba **"Deployments"**
2. Se houver um deploy recente com status **"Building"** ou **"Deploying"**, aguarde ele completar
3. Se não houver, clique em **"New Deploy"** ou **"Redeploy"**

---

### **Passo 4: Verificar Status**

Após o deploy:
1. Vá na aba **"Logs"** ou **"Deploy Logs"**
2. Procure por:
   - ✅ `Server running on http://0.0.0.0:...`
   - ✅ `Health check available at http://0.0.0.0:.../health`
3. Se aparecer esses logs, o serviço está rodando!

---

### **Passo 5: Verificar Domínio**

1. Vá na aba **"Settings"** → **"Networking"**
2. Verifique se o domínio **`admin.ileala.ae`** está configurado
3. Se não estiver, adicione-o novamente

---

## 🐛 Se o Serviço Continuar Parando

### **Verificar Logs de Erro**

1. Vá na aba **"Logs"** → **"Deploy Logs"**
2. Procure por erros em vermelho
3. Me envie os erros que aparecerem

### **Verificar Variáveis de Ambiente**

1. Vá em **"Settings"** → **"Variables"**
2. Verifique se estas variáveis estão configuradas:
   - ✅ `SITE_URL=https://admin.ileala.ae`
   - ✅ `VITE_APP_URL=https://admin.ileala.ae`
   - ✅ `DATABASE_URL=...` (deve estar preenchido)
   - ✅ `JWT_SECRET=...` (deve estar preenchido)

---

## 📋 Checklist

- [ ] Serviço está com status "Active" (não "Removed")
- [ ] Logs mostram "Server running on..."
- [ ] Domínio `admin.ileala.ae` está configurado
- [ ] Variáveis de ambiente estão corretas
- [ ] Health check retorna 200 OK

---

## 🎯 Próximos Passos

Após reativar o serviço:

1. **Aguarde 2-5 minutos** para o deploy completar
2. **Acesse**: `https://admin.ileala.ae/admin`
3. **Faça login**: `ceo@ileala.ae` / `IleAla@2025`
4. **Verifique** se o painel admin carrega corretamente

---

## ❓ Precisa de Ajuda?

Se o serviço continuar parando ou não conseguir reativá-lo:
1. Me envie um print da tela do Railway
2. Me envie os logs de erro (se houver)
3. Me diga qual passo você está travado




