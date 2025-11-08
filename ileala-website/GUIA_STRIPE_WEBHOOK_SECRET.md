# 🔑 Guia: Como Obter STRIPE_WEBHOOK_SECRET

## 📋 O Que é STRIPE_WEBHOOK_SECRET?

**Definição:**
- Chave secreta (signing secret) fornecida pelo Stripe
- Usada para verificar autenticidade dos webhooks
- Garante que notificações vêm realmente do Stripe
- Previne ataques e webhooks falsos

**Formato:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Sempre começa com `whsec_`
- Seguido de 40+ caracteres alfanuméricos

---

## ✅ Pré-requisitos

Antes de começar:
- [x] Conta Stripe criada
- [x] Site publicado (URL pública disponível)
- [x] Saber a URL do webhook: `https://ileala.ae/api/webhooks/stripe`

---

## 🚀 Passo a Passo Completo

### **ETAPA 1: Acessar Stripe Dashboard**

#### 1.1 Fazer Login
1. Abra seu navegador
2. Acesse: **https://dashboard.stripe.com**
3. Digite seu email e senha
4. Clique em **"Sign in"**
5. Se tiver autenticação de 2 fatores, confirme

#### 1.2 Verificar Modo (Teste vs Produção)

No canto superior direito, você verá um toggle:
- **Test mode** (modo de teste) - fundo laranja/amarelo
- **Live mode** (modo de produção) - fundo verde

**Importante:**
- Para desenvolvimento/testes: use **Test mode**
- Para site em produção: use **Live mode**

**Como alternar:**
- Clique no toggle para mudar entre Test e Live
- Cada modo tem webhooks e secrets diferentes

---

### **ETAPA 2: Navegar para Webhooks**

#### 2.1 Acessar Seção de Desenvolvedores
1. No menu superior do Dashboard, clique em **"Developers"**
2. Você verá um submenu com várias opções

#### 2.2 Abrir Webhooks
1. No menu lateral esquerdo, clique em **"Webhooks"**
2. Você será levado para a página de gerenciamento de webhooks

**Tela atual:**
- Lista de webhooks existentes (se houver)
- Botão "Add endpoint" no canto superior direito

---

### **ETAPA 3: Criar Webhook Endpoint**

⚠️ **Se você JÁ criou o webhook, pule para ETAPA 4**

#### 3.1 Clicar em "Add endpoint"
1. No canto superior direito, clique em **"Add endpoint"**
2. Uma janela de configuração será aberta

#### 3.2 Configurar Endpoint URL

**Campo: "Endpoint URL"**

Digite a URL completa do webhook:
```
https://ileala.ae/api/webhooks/stripe
```

**Observações:**
- ✅ Deve começar com `https://` (SSL obrigatório)
- ✅ Use domínio publicado (ileala.ae ou xxxxx.manus.space)
- ❌ Não use `http://` (sem SSL)
- ❌ Não adicione espaços ou `/` no final

**Exemplos válidos:**
```
https://ileala.ae/api/webhooks/stripe
https://ileala.manus.space/api/webhooks/stripe
```

#### 3.3 Selecionar Eventos

**Campo: "Events to send"**

Clique em **"Select events"** e marque:

**Eventos essenciais para e-commerce:**
- ✅ `checkout.session.completed` - Checkout concluído
- ✅ `payment_intent.succeeded` - Pagamento bem-sucedido
- ✅ `payment_intent.payment_failed` - Pagamento falhou

**Eventos opcionais (recomendados):**
- `charge.refunded` - Reembolso processado
- `charge.dispute.created` - Cliente contestou pagamento
- `customer.created` - Cliente criado
- `invoice.paid` - Fatura paga (se usar assinaturas)

**Ou simplesmente:**
- Marque **"Send all event types"** para receber todos os eventos

#### 3.4 Salvar Webhook
1. Revise as configurações
2. Clique em **"Add endpoint"** (botão inferior)
3. Webhook será criado
4. Você verá mensagem de confirmação

---

### **ETAPA 4: Obter Signing Secret (STRIPE_WEBHOOK_SECRET)**

Agora vem a parte mais importante!

#### 4.1 Acessar Detalhes do Webhook

**Se acabou de criar:**
- Você já está na página de detalhes
- Pule para 4.2

**Se criou antes:**
1. Na lista de webhooks, encontre o webhook para `ileala.ae`
2. Clique no webhook
3. Você será levado para a página de detalhes

#### 4.2 Localizar Signing Secret

Na página de detalhes do webhook, procure pela seção:
```
┌─────────────────────────────────────────┐
│  Signing secret                         │
│  ────────────────────────────────────   │
│  whsec_•••••••••••••••••••••••••••••••  │
│  [Click to reveal]  [📋 Copy]           │
└─────────────────────────────────────────┘
```

**Localização:**
- Geralmente no meio da página
- Logo abaixo da URL do endpoint
- Pode estar oculto por padrão

#### 4.3 Revelar o Secret

1. Clique em **"Click to reveal"** ou **"Reveal"**
2. O secret completo será exibido:
   ```
   whsec_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
   ```

#### 4.4 Copiar o Secret

**Opção 1: Botão de Copiar**
1. Clique no ícone de **copiar** (📋) ao lado do secret
2. Secret será copiado para área de transferência
3. Você verá confirmação: "Copied!"

**Opção 2: Seleção Manual**
1. Clique triplo no secret para selecionar tudo
2. Pressione `Ctrl+C` (Windows/Linux) ou `Cmd+C` (Mac)
3. Secret copiado!

#### 4.5 Anotar o Secret

⚠️ **IMPORTANTE:** Guarde esse secret em local seguro!

**Anote em:**
- Gerenciador de senhas (1Password, LastPass, Bitwarden)
- Documento criptografado
- Arquivo de texto local (temporário)

**NÃO compartilhe:**
- ❌ Não envie por email
- ❌ Não poste em fóruns públicos
- ❌ Não commite no Git/GitHub
- ❌ Não compartilhe em chat público

**Formato esperado:**
```
whsec_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

---

### **ETAPA 5: Configurar Secret no Site Manus**

Agora vamos adicionar o secret ao site.

#### 5.1 Acessar Management UI

1. Abra o site: `https://ileala.ae` (ou URL de desenvolvimento)
2. Clique no ícone de **Management UI** (canto superior direito)
3. O painel lateral direito será aberto

#### 5.2 Navegar para Secrets

1. No menu lateral, clique em **"Settings"**
2. No submenu, clique em **"Secrets"**
3. Você verá a lista de variáveis de ambiente

#### 5.3 Procurar STRIPE_WEBHOOK_SECRET

Role a lista e procure por:
```
STRIPE_WEBHOOK_SECRET
```

**Se ENCONTRAR:**
- Vá para 5.4 (Editar Secret Existente)

**Se NÃO ENCONTRAR:**
- Vá para 5.5 (Adicionar Novo Secret)

---

#### 5.4 Editar Secret Existente

1. Encontre `STRIPE_WEBHOOK_SECRET` na lista
2. Clique no ícone de **editar** (lápis ✏️) ao lado
3. Uma janela de edição será aberta

**Campos:**
- **Key:** `STRIPE_WEBHOOK_SECRET` (não edite)
- **Value:** (campo de texto)

4. No campo **"Value"**, **delete o valor antigo** (se houver)
5. **Cole o signing secret** que você copiou:
   ```
   whsec_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
   ```
6. Clique em **"Save"** ou **"Update"**
7. Confirmação: "Secret updated!"
8. Servidor reiniciará automaticamente (aguarde 10-15 segundos)

---

#### 5.5 Adicionar Novo Secret

⚠️ **IMPORTANTE:** Não adicione secrets manualmente via UI!

**Se o secret não existir, você precisa solicitá-lo:**

**Opção A: Solicitar via Chat (Recomendado)**
1. Volte para o chat comigo
2. Diga: "Preciso adicionar STRIPE_WEBHOOK_SECRET"
3. Forneça o valor do signing secret
4. Eu criarei o secret automaticamente

**Opção B: Usar Ferramenta de Request Secrets**
1. Eu usarei `webdev_request_secrets`
2. Você receberá um card para inserir o valor
3. Cole o signing secret
4. Secret será adicionado automaticamente

---

### **ETAPA 6: Verificar Configuração**

#### 6.1 Confirmar Secret Salvo

1. Ainda em **Settings → Secrets**
2. Procure `STRIPE_WEBHOOK_SECRET`
3. Valor deve mostrar: `whsec_•••••••••••••••••••••` (oculto)
4. Se aparecer, está configurado! ✅

#### 6.2 Verificar Servidor Reiniciado

1. Aguarde 10-15 segundos após salvar
2. O servidor reinicia automaticamente
3. Novas variáveis são carregadas

**Como confirmar:**
- Acesse o site: `https://ileala.ae`
- Site deve carregar normalmente
- Se carregar, servidor reiniciou com sucesso

---

### **ETAPA 7: Testar Webhook**

Agora vamos testar se tudo está funcionando!

#### 7.1 Teste no Stripe Dashboard

1. Volte para Stripe Dashboard → Developers → Webhooks
2. Clique no webhook que você criou
3. Procure por **"Send test webhook"** (geralmente no topo ou lateral)
4. Clique em **"Send test webhook"**
5. Selecione um evento para testar:
   - Escolha: **checkout.session.completed**
6. Clique em **"Send test webhook"**

**Resultado esperado:**
```
✅ Status: 200 OK
✅ Response time: < 1 segundo
✅ Message: Webhook received successfully
```

**Se der erro:**
```
❌ Status: 401 Unauthorized
   → Signing secret incorreto, verifique valor

❌ Status: 404 Not Found
   → URL do webhook incorreta

❌ Status: 500 Internal Server Error
   → Erro no código do servidor
```

#### 7.2 Verificar Logs

1. Ainda na página do webhook
2. Vá para aba **"Logs"** ou **"Recent deliveries"**
3. Você verá o teste que acabou de enviar
4. Clique no evento para ver detalhes:
   - Request enviado
   - Response recebido
   - Status code
   - Tempo de resposta

#### 7.3 Teste com Pagamento Real (Teste)

**Usar cartão de teste:**

1. Acesse: `https://ileala.ae`
2. Adicione produtos ao carrinho
3. Vá para checkout
4. Preencha informações
5. Clique em "Proceed to Payment"
6. No Stripe Checkout, use:
   ```
   Número: 4242 4242 4242 4242
   Validade: 12/25
   CVV: 123
   Nome: Test User
   ```
7. Complete o pagamento
8. Você será redirecionado para confirmação

**Verificar webhook:**
1. Volte ao Stripe Dashboard → Webhooks → Logs
2. Você verá evento `checkout.session.completed`
3. Status deve ser **200 OK**
4. Isso confirma que webhook está funcionando! ✅

---

## 🔄 Diferença entre Test e Live Mode

### Test Mode (Modo de Teste)

**Quando usar:**
- Durante desenvolvimento
- Para testar funcionalidades
- Antes de lançar site

**Características:**
- Webhook secret começa com: `whsec_test_...`
- Não processa pagamentos reais
- Usa cartões de teste (4242...)
- Gratuito, sem limites

**Como obter:**
1. No Stripe Dashboard, ative **Test mode** (toggle)
2. Siga passos acima
3. Secret será: `whsec_test_xxxxxxxxxxxxxxxx`

---

### Live Mode (Modo de Produção)

**Quando usar:**
- Site publicado e funcionando
- Pronto para receber clientes reais
- Processar pagamentos reais

**Características:**
- Webhook secret começa com: `whsec_...` (sem "test")
- Processa pagamentos reais
- Cobra taxas do Stripe
- Requer conta ativada

**Como obter:**
1. No Stripe Dashboard, ative **Live mode** (toggle verde)
2. Siga passos acima
3. Secret será: `whsec_xxxxxxxxxxxxxxxx`

---

### Configurar Ambos (Recomendado)

**Melhor prática:**
- Crie 2 webhooks separados
- 1 para Test mode
- 1 para Live mode

**Vantagens:**
- Testa sem afetar produção
- Logs separados
- Mais organizado

**Como fazer:**
1. Crie webhook em **Test mode**
   - URL: `https://dev.ileala.ae/api/webhooks/stripe` (ou mesma URL)
   - Copie secret: `whsec_test_xxx`
   - Configure no site de desenvolvimento

2. Crie webhook em **Live mode**
   - URL: `https://ileala.ae/api/webhooks/stripe`
   - Copie secret: `whsec_xxx`
   - Configure no site de produção

---

## ✅ Checklist Completo

Use esta lista para garantir que tudo está correto:

### Obter Signing Secret
- [ ] Acessei Stripe Dashboard
- [ ] Fui em Developers → Webhooks
- [ ] Criei webhook (ou encontrei existente)
- [ ] URL configurada: `https://ileala.ae/api/webhooks/stripe`
- [ ] Eventos selecionados (checkout.session.completed, etc.)
- [ ] Revelei signing secret
- [ ] Copiei secret (começa com `whsec_`)
- [ ] Anotei secret em local seguro

### Configurar no Site
- [ ] Acessei Management UI → Settings → Secrets
- [ ] Encontrei ou solicitei `STRIPE_WEBHOOK_SECRET`
- [ ] Colei signing secret no campo Value
- [ ] Salvei configuração
- [ ] Servidor reiniciou (aguardei 15 segundos)

### Testar
- [ ] Enviei test webhook do Stripe Dashboard
- [ ] Status retornou 200 OK
- [ ] Fiz pagamento de teste com cartão 4242...
- [ ] Webhook foi recebido e processado
- [ ] Verifiquei logs no Stripe (200 OK)

### Produção (Se Aplicável)
- [ ] Ativei Live mode no Stripe
- [ ] Criei webhook de produção
- [ ] Copiei signing secret de produção
- [ ] Configurei no site de produção
- [ ] Testei com pagamento real (valor pequeno)

---

## 🔒 Segurança do Signing Secret

### Por Que é Importante?

**Sem signing secret:**
- ❌ Qualquer um pode enviar webhooks falsos
- ❌ Hackers podem simular pagamentos
- ❌ Dados podem ser manipulados

**Com signing secret:**
- ✅ Apenas Stripe pode enviar webhooks válidos
- ✅ Site verifica assinatura antes de processar
- ✅ Protege contra ataques e fraudes

### Como Funciona a Verificação?

```
1. Stripe cria webhook
   ↓
2. Stripe assina com signing secret
   ↓
3. Stripe envia webhook + assinatura
   ↓
4. Seu site recebe webhook
   ↓
5. Seu site verifica assinatura usando STRIPE_WEBHOOK_SECRET
   ↓
6. Se assinatura válida: processa ✅
   Se inválida: rejeita ❌
```

### Boas Práticas

**Proteja o secret:**
- ✅ Armazene em variáveis de ambiente
- ✅ Use gerenciador de senhas
- ✅ Não commite no Git
- ✅ Não compartilhe publicamente

**Rotação de secrets:**
- Stripe permite gerar novos secrets
- Útil se secret foi comprometido
- Atualize no site após gerar novo

**Monitore logs:**
- Verifique webhooks falhados
- Investigue status 401 (secret incorreto)
- Revise eventos suspeitos

---

## 🆘 Solução de Problemas

### Problema 1: Não encontro "Signing secret"

**Causa:** Webhook não foi criado ou você está na página errada

**Solução:**
1. Certifique-se de que criou o webhook
2. Clique no webhook na lista
3. Role a página para baixo
4. Procure por "Signing secret"

---

### Problema 2: Secret começa com "we_" ao invés de "whsec_"

**Causa:** Você copiou o Webhook ID ao invés do Signing Secret

**Solução:**
1. Volte para página do webhook
2. Procure especificamente por "Signing secret"
3. NÃO copie "Webhook ID" (we_xxx)
4. Copie o valor que começa com `whsec_`

---

### Problema 3: Teste retorna 401 Unauthorized

**Causa:** Signing secret incorreto ou não configurado

**Solução:**
1. Verifique se `STRIPE_WEBHOOK_SECRET` está configurado
2. Copie secret novamente do Stripe
3. Cole exatamente como está (sem espaços)
4. Salve e aguarde servidor reiniciar
5. Teste novamente

---

### Problema 4: Teste retorna 404 Not Found

**Causa:** URL do webhook incorreta

**Solução:**
1. Verifique URL no Stripe: `https://ileala.ae/api/webhooks/stripe`
2. Certifique-se de que site está publicado
3. Teste acessar a URL no navegador (deve retornar erro, mas não 404)
4. Corrija URL se necessário

---

### Problema 5: Secret não aparece em Secrets

**Causa:** Secret não foi adicionado ainda

**Solução:**
1. Solicite adição do secret via chat comigo
2. Ou use ferramenta de request secrets
3. Não tente adicionar manualmente via UI

---

## 📞 Recursos e Suporte

### Documentação Oficial
- Webhooks Stripe: https://stripe.com/docs/webhooks
- Signing Secrets: https://stripe.com/docs/webhooks/signatures
- Eventos: https://stripe.com/docs/api/events/types

### Ferramentas Úteis
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Webhook Tester: https://webhook.site
- Request Bin: https://requestbin.com

### Suporte
- Stripe Support: https://support.stripe.com
- Manus Help: https://help.manus.im

---

## 📊 Resumo Visual

```
┌────────────────────────────────────────────────────────┐
│  COMO OBTER STRIPE_WEBHOOK_SECRET                      │
└────────────────────────────────────────────────────────┘

1. ACESSAR STRIPE
   └─▶ https://dashboard.stripe.com

2. NAVEGAR
   └─▶ Developers → Webhooks

3. CRIAR/ABRIR WEBHOOK
   ├─▶ Add endpoint (se novo)
   ├─▶ URL: https://ileala.ae/api/webhooks/stripe
   ├─▶ Eventos: checkout.session.completed, etc.
   └─▶ Save

4. REVELAR SECRET
   ├─▶ Procurar "Signing secret"
   ├─▶ Click to reveal
   └─▶ Copiar: whsec_xxxxxxxxxxxxxxxx

5. CONFIGURAR NO SITE
   ├─▶ Management UI → Settings → Secrets
   ├─▶ STRIPE_WEBHOOK_SECRET
   ├─▶ Colar secret
   └─▶ Save (servidor reinicia)

6. TESTAR
   ├─▶ Send test webhook (Stripe)
   ├─▶ Status: 200 OK ✅
   └─▶ Webhook funcionando!

✅ STRIPE_WEBHOOK_SECRET CONFIGURADO!
```

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79  
**Status:** Pronto para configurar webhook 🔔
