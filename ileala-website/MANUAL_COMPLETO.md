# 📖 Manual Completo - Site ILE ALA

## Todas as Opções, Funcionalidades e Recursos Disponíveis

---

## 📑 Índice Geral

### PARTE A - SITE PÚBLICO (Para Clientes)
1. [Página Inicial](#1-página-inicial)
2. [Menu de Navegação](#2-menu-de-navegação)
3. [Loja (Shop)](#3-loja-shop)
4. [Detalhes do Produto](#4-detalhes-do-produto)
5. [Carrinho de Compras](#5-carrinho-de-compras)
6. [Checkout](#6-checkout)
7. [Sistema de Cupons](#7-sistema-de-cupons)
8. [Confirmação de Pedido](#8-confirmação-de-pedido)
9. [Páginas Informativas](#9-páginas-informativas)
10. [Footer e Links](#10-footer-e-links)
11. [Multilíngue](#11-multilíngue)
12. [Newsletter](#12-newsletter)

### PARTE B - PAINEL ADMINISTRATIVO (Para Você)
13. [Acesso ao Painel Admin](#13-acesso-ao-painel-admin)
14. [Gerenciamento de Produtos](#14-gerenciamento-de-produtos)
15. [Gerenciamento de Pedidos](#15-gerenciamento-de-pedidos)
16. [Gerenciamento de Cupons](#16-gerenciamento-de-cupons)
17. [Upload de Imagens](#17-upload-de-imagens)
18. [Navegação do Painel](#18-navegação-do-painel)

### PARTE C - CONFIGURAÇÕES E RECURSOS TÉCNICOS
19. [Management UI](#19-management-ui)
20. [Banco de Dados](#20-banco-de-dados)
21. [Secrets (Variáveis de Ambiente)](#21-secrets-variáveis-de-ambiente)
22. [Domínios](#22-domínios)
23. [Publicação](#23-publicação)
24. [Checkpoints](#24-checkpoints)

---

# PARTE A - SITE PÚBLICO

## 1. Página Inicial

**URL:** `/` ou `https://ileala.ae`

### 1.1 Hero Section
**Localização:** Topo da página

**Elementos:**
- **Logo ILE ALA** (canto superior esquerdo)
- **Imagem de fundo** grande e impactante
- **Título principal:** "ILE ALA"
- **Subtítulo:** "Everything you need to create your unique style and add comfort to everyday life"
- **Efeito visual:** Overlay escuro sobre imagem para melhor legibilidade

**Ações disponíveis:**
- Nenhuma ação direta (seção visual/branding)

---

### 1.2 Seção "Essence"
**Localização:** Logo após hero section

**Conteúdo:**
- **Título:** "Essence" (em verde)
- **Texto 1:** "ILE ALA was born from the idea that our home should reflect what truly makes us feel good: warmth, stillness, and meaningful connections."
- **Texto 2:** "More than just a physical space, it is a sanctuary — a place where every detail expresses our essence and tells our story."
- **Texto 3:** "The dining table is a place of gathering and celebration with loved ones, where memories are made and bonds are strengthened."

**Ações disponíveis:**
- Nenhuma ação (seção informativa)

---

### 1.3 Seção "About Us"
**Localização:** Após "Essence"

**Título:** "About Us" (centralizado)

**3 Cards com imagens:**

**Card 1: About me**
- **Imagem:** Foto de produtos ILE ALA (verde)
- **Título:** "About me"
- **Botão:** "KNOW" (leva para `/about`)

**Card 2: Our Collections**
- **Imagem:** Mesa posta com produtos
- **Título:** "Our Collections"
- **Botão:** "KNOW" (leva para `/collections`)

**Card 3: Our Values**
- **Imagem:** Produtos em dourado
- **Título:** "Our Values"
- **Botão:** "KNOW" (leva para página de valores)

**Ações disponíveis:**
- Clicar em qualquer botão "KNOW" para saber mais

---

### 1.4 Seção "Our Craft in Motion"
**Localização:** Após "About Us"

**Título:** "Our Craft in Motion"
**Subtítulo:** "Discover the artistry behind each piece. Watch how tradition meets innovation in our creative process."

**6 Vídeos em Grid (2 linhas x 3 colunas):**

1. **Handcrafting Process**
   - Placeholder de vídeo com botão play
   - Ao clicar: reproduz vídeo

2. **Textile Techniques**
   - Placeholder de vídeo com botão play

3. **Product Details**
   - Placeholder de vídeo com botão play

4. **Table Setting Inspiration**
   - Placeholder de vídeo com botão play

5. **Artisan Stories**
   - Placeholder de vídeo com botão play

6. **Collection Showcase**
   - Placeholder de vídeo com botão play

**Ações disponíveis:**
- Clicar no botão play para assistir vídeos
- *Nota: Vídeos são placeholders, você pode substituir por vídeos reais*

---

### 1.5 Seção "Subscribe" (Newsletter)
**Localização:** Antes do footer

**Fundo:** Verde escuro

**Conteúdo:**
- **Título:** "Subscribe"
- **Texto:** "Subscribe to our newsletter and receive the most exclusive news from the world of luxury table setting"
- **Campo de email:** Input para digitar email
- **Botão:** "Submit"

**Ações disponíveis:**
- Digitar email e clicar em "Submit" para se inscrever
- *Nota: Funcionalidade de envio pode precisar de integração com serviço de email*

---

## 2. Menu de Navegação

**Localização:** Topo de todas as páginas (Header fixo)

### 2.1 Logo
**Posição:** Esquerda

**Ação:**
- Clicar no logo retorna para página inicial (`/`)

---

### 2.2 Links de Navegação
**Posição:** Centro

**Links disponíveis:**
1. **Home** → `/`
2. **About** → `/about`
3. **Collections** → `/collections`
4. **Contact** → `/contact`
5. **Shop** → `/shop`

**Ações:**
- Clicar em qualquer link navega para a página correspondente
- Link ativo fica destacado

---

### 2.3 Ícones de Ação
**Posição:** Direita

**Ícones disponíveis:**

1. **Carrinho de Compras** (🛒)
   - Mostra badge com número de itens
   - Clicar abre página do carrinho (`/cart`)

2. **Seletor de Idioma** (🌐 EN/PT)
   - Mostra idioma atual
   - Clicar alterna entre Inglês e Português
   - Traduz todo o site automaticamente

**Ações:**
- Clicar no carrinho para ver itens
- Clicar no idioma para trocar EN ↔ PT

---

### 2.4 Menu Mobile (Responsivo)
**Visível em:** Telas pequenas (celular/tablet)

**Ícone:** Hambúrguer (☰)

**Ao clicar:**
- Abre menu lateral com todos os links
- Mesmas opções do menu desktop
- Botão de fechar (X)

---

## 3. Loja (Shop)

**URL:** `/shop`

### 3.1 Hero Section da Loja
**Elementos:**
- **Título:** "Shop"
- **Subtítulo:** "Discover our luxury home and table collection"
- **Fundo:** Gradiente suave

---

### 3.2 Grid de Produtos

**Layout:** Grid responsivo
- Desktop: 3 colunas
- Tablet: 2 colunas
- Mobile: 1 coluna

**Cada Card de Produto contém:**

1. **Imagem do Produto**
   - Foto em alta qualidade
   - Hover: leve zoom
   - Clicável (leva para detalhes)

2. **Nome do Produto**
   - Bilíngue (EN/PT conforme idioma selecionado)
   - Exemplo: "Botanical Placemat" / "Jogo Americano Botânico"

3. **Coleção**
   - Nome da coleção (ex: "Botanica", "La Mer")
   - Texto em cinza

4. **Preço**
   - Formato: "150.00 AED"
   - Destaque em verde

5. **Botão "Add"**
   - Adiciona produto ao carrinho
   - Feedback visual ao clicar

**Produtos Disponíveis (10 produtos):**

1. **Botanical Placemat** (Botanica) - 150.00 AED
2. **La Mer Table Runner** (La Mer) - 250.00 AED
3. **Soul Stamps Napkin Set (4 pieces)** (Soul Stamps) - 120.00 AED
4. **Khata Ceremonial Cloth** (Khata) - 180.00 AED
5. **Anima Cushion Cover** (Anima) - 95.00 AED
6. **Lacea Lace Doily** (Lacea) - 65.00 AED
7. **Terracotta Serving Bowl** (Terracotta) - 220.00 AED
8. **Nocturne Dinner Plate** (Nocturne) - 145.00 AED
9. **Aurora Tablecloth** (Aurora) - 350.00 AED
10. **Botanical Napkin Rings (Set of 6)** (Botanica) - 80.00 AED

**Ações disponíveis:**
- **Clicar na imagem ou nome:** Abre detalhes do produto
- **Clicar em "Add":** Adiciona 1 unidade ao carrinho
- **Scroll:** Ver mais produtos

---

### 3.3 Filtros (Futuro)
*Atualmente não implementado, mas pode ser adicionado:*
- Filtrar por coleção
- Filtrar por faixa de preço
- Ordenar por: preço, nome, novidades

---

## 4. Detalhes do Produto

**URLs possíveis:**
- `/shop/botanical-placemat-green-1` (URL amigável)
- `/product/1` (URL por ID)

### 4.1 Breadcrumb
**Localização:** Topo da página

**Formato:** Home > Shop > Nome do Produto

**Ação:**
- Clicar em qualquer parte navega para aquela seção

---

### 4.2 Layout da Página

**Divisão:** 2 colunas (desktop) ou 1 coluna (mobile)

---

### 4.3 Coluna Esquerda - Imagem

**Elementos:**
- **Imagem grande do produto**
- Alta resolução
- Zoom ao passar mouse (desktop)

**Ações:**
- Visualizar produto em detalhes

---

### 4.4 Coluna Direita - Informações

**Elementos:**

1. **Nome do Produto**
   - Tamanho grande
   - Bilíngue

2. **Coleção**
   - Badge ou tag
   - Exemplo: "Botanica Collection"

3. **Preço**
   - Destaque em verde
   - Formato: "150.00 AED"

4. **Disponibilidade**
   - "In Stock" (verde) se stock > 0
   - "Out of Stock" (vermelho) se stock = 0

5. **Descrição**
   - Texto completo bilíngue
   - Detalhes do produto
   - Materiais, dimensões, cuidados

6. **Seletor de Quantidade**
   - Botão `-` (diminuir)
   - Campo numérico (digitar quantidade)
   - Botão `+` (aumentar)
   - Mínimo: 1
   - Máximo: estoque disponível

7. **Botão "Add to Cart"**
   - Adiciona quantidade selecionada ao carrinho
   - Feedback: toast "Product added to cart!"
   - Desabilitado se out of stock

**Ações disponíveis:**
- Ajustar quantidade com +/-
- Adicionar ao carrinho
- Voltar para shop

---

### 4.5 Schema Markup (SEO)
*Invisível para usuário, mas importante para Google:*
- Nome, descrição, imagem
- Preço e moeda
- Disponibilidade
- SKU e marca

---

## 5. Carrinho de Compras

**URL:** `/cart`

### 5.1 Carrinho Vazio

**Quando:** Nenhum produto adicionado

**Elementos:**
- Ícone de carrinho vazio
- Texto: "Your cart is empty"
- Subtexto: "Add some products to get started"
- Botão: "Continue Shopping" (volta para `/shop`)

---

### 5.2 Carrinho com Produtos

**Layout:** Lista de produtos + resumo

---

### 5.3 Lista de Produtos

**Cada item mostra:**

1. **Imagem do Produto**
   - Miniatura (thumbnail)
   - Clicável (vai para detalhes)

2. **Nome do Produto**
   - Bilíngue
   - Clicável

3. **Preço Unitário**
   - Formato: "150.00 AED"

4. **Controles de Quantidade**
   - Botão `-` (diminuir)
   - Número atual
   - Botão `+` (aumentar)
   - Atualiza automaticamente

5. **Subtotal do Item**
   - Preço × Quantidade
   - Formato: "300.00 AED"

6. **Botão Remover**
   - Ícone de lixeira (🗑️)
   - Remove item do carrinho
   - Confirmação: "Are you sure?"

**Ações disponíveis:**
- Aumentar/diminuir quantidade
- Remover item
- Clicar no produto para ver detalhes

---

### 5.4 Resumo do Carrinho

**Localização:** Lateral direita (desktop) ou abaixo (mobile)

**Elementos:**

1. **Subtotal**
   - Soma de todos os itens
   - Formato: "Subtotal: 470.00 AED"

2. **Observação**
   - "Shipping and taxes calculated at checkout"

3. **Botão "Proceed to Checkout"**
   - Verde, destaque
   - Leva para `/checkout`

**Ações:**
- Clicar em "Proceed to Checkout" para finalizar compra

---

### 5.5 Persistência do Carrinho

**Comportamento:**
- Carrinho é salvo por usuário logado
- Persiste entre sessões
- Se não logado, usa localStorage (temporário)

---

## 6. Checkout

**URL:** `/checkout`

**Requisito:** Usuário deve estar logado

### 6.1 Layout da Página

**Divisão:** 2 colunas
- **Esquerda:** Formulário de informações
- **Direita:** Resumo do pedido

---

### 6.2 Formulário de Checkout (Esquerda)

**Seção 1: Informações do Cliente**

**Campos:**

1. **Nome Completo** *
   - Input text
   - Obrigatório
   - Placeholder: "John Doe"

2. **Email** *
   - Input email
   - Obrigatório
   - Validação de formato
   - Placeholder: "john@example.com"

3. **Telefone**
   - Input tel
   - Opcional
   - Placeholder: "+971 50 123 4567"

---

**Seção 2: Endereço de Entrega**

**Campos:**

4. **Endereço Completo** *
   - Textarea
   - Obrigatório
   - Múltiplas linhas
   - Placeholder:
     ```
     Street Address
     Building/Apartment
     City, Emirate
     UAE
     ```

---

**Seção 3: Observações**

5. **Notas Adicionais**
   - Textarea
   - Opcional
   - Placeholder: "Special delivery instructions..."

---

**Campos marcados com * são obrigatórios**

---

### 6.3 Campo de Cupom de Desconto

**Localização:** Entre formulário e resumo (ou dentro do resumo)

**Elementos:**

1. **Label:** "Have a coupon code?"

2. **Input de Texto**
   - Placeholder: "Enter coupon code"
   - Converte para maiúsculas automaticamente

3. **Botão "Apply"**
   - Valida cupom ao clicar
   - Feedback:
     - ✅ Sucesso: "Coupon applied! 10% discount"
     - ❌ Erro: "Invalid coupon code"
     - ❌ Erro: "Coupon expired"
     - ❌ Erro: "Minimum purchase not met"

4. **Cupom Aplicado (se válido)**
   - Badge verde: "WELCOME10 applied"
   - Botão "Remove" (X) para remover cupom

**Cupons disponíveis:**
- **WELCOME10** - 10% de desconto, sem mínimo, ilimitado

**Ações:**
- Digitar código
- Clicar em "Apply"
- Remover cupom aplicado

---

### 6.4 Resumo do Pedido (Direita)

**Título:** "Order Summary"

**Lista de Produtos:**
- Nome de cada produto
- Quantidade × Preço unitário
- Subtotal por item

**Cálculos:**

1. **Subtotal**
   - Soma de todos os produtos
   - Formato: "470.00 AED"

2. **VAT (5%)**
   - Imposto dos Emirados
   - Cálculo: Subtotal × 0.05
   - Formato: "23.50 AED"

3. **Desconto** (se cupom aplicado)
   - Em verde ou vermelho
   - Formato: "-47.00 AED" (10% de 470)
   - Mostra código do cupom

4. **Total**
   - Subtotal + VAT - Desconto
   - Destaque em negrito
   - Formato: "446.50 AED"

**Exemplo com cupom WELCOME10:**
```
Subtotal:    470.00 AED
VAT (5%):     23.50 AED
Discount:    -47.00 AED (WELCOME10)
─────────────────────
Total:       446.50 AED
```

---

### 6.5 Botão de Pagamento

**Texto:** "Proceed to Payment"

**Estilo:** Verde, grande, destaque

**Ação ao clicar:**
1. Valida todos os campos obrigatórios
2. Cria pedido no banco de dados
3. Cria sessão de pagamento no Stripe
4. Redireciona para Stripe Checkout
5. Cliente preenche dados do cartão no Stripe
6. Após pagamento:
   - Sucesso → `/order-confirmation/:id`
   - Cancelado → volta para `/checkout`

---

### 6.6 Validações

**Antes de prosseguir:**
- ✅ Nome preenchido
- ✅ Email válido
- ✅ Endereço preenchido
- ✅ Carrinho não vazio
- ✅ Estoque disponível

**Mensagens de erro:**
- "Please fill in all required fields"
- "Invalid email format"
- "Cart is empty"

---

## 7. Sistema de Cupons

### 7.1 Como Funciona

**Fluxo:**
1. Cliente digita código no checkout
2. Sistema valida:
   - Código existe?
   - Está ativo?
   - Não expirou?
   - Compra mínima atingida?
   - Não excedeu limite de usos?
3. Se válido:
   - Aplica desconto
   - Atualiza total
   - Mostra badge verde
4. Se inválido:
   - Mostra mensagem de erro
   - Não aplica desconto

---

### 7.2 Tipos de Desconto

**Percentage (Porcentagem):**
- Exemplo: 10% OFF
- Cálculo: Subtotal × (Valor / 100)
- WELCOME10 = 10%

**Fixed (Valor Fixo):**
- Exemplo: 50 AED OFF
- Cálculo: Subtotal - Valor
- Exemplo: SAVE50 = 50.00 AED

---

### 7.3 Regras de Validação

**Cupom é válido se:**
- ✅ Código correto (case-insensitive)
- ✅ Status = Ativo
- ✅ Data atual < Data de expiração (se definida)
- ✅ Subtotal ≥ Compra mínima
- ✅ Usos atuais < Máximo de usos (se definido)

**Cupom é inválido se:**
- ❌ Código não existe
- ❌ Status = Inativo
- ❌ Expirado
- ❌ Compra mínima não atingida
- ❌ Limite de usos excedido

---

### 7.4 Cupons Pré-configurados

**WELCOME10:**
- Tipo: Percentage
- Valor: 10%
- Compra mínima: 0 AED
- Máximo de usos: Ilimitado (0)
- Validade: 1 ano
- Status: Ativo
- Uso: Boas-vindas para novos clientes

**Você pode criar mais cupons no painel admin!**

---

## 8. Confirmação de Pedido

**URL:** `/order-confirmation/:id`

**Quando:** Após pagamento bem-sucedido no Stripe

### 8.1 Mensagem de Sucesso

**Elementos:**
- ✅ Ícone de sucesso (check verde)
- **Título:** "Order Confirmed!"
- **Mensagem:** "Thank you for your purchase. Your order has been placed successfully."

---

### 8.2 Detalhes do Pedido

**Informações exibidas:**

1. **Número do Pedido**
   - Formato: "Order #123"
   - Único e sequencial

2. **Data do Pedido**
   - Formato: "November 1, 2025 at 10:30 AM"

3. **Status do Pedido**
   - Badge colorido
   - Valores: Pending, Processing, Shipped, Delivered

4. **Status de Pagamento**
   - Badge colorido
   - Valores: Paid (verde), Pending (amarelo), Failed (vermelho)

5. **Produtos Comprados**
   - Lista de cada produto
   - Quantidade × Nome
   - Preço

6. **Resumo Financeiro**
   - Subtotal
   - VAT (5%)
   - Desconto (se aplicável)
   - Total pago

7. **Informações de Entrega**
   - Nome do cliente
   - Email
   - Telefone
   - Endereço completo

8. **Observações**
   - Notas adicionais (se fornecidas)

---

### 8.3 Próximos Passos

**Mensagens:**
- "You will receive an email confirmation shortly"
- "We will notify you when your order is shipped"

**Botões:**
- "Continue Shopping" → volta para `/shop`
- "View My Orders" → (futuro: área do cliente)

---

### 8.4 Email de Confirmação
*Funcionalidade futura - pode ser implementada:*
- Email automático para cliente
- Resumo do pedido
- Número de rastreamento (quando enviado)

---

## 9. Páginas Informativas

### 9.1 About (Sobre)
**URL:** `/about`

**Conteúdo:**
- História da ILE ALA
- Missão e valores
- Equipe (opcional)
- Fotos e imagens

---

### 9.2 Collections (Coleções)
**URL:** `/collections`

**Conteúdo:**
- Descrição de cada coleção:
  - Botanica
  - La Mer
  - Soul Stamps
  - Khata
  - Anima
  - Lacea
  - Terracotta
  - Nocturne
  - Aurora
- Imagens representativas
- Links para produtos de cada coleção

---

### 9.3 Contact (Contato)
**URL:** `/contact`

**Elementos:**
- Formulário de contato:
  - Nome
  - Email
  - Assunto
  - Mensagem
  - Botão "Send"
- Informações de contato:
  - Email: contact@ileala.ae (exemplo)
  - Telefone: +971 XX XXX XXXX
  - Endereço físico (se aplicável)
- Mapa (opcional)

---

### 9.4 FAQ (Perguntas Frequentes)
**URL:** `/faq`

**Formato:** Accordion (perguntas expansíveis)

**Categorias:**
- Pedidos e Pagamentos
- Envio e Entrega
- Devoluções e Trocas
- Produtos e Cuidados
- Conta e Segurança

---

### 9.5 Shipping (Envio)
**URL:** `/shipping`

**Conteúdo:**
- Métodos de envio disponíveis
- Prazos de entrega
- Custos de envio
- Áreas atendidas
- Rastreamento de pedidos

---

### 9.6 Returns (Devoluções)
**URL:** `/returns`

**Conteúdo:**
- Política de devolução (prazo, condições)
- Como solicitar devolução
- Reembolsos
- Trocas

---

### 9.7 Product Care (Cuidados com Produtos)
**URL:** `/product-care`

**Conteúdo:**
- Instruções de lavagem
- Armazenamento
- Manutenção
- Dicas por tipo de produto

---

### 9.8 Privacy (Privacidade)
**URL:** `/privacy`

**Conteúdo:**
- Política de privacidade
- Coleta de dados
- Uso de cookies
- Direitos do usuário (GDPR)

---

### 9.9 Terms (Termos de Uso)
**URL:** `/terms`

**Conteúdo:**
- Termos e condições
- Uso do site
- Responsabilidades
- Limitações de responsabilidade

---

### 9.10 Accessibility (Acessibilidade)
**URL:** `/accessibility`

**Conteúdo:**
- Compromisso com acessibilidade
- Recursos disponíveis
- Conformidade WCAG
- Contato para sugestões

---

### 9.11 AI Policy (Política de IA)
**URL:** `/ai-policy`

**Conteúdo:**
- Uso de IA no site (se aplicável)
- Transparência
- Dados e privacidade

---

### 9.12 Do Not Sell (Não Vender Dados)
**URL:** `/do-not-sell`

**Conteúdo:**
- Opção de opt-out
- Direitos de privacidade (CCPA)

---

### 9.13 Help (Ajuda)
**URL:** `/help`

**Conteúdo:**
- Central de ajuda
- Links para FAQ, Shipping, Returns
- Formulário de suporte

---

### 9.14 Find Retailer (Encontrar Revendedor)
**URL:** `/find-retailer`

**Conteúdo:**
- Lojas físicas (se aplicável)
- Mapa de revendedores
- Informações de contato

---

## 10. Footer e Links

**Localização:** Rodapé de todas as páginas

### 10.1 Logo e Informações
**Coluna 1:**
- Logo ILE ALA
- Endereço: "Dubai, United Arab Emirates"
- Copyright: "© 2025 ILE ALA. All rights reserved."

---

### 10.2 Support (Suporte)
**Coluna 2:**

**Links:**
- Help
- FAQ
- Shipping
- Returns
- Product Care
- Find Retailer

---

### 10.3 Let's Talk (Contato)
**Coluna 3:**

**Elementos:**
- Website: www.ileala.ae
- Ícones de redes sociais:
  - Instagram
  - Facebook

---

### 10.4 Subscribe (Newsletter)
**Coluna 4:**

**Elementos:**
- Texto: "Subscribe to our newsletter and receive the most exclusive news from the world of luxury table setting"
- Campo de email
- Botão "Submit"

---

### 10.5 Links Legais
**Linha inferior:**

**Links:**
- Privacy
- Terms
- AI Policy
- Accessibility
- Do Not Sell

---

## 11. Multilíngue

### 11.1 Idiomas Disponíveis
- **Inglês (EN)** - padrão
- **Português (PT)**

---

### 11.2 Como Trocar Idioma

**Método 1: Botão no Header**
- Localização: Canto superior direito
- Ícone: 🌐 + "EN" ou "PT"
- Ação: Clicar alterna entre idiomas

**Método 2: Persistência**
- Escolha é salva no navegador
- Persiste entre sessões
- Mesmo idioma ao voltar ao site

---

### 11.3 O Que é Traduzido

**Traduzido automaticamente:**
- ✅ Nomes de produtos
- ✅ Descrições de produtos
- ✅ Textos de interface (botões, labels)
- ✅ Mensagens de erro/sucesso
- ✅ Páginas informativas
- ✅ Menu e navegação
- ✅ Footer

**Não traduzido:**
- ❌ URLs (sempre em inglês)
- ❌ Códigos de cupom
- ❌ Dados do usuário (nome, endereço)

---

### 11.4 Qualidade da Tradução

**Produtos:**
- Campos separados: `nameEN`, `namePT`, `descriptionEN`, `descriptionPT`
- Tradução manual (você define)
- Alta qualidade

**Interface:**
- Tradução programática
- Contexto preservado

---

## 12. Newsletter

### 12.1 Popup de Boas-Vindas

**Quando aparece:**
- Primeira visita ao site
- Após 3 segundos na página
- Não aparece novamente se fechado

**Conteúdo:**
- **Título:** "Welcome to ILE ALA!"
- **Texto:** "Get 10% OFF your first order"
- **Cupom destacado:** "WELCOME10"
- **Campo de email:** "Enter your email"
- **Botão:** "Subscribe & Get Discount"
- **Link:** "No thanks" (fecha popup)

**Ações:**
- Digitar email e clicar em "Subscribe"
- Ou fechar popup

---

### 12.2 Newsletter no Footer

**Localização:** Rodapé de todas as páginas

**Elementos:**
- Campo de email
- Botão "Submit"
- Texto explicativo

**Ação:**
- Inscrever-se na newsletter

---

### 12.3 Integração (Futuro)
*Pode ser integrado com:*
- Mailchimp
- SendGrid
- ConvertKit
- Outro serviço de email marketing

---

# PARTE B - PAINEL ADMINISTRATIVO

## 13. Acesso ao Painel Admin

### 13.1 URLs de Acesso

**Páginas disponíveis:**
- `/admin/products` - Gerenciar produtos
- `/admin/orders` - Gerenciar pedidos
- `/admin/coupons` - Gerenciar cupons

---

### 13.2 Requisitos de Acesso

**Para acessar:**
1. Usuário deve estar logado
2. Usuário deve ter `role = 'admin'`

**Seu acesso:**
- ✅ Você já está configurado como admin
- ✅ Pode acessar todas as áreas

---

### 13.3 Tela de Acesso Negado

**Se não for admin:**
- Título: "Access Denied"
- Mensagem: "You need admin privileges to access this page"
- Botão: "Go Home"

---

### 13.4 Login

**Se não estiver logado:**
- Redirecionado para tela de login
- Após login, volta para página admin

---

## 14. Gerenciamento de Produtos

**URL:** `/admin/products`

### 14.1 Visão Geral da Página

**Layout:**
- **Header:** Título + Botão "Add Product"
- **Grid:** Cards de produtos (3 colunas)

---

### 14.2 Visualização de Produtos

**Cada card mostra:**

1. **Imagem do Produto**
   - Foto em alta qualidade
   - 200px de altura

2. **Nome**
   - No idioma selecionado
   - Fonte grande

3. **Coleção**
   - Texto em cinza
   - Fonte pequena

4. **Preço**
   - Verde, destaque
   - Formato: "150.00 AED"

5. **Estoque**
   - "Stock: 10"

6. **Botões de Ação:**
   - **Edit** (lápis) - Editar produto
   - **Delete** (lixeira) - Deletar produto

---

### 14.3 Adicionar Novo Produto

**Botão:** "Add Product" (canto superior direito)

**Ao clicar:**
- Abre diálogo modal
- Formulário de criação

---

**Formulário - Campos:**

#### Seção 1: Imagem

**Upload de Imagem:**
- **Preview:** Mostra imagem selecionada
- **Input file:** Selecionar arquivo do computador
- **Botão "Upload":** Confirma upload
- **Formatos aceitos:** JPG, PNG, WEBP, GIF
- **Tamanho máximo:** 5MB recomendado

**OU**

**URL da Imagem:**
- **Input text:** Colar URL de imagem hospedada
- **Preview automático:** Mostra imagem ao colar URL

**Botão Remover (X):**
- Remove imagem selecionada
- Limpa preview

---

#### Seção 2: Informações Básicas

**1. Nome (Inglês)** *
- Input text
- Obrigatório
- Exemplo: "Botanical Placemat"

**2. Nome (Português)** *
- Input text
- Obrigatório
- Exemplo: "Jogo Americano Botânico"

---

#### Seção 3: Descrições

**3. Descrição (Inglês)**
- Textarea
- Opcional
- Múltiplas linhas
- Exemplo: "Elegant placemat with botanical patterns..."

**4. Descrição (Português)**
- Textarea
- Opcional
- Exemplo: "Jogo americano elegante com padrões botânicos..."

---

#### Seção 4: Preço e Estoque

**5. Preço (AED)** *
- Input number
- Obrigatório
- Aceita decimais
- Exemplo: 150.00

**6. Estoque** *
- Input number
- Obrigatório
- Número inteiro
- Exemplo: 10

---

#### Seção 5: Categorização

**7. Coleção**
- Input text
- Opcional
- Exemplo: "Botanica", "La Mer"

**8. Categoria**
- Input text
- Opcional
- Exemplo: "Placemats", "Table Runners"

---

#### Seção 6: Destaque

**9. Produto em Destaque**
- Checkbox
- Marcado = produto aparece na home
- Desmarcado = produto normal

---

**Botões:**
- **"Save Product"** - Salva e fecha
- **"Cancel"** - Cancela e fecha

---

### 14.4 Editar Produto

**Ação:** Clicar em botão "Edit" em qualquer produto

**Comportamento:**
- Abre mesmo diálogo de criação
- Campos pré-preenchidos com dados atuais
- Título muda para "Edit Product"

**Modificações:**
- Altere qualquer campo
- Clique em "Save Product"
- Produto é atualizado

---

### 14.5 Deletar Produto

**Ação:** Clicar em botão de lixeira (🗑️)

**Comportamento:**
1. Confirmação: "Delete this product?"
2. Se confirmar:
   - Produto é marcado como inativo (`active = 0`)
   - Não aparece mais na loja
   - Soft delete (não remove do banco)
3. Toast: "Product deleted!"

---

### 14.6 Slug Automático

**O que é:**
- URL amigável gerada automaticamente
- Baseada no nome em inglês

**Exemplo:**
- Nome: "Botanical Placemat"
- Slug: "botanical-placemat-green-1730123456"

**Formato:**
- Nome em minúsculas
- Espaços viram hífens
- Remove caracteres especiais
- Adiciona timestamp para unicidade

**Uso:**
- URL do produto: `/shop/botanical-placemat-green-1730123456`

---

## 15. Gerenciamento de Pedidos

**URL:** `/admin/orders`

### 15.1 Visão Geral da Página

**Layout:**
- **Header:** Título "Manage Orders"
- **Lista:** Cards de pedidos (1 coluna, full width)

---

### 15.2 Visualização de Pedidos

**Cada card mostra:**

#### Linha 1: Informações Principais (4 colunas)

**Coluna 1: ID do Pedido**
- Label: "Order ID"
- Valor: "#123"

**Coluna 2: Data**
- Label: "Date"
- Valor: "Nov 1, 2025 10:30 AM"

**Coluna 3: Total**
- Label: "Total"
- Valor: "446.50 AED" (verde)
- Desconto: "-47.00 AED" (se aplicável)
- Cupom: "Coupon: WELCOME10"

**Coluna 4: Status**
- Label: "Status"
- **Dropdown editável:**
  - Pending (amarelo)
  - Processing (azul)
  - Shipped (roxo)
  - Delivered (verde)
  - Cancelled (vermelho)

---

#### Linha 2: Detalhes (2 colunas)

**Coluna 1: Informações do Cliente**
- **Nome:** John Doe
- **Email:** john@example.com
- **Telefone:** +971 50 123 4567

**Coluna 2: Endereço de Entrega**
- Endereço completo
- Múltiplas linhas

---

#### Linha 3: Status de Pagamento

**Badge colorido:**
- **Paid** (verde) - pago
- **Pending** (amarelo) - pendente
- **Failed** (vermelho) - falhou
- **Refunded** (cinza) - reembolsado

---

#### Linha 4: Observações (se houver)

**Label:** "Notes"
**Valor:** Texto das observações do cliente

---

### 15.3 Atualizar Status do Pedido

**Ação:** Clicar no dropdown de status

**Opções:**
1. **Pending** - Pedido recebido, aguardando processamento
2. **Processing** - Pedido sendo preparado
3. **Shipped** - Pedido enviado para entrega
4. **Delivered** - Pedido entregue ao cliente
5. **Cancelled** - Pedido cancelado

**Ao selecionar:**
- Status é atualizado imediatamente
- Toast: "Order status updated!"
- Cliente pode ver novo status (futuro)

---

### 15.4 Pedidos Vazios

**Se não houver pedidos:**
- Card centralizado
- Texto: "No orders yet"

---

### 15.5 Ordenação

**Padrão:** Mais recentes primeiro
**Ordem:** Decrescente por data de criação

---

## 16. Gerenciamento de Cupons

**URL:** `/admin/coupons`

### 16.1 Visão Geral da Página

**Layout:**
- **Header:** Título + Botão "Add Coupon"
- **Grid:** Cards de cupons (3 colunas)

---

### 16.2 Visualização de Cupons

**Cada card mostra:**

#### Topo: Código e Toggle

**Esquerda:**
- **Código:** WELCOME10 (grande, verde)
- **Desconto:** "10% OFF" ou "50.00 AED OFF"

**Direita:**
- **Toggle Ativo/Inativo:**
  - Verde (🔄 direita) = Ativo
  - Cinza (🔄 esquerda) = Inativo

---

#### Meio: Detalhes

**Informações:**

1. **Compra Mínima** (se > 0)
   - "Min. Purchase: 100.00 AED"

2. **Usos**
   - "Uses: 5 / 100"
   - Ou "Uses: 5" (se ilimitado)

3. **Validade** (se definida)
   - "Valid Until: Dec 31, 2025"

4. **Status**
   - "Active" (verde) ou "Inactive" (vermelho)

---

#### Rodapé: Botões

**Botões:**
- **Edit** (lápis) - Editar cupom
- **Delete** (lixeira) - Deletar cupom

---

### 16.3 Adicionar Novo Cupom

**Botão:** "Add Coupon" (canto superior direito)

**Ao clicar:**
- Abre diálogo modal
- Formulário de criação

---

**Formulário - Campos:**

**1. Código do Cupom** *
- Input text
- Obrigatório
- Converte para maiúsculas automaticamente
- Exemplo: "WELCOME10", "SUMMER2024"
- **Não pode ser editado após criação**

**2. Tipo de Desconto** *
- Dropdown
- Obrigatório
- Opções:
  - **Percentage (%)** - desconto percentual
  - **Fixed Amount (AED)** - valor fixo

**3. Valor do Desconto** *
- Input number
- Obrigatório
- Se Percentage: 1-100 (ex: 10 = 10%)
- Se Fixed: valor em AED (ex: 50.00)

**4. Compra Mínima (AED)**
- Input number
- Opcional
- Padrão: 0 (sem mínimo)
- Exemplo: 100.00

**5. Máximo de Usos**
- Input number
- Opcional
- Padrão: 0 (ilimitado)
- Exemplo: 100

**6. Válido Até**
- Input date
- Opcional
- Formato: YYYY-MM-DD
- Exemplo: 2025-12-31

---

**Botões:**
- **"Save Coupon"** - Salva e fecha
- **"Cancel"** - Cancela

---

### 16.4 Editar Cupom

**Ação:** Clicar em "Edit" em qualquer cupom

**Comportamento:**
- Abre diálogo de edição
- Campos pré-preenchidos
- **Código não pode ser alterado**

**Modificações:**
- Altere valor, tipo, limites, validade
- Clique em "Save Coupon"

---

### 16.5 Ativar/Desativar Cupom

**Ação:** Clicar no toggle (🔄)

**Comportamento:**
- Alterna entre Ativo (1) e Inativo (0)
- Atualização imediata
- Toast: "Coupon updated!"

**Efeito:**
- **Ativo:** Cupom pode ser usado no checkout
- **Inativo:** Cupom não pode ser usado

---

### 16.6 Deletar Cupom

**Ação:** Clicar em botão de lixeira

**Comportamento:**
1. Confirmação: "Delete this coupon?"
2. Se confirmar:
   - Cupom é removido permanentemente
   - Hard delete (remove do banco)
3. Toast: "Coupon deleted!"

---

### 16.7 Cupons Vazios

**Se não houver cupons:**
- Card centralizado
- Texto: "No coupons yet"

---

## 17. Upload de Imagens

### 17.1 Como Funciona

**Fluxo completo:**

1. **Seleção:**
   - Usuário clica em "Choose File"
   - Seleciona imagem do computador

2. **Preview:**
   - Imagem aparece na tela
   - Tamanho ajustado (200px altura)

3. **Conversão:**
   - Imagem é lida como base64
   - JavaScript converte arquivo

4. **Upload:**
   - Ao salvar produto, imagem é enviada
   - Base64 é enviado para backend

5. **Processamento Backend:**
   - Decodifica base64 para buffer
   - Gera nome único: `{timestamp}-{filename}`
   - Chama função `storagePut()`

6. **Armazenamento S3:**
   - Upload para Manus Storage (S3)
   - Pasta: `products/`
   - Exemplo: `products/1730123456-botanical.jpg`

7. **URL Pública:**
   - S3 retorna URL pública
   - Exemplo: `https://storage.manus.com/...`

8. **Salvamento:**
   - URL é salva no campo `imageUrl` do produto
   - Produto é criado/atualizado no banco

---

### 17.2 Formatos Aceitos

**Imagens:**
- ✅ JPG / JPEG
- ✅ PNG
- ✅ WEBP
- ✅ GIF

**Tamanho:**
- Recomendado: até 5MB
- Máximo: depende do servidor (geralmente 10MB)

---

### 17.3 Alternativas ao Upload

**Opção 1: URL Externa**
- Cole URL de imagem já hospedada
- Exemplo: https://imgur.com/abc123.jpg
- Não faz upload, usa URL diretamente

**Serviços gratuitos:**
- Imgur: https://imgur.com
- Cloudinary: https://cloudinary.com
- ImgBB: https://imgbb.com

**Opção 2: Management UI**
- Acesse Database → products
- Edite campo `imageUrl` diretamente

---

### 17.4 Remover Imagem

**Ação:** Clicar no botão X no preview

**Comportamento:**
- Remove preview
- Limpa campo de arquivo
- Limpa campo de URL
- Produto pode ser salvo sem imagem

---

## 18. Navegação do Painel

### 18.1 Sidebar

**Localização:** Esquerda, fixa

**Largura:** 256px (desktop)

**Seções:**

#### Header da Sidebar
- **Título:** "Admin Panel"
- **Subtítulo:** "ILE ALA"

---

#### Menu de Navegação

**Links:**

1. **Back to Site** (🏠)
   - Volta para página inicial pública
   - URL: `/`

2. **Products** (📦)
   - Gerenciar produtos
   - URL: `/admin/products`
   - Ativo: fundo verde

3. **Orders** (🛒)
   - Gerenciar pedidos
   - URL: `/admin/orders`

4. **Coupons** (🎫)
   - Gerenciar cupons
   - URL: `/admin/coupons`

---

#### Rodapé da Sidebar

**Informações do Usuário:**
- Nome: Seu nome
- Email: Seu email

**Botão Logout:**
- Texto: "Logout"
- Ícone: 🚪
- Ação: Desloga e volta para home

---

### 18.2 Área Principal

**Localização:** Direita da sidebar

**Largura:** Restante da tela (flex-1)

**Conteúdo:**
- Página selecionada (Products, Orders, Coupons)
- Scroll independente

---

### 18.3 Responsividade

**Desktop (> 1024px):**
- Sidebar fixa à esquerda
- Conteúdo à direita

**Tablet/Mobile (< 1024px):**
- Sidebar oculta
- Menu hambúrguer
- Conteúdo full width

---

# PARTE C - CONFIGURAÇÕES E RECURSOS TÉCNICOS

## 19. Management UI

**Localização:** Painel direito (colapsável)

**Como abrir:**
- Ícone no canto superior direito
- Ou botões em cards de checkpoint

---

### 19.1 Painéis Disponíveis

#### Preview
**Função:** Visualizar site em desenvolvimento

**Recursos:**
- Iframe com site rodando
- Atualização em tempo real
- Login persistente
- Mesma sessão do navegador

---

#### Code
**Função:** Navegar arquivos do projeto

**Recursos:**
- Árvore de arquivos
- Visualizar código
- Botão "Download All Files"
- Estrutura completa do projeto

---

#### Dashboard
**Função:** Monitorar site publicado

**Recursos:**
- Status do site (online/offline)
- Visibilidade (public/private)
- Analytics:
  - UV (Unique Visitors)
  - PV (Page Views)
- Gráficos de tráfego

---

#### Database
**Função:** Gerenciar banco de dados

**Recursos:**
- Listar tabelas
- Ver dados (CRUD)
- Adicionar registros
- Editar registros
- Deletar registros
- **Conexão externa:**
  - Host, Port, User, Password
  - SSL habilitado
  - Acesso via MySQL Workbench, DBeaver, etc.

**Tabelas principais:**
- `users` - Usuários
- `products` - Produtos
- `cart_items` - Carrinho
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `coupons` - Cupons

---

#### Settings
**Função:** Configurações do site

**Sub-painéis:**

##### General
- **Website Name:** `VITE_APP_TITLE`
- **Website Logo:** `VITE_APP_LOGO`
- Visibilidade (public/private)

##### Domains
- Domínio atual: `xxxxx.manus.space`
- **Add Custom Domain:**
  - Digite domínio personalizado
  - Recebe instruções DNS
- Modificar prefixo do domínio Manus

##### Notifications
- Configurações de notificações
- Sistema de notificações built-in
- Requer feature `web-db-user`

##### Secrets
- **Visualizar secrets existentes**
- **Editar valores**
- **Deletar secrets**
- ⚠️ **Para ADICIONAR novos secrets:**
  - Use ferramenta `webdev_request_secrets`
  - Não adicione manualmente

**Secrets importantes:**
- `STRIPE_SECRET_KEY` - Chave secreta Stripe
- `VITE_STRIPE_PUBLISHABLE_KEY` - Chave pública Stripe
- `JWT_SECRET` - Segredo JWT
- Outros...

---

## 20. Banco de Dados

### 20.1 Acesso via Management UI

**Caminho:** Management UI → Database

**Funcionalidades:**
- Selecionar tabela
- Ver registros
- Adicionar novo (Add Row)
- Editar existente (clicar na linha)
- Deletar (botão delete)

---

### 20.2 Acesso Externo

**Informações de conexão:**
- Encontre em: Database → Settings (canto inferior esquerdo)

**Credenciais:**
- Host: `xxxxx.mysql.database.azure.com`
- Port: `3306`
- User: `xxxxx`
- Password: `xxxxx`
- Database: `xxxxx`
- **SSL:** Obrigatório

**Ferramentas compatíveis:**
- MySQL Workbench
- DBeaver
- phpMyAdmin
- TablePlus
- Sequel Pro

---

### 20.3 Schema do Banco

**Principais tabelas:**

#### users
- `id` - ID único
- `openId` - ID OAuth
- `name` - Nome
- `email` - Email
- `role` - Papel (user/admin)
- `createdAt` - Data de criação

#### products
- `id` - ID único
- `name` - Nome (legado)
- `nameEN` - Nome em inglês
- `namePT` - Nome em português
- `descriptionEN` - Descrição em inglês
- `descriptionPT` - Descrição em português
- `price` - Preço em centavos
- `imageUrl` - URL da imagem
- `collection` - Coleção
- `category` - Categoria
- `stock` - Estoque
- `featured` - Destaque (0/1)
- `active` - Ativo (0/1)
- `slug` - URL amigável
- `createdAt` - Data de criação

#### orders
- `id` - ID único
- `userId` - ID do usuário
- `customerName` - Nome do cliente
- `customerEmail` - Email
- `customerPhone` - Telefone
- `shippingAddress` - Endereço
- `notes` - Observações
- `totalAmount` - Total em centavos
- `status` - Status do pedido
- `paymentStatus` - Status de pagamento
- `couponCode` - Código do cupom usado
- `discountAmount` - Valor do desconto
- `createdAt` - Data de criação

#### coupons
- `id` - ID único
- `code` - Código do cupom
- `discountType` - Tipo (percentage/fixed)
- `discountValue` - Valor do desconto
- `minPurchaseAmount` - Compra mínima
- `maxUses` - Máximo de usos
- `usedCount` - Usos atuais
- `active` - Ativo (0/1)
- `validFrom` - Válido de
- `validUntil` - Válido até
- `createdAt` - Data de criação

---

### 20.4 Migrações

**Sistema:** Drizzle ORM

**Comandos:**
- `pnpm db:push` - Aplica mudanças no schema
- `pnpm db:generate` - Gera migrations
- `pnpm db:migrate` - Aplica migrations

**Arquivos:**
- Schema: `drizzle/schema.ts`
- Migrations: `drizzle/XXXX_name.sql`

---

## 21. Secrets (Variáveis de Ambiente)

### 21.1 O Que São

**Definição:**
- Variáveis de configuração sensíveis
- Armazenadas de forma segura
- Não aparecem no código
- Injetadas automaticamente

---

### 21.2 Secrets Configurados

**Backend (server):**
- `BUILT_IN_FORGE_API_KEY` - API S3
- `BUILT_IN_FORGE_API_URL` - URL S3
- `JWT_SECRET` - Segredo JWT
- `OAUTH_SERVER_URL` - OAuth
- `OWNER_NAME` - Seu nome
- `OWNER_OPEN_ID` - Seu ID
- `STRIPE_SECRET_KEY` - Stripe backend

**Frontend (client):**
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe frontend
- `VITE_APP_TITLE` - Título do site
- `VITE_APP_LOGO` - Logo do site
- `VITE_ANALYTICS_ENDPOINT` - Analytics
- `VITE_ANALYTICS_WEBSITE_ID` - ID analytics
- `VITE_OAUTH_PORTAL_URL` - Portal OAuth
- `VITE_FRONTEND_FORGE_API_KEY` - API frontend
- `VITE_FRONTEND_FORGE_API_URL` - URL API

---

### 21.3 Como Editar

**Via Management UI:**
1. Settings → Secrets
2. Encontre secret
3. Clique em editar (lápis)
4. Altere valor
5. Salve
6. Servidor reinicia automaticamente

---

### 21.4 Como Adicionar Novos
⚠️ **Não adicione manualmente!**

**Processo correto:**
- Solicite via ferramenta `webdev_request_secrets`
- Ou peça ao desenvolvedor

---

## 22. Domínios

### 22.1 Domínio Temporário

**Formato:** `xxxxx.manus.space`

**Características:**
- Gerado automaticamente na publicação
- Gratuito
- SSL incluído
- Sempre disponível

---

### 22.2 Domínio Personalizado

**Seu domínio:** `ileala.ae`

**Como configurar:**
1. Management UI → Settings → Domains
2. Add Custom Domain
3. Digite: `ileala.ae`
4. Copie instruções DNS
5. Configure no registrador
6. Aguarde propagação

**Veja:** GUIA_PUBLICACAO.md para detalhes

---

## 23. Publicação

### 23.1 Requisitos

**Antes de publicar:**
- ✅ Checkpoint criado
- ✅ Conteúdo revisado
- ✅ Testes realizados

---

### 23.2 Como Publicar

**Passo a passo:**
1. Crie checkpoint (se necessário)
2. Clique em "Publish" (Management UI)
3. Configure visibilidade
4. Confirme
5. Aguarde (30s-2min)
6. Receba URL pública

---

### 23.3 Após Publicação

**O que acontece:**
- Site fica online
- URL pública gerada
- SSL configurado automaticamente
- Pode configurar domínio personalizado

---

## 24. Checkpoints

### 24.1 O Que São

**Definição:**
- Snapshots do estado do projeto
- Inclui código, dependências, configurações
- Permite rollback
- Necessário para publicar

---

### 24.2 Checkpoints Criados

**Histórico:**

1. **9aaf6848** - Projeto inicial
2. **9c0af724** - SEO avançado completo
3. **dcc7a915** - Sistema de cupons WELCOME10
4. **890d3e79** - Painel administrativo completo (ATUAL)

---

### 24.3 Como Criar

**Via ferramenta:**
- Solicite criação de checkpoint
- Forneça descrição

**Quando criar:**
- Após implementar features
- Antes de mudanças arriscadas
- Antes de publicar

---

### 24.4 Como Fazer Rollback

**Se algo der errado:**
1. Identifique checkpoint desejado
2. Use ferramenta de rollback
3. Projeto volta ao estado anterior

---

## 🎓 Resumo Final

### Site Público - Funcionalidades

✅ **10 páginas principais** (Home, Shop, Product, Cart, Checkout, Confirmation, About, Collections, Contact, etc.)
✅ **Multilíngue** (EN/PT com troca instantânea)
✅ **Carrinho de compras** completo
✅ **Sistema de cupons** (WELCOME10 e customizáveis)
✅ **Checkout integrado** com Stripe
✅ **10 produtos** cadastrados
✅ **Newsletter** com popup de boas-vindas
✅ **SEO otimizado** (meta tags, schema, sitemap)
✅ **Responsivo** (desktop, tablet, mobile)

---

### Painel Admin - Funcionalidades

✅ **Gerenciar produtos** (criar, editar, deletar, upload de imagens)
✅ **Gerenciar pedidos** (visualizar, atualizar status)
✅ **Gerenciar cupons** (criar, editar, ativar/desativar)
✅ **Upload para S3** automático
✅ **Proteção de acesso** (apenas admins)
✅ **Interface intuitiva** com sidebar

---

### Configurações - Funcionalidades

✅ **Management UI** completo (Preview, Code, Database, Dashboard, Settings)
✅ **Banco de dados** acessível (UI e externo)
✅ **Secrets** configuráveis
✅ **Domínios** (temporário + personalizado)
✅ **Publicação** com 1 clique
✅ **Checkpoints** para backup e rollback

---

## 📞 Precisa de Mais Ajuda?

**Documentos disponíveis:**
- ✅ MANUAL_COMPLETO.md (este arquivo)
- ✅ GUIA_COMPLETO.md (funcionalidades resumidas)
- ✅ GUIA_PUBLICACAO.md (passo a passo publicação)

**Tudo está pronto para você gerenciar e lançar o site ILE ALA! 🎉**

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79  
**Total de funcionalidades:** 100+
