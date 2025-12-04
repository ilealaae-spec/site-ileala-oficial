# 🚨 SOLUÇÃO: Problema de Deployment no Railway

**Problema:** Railway não está fazendo deploy do código novo do GitHub  
**Impacto:** Site público ainda mostra código antigo do Sanity  
**Urgência:** 🔴 CRÍTICO

---

## 📋 DIAGNÓSTICO

### Sintomas:
- ❌ Commits no GitHub não disparam deploy automático
- ❌ Watch Paths não está funcionando
- ❌ Site público está "preso" em código antigo
- ❌ Build manual funciona, mas não atualiza o site

### Possíveis Causas:
1. Watch Paths configurado incorretamente
2. Branch incorreto configurado
3. Webhook GitHub-Railway quebrado
4. Cache do build antigo
5. Service pausado ou com erro

---

## 🔧 SOLUÇÃO PASSO A PASSO

### PASSO 1: Verificar Status do Service

1. Acesse [Railway Dashboard](https://railway.app)
2. Vá para o service `ileala-website` (www.ileala.ae)
3. Verifique:
   - ✅ Service está **Active** (não pausado)
   - ✅ Último deploy foi bem-sucedido
   - ✅ Não há erros visíveis

**Se o service estiver pausado:**
- Clique em "Resume" ou "Unpause"

---

### PASSO 2: Limpar Cache do Build

1. No Railway Dashboard → Service `ileala-website`
2. Vá em **Settings** (ícone de engrenagem)
3. Role até **Build Settings**
4. Clique em **Clear Build Cache**
5. Confirme a ação

**Por quê?** O cache pode estar mantendo código antigo do Sanity.

---

### PASSO 3: Verificar Branch Configurado

1. No Railway Dashboard → Service `ileala-website`
2. Vá em **Settings** → **Source**
3. Verifique:
   - ✅ Branch está configurado para `main` ou `master` (ou a branch correta)
   - ✅ Repositório está conectado corretamente

**Se o branch estiver errado:**
- Selecione o branch correto
- Salve as alterações

---

### PASSO 4: Verificar e Remover Watch Paths

1. No Railway Dashboard → Service `ileala-website`
2. Vá em **Settings** → **Build & Deploy**
3. Procure por **Watch Paths** ou **Root Directory**
4. **AÇÃO RECOMENDADA:**
   - **Remover Watch Paths completamente** (deixar vazio)
   - Isso faz o Railway monitorar TODAS as mudanças no repositório

**Por quê?** Watch Paths pode estar limitando quais mudanças disparam deploy.

**Alternativa (se quiser manter Watch Paths):**
- Configurar para: `ileala-website/**`
- Isso monitora apenas a pasta `ileala-website`

---

### PASSO 5: Verificar Webhook do GitHub

1. No GitHub, vá para o repositório
2. Vá em **Settings** → **Webhooks**
3. Procure por webhook do Railway
4. Verifique:
   - ✅ Webhook está **Active**
   - ✅ Última entrega foi bem-sucedida
   - ✅ URL está correta

**Se o webhook estiver quebrado:**
- Delete o webhook antigo
- No Railway, vá em **Settings** → **Source**
- Clique em **Disconnect** e depois **Connect** novamente
- Isso recria o webhook automaticamente

---

### PASSO 6: Forçar Deploy Manual

1. No Railway Dashboard → Service `ileala-website`
2. Vá em **Deployments** (ou clique no service)
3. Clique em **Deploy** → **Redeploy**
4. Selecione o commit mais recente
5. Aguarde o build completar

**Isso força um deploy mesmo sem mudanças no código.**

---

### PASSO 7: Testar Deploy com Commit

1. Faça uma pequena mudança no código (ex: comentário)
2. Faça commit e push para o GitHub
3. No Railway, monitore se um novo deploy é iniciado automaticamente
4. Se não iniciar, há um problema com webhook/watch paths

---

## 🎯 SOLUÇÃO RÁPIDA (Se Nada Funcionar)

### Opção 1: Recriar Service (Última Opção)

**⚠️ ATENÇÃO:** Isso vai recriar o service do zero. Você precisará:
- Reconfigurar variáveis de ambiente
- Reconfigurar domínios
- Reconfigurar banco de dados

**Passos:**
1. No Railway, crie um **novo service**
2. Conecte ao mesmo repositório GitHub
3. Configure:
   - **Root Directory:** `ileala-website` (ou deixe vazio)
   - **Build Command:** `pnpm run build`
   - **Start Command:** `pnpm run start`
4. Configure variáveis de ambiente (copiar do service antigo)
5. Configure domínio `www.ileala.ae`
6. Teste o deploy

### Opção 2: Usar Deploy Hook Manual

1. No Railway Dashboard → Service `ileala-website`
2. Vá em **Settings** → **Deploy Hooks**
3. Crie um novo Deploy Hook
4. Use este hook para fazer deploy manual via:
   ```bash
   curl -X POST https://api.railway.app/v1/deployments -H "Authorization: Bearer YOUR_TOKEN" -d '{"serviceId": "YOUR_SERVICE_ID"}'
   ```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após seguir os passos acima, verifique:

- [ ] Service está Active no Railway
- [ ] Cache do build foi limpo
- [ ] Branch correto está configurado
- [ ] Watch Paths foi removido ou configurado corretamente
- [ ] Webhook do GitHub está funcionando
- [ ] Deploy manual funciona
- [ ] Commit novo dispara deploy automático
- [ ] Site público mostra código novo (sem Sanity)

---

## 🔍 COMO VERIFICAR SE FUNCIONOU

### 1. Verificar Logs do Build
- Railway Dashboard → Deployments → Último deploy → Logs
- Procure por mensagens de build
- Verifique se não há erros

### 2. Verificar Site Público
- Acesse `www.ileala.ae`
- Abra DevTools (F12) → Console
- Procure por erros relacionados ao Sanity
- Verifique se produtos aparecem (devem vir do PostgreSQL)

### 3. Verificar Network Requests
- DevTools → Network
- Procure por requisições para `/api/trpc/products.list`
- Verifique se retorna produtos do banco

### 4. Testar Funcionalidades
- Acesse `/shop` - deve mostrar produtos do PostgreSQL
- Acesse `/collections/:slug` - deve mostrar produtos da coleção
- Adicione produto ao carrinho - deve funcionar
- Verifique se imagens do Cloudinary aparecem

---

## 📞 SE AINDA NÃO FUNCIONAR

### Informações para Suporte:

1. **Screenshots:**
   - Configurações do Railway (Settings)
   - Logs do último deploy
   - Erros no console do navegador

2. **Informações Técnicas:**
   - Service ID no Railway
   - Branch configurado
   - Último commit SHA
   - Versão do Node.js usada

3. **Contatar:**
   - Railway Support: https://railway.app/help
   - Ou verificar documentação: https://docs.railway.app

---

## 🎯 RESUMO DAS AÇÕES PRIORITÁRIAS

1. **URGENTE:** Limpar cache do build
2. **URGENTE:** Remover ou corrigir Watch Paths
3. **URGENTE:** Verificar webhook do GitHub
4. **URGENTE:** Fazer deploy manual do commit mais recente
5. **IMPORTANTE:** Testar se site público mostra código novo

---

**Última atualização:** 23 de Novembro de 2025

