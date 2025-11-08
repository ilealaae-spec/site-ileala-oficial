# 📧 Guia: Configurar Emails de Notificação

## 📋 Visão Geral

Este guia explica **onde e como** configurar emails para receber notificações de pedidos e mensagens dos clientes no site ILE ALA.

---

## 🎯 Tipos de Emails

### **1. Notificações de Pedidos (Para Você)**
Receber email quando um cliente faz um pedido.

### **2. Confirmação para Cliente**
Cliente recebe email após fazer pedido.

### **3. Mensagens do Formulário de Contato**
Receber mensagens enviadas pelo formulário de contato.

### **4. Notificações do Stripe**
Stripe envia emails sobre pagamentos.

---

## 📍 Onde Configurar Cada Tipo

### **Opção 1: Notificações do Stripe** ⭐ Mais Simples

**O QUE É:**
- Stripe envia emails automáticos para você
- Sobre pagamentos bem-sucedidos, falhas, reembolsos
- **NÃO precisa programar nada**

**ONDE CONFIGURAR:**

**Passo 1: Acessar Stripe Dashboard**
1. Acesse: https://dashboard.stripe.com
2. Faça login

**Passo 2: Configurar Email de Notificações**
1. Clique no seu nome (canto superior direito)
2. Vá em **"Settings"** (Configurações)
3. No menu lateral, clique em **"Team"** ou **"Team members"**
4. Encontre seu usuário
5. Verifique se seu email está correto

**Passo 3: Ativar Notificações**
1. Ainda em Settings, vá em **"Notifications"** ou **"Email notifications"**
2. Marque as opções que deseja receber:
   - ✅ **Successful payments** (Pagamentos bem-sucedidos)
   - ✅ **Failed payments** (Pagamentos falhados)
   - ✅ **Refunds** (Reembolsos)
   - ✅ **Disputes** (Contestações)
3. Salve as configurações

**VANTAGENS:**
- ✅ Configuração instantânea (5 minutos)
- ✅ Não precisa código
- ✅ Emails profissionais do Stripe
- ✅ Inclui detalhes do pagamento
- ✅ Gratuito

**DESVANTAGENS:**
- ❌ Não inclui detalhes do pedido (produtos, endereço)
- ❌ Apenas informações de pagamento

---

### **Opção 2: Emails Customizados via Resend** ⭐ Mais Completo

**O QUE É:**
- Sistema de emails personalizado
- Você recebe email com TODOS os detalhes do pedido
- Cliente também recebe confirmação bonita

**ONDE CONFIGURAR:**

**Passo 1: Criar Conta Resend**
1. Acesse: https://resend.com
2. Clique em "Sign Up"
3. Crie conta com seu email

**Passo 2: Obter API Key**
1. No dashboard Resend, vá em **"API Keys"**
2. Clique em **"Create API Key"**
3. Nome: "ILE ALA Production"
4. Copie a chave: `re_xxxxxxxxxxxxxxxxxx`

**Passo 3: Configurar no Site Manus**
1. Management UI → Settings → Secrets
2. Clique em **"+ Adicionar segredo"**
3. Nome: `RESEND_API_KEY`
4. Valor: Cole a chave copiada (`re_xxx...`)
5. Salve

**Passo 4: Configurar Email de Destino**
1. Ainda em Secrets, adicione outro:
2. Nome: `ADMIN_EMAIL`
3. Valor: Seu email (ex: `contato@ileala.ae`)
4. Salve

**Passo 5: Eu Implemento o Sistema**
- Me avise quando configurar as chaves
- Eu crio os templates de email
- Integro com o sistema de pedidos
- Testo o envio

**VANTAGENS:**
- ✅ Emails personalizados com logo ILE ALA
- ✅ Detalhes completos do pedido
- ✅ Confirmação para cliente
- ✅ Controle total do design
- ✅ 100 emails/dia grátis

**DESVANTAGENS:**
- ⚠️ Precisa configurar API key
- ⚠️ Precisa implementação (eu faço)

---

### **Opção 3: Painel Admin** ⭐ Sempre Disponível

**O QUE É:**
- Ver pedidos diretamente no painel admin
- Não depende de email
- Acesso em tempo real

**ONDE ACESSAR:**
1. Acesse: https://ileala.ae/admin/orders
2. Faça login (se necessário)
3. Veja lista de todos os pedidos
4. Clique em um pedido para ver detalhes completos

**VANTAGENS:**
- ✅ Já está funcionando
- ✅ Não precisa configurar nada
- ✅ Informações completas
- ✅ Atualização em tempo real

**DESVANTAGENS:**
- ❌ Precisa acessar manualmente
- ❌ Não recebe notificação automática

---

## 🎯 Recomendação: Usar as 3 Opções Juntas!

### **Combinação Ideal:**

**1. Stripe Notifications (Imediato)**
- Configure agora (5 minutos)
- Receba alertas instantâneos de pagamento
- Saiba quando tem venda

**2. Painel Admin (Diário)**
- Acesse 1-2x por dia
- Veja detalhes completos
- Gerencie pedidos

**3. Resend Emails (Futuro)**
- Configure quando tiver tempo
- Emails profissionais personalizados
- Melhor experiência para cliente

---

## 📧 Configuração Rápida (5 Minutos)

### **Para Começar AGORA:**

**Passo 1: Stripe Notifications**
```
1. https://dashboard.stripe.com
2. Settings → Notifications
3. Marcar: Successful payments, Failed payments
4. Adicionar seu email: contato@ileala.ae
5. Salvar
```

**Passo 2: Verificar Painel Admin**
```
1. https://ileala.ae/admin/orders
2. Login (se necessário)
3. Pronto! Você vê todos os pedidos aqui
```

**Resultado:**
- ✅ Recebe email do Stripe quando tem pagamento
- ✅ Acessa painel para ver detalhes do pedido
- ✅ Funciona imediatamente!

---

## 📬 Formulário de Contato

### **Como Funciona Atualmente:**

**Situação atual:**
- Formulário de contato existe na página `/contact`
- Cliente preenche nome, email, mensagem
- **MAS:** Não está enviando email ainda

**Para Ativar:**

**Opção A: Usar Resend (Recomendado)**
1. Configure `RESEND_API_KEY` (ver Opção 2 acima)
2. Configure `ADMIN_EMAIL` com seu email
3. Me avise → Eu implemento o envio
4. Mensagens chegam no seu email

**Opção B: Usar FormSubmit (Simples)**
1. Acesse: https://formsubmit.co
2. Siga instruções para configurar
3. Eu atualizo o formulário com endpoint
4. Mensagens chegam no seu email

**Opção C: Verificar Manualmente**
- Por enquanto, não há envio automático
- Clientes podem enviar email diretamente para: contato@ileala.ae
- Adicione esse email visível na página de contato

---

## 🔔 Notificações em Tempo Real (Futuro)

### **Opções Avançadas:**

**1. Telegram Bot**
- Receber mensagem no Telegram quando tem pedido
- Instantâneo
- Gratuito

**2. WhatsApp Business**
- Notificações via WhatsApp
- Requer integração com API

**3. SMS**
- Notificações via SMS
- Requer serviço pago (Twilio, etc.)

---

## 📊 Comparação das Opções

| Opção | Configuração | Custo | Detalhes | Tempo Real |
|-------|-------------|-------|----------|-----------|
| **Stripe Notifications** | 5 min | Grátis | Pagamento apenas | ✅ Sim |
| **Painel Admin** | 0 min (já pronto) | Grátis | Completo | ✅ Sim |
| **Resend Emails** | 15 min | Grátis (100/dia) | Completo + Design | ✅ Sim |
| **FormSubmit** | 10 min | Grátis | Mensagens contato | ✅ Sim |

---

## ✅ Checklist de Configuração

### **Agora (5 minutos):**
- [ ] Configurar notificações do Stripe
- [ ] Adicionar seu email no Stripe
- [ ] Testar acesso ao painel admin

### **Esta Semana (30 minutos):**
- [ ] Criar conta Resend
- [ ] Obter API key
- [ ] Configurar `RESEND_API_KEY` no site
- [ ] Configurar `ADMIN_EMAIL` no site
- [ ] Solicitar implementação de emails

### **Futuro:**
- [ ] Configurar formulário de contato
- [ ] Considerar notificações Telegram/WhatsApp
- [ ] Adicionar email visível na página de contato

---

## 🎯 Resumo Final

### **Para Receber Notificações de Pedidos:**

**Método 1 (Rápido - 5 min):**
```
Stripe Dashboard → Settings → Notifications
→ Adicionar seu email
→ Marcar "Successful payments"
→ Pronto!
```

**Método 2 (Completo - 30 min):**
```
1. Criar conta Resend
2. Obter API key
3. Adicionar em Secrets:
   - RESEND_API_KEY
   - ADMIN_EMAIL (seu email)
4. Me avisar para implementar
```

**Método 3 (Manual - 0 min):**
```
Acessar diariamente:
https://ileala.ae/admin/orders
```

---

## 📞 Precisa de Ajuda?

**Para configurar emails:**
1. Me forneça a API key do Resend
2. Me diga qual email usar (ex: contato@ileala.ae)
3. Eu implemento todo o sistema de emails
4. Você testa e confirma

**Para dúvidas:**
- Stripe: https://support.stripe.com
- Resend: https://resend.com/docs

---

**Recomendação:** Comece com **Stripe Notifications** (5 minutos) e **Painel Admin** (já pronto). Depois configure **Resend** quando tiver tempo para emails personalizados! 📧✨
