# 🌐 Migrar Domínio admin.ileala.ae do Vercel para Railway

**Objetivo:** Mover `admin.ileala.ae` do Vercel para o Railway service `site-ileala-oficial`

---

## 📋 PRÉ-REQUISITOS

- ✅ Service `site-ileala-oficial` rodando no Railway
- ✅ Domínio `admin.ileala.ae` atualmente no Vercel
- ✅ Acesso ao painel de DNS do domínio

---

## 🚀 PASSO A PASSO

### Passo 1: Configurar Domínio no Railway

1. **No Railway Dashboard:**
   - Vá no service `site-ileala-oficial`
   - Clique na aba **"Settings"**
   - Role até a seção **"Networking"** ou **"Domains"**
   - Clique em **"Generate Domain"** ou **"Add Domain"**

2. **Adicionar domínio customizado:**
   - Clique em **"Custom Domain"** ou **"Add Custom Domain"**
   - Digite: `admin.ileala.ae`
   - Clique em **"Add"**

3. **Railway vai mostrar instruções de DNS:**
   - Anote os valores que o Railway fornecer
   - Geralmente será um registro CNAME ou A

---

### Passo 2: Configurar DNS

1. **Acesse o painel de DNS do seu domínio:**
   - Onde você gerencia o DNS de `ileala.ae`
   - Pode ser: Cloudflare, Namecheap, GoDaddy, etc.

2. **Criar/Atualizar registro DNS:**
   
   **Opção A: CNAME (Recomendado)**
   ```
   Tipo: CNAME
   Nome: admin
   Valor: [valor fornecido pelo Railway]
   TTL: 3600 (ou automático)
   ```

   **Opção B: A Record (se Railway fornecer IP)**
   ```
   Tipo: A
   Nome: admin
   Valor: [IP fornecido pelo Railway]
   TTL: 3600 (ou automático)
   ```

3. **Salvar as alterações DNS**

---

### Passo 3: Atualizar Variáveis de Ambiente no Railway

1. **No Railway Dashboard:**
   - Service `site-ileala-oficial` → Settings → Variables

2. **Atualizar `SITE_URL`:**
   - Encontre `SITE_URL`
   - Edite o valor para: `https://admin.ileala.ae`
   - Salve

3. **Verificar outras variáveis relacionadas:**
   - `VITE_APP_URL` → `https://admin.ileala.ae` (se necessário)
   - Outras variáveis que referenciem o domínio

---

### Passo 4: Remover Domínio do Vercel (Opcional)

**⚠️ IMPORTANTE:** Só faça isso DEPOIS que o domínio estiver funcionando no Railway!

1. **No Vercel Dashboard:**
   - Vá no projeto que tem `admin.ileala.ae`
   - Settings → Domains
   - Encontre `admin.ileala.ae`
   - Clique em **"Remove"** ou **"Delete"**
   - Confirme a remoção

---

### Passo 5: Aguardar Propagação DNS

1. **Tempo de propagação:**
   - Geralmente: 5-30 minutos
   - Máximo: até 48 horas (raro)

2. **Verificar propagação:**
   ```bash
   # No terminal, teste o DNS:
   nslookup admin.ileala.ae
   # ou
   dig admin.ileala.ae
   ```

3. **Verificar no Railway:**
   - Settings → Networking/Domains
   - Deve mostrar status "Active" ou "Verified"

---

### Passo 6: Testar o Domínio

1. **Aguardar propagação DNS completar**

2. **Testar acesso:**
   - Acesse: `https://admin.ileala.ae`
   - Deve carregar o site do Railway

3. **Testar health check:**
   - Acesse: `https://admin.ileala.ae/health`
   - Deve retornar JSON com status

---

## 🔧 CONFIGURAÇÕES ADICIONAIS

### SSL/HTTPS

O Railway configura SSL automaticamente via Let's Encrypt:
- ✅ Não precisa configurar manualmente
- ✅ SSL será ativado automaticamente após DNS propagar
- ⏱️ Pode levar alguns minutos após DNS propagar

### Verificar Certificado SSL

1. Acesse: `https://admin.ileala.ae`
2. Verifique o cadeado no navegador
3. Se aparecer aviso, aguarde alguns minutos (certificado sendo gerado)

---

## 🚨 TROUBLESHOOTING

### Domínio não resolve

**Sintoma:** `admin.ileala.ae` não carrega ou retorna erro DNS

**Soluções:**
1. Verificar se DNS foi configurado corretamente
2. Aguardar propagação DNS (pode levar até 48h)
3. Verificar se o registro DNS está correto no painel
4. Limpar cache DNS: `nslookup -flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

---

### SSL não funciona

**Sintoma:** Aviso de certificado inválido ou HTTP ao invés de HTTPS

**Soluções:**
1. Aguardar alguns minutos (certificado sendo gerado)
2. Verificar se DNS está apontando corretamente
3. No Railway, verificar status do domínio (deve estar "Active")

---

### Site carrega mas retorna 404

**Sintoma:** Domínio resolve mas site retorna 404

**Soluções:**
1. Verificar se `SITE_URL` está correto: `https://admin.ileala.ae`
2. Verificar se o service está ACTIVE no Railway
3. Testar health check: `https://admin.ileala.ae/health`
4. Verificar logs do Railway para erros

---

### Domínio ainda aponta para Vercel

**Sintoma:** `admin.ileala.ae` ainda mostra o site do Vercel

**Soluções:**
1. Verificar se DNS foi atualizado corretamente
2. Aguardar propagação DNS (pode levar tempo)
3. Limpar cache do navegador
4. Verificar se o registro DNS está correto

---

## 📋 CHECKLIST DE MIGRAÇÃO

- [ ] Domínio `admin.ileala.ae` adicionado no Railway
- [ ] DNS configurado (CNAME ou A record)
- [ ] Variável `SITE_URL` atualizada para `https://admin.ileala.ae`
- [ ] Aguardado propagação DNS (5-30 minutos)
- [ ] Domínio testado e funcionando
- [ ] SSL/HTTPS funcionando (cadeado verde)
- [ ] Health check funcionando: `https://admin.ileala.ae/health`
- [ ] Domínio removido do Vercel (opcional, depois de confirmar que funciona)

---

## 🎯 ORDEM RECOMENDADA

1. ✅ **Primeiro:** Configurar domínio no Railway
2. ✅ **Segundo:** Atualizar DNS
3. ✅ **Terceiro:** Atualizar variáveis de ambiente (`SITE_URL`)
4. ✅ **Quarto:** Aguardar propagação DNS
5. ✅ **Quinto:** Testar domínio
6. ✅ **Sexto:** Remover do Vercel (só depois de confirmar que funciona)

---

## 📝 NOTAS IMPORTANTES

### Não remover do Vercel antes de testar!

⚠️ **NÃO remova o domínio do Vercel até confirmar que está funcionando no Railway!**

Isso evita downtime caso algo dê errado.

### Backup das configurações

Antes de remover do Vercel:
- Anote todas as variáveis de ambiente do Vercel
- Anote configurações de build/deploy
- Tire screenshots das configurações

---

## 🔍 VERIFICAÇÃO FINAL

Após migração completa:

1. ✅ `admin.ileala.ae` carrega o site do Railway
2. ✅ SSL/HTTPS funcionando (cadeado verde)
3. ✅ Health check funciona: `https://admin.ileala.ae/health`
4. ✅ Admin panel acessível: `https://admin.ileala.ae/admin`
5. ✅ Domínio removido do Vercel (se desejado)

---

**Última atualização:** 23 de Novembro de 2025




