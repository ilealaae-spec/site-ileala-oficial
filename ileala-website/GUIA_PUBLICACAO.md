# 🚀 Guia de Publicação - Site ILE ALA

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Stripe em Produção](#configuração-do-stripe-em-produção)
3. [Publicação do Site na Manus](#publicação-do-site-na-manus)
4. [Configuração do Domínio ileala.ae](#configuração-do-domínio-ilealaae)
5. [Testes Finais](#testes-finais)
6. [Checklist de Lançamento](#checklist-de-lançamento)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Conta no Stripe criada (https://stripe.com)
- [ ] Domínio ileala.ae registrado e ativo
- [ ] Acesso ao painel de DNS do domínio
- [ ] Imagens reais dos produtos (opcional, mas recomendado)
- [ ] Informações bancárias para receber pagamentos

---

## 💳 Configuração do Stripe em Produção

### Passo 1: Criar/Acessar Conta Stripe

#### 1.1 Criar Nova Conta
1. Acesse https://stripe.com
2. Clique em **"Start now"** ou **"Sign up"**
3. Preencha:
   - Email
   - Nome completo
   - País: **United Arab Emirates** (Emirados Árabes Unidos)
   - Senha
4. Verifique seu email
5. Complete o cadastro

#### 1.2 Acessar Conta Existente
1. Acesse https://dashboard.stripe.com
2. Faça login com suas credenciais

---

### Passo 2: Ativar Conta para Produção

#### 2.1 Completar Informações da Empresa
1. No Dashboard Stripe, clique em **"Activate your account"**
2. Preencha as informações:

**Informações do Negócio:**
- Nome da empresa: **ILE ALA**
- Tipo de negócio: **E-commerce / Retail**
- Descrição: **Luxury home and table products**
- Website: **ileala.ae** (ou temporário se ainda não publicado)
- Endereço comercial completo nos Emirados

**Informações Pessoais:**
- Nome completo do proprietário
- Data de nascimento
- Endereço residencial
- Número de telefone

**Informações Bancárias:**
- País da conta bancária: **UAE**
- Nome do banco
- Número da conta (IBAN)
- SWIFT/BIC code

**Documentos:**
- Upload de documento de identidade (Emirates ID ou Passaporte)
- Comprovante de endereço (se solicitado)
- Licença comercial (Trade License) - se aplicável

#### 2.2 Aguardar Aprovação
- O Stripe pode levar de algumas horas a 2-3 dias úteis para revisar
- Você receberá email quando a conta for aprovada
- Enquanto isso, pode continuar usando o modo de teste

---

### Passo 3: Obter Chaves de API de Produção

#### 3.1 Acessar Chaves de API
1. No Dashboard Stripe, clique em **"Developers"** (menu superior)
2. Clique em **"API keys"** (menu lateral)
3. Você verá duas seções:
   - **Test mode** (modo de teste - chaves atuais)
   - **Production mode** (modo de produção - novas chaves)

#### 3.2 Copiar Chaves de Produção
1. Certifique-se de estar em **"Production mode"** (toggle no canto superior direito)
2. Você verá duas chaves:

**Publishable key (Chave Pública):**
```
pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Começa com `pk_live_`
- Pode ser exposta no frontend
- Clique em **"Reveal test key"** se estiver oculta
- **Copie esta chave** (vamos usar no Passo 4)

**Secret key (Chave Secreta):**
```
sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Começa com `sk_live_`
- **NUNCA** exponha publicamente
- Clique em **"Reveal test key"** para visualizar
- **Copie esta chave** (vamos usar no Passo 4)

⚠️ **IMPORTANTE:** Guarde essas chaves em local seguro. Se perdê-las, precisará gerar novas.

---

### Passo 4: Configurar Chaves no Site Manus

#### 4.1 Acessar Painel de Secrets
1. Abra o site em desenvolvimento
2. Clique no ícone de **Management UI** (canto superior direito)
3. Vá em **Settings** → **Secrets** (menu lateral)

#### 4.2 Atualizar Chave Pública (Frontend)
1. Procure por **`VITE_STRIPE_PUBLISHABLE_KEY`**
2. Clique no ícone de **editar** (lápis)
3. **Cole a chave pública** que copiou (começa com `pk_live_`)
4. Clique em **"Save"**

#### 4.3 Atualizar Chave Secreta (Backend)
1. Procure por **`STRIPE_SECRET_KEY`**
2. Clique no ícone de **editar** (lápis)
3. **Cole a chave secreta** que copiou (começa com `sk_live_`)
4. Clique em **"Save"**

#### 4.4 Reiniciar Servidor
1. As variáveis de ambiente foram atualizadas
2. O servidor será reiniciado automaticamente
3. Aguarde alguns segundos

✅ **Pronto!** Seu site agora está configurado para processar pagamentos reais via Stripe.

---

### Passo 5: Configurar Webhooks (Opcional mas Recomendado)

Webhooks permitem que o Stripe notifique seu site sobre eventos de pagamento.

#### 5.1 Criar Webhook Endpoint
1. No Dashboard Stripe, vá em **Developers** → **Webhooks**
2. Clique em **"Add endpoint"**
3. **Endpoint URL:** `https://seu-dominio.manus.space/api/webhooks/stripe`
   - Substitua `seu-dominio` pelo domínio gerado após publicação
4. **Events to send:**
   - Selecione: `checkout.session.completed`
   - Selecione: `payment_intent.succeeded`
   - Selecione: `payment_intent.payment_failed`
5. Clique em **"Add endpoint"**

#### 5.2 Copiar Webhook Secret
1. Após criar o webhook, clique nele
2. Copie o **"Signing secret"** (começa com `whsec_`)
3. Adicione em **Settings → Secrets** como `STRIPE_WEBHOOK_SECRET`

---

## 🌐 Publicação do Site na Manus

### Passo 1: Preparar o Site para Produção

#### 1.1 Substituir Imagens Placeholder
1. Acesse `/admin/products`
2. Para cada produto:
   - Clique em **"Edit"**
   - Faça upload da imagem real do produto
   - Ou cole URL de imagem hospedada
   - Salve

#### 1.2 Revisar Conteúdo
- [ ] Verifique textos em inglês e português
- [ ] Confirme preços corretos
- [ ] Verifique estoque de cada produto
- [ ] Teste links do footer
- [ ] Revise informações de contato

#### 1.3 Testar Funcionalidades
- [ ] Adicionar produto ao carrinho
- [ ] Aplicar cupom WELCOME10
- [ ] Preencher checkout
- [ ] Verificar cálculo de VAT (5%)
- [ ] Testar troca de idioma

---

### Passo 2: Criar Checkpoint Final

**Por que criar checkpoint?**
- Necessário para publicar
- Cria snapshot do estado atual
- Permite rollback se necessário

#### 2.1 Criar Checkpoint
1. Certifique-se de que todas as mudanças foram salvas
2. O checkpoint mais recente já foi criado (versão: 890d3e79)
3. Se fez mudanças após isso, peça para criar novo checkpoint

---

### Passo 3: Publicar o Site

#### 3.1 Acessar Botão de Publicação
1. Abra o **Management UI** (painel direito)
2. Localize o botão **"Publish"** no canto superior direito
   - Só aparece se houver checkpoint criado
   - Se não aparecer, crie um checkpoint primeiro

#### 3.2 Configurar Publicação
1. Clique em **"Publish"**
2. Uma janela de configuração será aberta
3. Revise as configurações:

**Configurações Básicas:**
- **Site Name:** ILE ALA - Luxury Home & Table
- **Visibility:** Public (público)

**Domínio Temporário:**
- Será gerado automaticamente
- Formato: `xxxxx.manus.space`
- Exemplo: `ileala.manus.space`

4. Clique em **"Publish"** para confirmar

#### 3.3 Aguardar Publicação
- O processo leva de 30 segundos a 2 minutos
- Você verá um indicador de progresso
- Quando concluído, receberá confirmação

#### 3.4 Anotar URL Pública
Após publicação, você receberá:
```
https://xxxxx.manus.space
```
**Anote esta URL!** Você precisará dela para:
- Configurar webhook do Stripe (se ainda não fez)
- Testar o site em produção
- Configurar domínio personalizado

---

### Passo 4: Atualizar Configurações Pós-Publicação

#### 4.1 Atualizar Webhook do Stripe
Se criou webhook no Passo 5 da seção Stripe:
1. Volte ao Dashboard Stripe → Developers → Webhooks
2. Edite o endpoint criado
3. Atualize a URL para: `https://xxxxx.manus.space/api/webhooks/stripe`
4. Salve

#### 4.2 Atualizar URLs no Stripe (Opcional)
1. Dashboard Stripe → Settings → Business settings
2. Atualize **Website** para: `https://xxxxx.manus.space`
3. Salve

---

## 🌍 Configuração do Domínio ileala.ae

### Passo 1: Acessar Configurações de Domínio na Manus

#### 1.1 Abrir Painel de Domínios
1. No **Management UI**, vá em **Settings** → **Domains**
2. Você verá:
   - Domínio atual: `xxxxx.manus.space`
   - Opção para adicionar domínio personalizado

#### 1.2 Adicionar Domínio Personalizado
1. Clique em **"Add Custom Domain"** ou **"Custom Domain"**
2. Digite: `ileala.ae`
3. Clique em **"Add"** ou **"Continue"**

#### 1.3 Copiar Registros DNS
A Manus fornecerá instruções de DNS. Você verá algo como:

**Opção A - CNAME (Recomendado):**
```
Type: CNAME
Name: @ (ou www)
Value: xxxxx.manus.space
TTL: 3600
```

**Opção B - A Record:**
```
Type: A
Name: @
Value: 123.45.67.89 (IP fornecido)
TTL: 3600
```

**Para www:**
```
Type: CNAME
Name: www
Value: xxxxx.manus.space
TTL: 3600
```

**Anote esses valores!** Você precisará deles no próximo passo.

---

### Passo 2: Configurar DNS no Registrador do Domínio

O processo varia dependendo de onde você registrou o domínio (GoDaddy, Namecheap, etc.).

#### 2.1 Acessar Painel DNS
**Exemplos comuns:**

**GoDaddy:**
1. Login em https://dcc.godaddy.com
2. Meus Produtos → Domínios
3. Clique em **ileala.ae**
4. Vá em **DNS** ou **Manage DNS**

**Namecheap:**
1. Login em https://namecheap.com
2. Domain List → Manage
3. Advanced DNS

**Google Domains:**
1. Login em https://domains.google.com
2. Selecione ileala.ae
3. DNS

#### 2.2 Adicionar Registros DNS

**Para domínio principal (ileala.ae):**

1. Procure por **"Add Record"** ou **"Add New Record"**
2. Preencha:
   - **Type:** CNAME (ou A, conforme instruções Manus)
   - **Host/Name:** @ (significa raiz do domínio)
   - **Value/Points to:** xxxxx.manus.space (ou IP fornecido)
   - **TTL:** 3600 (ou 1 hour)
3. Clique em **"Save"** ou **"Add Record"**

**Para www (www.ileala.ae):**

1. Adicione outro registro:
   - **Type:** CNAME
   - **Host/Name:** www
   - **Value/Points to:** xxxxx.manus.space
   - **TTL:** 3600
2. Salve

#### 2.3 Remover Registros Conflitantes (Se Necessário)
- Se houver registros A ou CNAME existentes para @ ou www, **delete-os**
- Mantenha apenas os novos registros que você criou

---

### Passo 3: Aguardar Propagação DNS

#### 3.1 Tempo de Propagação
- **Mínimo:** 5-15 minutos
- **Típico:** 1-2 horas
- **Máximo:** 24-48 horas (raro)

#### 3.2 Verificar Propagação
Use ferramentas online para verificar:

**DNSChecker:**
1. Acesse https://dnschecker.org
2. Digite: `ileala.ae`
3. Selecione tipo: CNAME (ou A)
4. Clique em **"Search"**
5. Veja se os servidores ao redor do mundo já reconhecem o novo DNS

**WhatsMyDNS:**
1. Acesse https://whatsmydns.net
2. Digite: `ileala.ae`
3. Selecione tipo: CNAME
4. Veja propagação global

#### 3.3 Testar Acesso
Após propagação:
1. Abra navegador em modo anônimo
2. Acesse: `https://ileala.ae`
3. Verifique se o site carrega corretamente
4. Teste também: `https://www.ileala.ae`

---

### Passo 4: Configurar SSL/HTTPS (Automático)

A Manus configura SSL automaticamente:
- Certificado Let's Encrypt gratuito
- Renovação automática
- HTTPS forçado (HTTP redireciona para HTTPS)

**Aguarde:**
- 5-10 minutos após DNS propagar
- O certificado será emitido automaticamente
- Você verá o cadeado verde no navegador

---

## ✅ Testes Finais

### Teste 1: Navegação Básica
- [ ] Acesse https://ileala.ae
- [ ] Verifique carregamento da página inicial
- [ ] Teste menu de navegação
- [ ] Troque idioma (EN ↔ PT)
- [ ] Verifique footer e links

### Teste 2: Catálogo de Produtos
- [ ] Acesse página Shop
- [ ] Verifique se produtos aparecem
- [ ] Clique em um produto
- [ ] Verifique detalhes, preço, estoque
- [ ] Teste botão "Add to Cart"

### Teste 3: Carrinho e Checkout
- [ ] Adicione 2-3 produtos ao carrinho
- [ ] Acesse carrinho
- [ ] Altere quantidades
- [ ] Remova um item
- [ ] Clique em "Proceed to Checkout"

### Teste 4: Cupom de Desconto
- [ ] No checkout, digite: **WELCOME10**
- [ ] Clique em "Apply"
- [ ] Verifique se desconto de 10% foi aplicado
- [ ] Confirme cálculo correto do total

### Teste 5: Pagamento Stripe (TESTE)
⚠️ **Use cartão de teste primeiro!**

**Cartão de teste Stripe:**
```
Número: 4242 4242 4242 4242
Validade: Qualquer data futura (ex: 12/25)
CVV: Qualquer 3 dígitos (ex: 123)
Nome: Qualquer nome
```

1. Preencha formulário de checkout
2. Clique em "Proceed to Payment"
3. Será redirecionado para Stripe
4. Preencha com cartão de teste
5. Complete pagamento
6. Verifique redirecionamento para confirmação

### Teste 6: Pagamento Real (PRODUÇÃO)
⚠️ **Use seu próprio cartão!**

1. Repita processo com cartão real
2. Use valor pequeno (ex: 1 produto barato)
3. Complete pagamento
4. Verifique:
   - Confirmação no site
   - Email de confirmação (se configurado)
   - Pedido aparece em `/admin/orders`
   - Transação aparece no Dashboard Stripe

### Teste 7: Painel Administrativo
- [ ] Acesse https://ileala.ae/admin/products
- [ ] Verifique login (se necessário)
- [ ] Teste criar novo produto
- [ ] Faça upload de imagem
- [ ] Verifique https://ileala.ae/admin/orders
- [ ] Atualize status de um pedido
- [ ] Teste https://ileala.ae/admin/coupons
- [ ] Crie novo cupom de teste

### Teste 8: Dispositivos Móveis
- [ ] Abra site no celular
- [ ] Teste navegação mobile
- [ ] Verifique responsividade
- [ ] Teste checkout no mobile
- [ ] Verifique imagens carregam

### Teste 9: SEO
- [ ] Pesquise no Google: `site:ileala.ae`
- [ ] Verifique se páginas estão indexadas (pode levar dias)
- [ ] Acesse https://ileala.ae/sitemap.xml
- [ ] Confirme produtos listados
- [ ] Acesse https://ileala.ae/robots.txt

---

## 📋 Checklist de Lançamento

### Antes de Anunciar Publicamente

#### Conteúdo
- [ ] Todas as imagens de produtos são reais (não placeholders)
- [ ] Descrições de produtos revisadas (EN e PT)
- [ ] Preços corretos e atualizados
- [ ] Estoque configurado corretamente
- [ ] Informações de contato corretas
- [ ] Políticas de envio/devolução atualizadas

#### Configurações Técnicas
- [ ] Stripe em modo produção
- [ ] Chaves de API de produção configuradas
- [ ] Webhook do Stripe funcionando
- [ ] Domínio ileala.ae configurado e funcionando
- [ ] SSL/HTTPS ativo (cadeado verde)
- [ ] Analytics configurado (se aplicável)

#### Testes
- [ ] Fluxo completo de compra testado
- [ ] Pagamento real processado com sucesso
- [ ] Cupom WELCOME10 funcionando
- [ ] Emails de confirmação enviados (se configurado)
- [ ] Painel admin acessível e funcional
- [ ] Site responsivo em mobile

#### Legal e Compliance
- [ ] Política de privacidade atualizada
- [ ] Termos de uso revisados
- [ ] Informações de VAT corretas (5% UAE)
- [ ] Informações da empresa no footer
- [ ] Licença comercial válida (se aplicável)

#### Marketing
- [ ] Newsletter signup funcionando
- [ ] Popup de boas-vindas ativo
- [ ] Cupom WELCOME10 divulgado
- [ ] Redes sociais linkadas
- [ ] Google Analytics configurado (opcional)

---

## 🎉 Pós-Lançamento

### Primeiras 24 Horas
1. **Monitore pedidos** em `/admin/orders`
2. **Verifique Dashboard Stripe** para transações
3. **Responda rapidamente** a emails de clientes
4. **Teste periodicamente** o site
5. **Monitore erros** no console do navegador

### Primeira Semana
1. **Analise vendas** e produtos mais populares
2. **Ajuste estoque** conforme necessário
3. **Crie cupons sazonais** se aplicável
4. **Colete feedback** dos primeiros clientes
5. **Otimize imagens** se site estiver lento

### Manutenção Contínua
1. **Atualize produtos** regularmente
2. **Crie cupons** para datas especiais
3. **Monitore pedidos** diariamente
4. **Responda contatos** via formulário
5. **Backup regular** (checkpoints na Manus)

---

## 🆘 Solução de Problemas

### Problema: Domínio não funciona após 24h
**Solução:**
1. Verifique registros DNS no painel do registrador
2. Confirme que apontam para o domínio Manus correto
3. Use DNSChecker para verificar propagação
4. Entre em contato com suporte do registrador

### Problema: Pagamento não processa
**Solução:**
1. Verifique se chaves Stripe são de produção (`pk_live_` e `sk_live_`)
2. Confirme que conta Stripe está ativada
3. Verifique Dashboard Stripe para erros
4. Teste com cartão de teste primeiro

### Problema: Cupom não funciona
**Solução:**
1. Acesse `/admin/coupons`
2. Verifique se cupom está **ativo** (toggle verde)
3. Confirme data de validade
4. Verifique se compra mínima foi atingida
5. Confirme que não atingiu limite de usos

### Problema: Upload de imagem falha
**Solução:**
1. Verifique tamanho da imagem (máx 5MB recomendado)
2. Use formatos: JPG, PNG, WEBP
3. Tente fazer upload de imagem menor
4. Ou use URL de imagem hospedada externamente

### Problema: Não consigo acessar painel admin
**Solução:**
1. Confirme que está logado
2. Verifique se seu usuário tem `role = 'admin'`
3. Tente fazer logout e login novamente
4. Limpe cache do navegador

---

## 📞 Suporte

### Documentação
- **Guia Completo:** GUIA_COMPLETO.md
- **Este Guia:** GUIA_PUBLICACAO.md
- **Stripe Docs:** https://stripe.com/docs
- **Manus Help:** https://help.manus.im

### Contatos Úteis
- **Suporte Stripe:** https://support.stripe.com
- **Suporte Manus:** https://help.manus.im
- **Registrador de Domínio:** Verifique painel do registrador

---

## ✨ Parabéns!

Se você completou todos os passos, seu site **ILE ALA** está:
- ✅ Publicado e acessível em ileala.ae
- ✅ Processando pagamentos reais via Stripe
- ✅ Otimizado para SEO
- ✅ Pronto para receber clientes

**Próximos passos:**
1. Divulgue nas redes sociais
2. Envie newsletter para lista de contatos
3. Configure Google Ads (opcional)
4. Monitore vendas e ajuste estratégia

**Boa sorte com as vendas! 🎊**

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79
