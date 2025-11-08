# 🌐 Guia: Apontar Domínio ileala.ae (Hostinger) para Manus

## 📋 Visão Geral

Este guia mostra como configurar o domínio **ileala.ae** registrado no **Hostinger** para apontar para o site hospedado na **Manus**.

**Resultado final:**
- Visitantes acessam `https://ileala.ae`
- Site carrega da hospedagem Manus
- SSL/HTTPS automático
- Domínio Hostinger apenas aponta (DNS), não hospeda

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [x] Domínio **ileala.ae** registrado no Hostinger
- [x] Acesso ao painel Hostinger (hPanel)
- [x] Site publicado na Manus
- [x] URL temporária Manus (ex: `xxxxx.manus.space`)

---

## 🚀 Passo a Passo Completo

### **PARTE 1: Publicar o Site na Manus**

Antes de configurar o domínio, você precisa publicar o site.

#### 1.1 Criar Checkpoint (se necessário)
- Já temos checkpoint criado: **890d3e79**
- Se fez mudanças após isso, peça para criar novo checkpoint

#### 1.2 Publicar o Site
1. Abra o **Management UI** (painel direito)
2. Clique no botão **"Publish"** (canto superior direito)
3. Configure:
   - **Visibility:** Public
   - **Site Name:** ILE ALA - Luxury Home & Table
4. Clique em **"Publish"** para confirmar
5. Aguarde 30 segundos a 2 minutos

#### 1.3 Anotar URL Temporária
Após publicação, você receberá uma URL como:
```
https://xxxxx.manus.space
```

**IMPORTANTE:** Anote essa URL! Você precisará dela nos próximos passos.

**Exemplo:**
```
https://ileala.manus.space
```

---

### **PARTE 2: Obter Registros DNS da Manus**

Agora você precisa saber para onde apontar o domínio.

#### 2.1 Acessar Configurações de Domínio
1. No **Management UI**, vá em **Settings** (menu lateral)
2. Clique em **Domains**
3. Você verá o domínio atual: `xxxxx.manus.space`

#### 2.2 Adicionar Domínio Personalizado
1. Clique em **"Add Custom Domain"** ou **"Custom Domain"**
2. Digite: `ileala.ae`
3. Clique em **"Add"** ou **"Continue"**

#### 2.3 Copiar Instruções DNS
A Manus fornecerá os registros DNS necessários. Você verá algo como:

**Opção A - CNAME Record (Mais Comum):**
```
Type: CNAME
Name: @ (ou deixe vazio)
Target/Value: xxxxx.manus.space
TTL: 3600 (ou 1 hour)
```

**Para www:**
```
Type: CNAME
Name: www
Target/Value: xxxxx.manus.space
TTL: 3600
```

**OU**

**Opção B - A Record (Se CNAME não funcionar):**
```
Type: A
Name: @ (ou deixe vazio)
Target/Value: 123.45.67.89 (IP fornecido pela Manus)
TTL: 3600
```

**IMPORTANTE:** Anote exatamente o que a Manus mostrar!

---

### **PARTE 3: Configurar DNS no Hostinger**

Agora vamos configurar o DNS no painel do Hostinger.

#### 3.1 Acessar Painel Hostinger

1. Acesse: **https://hpanel.hostinger.com**
2. Faça login com suas credenciais
3. Você verá o painel principal (hPanel)

#### 3.2 Acessar Zona DNS do Domínio

**Método 1 - Via Domínios:**
1. No menu lateral, clique em **"Domínios"** ou **"Domains"**
2. Encontre **ileala.ae** na lista
3. Clique no botão **"Gerenciar"** ou **"Manage"** ao lado do domínio
4. Procure por **"DNS / Nameservers"** ou **"Zona DNS"**
5. Clique em **"DNS Zone"** ou **"Gerenciar DNS"**

**Método 2 - Via Menu Direto:**
1. No menu lateral, procure por **"Zona DNS"** ou **"DNS Zone"**
2. Selecione o domínio **ileala.ae** no dropdown

#### 3.3 Visualizar Registros Atuais

Você verá uma lista de registros DNS existentes, algo como:

```
Type    Name    Content/Value           TTL
A       @       123.45.67.89            3600
A       www     123.45.67.89            3600
CNAME   ...     ...                     ...
MX      ...     ...                     ...
```

---

#### 3.4 Remover Registros Conflitantes

**IMPORTANTE:** Antes de adicionar novos registros, você precisa remover os antigos que apontam para Hostinger.

**Registros a DELETAR:**

1. **Registro A para @ (raiz)**
   - Type: A
   - Name: @ (ou vazio)
   - Ação: Clique no ícone de **lixeira** ou **delete**
   - Confirme a exclusão

2. **Registro A para www**
   - Type: A
   - Name: www
   - Ação: Delete

3. **Qualquer CNAME para @ ou www**
   - Se houver, delete também

**NÃO DELETE:**
- ❌ Registros MX (email)
- ❌ Registros TXT (verificações)
- ❌ Outros subdomínios que você usa

---

#### 3.5 Adicionar Novos Registros DNS

Agora vamos adicionar os registros que apontam para Manus.

**Procure pelo botão:**
- **"Adicionar Registro"**
- **"Add Record"**
- **"Add New Record"**
- Ou ícone de **"+"**

---

**REGISTRO 1: Domínio Principal (ileala.ae)**

Clique em **"Add Record"** e preencha:

**Se Manus pediu CNAME:**
```
Type: CNAME
Name: @ (ou deixe vazio, ou digite "ileala.ae")
Target/Points to: xxxxx.manus.space
TTL: 3600 (ou selecione "1 hour")
```

**Se Manus pediu A Record:**
```
Type: A
Name: @ (ou deixe vazio)
Target/Points to: 123.45.67.89 (IP fornecido)
TTL: 3600
```

**Observações importantes:**
- Alguns painéis não aceitam CNAME para @ (raiz). Se der erro, use A Record.
- Cole exatamente o valor fornecido pela Manus
- **NÃO** adicione `https://` ou `http://`
- **NÃO** adicione `/` no final

Clique em **"Salvar"** ou **"Add Record"**

---

**REGISTRO 2: Subdomínio www (www.ileala.ae)**

Clique em **"Add Record"** novamente:

```
Type: CNAME
Name: www
Target/Points to: xxxxx.manus.space
TTL: 3600
```

Clique em **"Salvar"**

---

#### 3.6 Verificar Registros Adicionados

Após salvar, você deve ver na lista:

```
Type    Name    Content/Value           TTL
CNAME   @       xxxxx.manus.space       3600
CNAME   www     xxxxx.manus.space       3600
MX      @       mail.hostinger.com      3600  (se tiver email)
```

**Ou (se usou A Record):**
```
Type    Name    Content/Value           TTL
A       @       123.45.67.89            3600
CNAME   www     xxxxx.manus.space       3600
```

---

### **PARTE 4: Aguardar Propagação DNS**

#### 4.1 Tempo de Propagação

Após salvar as mudanças no Hostinger:

- **Mínimo:** 5-15 minutos
- **Típico:** 1-2 horas
- **Máximo:** 24-48 horas (raro)

**Por que demora?**
- DNS é distribuído globalmente
- Servidores precisam atualizar cache
- Depende do TTL anterior

---

#### 4.2 Verificar Propagação

Use ferramentas online para monitorar:

**1. DNSChecker.org**
1. Acesse: https://dnschecker.org
2. Digite: `ileala.ae`
3. Selecione tipo: **CNAME** (ou **A** se usou A Record)
4. Clique em **"Search"**
5. Veja mapa mundial:
   - ✅ Verde = propagado
   - ❌ Vermelho = ainda não propagado
6. Aguarde até maioria ficar verde

**2. WhatsMyDNS.net**
1. Acesse: https://whatsmydns.net
2. Digite: `ileala.ae`
3. Selecione tipo: **CNAME**
4. Veja lista de servidores DNS
5. Aguarde até maioria mostrar `xxxxx.manus.space`

**3. Comando Terminal (Avançado)**
```bash
# Mac/Linux
dig ileala.ae

# Windows
nslookup ileala.ae
```

---

#### 4.3 Testar Acesso

Após propagação (quando DNSChecker mostrar verde):

1. **Limpe cache do navegador:**
   - Chrome: Ctrl+Shift+Delete (Windows) ou Cmd+Shift+Delete (Mac)
   - Ou use modo anônimo

2. **Acesse o domínio:**
   - Digite na barra: `https://ileala.ae`
   - Pressione Enter

3. **Verifique:**
   - ✅ Site carrega corretamente
   - ✅ Cadeado verde (SSL)
   - ✅ URL mostra `ileala.ae`

4. **Teste www também:**
   - `https://www.ileala.ae`
   - Deve funcionar igualmente

---

### **PARTE 5: Configurar SSL/HTTPS (Automático)**

A Manus configura SSL automaticamente!

#### 5.1 Certificado SSL

**O que acontece:**
- Após DNS propagar, Manus detecta domínio
- Emite certificado Let's Encrypt gratuito
- Configura HTTPS automaticamente
- Renova certificado a cada 90 dias

**Tempo:**
- 5-10 minutos após DNS propagar
- Você verá cadeado verde no navegador

#### 5.2 Redirecionamento HTTP → HTTPS

**Automático:**
- `http://ileala.ae` → `https://ileala.ae`
- Manus força HTTPS sempre

---

### **PARTE 6: Atualizar Configurações Pós-Domínio**

#### 6.1 Atualizar Webhook do Stripe (Se Configurado)

Se você configurou webhook do Stripe:

1. Acesse: https://dashboard.stripe.com
2. Vá em **Developers** → **Webhooks**
3. Edite o webhook existente
4. Atualize URL para: `https://ileala.ae/api/webhooks/stripe`
5. Salve

#### 6.2 Atualizar Informações no Stripe

1. Dashboard Stripe → **Settings** → **Business settings**
2. Atualize **Website** para: `https://ileala.ae`
3. Salve

#### 6.3 Atualizar Sitemap (Opcional)

Se quiser, pode atualizar URLs no sitemap.xml para usar domínio final.

---

## 📊 Resumo Visual do Fluxo

```
┌─────────────────────────────────────────────────────────┐
│  1. PUBLICAR SITE NA MANUS                              │
│     ↓                                                    │
│     Recebe: https://xxxxx.manus.space                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. ADICIONAR DOMÍNIO NA MANUS                          │
│     ↓                                                    │
│     Settings → Domains → Add "ileala.ae"                │
│     ↓                                                    │
│     Recebe: Instruções DNS (CNAME ou A Record)          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. CONFIGURAR DNS NO HOSTINGER                         │
│     ↓                                                    │
│     hPanel → Domínios → ileala.ae → DNS Zone            │
│     ↓                                                    │
│     Deletar: Registros A antigos                        │
│     ↓                                                    │
│     Adicionar: CNAME @ → xxxxx.manus.space              │
│     Adicionar: CNAME www → xxxxx.manus.space            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. AGUARDAR PROPAGAÇÃO DNS                             │
│     ↓                                                    │
│     Verificar: dnschecker.org                           │
│     ↓                                                    │
│     Tempo: 1-2 horas (típico)                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  5. SSL AUTOMÁTICO                                      │
│     ↓                                                    │
│     Manus emite certificado Let's Encrypt               │
│     ↓                                                    │
│     https://ileala.ae com cadeado verde ✅              │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Configuração

Use esta lista para acompanhar o progresso:

### Pré-requisitos
- [ ] Domínio ileala.ae registrado no Hostinger
- [ ] Acesso ao hPanel Hostinger
- [ ] Site publicado na Manus
- [ ] URL temporária Manus anotada

### Configuração
- [ ] Domínio adicionado na Manus (Settings → Domains)
- [ ] Instruções DNS copiadas
- [ ] Acessado DNS Zone no Hostinger
- [ ] Registros A antigos deletados
- [ ] CNAME para @ adicionado
- [ ] CNAME para www adicionado
- [ ] Mudanças salvas no Hostinger

### Verificação
- [ ] DNSChecker mostra propagação (verde)
- [ ] https://ileala.ae carrega o site
- [ ] https://www.ileala.ae funciona
- [ ] Cadeado SSL verde aparece
- [ ] Webhook Stripe atualizado (se aplicável)

---

## 🆘 Solução de Problemas

### Problema 1: "CNAME não aceito para @"

**Erro:** Hostinger não aceita CNAME para raiz do domínio (@)

**Solução:**
1. Use **A Record** em vez de CNAME
2. Peça o IP na Manus (Settings → Domains)
3. Adicione:
   ```
   Type: A
   Name: @
   Value: 123.45.67.89 (IP fornecido)
   ```

---

### Problema 2: "Domínio não funciona após 24h"

**Causas possíveis:**

**A) DNS ainda não propagou globalmente**
- Solução: Aguarde mais algumas horas
- Verifique em dnschecker.org

**B) Registros DNS incorretos**
- Solução: Revise registros no Hostinger
- Confirme que apontam para `xxxxx.manus.space` correto

**C) Cache do navegador**
- Solução: Limpe cache ou use modo anônimo

**D) Nameservers errados**
- Solução: Verifique se nameservers do domínio apontam para Hostinger
- hPanel → Domínios → ileala.ae → Nameservers
- Devem ser: `ns1.dns-parking.com` e `ns2.dns-parking.com` (ou similar Hostinger)

---

### Problema 3: "SSL não funciona (sem cadeado)"

**Causas:**

**A) DNS ainda propagando**
- Solução: Aguarde DNS propagar completamente
- SSL só é emitido após DNS correto

**B) Certificado ainda sendo emitido**
- Solução: Aguarde 10-15 minutos após DNS propagar

**C) Mixed content (HTTP + HTTPS)**
- Solução: Verifique se todas as imagens/recursos usam HTTPS

---

### Problema 4: "Site mostra erro 404 ou página Hostinger"

**Causa:** DNS ainda aponta para Hostinger

**Solução:**
1. Verifique registros DNS no Hostinger
2. Confirme que deletou registros A antigos
3. Confirme que CNAME aponta para Manus
4. Aguarde propagação
5. Limpe cache DNS local:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

---

### Problema 5: "Email parou de funcionar"

**Causa:** Deletou registros MX por engano

**Solução:**
1. Acesse DNS Zone no Hostinger
2. Adicione registros MX de volta:
   ```
   Type: MX
   Name: @
   Priority: 10
   Value: mx1.hostinger.com
   ```
   ```
   Type: MX
   Name: @
   Priority: 10
   Value: mx2.hostinger.com
   ```
3. Salve

---

## 📞 Suporte

### Documentação Hostinger
- Central de Ajuda: https://support.hostinger.com
- Tutorial DNS: https://support.hostinger.com/en/articles/1583227-how-to-manage-dns-records

### Documentação Manus
- Help Center: https://help.manus.im

### Ferramentas Úteis
- DNSChecker: https://dnschecker.org
- WhatsMyDNS: https://whatsmydns.net
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

---

## 🎉 Conclusão

Após completar todos os passos:

✅ Domínio **ileala.ae** aponta para Manus
✅ Site carrega em `https://ileala.ae`
✅ SSL/HTTPS funcionando (cadeado verde)
✅ www.ileala.ae também funciona
✅ Email continua funcionando (se configurado)

**Seu site está no ar com domínio personalizado! 🚀**

---

## 📝 Notas Importantes

1. **Hostinger apenas gerencia DNS**
   - Não hospeda o site
   - Apenas aponta para Manus
   - Pode cancelar hospedagem Hostinger se não usar

2. **Renovação do domínio**
   - Renove ileala.ae no Hostinger anualmente
   - DNS continua apontando para Manus

3. **Mudanças futuras**
   - Se mudar URL Manus, atualize DNS
   - Se trocar de hospedagem, atualize registros

4. **Backup**
   - Anote registros DNS atuais
   - Tire screenshot da configuração
   - Guarde URL Manus (`xxxxx.manus.space`)

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79  
**Domínio:** ileala.ae → Manus
