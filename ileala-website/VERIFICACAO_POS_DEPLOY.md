# ✅ Verificação Pós-Deploy - admin.ileala.ae

**Service:** `site-ileala-oficial`  
**Status:** Deploy em andamento  
**Variáveis atualizadas:** ✅ `SITE_URL` e `VITE_APP_URL`

---

## 📋 O QUE VERIFICAR APÓS O DEPLOY

### 1. ✅ Verificar Status do Deploy

1. **Aguarde o deploy completar** (geralmente 2-5 minutos)
2. **Verifique o status:**
   - ✅ **ACTIVE** = Deploy bem-sucedido
   - ❌ **FAILED** = Deploy falhou (ver logs)

---

### 2. ✅ Verificar Logs do Deploy

1. Clique no deploy que está "INITIALIZING" ou "ACTIVE"
2. Vá na aba **"Deploy Logs"**
3. Procure por:

**✅ SUCESSO:**
```
Server running on http://localhost:XXXX/
Health check available at http://localhost:XXXX/health
Serving static files from: /app/ileala-website/dist/public
```

**❌ ERRO:**
```
Invalid environment variables:
- SITE_URL: Must start with https://
```

Se aparecer erro de `SITE_URL`, significa que a variável não foi carregada corretamente.

---

### 3. ✅ Testar Health Check

Após o deploy completar:

1. **Acesse:** `https://admin.ileala.ae/health`
2. **Deve retornar:**
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "checks": {
       "database": "connected"
     }
   }
   ```

**Se retornar JSON:** ✅ App está rodando  
**Se retornar 404:** ❌ Problema de roteamento ou app não iniciou

---

### 4. ✅ Testar Acesso ao Site

1. **Acesse:** `https://admin.ileala.ae`
2. **Deve carregar:**
   - ✅ Página inicial do site
   - ✅ Sem erros no console do navegador
   - ✅ SSL funcionando (cadeado verde)

**Se retornar 404:** Verificar logs e configuração de roteamento

---

### 5. ✅ Verificar Variáveis no Deploy

1. **Deploy Logs** → Procure por:
   - `SITE_URL=https://admin.ileala.ae` (deve aparecer nos logs)
   - `VITE_APP_URL=https://admin.ileala.ae` (se configurado)

2. **Se não aparecer:**
   - Variáveis podem não ter sido carregadas
   - Fazer redeploy

---

## 🎯 CHECKLIST FINAL

Após deploy completar:

- [ ] Deploy status: **ACTIVE** (não FAILED)
- [ ] Logs mostram "Server running on http://localhost:XXXX/"
- [ ] Health check funciona: `https://admin.ileala.ae/health`
- [ ] Site carrega: `https://admin.ileala.ae`
- [ ] SSL funcionando (cadeado verde)
- [ ] Sem erros no console do navegador

---

## 🚨 SE ALGO DER ERRADO

### Se o deploy falhar:

1. **Verificar logs** → Veja qual erro aparece
2. **Verificar variáveis** → Confirme que `SITE_URL` e `VITE_APP_URL` estão corretas
3. **Fazer redeploy** → Deployments → Redeploy

### Se o site retornar 404:

1. **Testar health check** → `https://admin.ileala.ae/health`
2. **Se health check funcionar:** Problema é de roteamento/static files
3. **Se health check não funcionar:** App não está escutando corretamente

### Se aparecer erro de variáveis:

1. **Verificar se variáveis foram salvas** → Settings → Variables
2. **Confirmar valores:**
   - `SITE_URL` = `https://admin.ileala.ae`
   - `VITE_APP_URL` = `https://admin.ileala.ae`
3. **Fazer redeploy** para carregar novas variáveis

---

## 📝 VARIÁVEIS CONFIGURADAS

✅ **`SITE_URL`** = `https://admin.ileala.ae`  
✅ **`VITE_APP_URL`** = `https://admin.ileala.ae`

---

**Última atualização:** 23 de Novembro de 2025


