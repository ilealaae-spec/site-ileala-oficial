# 📋 PASSO A PASSO - Corrigir 404 no Railway

**Service:** `site-ileala-oficial`  
**Objetivo:** Fazer o site funcionar em `admin.ileala.ae`

---

## ✅ PASSO 1: Verificar Builder (2 minutos)

1. **No Railway Dashboard:**
   - Vá no service **`site-ileala-oficial`**
   - Clique na aba **"Settings"** (no topo)

2. **Verificar Builder:**
   - Role até a seção **"Build"**
   - Veja o campo **"Builder"**:
     - ✅ Se mostrar **"Dockerfile"** → Pule para Passo 2
     - ❌ Se mostrar **"Nixpacks"** → Continue

3. **Se estiver "Nixpacks":**
   - Clique no dropdown **"Builder"**
   - Selecione **"Dockerfile"**
   - Salve (pode salvar automaticamente)

---

## ✅ PASSO 2: Remover Variável PORT (1 minuto)

1. **Ainda em Settings:**
   - Clique na aba **"Variables"** (ao lado de "Settings")

2. **Procurar PORT:**
   - Procure pela variável **`PORT`**
   - Se encontrar:
     - Clique nos **3 pontos (...)** ao lado
     - Clique em **"Delete"** ou **"Remove"**
     - Confirme a remoção

3. **Por quê?** O Railway injeta `PORT` automaticamente, não precisa configurar manualmente.

---

## ✅ PASSO 3: Expor o Service (2 minutos)

1. **Voltar para página principal:**
   - Clique em **"Deployments"** (no topo, ao lado de "Settings")
   - Ou feche o painel de Settings

2. **Procurar "Generate Domain":**
   - Na página principal do service
   - Procure por:
     - Botão **"Generate Domain"** ou
     - Seção **"Networking"** ou
     - Texto **"Unexposed service"**

3. **Gerar domínio:**
   - Se encontrar **"Generate Domain"**:
     - Clique no botão
     - O Railway vai gerar um domínio temporário (ex: `site-ileala-oficial-production.up.railway.app`)
   
   - Se encontrar toggle **"Public"** ou **"Expose"**:
     - Ative o toggle
     - Isso torna o service acessível

4. **Anotar domínio temporário:**
   - Anote o domínio que o Railway gerou
   - Você vai testar esse domínio primeiro

---

## ✅ PASSO 4: Adicionar Domínio Customizado (2 minutos)

1. **Na mesma seção "Networking":**
   - Procure por **"Custom Domain"** ou **"Add Domain"**
   - Clique em **"Add Custom Domain"**

2. **Adicionar domínio:**
   - Digite: `admin.ileala.ae`
   - Clique em **"Add"**

3. **Anotar instruções DNS:**
   - O Railway vai mostrar instruções de DNS
   - Anote os valores (CNAME ou A record)
   - Você vai configurar isso depois

---

## ✅ PASSO 5: Fazer Redeploy (1 minuto)

1. **Vá em "Deployments":**
   - Clique na aba **"Deployments"**

2. **Fazer redeploy:**
   - Clique no botão **"Redeploy"** (ou "New Deploy")
   - Aguarde o deploy completar (2-5 minutos)

---

## ✅ PASSO 6: Verificar Logs (2 minutos)

1. **Após deploy completar:**
   - Clique no deploy mais recente
   - Vá na aba **"Deploy Logs"**

2. **Procurar por:**
   ```
   ✅ Server listening on port XXXX
   ✅ Health check: http://0.0.0.0:XXXX/health
   ✅ Serving static files from: /app/ileala-website/dist/public
   ```

3. **Se aparecer essas mensagens:** ✅ Tudo certo!

---

## ✅ PASSO 7: Testar (2 minutos)

1. **Testar domínio temporário:**
   - Acesse o domínio que o Railway gerou
   - Exemplo: `https://site-ileala-oficial-production.up.railway.app`
   - Deve carregar o site

2. **Testar health check:**
   - Acesse: `https://[domínio-temporário]/health`
   - Deve retornar JSON com status "healthy"

3. **Se funcionar:** ✅ Service está funcionando!
4. **Se não funcionar:** Verificar logs para erros

---

## ✅ PASSO 8: Configurar DNS (5 minutos)

1. **Acesse seu painel de DNS:**
   - Onde você gerencia o DNS de `ileala.ae`
   - Pode ser: Cloudflare, Namecheap, GoDaddy, etc.

2. **Criar registro DNS:**
   - **Tipo:** CNAME (ou A, se Railway fornecer IP)
   - **Nome:** `admin`
   - **Valor:** [valor fornecido pelo Railway]
   - **TTL:** 3600 (ou automático)
   - Salve

3. **Aguardar propagação:**
   - Geralmente: 5-30 minutos
   - Máximo: até 48 horas (raro)

---

## ✅ PASSO 9: Testar Domínio Customizado

1. **Após DNS propagar:**
   - Acesse: `https://admin.ileala.ae`
   - Deve carregar o site

2. **Testar health check:**
   - Acesse: `https://admin.ileala.ae/health`
   - Deve retornar JSON

---

## 📋 CHECKLIST RÁPIDO

- [ ] Builder está como **"Dockerfile"**
- [ ] Variável `PORT` foi **removida**
- [ ] Service está **exposto** (domínio gerado)
- [ ] Domínio customizado `admin.ileala.ae` adicionado
- [ ] Redeploy feito
- [ ] Logs mostram "Server listening on port XXXX"
- [ ] Domínio temporário funciona
- [ ] DNS configurado
- [ ] Domínio customizado funciona

---

## 🚨 SE ALGO DER ERRADO

### Se o deploy falhar:
- Verificar logs → Ver qual erro aparece
- Verificar se Builder está como "Dockerfile"
- Me avise qual erro aparece

### Se o domínio temporário não funcionar:
- Verificar logs → Ver se servidor iniciou
- Verificar se service está exposto
- Me avise o que aparece

### Se o domínio customizado não funcionar:
- Verificar se DNS foi configurado corretamente
- Aguardar propagação DNS (pode levar tempo)
- Verificar se domínio está "Active" no Railway

---

## 🎯 RESUMO DOS PASSOS

1. ✅ Verificar Builder = Dockerfile
2. ✅ Remover variável PORT
3. ✅ Expor service (Generate Domain)
4. ✅ Adicionar domínio customizado
5. ✅ Fazer redeploy
6. ✅ Verificar logs
7. ✅ Testar domínio temporário
8. ✅ Configurar DNS
9. ✅ Testar domínio customizado

---

**Tempo total estimado:** 15-20 minutos

**Última atualização:** 23 de Novembro de 2025




