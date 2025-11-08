# 🔔 Guia Completo: Webhook Stripe e Finalização da Publicação

## 📋 Visão Geral

Este guia detalha como configurar o **Webhook do Stripe** e finalizar a publicação do site ILE ALA. Webhooks permitem que o Stripe notifique seu site automaticamente sobre eventos de pagamento.

---

## 🎯 O Que São Webhooks?

### Definição
**Webhook** é uma forma de o Stripe comunicar seu site sobre eventos importantes:
- ✅ Pagamento concluído
- ✅ Pagamento falhou
- ✅ Reembolso processado
- ✅ Assinatura renovada
- E mais...

### Como Funciona

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Cliente   │────────▶│   Stripe    │────────▶│  Seu Site   │
│  Paga com   │         │  Processa   │         │  Recebe     │
│   Cartão    │         │  Pagamento  │         │ Notificação │
└─────────────┘         └─────────────┘         └─────────────┘
                                │
                                │ Webhook Event
                                │ (HTTP POST)
                                ▼
                        ┌─────────────────┐
                        │ https://ileala  │
                        │ .ae/api/        │
                        │ webhooks/stripe │
                        └─────────────────┘
```

### Por Que Configurar?

**Sem Webhook:**
- ❌ Site não sabe se pagamento foi confirmado
- ❌ Status do pedido não atualiza automaticamente
- ❌ Cliente pode não receber confirmação

**Com Webhook:**
- ✅ Site recebe notificação em tempo real
- ✅ Status do pedido atualiza automaticamente
- ✅ Você pode enviar emails de confirmação
- ✅ Estoque é atualizado corretamente
- ✅ Mais seguro e confiável

---

## ✅ Pré-requisitos

Antes de começar:

- [x] Site publicado na Manus
- [x] URL pública disponível (ex: `https://ileala.ae` ou `https://xxxxx.manus.space`)
- [x] Conta Stripe criada e ativada
- [x] Chaves de API configuradas no site

---

## 🚀 Parte 1: Obter URL do Webhook

### 1.1 Identificar URL Pública do Site

Você precisa saber a URL pública do seu site.

**Opção A: Domínio Personalizado (Recomendado)**
```
https://ileala.ae
```

**Opção B: Domínio Temporário Manus**
```
https://xxxxx.manus.space
```
(Substitua `xxxxx` pelo seu domínio Manus)

### 1.2 Construir URL do Webhook

A URL do webhook segue este formato:
```
https://SEU-DOMINIO/api/webhooks/stripe
```

**Exemplos:**
- Com domínio personalizado: `https://ileala.ae/api/webhooks/stripe`
- Com domínio Manus: `https://ileala.manus.space/api/webhooks/stripe`

**IMPORTANTE:** Anote essa URL completa! Você precisará dela no próximo passo.

---

## 🔧 Parte 2: Configurar Webhook no Stripe Dashboard

### 2.1 Acessar Stripe Dashboard

1. Abra seu navegador
2. Acesse: **https://dashboard.stripe.com**
3. Faça login com suas credenciais
4. Você verá o painel principal do Stripe

### 2.2 Navegar para Webhooks

**Passo a passo:**

1. No menu superior, clique em **"Developers"** (Desenvolvedores)
2. No menu lateral esquerdo, clique em **"Webhooks"**
3. Você verá a página de gerenciamento de webhooks

**Tela atual:**
- Lista de webhooks existentes (se houver)
- Botão "Add endpoint" ou "Add an endpoint"

### 2.3 Criar Novo Webhook Endpoint

1. Clique no botão **"Add endpoint"** (canto superior direito)
2. Uma janela de configuração será aberta

---

### 2.4 Configurar Endpoint URL

**Campo: "Endpoint URL"**

Cole a URL do webhook que você construiu:
```
https://ileala.ae/api/webhooks/stripe
```

**Observações:**
- ✅ Deve começar com `https://` (SSL obrigatório)
- ✅ Não adicione espaços
- ✅ Não adicione `/` no final
- ❌ Não use `http://` (sem SSL)

---

### 2.5 Selecionar Eventos para Enviar

**Campo: "Events to send"**

Você precisa selecionar quais eventos o Stripe deve notificar.

**Opção 1: Selecionar Eventos Específicos (Recomendado)**

Clique em **"Select events"** e marque:

1. **checkout.session.completed**
   - ✅ Quando checkout é concluído
   - Mais importante para e-commerce

2. **payment_intent.succeeded**
   - ✅ Quando pagamento é bem-sucedido
   - Confirma que dinheiro foi recebido

3. **payment_intent.payment_failed**
   - ✅ Quando pagamento falha
   - Permite notificar cliente

4. **charge.refunded** (Opcional)
   - Quando reembolso é processado

5. **charge.dispute.created** (Opcional)
   - Quando cliente contesta pagamento

**Eventos mínimos necessários:**
```
✅ checkout.session.completed
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
```

**Opção 2: Receber Todos os Eventos**
- Marque **"Send all event types"**
- Mais simples, mas recebe muitos eventos desnecessários
- Não recomendado para produção

---

### 2.6 Versão da API

**Campo: "API version"**

- Deixe como **"Default"** ou **"Latest"**
- Ou selecione: **2024-12-18.acacia** (versão atual)

---

### 2.7 Descrição (Opcional)

**Campo: "Description"**

Adicione uma descrição para identificar:
```
ILE ALA Production Webhook
```

---

### 2.8 Salvar Webhook

1. Revise todas as configurações
2. Clique em **"Add endpoint"** (botão inferior)
3. Webhook será criado

**Confirmação:**
- Você verá mensagem de sucesso
- Webhook aparece na lista

---

## 🔑 Parte 3: Obter Signing Secret

### 3.1 O Que é Signing Secret?

**Definição:**
- Chave secreta usada para verificar autenticidade
- Garante que webhook veio realmente do Stripe
- Previne ataques maliciosos

### 3.2 Copiar Signing Secret

Após criar o webhook:

1. Na lista de webhooks, clique no webhook que você acabou de criar
2. Você verá a página de detalhes do webhook
3. Procure pela seção **"Signing secret"**
4. Clique em **"Reveal"** ou **"Click to reveal"**
5. O secret será exibido:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. Clique no ícone de **copiar** (📋) ao lado
7. **Anote este valor!** Você precisará dele no próximo passo

**Formato:**
- Começa com `whsec_`
- Seguido de caracteres alfanuméricos
- Exemplo: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

---

## ⚙️ Parte 4: Configurar Signing Secret no Site

### 4.1 Acessar Management UI

1. Abra o site em desenvolvimento ou produção
2. Clique no ícone de **Management UI** (canto superior direito)
3. O painel lateral direito será aberto

### 4.2 Navegar para Secrets

1. No menu lateral do Management UI, clique em **"Settings"**
2. No submenu, clique em **"Secrets"**
3. Você verá a lista de variáveis de ambiente

### 4.3 Verificar se Secret Existe

Procure por:
```
STRIPE_WEBHOOK_SECRET
```

**Se EXISTIR:**
- Vá para o passo 4.4 (Editar)

**Se NÃO EXISTIR:**
- Vá para o passo 4.5 (Adicionar)

---

### 4.4 Editar Secret Existente

1. Encontre `STRIPE_WEBHOOK_SECRET` na lista
2. Clique no ícone de **editar** (lápis) ao lado
3. Uma janela de edição será aberta
4. No campo **"Value"**, cole o signing secret que você copiou:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Clique em **"Save"** ou **"Update"**
6. Secret será atualizado
7. Servidor reiniciará automaticamente (aguarde 10-15 segundos)

---

### 4.5 Adicionar Novo Secret

⚠️ **IMPORTANTE:** Não adicione secrets manualmente via UI!

**Se o secret não existir, você precisa:**

**Opção A: Solicitar via Chat**
- Peça para adicionar `STRIPE_WEBHOOK_SECRET`
- Forneça o valor do signing secret
- Sistema criará automaticamente

**Opção B: Adicionar via Código (Avançado)**
- Edite arquivo `.env` ou configuração
- Adicione linha:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Faça commit e redeploy

---

## 🧪 Parte 5: Testar Webhook

### 5.1 Testar no Stripe Dashboard

O Stripe permite testar webhooks antes de usar em produção.

**Passo a passo:**

1. Na página de detalhes do webhook, role até **"Send test webhook"**
2. Selecione um evento para testar:
   - **checkout.session.completed**
3. Clique em **"Send test webhook"**
4. Stripe enviará uma requisição de teste para seu site

**Resultado esperado:**
- ✅ Status: **200 OK** (sucesso)
- ✅ Response time: < 1 segundo
- ✅ Mensagem: "Webhook received"

**Se der erro:**
- ❌ Status: **404 Not Found** → URL incorreta
- ❌ Status: **401 Unauthorized** → Signing secret incorreto
- ❌ Status: **500 Internal Server Error** → Erro no código

---

### 5.2 Testar com Pagamento Real (Teste)

**Usar cartão de teste:**

1. Acesse seu site: `https://ileala.ae`
2. Adicione produtos ao carrinho
3. Vá para checkout
4. Preencha informações
5. Clique em "Proceed to Payment"
6. No Stripe Checkout, use cartão de teste:
   ```
   Número: 4242 4242 4242 4242
   Validade: 12/25 (qualquer data futura)
   CVV: 123 (qualquer 3 dígitos)
   Nome: Test User
   ```
7. Complete o pagamento
8. Você será redirecionado para confirmação

**Verificar webhook:**

1. Volte ao Stripe Dashboard → Webhooks
2. Clique no webhook criado
3. Vá para aba **"Logs"** ou **"Events"**
4. Você verá o evento `checkout.session.completed`
5. Status deve ser **200 OK**

---

### 5.3 Verificar no Banco de Dados

**Confirmar que pedido foi atualizado:**

1. Acesse Management UI → Database
2. Selecione tabela **`orders`**
3. Encontre o pedido de teste
4. Verifique:
   - ✅ `paymentStatus` = "paid"
   - ✅ `status` = "pending" ou "processing"
   - ✅ Dados do pedido corretos

---

## 📊 Parte 6: Monitorar Webhooks

### 6.1 Visualizar Logs

**No Stripe Dashboard:**

1. Developers → Webhooks
2. Clique no webhook
3. Vá para aba **"Logs"** ou **"Events"**

**Informações exibidas:**
- Data e hora do evento
- Tipo de evento
- Status da resposta (200, 404, 500)
- Tempo de resposta
- Payload enviado
- Resposta recebida

### 6.2 Interpretar Status

**Status 200 OK:**
- ✅ Webhook recebido e processado com sucesso
- Tudo funcionando corretamente

**Status 404 Not Found:**
- ❌ URL do webhook incorreta
- Verifique URL configurada

**Status 401 Unauthorized:**
- ❌ Signing secret incorreto
- Verifique `STRIPE_WEBHOOK_SECRET`

**Status 500 Internal Server Error:**
- ❌ Erro no código do servidor
- Verifique logs do servidor

**Status 503 Service Unavailable:**
- ❌ Servidor offline ou sobrecarregado
- Verifique se site está online

---

### 6.3 Reenviar Webhooks Falhados

Se um webhook falhar, você pode reenviá-lo:

1. Na aba "Logs", encontre o evento falhado
2. Clique no evento
3. Clique em **"Resend"** ou **"Retry"**
4. Stripe reenviará o webhook

---

## 🔒 Parte 7: Segurança do Webhook

### 7.1 Verificação de Assinatura

O site já implementa verificação automática:

**Como funciona:**
1. Stripe envia webhook com assinatura no header
2. Seu site verifica assinatura usando `STRIPE_WEBHOOK_SECRET`
3. Se assinatura for válida, processa evento
4. Se inválida, rejeita (401 Unauthorized)

**Benefícios:**
- ✅ Garante que webhook veio do Stripe
- ✅ Previne ataques de replay
- ✅ Protege contra webhooks falsos

---

### 7.2 HTTPS Obrigatório

**Stripe exige HTTPS:**
- ✅ `https://ileala.ae` → Aceito
- ❌ `http://ileala.ae` → Rejeitado

**Por quê:**
- Criptografa dados em trânsito
- Protege informações sensíveis
- Previne interceptação

---

### 7.3 Timeout e Retry

**Stripe aguarda resposta:**
- Timeout: 30 segundos
- Se não responder, marca como falha
- Tenta reenviar automaticamente

**Boas práticas:**
- Responda rapidamente (< 5 segundos)
- Processe tarefas longas em background
- Retorne 200 OK imediatamente

---

## 🌍 Parte 8: Webhook em Produção vs Teste

### 8.1 Modo de Teste

**Quando usar:**
- Durante desenvolvimento
- Para testar funcionalidades
- Antes de lançar

**Características:**
- Usa chaves de teste (`pk_test_`, `sk_test_`)
- Usa webhook de teste
- Não processa pagamentos reais
- Signing secret diferente (`whsec_test_...`)

---

### 8.2 Modo de Produção

**Quando usar:**
- Após testes completos
- Site publicado e funcionando
- Pronto para receber clientes reais

**Características:**
- Usa chaves de produção (`pk_live_`, `sk_live_`)
- Usa webhook de produção
- Processa pagamentos reais
- Signing secret de produção (`whsec_...`)

---

### 8.3 Configurar Ambos

**Recomendação:**
- Crie 2 webhooks separados:
  1. **Teste:** `https://dev.ileala.ae/api/webhooks/stripe`
  2. **Produção:** `https://ileala.ae/api/webhooks/stripe`

**Vantagens:**
- Testa sem afetar produção
- Logs separados
- Mais organizado

---

## 📝 Parte 9: Atualizar Webhook Após Mudanças

### 9.1 Quando Atualizar

**Situações que exigem atualização:**

1. **Mudança de domínio:**
   - De `xxxxx.manus.space` para `ileala.ae`
   - Atualize URL do webhook

2. **Mudança de rota:**
   - Se mudar endpoint de `/api/webhooks/stripe` para outro
   - Atualize URL

3. **Adicionar/Remover eventos:**
   - Se quiser receber mais ou menos eventos
   - Edite webhook

---

### 9.2 Como Atualizar

**Passo a passo:**

1. Acesse Stripe Dashboard → Developers → Webhooks
2. Clique no webhook existente
3. Clique em **"Edit"** (canto superior direito)
4. Atualize:
   - **Endpoint URL** (se mudou domínio)
   - **Events** (se mudou eventos)
5. Clique em **"Update endpoint"**
6. Webhook será atualizado

**Observação:**
- Signing secret permanece o mesmo
- Não precisa atualizar no site

---

### 9.3 Deletar Webhook Antigo

Se criou webhook de teste e agora tem de produção:

1. Acesse lista de webhooks
2. Encontre webhook antigo
3. Clique nele
4. Clique em **"Delete"** (canto superior direito)
5. Confirme exclusão

---

## ✅ Checklist de Configuração Completa

Use esta lista para garantir que tudo está configurado:

### Pré-requisitos
- [ ] Site publicado na Manus
- [ ] URL pública disponível
- [ ] Conta Stripe ativa
- [ ] Chaves de API configuradas

### Configuração do Webhook
- [ ] URL do webhook construída (`https://ileala.ae/api/webhooks/stripe`)
- [ ] Webhook criado no Stripe Dashboard
- [ ] Eventos selecionados:
  - [ ] checkout.session.completed
  - [ ] payment_intent.succeeded
  - [ ] payment_intent.payment_failed
- [ ] Signing secret copiado
- [ ] `STRIPE_WEBHOOK_SECRET` configurado no site
- [ ] Servidor reiniciado

### Testes
- [ ] Teste de webhook enviado pelo Stripe (200 OK)
- [ ] Pagamento de teste realizado
- [ ] Webhook recebido e processado
- [ ] Pedido atualizado no banco de dados
- [ ] Logs verificados no Stripe

### Produção
- [ ] Webhook de produção criado (se diferente de teste)
- [ ] URL de produção configurada
- [ ] Signing secret de produção configurado
- [ ] Teste com pagamento real realizado

---

## 🎉 Finalização da Publicação

### Última Etapa: Verificação Final

Após configurar webhook, faça verificação completa:

**1. Teste de Compra Completo:**
- [ ] Adicionar produto ao carrinho
- [ ] Aplicar cupom WELCOME10
- [ ] Preencher checkout
- [ ] Pagar com cartão real (valor pequeno)
- [ ] Verificar confirmação
- [ ] Verificar pedido no admin
- [ ] Verificar webhook no Stripe

**2. Teste de Domínio:**
- [ ] `https://ileala.ae` carrega
- [ ] `https://www.ileala.ae` carrega
- [ ] Cadeado SSL verde aparece
- [ ] Sem erros de certificado

**3. Teste de Funcionalidades:**
- [ ] Navegação funciona
- [ ] Troca de idioma funciona
- [ ] Carrinho funciona
- [ ] Checkout funciona
- [ ] Painel admin acessível

**4. Teste Mobile:**
- [ ] Site responsivo no celular
- [ ] Checkout funciona no mobile
- [ ] Pagamento funciona no mobile

---

## 🚀 Site Pronto para Lançamento!

Após completar todos os passos:

✅ **Webhook configurado e funcionando**
✅ **Pagamentos processados corretamente**
✅ **Notificações em tempo real**
✅ **Site seguro com SSL**
✅ **Domínio personalizado ativo**
✅ **Testes completos realizados**

**Seu site está 100% pronto para receber clientes! 🎊**

---

## 📞 Suporte e Recursos

### Documentação Stripe
- Webhooks: https://stripe.com/docs/webhooks
- Eventos: https://stripe.com/docs/api/events/types
- Segurança: https://stripe.com/docs/webhooks/signatures

### Ferramentas Úteis
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Webhook Tester: https://webhook.site
- Request Bin: https://requestbin.com

### Solução de Problemas
- Stripe Support: https://support.stripe.com
- Manus Help: https://help.manus.im

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  CONFIGURAÇÃO WEBHOOK STRIPE - PASSO A PASSO            │
└─────────────────────────────────────────────────────────┘

1. OBTER URL
   └─▶ https://ileala.ae/api/webhooks/stripe

2. CRIAR WEBHOOK NO STRIPE
   ├─▶ Developers → Webhooks → Add endpoint
   ├─▶ URL: https://ileala.ae/api/webhooks/stripe
   ├─▶ Eventos: checkout.session.completed, payment_intent.*
   └─▶ Salvar

3. COPIAR SIGNING SECRET
   └─▶ whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

4. CONFIGURAR NO SITE
   ├─▶ Management UI → Settings → Secrets
   ├─▶ STRIPE_WEBHOOK_SECRET = whsec_xxx...
   └─▶ Salvar (servidor reinicia)

5. TESTAR
   ├─▶ Send test webhook (Stripe Dashboard)
   ├─▶ Pagamento de teste
   └─▶ Verificar logs (200 OK)

6. PRODUÇÃO
   ├─▶ Criar webhook de produção
   ├─▶ Usar chaves live
   ├─▶ Testar com pagamento real
   └─▶ Monitorar logs

✅ WEBHOOK CONFIGURADO E FUNCIONANDO!
```

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79  
**Status:** Pronto para produção 🚀
