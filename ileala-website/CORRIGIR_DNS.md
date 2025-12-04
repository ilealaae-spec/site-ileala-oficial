# 🔧 CORRIGIR DNS - admin.ileala.ae

**Status:** Variável PORT removida ✅  
**Próximo passo:** Configurar DNS corretamente

---

## 📋 PASSO 1: Ver Instruções de DNS no Railway (2 min)

1. **No Railway Dashboard:**
   - Você já está na página de **Settings** do service `site-ileala-oficial`
   - Na seção **"Public Networking"**
   - Você vê o domínio `admin.ileala.ae` com um ⚠️ amarelo

2. **Clicar em "Show setup issues":**
   - Clique no texto **"Show setup issues"** (ou no ícone ⚠️)
   - Isso vai mostrar as instruções de DNS

3. **Anotar as instruções:**
   - O Railway vai mostrar algo como:
     - **CNAME:** `admin` → `[algum-valor].railway.app` ou
     - **A Record:** `admin` → `[IP address]`
   - **ANOTE ESSAS INSTRUÇÕES!** Você vai precisar delas.

---

## 📋 PASSO 2: Verificar Porta no Railway (1 min)

1. **Verificar qual porta o Railway está usando:**
   - Na mensagem de erro, vejo "Port 8080 Metal Edge"
   - Mas o Railway normalmente injeta `PORT` automaticamente

2. **Verificar variável PORT (se ainda existir):**
   - Settings → Variables
   - Se ainda houver uma variável `PORT`, delete ela (você já fez isso ✅)

3. **O servidor vai usar a porta que o Railway injetar automaticamente**
   - Não precisa configurar nada aqui
   - O código já está preparado para isso ✅

---

## 📋 PASSO 3: Configurar DNS no Provedor (5 min)

1. **Acessar painel de DNS:**
   - Onde você gerencia o DNS de `ileala.ae`?
     - Cloudflare?
     - Namecheap?
     - GoDaddy?
     - Outro?
   - Acesse o painel de controle do DNS

2. **Localizar domínio `ileala.ae`:**
   - Encontre o domínio `ileala.ae` no painel
   - Vá para a seção de **DNS Records** ou **DNS Management**

3. **Verificar se já existe registro para `admin`:**
   - Procure por um registro com nome `admin` ou `admin.ileala.ae`
   - Se existir:
     - **Verifique se está apontando para Vercel ainda**
     - Você vai precisar **atualizar** esse registro

4. **Criar/Atualizar registro DNS:**
   
   **Se Railway pedir CNAME:**
   - **Tipo:** CNAME
   - **Nome/Host:** `admin` (ou `admin.ileala.ae`)
   - **Valor/Target:** [valor que o Railway forneceu]
   - **TTL:** 3600 (ou automático)
   - **Proxy:** ❌ **DESLIGADO** (se usar Cloudflare, desligue o proxy laranja)

   **Se Railway pedir A Record:**
   - **Tipo:** A
   - **Nome/Host:** `admin` (ou `admin.ileala.ae`)
   - **Valor/IP:** [IP que o Railway forneceu]
   - **TTL:** 3600 (ou automático)
   - **Proxy:** ❌ **DESLIGADO** (se usar Cloudflare)

5. **Salvar:**
   - Clique em **"Save"** ou **"Add Record"**
   - Aguarde a confirmação

---

## 📋 PASSO 4: Remover do Vercel (2 min)

1. **Acessar Vercel Dashboard:**
   - Vá em [vercel.com](https://vercel.com)
   - Encontre o projeto relacionado a `admin.ileala.ae`

2. **Remover domínio:**
   - Settings → Domains
   - Encontre `admin.ileala.ae`
   - Clique em **"Remove"** ou **"Delete"**
   - Confirme a remoção

3. **Por quê?**
   - Evitar conflito de DNS
   - O domínio agora vai apontar só para Railway

---

## 📋 PASSO 5: Aguardar Propagação DNS (5-30 min)

1. **A propagação DNS pode levar:**
   - Mínimo: 5 minutos
   - Normal: 15-30 minutos
   - Máximo: até 48 horas (raro)

2. **Enquanto espera:**
   - Você pode verificar o status no Railway
   - O aviso amarelo ⚠️ deve desaparecer quando DNS estiver correto

---

## 📋 PASSO 6: Verificar DNS Está Correto (2 min)

1. **Verificar no Railway:**
   - Volte no Railway Dashboard
   - Settings → Networking
   - O aviso ⚠️ deve desaparecer
   - O domínio deve aparecer como **"Active"** ou **"Healthy"**

2. **Verificar com ferramentas online:**
   - Acesse: https://dnschecker.org
   - Digite: `admin.ileala.ae`
   - Tipo: CNAME (ou A, conforme configurou)
   - Veja se está apontando para Railway

---

## 📋 PASSO 7: Testar Site (2 min)

1. **Aguardar propagação completa** (30 min é seguro)

2. **Testar domínio:**
   - Acesse: `https://admin.ileala.ae`
   - Deve carregar o site

3. **Testar health check:**
   - Acesse: `https://admin.ileala.ae/health`
   - Deve retornar JSON:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "checks": {
       "database": "connected"
     }
   }
   ```

---

## 🚨 PROBLEMAS COMUNS

### DNS ainda mostra Vercel após 1 hora:
- Verificar se atualizou o registro correto
- Verificar se salvou as mudanças
- Aguardar mais tempo (pode levar até 48h)

### Railway ainda mostra aviso ⚠️:
- Verificar se DNS está apontando para Railway
- Verificar se TTL está baixo (3600 = 1 hora)
- Usar https://dnschecker.org para verificar globalmente

### Site não carrega mesmo com DNS correto:
- Verificar logs no Railway (Deployments → Logs)
- Verificar se service está "Active"
- Verificar se variáveis de ambiente estão corretas

---

## 📋 CHECKLIST

- [ ] ✅ Variável PORT removida
- [ ] Cliquei em "Show setup issues" no Railway
- [ ] Anotei as instruções de DNS do Railway
- [ ] Acessei meu painel de DNS
- [ ] Atualizei/criei registro DNS conforme Railway pediu
- [ ] Proxy desligado (se usar Cloudflare)
- [ ] Removi domínio do Vercel
- [ ] Aguardei propagação DNS (30 min)
- [ ] Railway mostra domínio como "Active"
- [ ] Site funciona em `https://admin.ileala.ae`
- [ ] Health check funciona: `/health`

---

**PRÓXIMO PASSO:** Clique em "Show setup issues" no Railway para ver as instruções de DNS!


