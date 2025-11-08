# 🌐 Registros DNS Exatos para Hostinger

## 📋 Informações Importantes

**Domínio:** ileala.ae  
**Hospedagem:** Manus  
**Registrador:** Hostinger  
**Status Atual:** Site já publicado em https://ileala.ae

---

## 🔍 Passo 1: Verificar Domínio Atual da Manus

Antes de configurar, você precisa saber qual é o **domínio temporário** que a Manus atribuiu ao seu site.

### **Como Descobrir:**

**Opção A: Via Management UI**
1. Abra Management UI (lado direito)
2. Vá em **Settings** → **Domains**
3. Você verá algo como: `ileala-home-klajho6r.manus.space`
4. Anote esse domínio

**Opção B: Via URL Atual**
- Olhe a URL do site publicado
- Exemplo: `https://ileala-home-klajho6r.manus.space`
- O domínio é: `ileala-home-klajho6r.manus.space`

---

## 📝 Registros DNS para Configurar

Depois de descobrir o domínio Manus, configure estes registros no Hostinger:

### **Configuração Completa:**

| Tipo | Nome/Host | Valor/Target | TTL |
|------|-----------|--------------|-----|
| **CNAME** | `@` | `[SEU-DOMINIO].manus.space` | 3600 |
| **CNAME** | `www` | `[SEU-DOMINIO].manus.space` | 3600 |

**Substitua `[SEU-DOMINIO]` pelo domínio que você anotou!**

### **Exemplo Real:**

Se o domínio Manus for: `ileala-home-klajho6r.manus.space`

| Tipo | Nome/Host | Valor/Target | TTL |
|------|-----------|--------------|-----|
| **CNAME** | `@` | `ileala-home-klajho6r.manus.space` | 3600 |
| **CNAME** | `www` | `ileala-home-klajho6r.manus.space` | 3600 |

---

## 🔧 Passo 2: Configurar no Hostinger

### **1. Acessar DNS Zone**
```
1. Login em: https://hpanel.hostinger.com
2. Clique em "Domínios" no menu lateral
3. Selecione: ileala.ae
4. Clique em "DNS Zone" ou "Gerenciar DNS"
```

### **2. Deletar Registros Antigos** ⚠️ IMPORTANTE
```
Procure e DELETE:
- Todos os registros A com nome "@"
- Todos os registros A com nome "www"
- Qualquer CNAME antigo com nome "@" ou "www"

Por quê? Para evitar conflitos!
```

### **3. Adicionar Novo Registro para @ (raiz)**
```
Clique em "Add Record" ou "Adicionar Registro"

Tipo: CNAME
Nome: @
Target/Valor: [SEU-DOMINIO].manus.space
TTL: 3600

Clique em "Save" ou "Adicionar"
```

### **4. Adicionar Novo Registro para www**
```
Clique em "Add Record" novamente

Tipo: CNAME
Nome: www
Target/Valor: [SEU-DOMINIO].manus.space
TTL: 3600

Clique em "Save" ou "Adicionar"
```

### **5. Salvar Todas as Mudanças**
```
Clique em "Save Changes" ou "Salvar" no final da página
```

---

## ⏳ Passo 3: Aguardar Propagação

### **Tempo de Espera:**
- **Mínimo:** 15-30 minutos
- **Típico:** 1-2 horas
- **Máximo:** 24-48 horas (raro)

### **Verificar Propagação:**
1. Acesse: https://dnschecker.org
2. Digite: `ileala.ae`
3. Tipo: `CNAME`
4. Clique em "Search"
5. Aguarde até ver o domínio Manus em vários locais

---

## ⚠️ Observações Importantes

### **CNAME para @ (raiz)**

Alguns provedores DNS **não permitem** CNAME no registro raiz (@). Se o Hostinger não permitir:

**Alternativa: Usar A Record**

Você precisará dos **IPs do Cloudflare** (que a Manus usa):

| Tipo | Nome/Host | Valor/IP | TTL |
|------|-----------|----------|-----|
| **A** | `@` | `104.18.26.246` | 3600 |
| **A** | `@` | `104.18.27.246` | 3600 |
| **CNAME** | `www` | `ileala.ae` | 3600 |

**Nota:** Esses IPs são baseados no que vi quando testei `ileala.ae`. Confirme com a Manus se necessário.

---

## ✅ Passo 4: Testar

Após propagação, teste:

```
1. Acesse: https://ileala.ae
   ✅ Deve carregar o site

2. Acesse: https://www.ileala.ae
   ✅ Deve carregar o site

3. Verifique SSL:
   ✅ Deve ter cadeado verde (https://)
```

---

## 🆘 Problemas Comuns

### **1. "CNAME não é permitido para @"**

**Solução:** Use A Records (veja seção "Alternativa" acima)

---

### **2. "Site não carrega após 24h"**

**Possíveis causas:**
- DNS ainda propagando (aguarde mais)
- Registros incorretos (verifique Target/Valor)
- Cache do navegador (limpe cache ou teste em aba anônima)

**Solução:**
1. Verifique registros DNS no Hostinger
2. Confirme que Target está correto
3. Teste em: https://dnschecker.org

---

### **3. "www funciona mas @ não" (ou vice-versa)**

**Causa:** Falta um dos registros CNAME

**Solução:**
- Verifique se configurou AMBOS: `@` e `www`
- Ambos devem apontar para o mesmo domínio Manus

---

### **4. "Erro SSL / Certificado inválido"**

**Causa:** SSL ainda sendo gerado

**Solução:**
- Aguarde 10-15 minutos após DNS propagar
- Manus gera certificado Let's Encrypt automaticamente
- Teste novamente

---

## 📞 Informações de Contato

**Se precisar de ajuda:**

**Hostinger Suporte:**
- Chat: https://hpanel.hostinger.com
- Email: suporte via hPanel

**Manus Suporte:**
- https://help.manus.im

---

## 🎯 Resumo Rápido

### **Para Configurar DNS:**

**1. Descobrir domínio Manus:**
- Management UI → Settings → Domains
- Anotar: `xxxxxx.manus.space`

**2. Configurar Hostinger:**
- Deletar registros A antigos
- Adicionar CNAME @ → domínio Manus
- Adicionar CNAME www → domínio Manus
- Salvar

**3. Aguardar:**
- 1-2 horas para propagação
- Verificar em dnschecker.org

**4. Testar:**
- https://ileala.ae
- https://www.ileala.ae
- Verificar SSL (cadeado verde)

---

## ✅ Checklist

- [ ] Descobri domínio Manus (xxxxxx.manus.space)
- [ ] Acessei Hostinger DNS Zone
- [ ] Deletei registros A antigos
- [ ] Adicionei CNAME para @
- [ ] Adicionei CNAME para www
- [ ] Salvei mudanças
- [ ] Aguardei propagação (1-2h)
- [ ] Testei https://ileala.ae
- [ ] Testei https://www.ileala.ae
- [ ] Verifiquei SSL (cadeado verde)
- [ ] ✅ SITE NO AR!

---

**Boa sorte com a configuração! Se tiver dúvidas, me avise!** 🚀
