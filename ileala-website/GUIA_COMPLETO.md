# 🏪 Guia Completo - Site ILE ALA

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Funcionalidades Públicas](#funcionalidades-públicas)
3. [Painel Administrativo](#painel-administrativo)
4. [Gerenciamento de Produtos](#gerenciamento-de-produtos)
5. [Gerenciamento de Pedidos](#gerenciamento-de-pedidos)
6. [Gerenciamento de Cupons](#gerenciamento-de-cupons)
7. [Sistema de Pagamentos](#sistema-de-pagamentos)
8. [SEO e Marketing](#seo-e-marketing)
9. [Configurações Técnicas](#configurações-técnicas)

---

## 🌟 Visão Geral

**Site:** ILE ALA - Luxury Home & Table  
**URL de Desenvolvimento:** https://3000-iweji8tawfxixrytbhsd2-dde986d3.manusvm.computer  
**Tecnologias:** React 19, TypeScript, Tailwind CSS, tRPC, MySQL, Stripe, S3

### Recursos Principais
✅ E-commerce completo bilíngue (Inglês/Português)  
✅ Sistema de carrinho e checkout  
✅ Pagamentos via Stripe  
✅ Painel administrativo completo  
✅ Upload de imagens para S3  
✅ Sistema de cupons de desconto  
✅ SEO otimizado com Schema Markup  
✅ Responsivo e acessível  

---

## 🌐 Funcionalidades Públicas

### 1. **Página Inicial** (`/`)
- Hero section com imagem de destaque
- Seção "Essence" com descrição da marca
- Cards "About Us" com 3 seções (About me, Our Collections, Our Values)
- Vídeos de demonstração (6 vídeos em grid)
- Newsletter signup
- Footer com links úteis e redes sociais

### 2. **Loja** (`/shop`)
- Grid de produtos com imagens
- Filtros por coleção
- Preços em AED
- Botão "Add to Cart" em cada produto
- Links para detalhes do produto

### 3. **Detalhes do Produto** (`/shop/:slug` ou `/product/:id`)
- URLs amigáveis com slug (ex: `/shop/botanical-placemat-green-1`)
- Imagem grande do produto
- Descrição completa bilíngue
- Preço e disponibilidade de estoque
- Seletor de quantidade
- Botão "Add to Cart"
- Schema Markup de Product para SEO
- Breadcrumb navigation

### 4. **Carrinho** (`/cart`)
- Lista de produtos adicionados
- Controle de quantidade (+/-)
- Remover itens
- Cálculo de subtotal
- Botão "Proceed to Checkout"

### 5. **Checkout** (`/checkout`)
- Formulário de informações do cliente:
  - Nome completo
  - Email
  - Telefone
  - Endereço de entrega completo
  - Observações (opcional)
- **Campo de cupom de desconto:**
  - Input para código do cupom
  - Botão "Apply"
  - Validação em tempo real
  - Exibição do desconto aplicado
  - Opção de remover cupom
- Resumo do pedido:
  - Subtotal
  - VAT (5%)
  - Desconto (se aplicável, em verde)
  - Total final
- Botão "Proceed to Payment" (Stripe)

### 6. **Confirmação de Pedido** (`/order-confirmation/:id`)
- Detalhes do pedido realizado
- Status de pagamento
- Informações de entrega
- Número do pedido para rastreamento

### 7. **Outras Páginas**
- `/about` - Sobre a ILE ALA
- `/collections` - Coleções de produtos
- `/contact` - Formulário de contato
- `/faq` - Perguntas frequentes
- `/shipping` - Política de envio
- `/returns` - Política de devoluções
- `/product-care` - Cuidados com produtos
- `/privacy` - Política de privacidade
- `/terms` - Termos de uso
- `/accessibility` - Acessibilidade
- `/ai-policy` - Política de IA

### 8. **Recursos Multilíngues**
- Botão de troca de idioma (EN/PT) no header
- Todo conteúdo traduzido automaticamente
- Persistência da escolha de idioma

### 9. **Newsletter & Marketing**
- Popup de boas-vindas com oferta de 10% OFF (cupom WELCOME10)
- Formulário de newsletter no footer
- Integração com sistema de cupons

---

## 🔐 Painel Administrativo

### Acesso
**URL:** `/admin/products`, `/admin/orders`, `/admin/coupons`  
**Requisito:** Usuário com `role = 'admin'`  
**Seu acesso:** Já configurado como administrador

### Layout do Painel
- **Sidebar esquerda** com navegação:
  - Back to Site (voltar ao site público)
  - Products (gerenciar produtos)
  - Orders (gerenciar pedidos)
  - Coupons (gerenciar cupons)
  - Logout (sair)
- **Área principal** com conteúdo da página selecionada
- **Informações do usuário** no rodapé da sidebar

---

## 📦 Gerenciamento de Produtos

### URL: `/admin/products`

### Visualização
- Grid de cards com todos os produtos
- Cada card mostra:
  - Imagem do produto
  - Nome (no idioma selecionado)
  - Coleção
  - Preço em AED
  - Estoque disponível
  - Botões "Edit" e "Delete"

### Adicionar Novo Produto
**Botão:** "Add Product" (canto superior direito)

**Campos do formulário:**
1. **Imagem do Produto:**
   - Upload de arquivo (aceita imagens)
   - Preview em tempo real
   - OU cole URL da imagem
   - Botão para remover imagem
   - **Upload automático para S3**

2. **Nome (Inglês)** * obrigatório
3. **Nome (Português)** * obrigatório
4. **Descrição (Inglês)** - textarea
5. **Descrição (Português)** - textarea
6. **Preço (AED)** * obrigatório - aceita decimais
7. **Estoque** * obrigatório - número inteiro
8. **Coleção** - texto livre (ex: "Botanica", "La Mer")
9. **Categoria** - texto livre
10. **Produto em Destaque** - checkbox

**Ações:**
- "Save Product" - salva e fecha o diálogo
- "Cancel" - cancela e fecha

### Editar Produto
1. Clique no botão "Edit" em qualquer produto
2. Formulário pré-preenchido com dados atuais
3. Modifique os campos desejados
4. Clique em "Save Product"

### Deletar Produto
1. Clique no botão de lixeira (🗑️) em qualquer produto
2. Confirme a exclusão
3. Produto é marcado como inativo (soft delete)

### Upload de Imagens
**Como funciona:**
1. Selecione uma imagem do seu computador
2. Preview aparece automaticamente
3. Ao salvar o produto, a imagem é:
   - Convertida para base64
   - Enviada para S3
   - URL pública é gerada automaticamente
   - URL é salva no campo `imageUrl` do produto

**Formatos aceitos:** JPG, PNG, WEBP, GIF  
**Armazenamento:** S3 (Manus Storage)

---

## 📋 Gerenciamento de Pedidos

### URL: `/admin/orders`

### Visualização
Lista de todos os pedidos em cards expandidos com:

**Informações Principais:**
- ID do pedido (#123)
- Data e hora do pedido
- Total do pedido em AED
- Desconto aplicado (se houver)
- Código do cupom usado (se houver)
- **Status do pedido** (dropdown editável)

**Informações do Cliente:**
- Nome completo
- Email
- Telefone
- Endereço de entrega completo

**Status de Pagamento:**
- Badge colorido: Paid (verde), Pending (amarelo), Failed (vermelho)

**Observações:**
- Notas adicionais do cliente (se houver)

### Atualizar Status do Pedido
**Opções de status:**
1. **Pending** (Pendente) - pedido recebido, aguardando processamento
2. **Processing** (Processando) - pedido sendo preparado
3. **Shipped** (Enviado) - pedido despachado para entrega
4. **Delivered** (Entregue) - pedido recebido pelo cliente
5. **Cancelled** (Cancelado) - pedido cancelado

**Como atualizar:**
1. Clique no dropdown de status
2. Selecione o novo status
3. Atualização é salva automaticamente
4. Cliente pode ver o status atualizado

### Filtros e Busca
- Ordenação por data (mais recentes primeiro)
- Visualização de todos os pedidos

---

## 🎫 Gerenciamento de Cupons

### URL: `/admin/coupons`

### Visualização
Grid de cards com todos os cupons:

**Informações exibidas:**
- Código do cupom (ex: WELCOME10)
- Tipo e valor do desconto
- Compra mínima (se aplicável)
- Usos atuais / máximo de usos
- Data de validade
- Status (Ativo/Inativo) com toggle

### Adicionar Novo Cupom
**Botão:** "Add Coupon" (canto superior direito)

**Campos do formulário:**
1. **Código do Cupom** * obrigatório
   - Texto em maiúsculas
   - Exemplo: WELCOME10, SUMMER2024, VIP50
   - Não pode ser editado após criação

2. **Tipo de Desconto** * obrigatório
   - **Percentage (%)** - desconto percentual
   - **Fixed Amount (AED)** - valor fixo em dinheiro

3. **Valor do Desconto** * obrigatório
   - Se Percentage: número de 1 a 100 (ex: 10 = 10%)
   - Se Fixed: valor em AED (ex: 50.00)

4. **Compra Mínima (AED)**
   - Valor mínimo do carrinho para usar o cupom
   - 0 = sem mínimo

5. **Máximo de Usos**
   - Número de vezes que o cupom pode ser usado
   - 0 = ilimitado

6. **Válido Até**
   - Data de expiração (opcional)
   - Formato: YYYY-MM-DD

**Ações:**
- "Save Coupon" - salva e fecha
- "Cancel" - cancela

### Editar Cupom
1. Clique em "Edit" no card do cupom
2. Modifique os campos (exceto código)
3. Salve as alterações

### Ativar/Desativar Cupom
- Clique no toggle (🔄) no canto superior direito do card
- Verde = Ativo (pode ser usado)
- Cinza = Inativo (não pode ser usado)

### Deletar Cupom
1. Clique no botão de lixeira
2. Confirme a exclusão
3. Cupom é removido permanentemente

### Cupons Pré-configurados
**WELCOME10:**
- Tipo: Percentage
- Valor: 10%
- Compra mínima: 0 AED
- Usos: Ilimitado
- Validade: 1 ano
- Status: Ativo

---

## 💳 Sistema de Pagamentos

### Stripe Integration
**Configuração:**
- Chave pública: `VITE_STRIPE_PUBLISHABLE_KEY`
- Chave secreta: `STRIPE_SECRET_KEY`
- API Version: 2024-12-18.acacia

### Fluxo de Pagamento
1. Cliente preenche checkout
2. Aplica cupom (opcional)
3. Clica em "Proceed to Payment"
4. Sistema cria sessão Stripe com:
   - Line items (produtos do pedido)
   - Valor total (com desconto aplicado)
   - Metadata (ID do pedido, cupom usado)
5. Cliente é redirecionado para Stripe Checkout
6. Após pagamento:
   - **Sucesso:** `/order-confirmation/:id?session_id={CHECKOUT_SESSION_ID}`
   - **Cancelado:** `/checkout`
7. Sistema verifica pagamento e atualiza status

### Moedas e Taxas
- **Moeda:** AED (Dirham dos Emirados Árabes)
- **VAT:** 5% (adicionado automaticamente)
- **Preços:** Armazenados em centavos (ex: 15000 = 150.00 AED)

---

## 🔍 SEO e Marketing

### Meta Tags Otimizadas
Todas as páginas incluem:
- Title tag personalizado
- Meta description
- Open Graph tags (Facebook)
- Twitter Card tags
- Canonical URL

### Schema Markup (JSON-LD)
**Página Inicial:**
- Organization schema
- Website schema

**Páginas de Produto:**
- Product schema com:
  - Nome, descrição, imagem
  - Preço e moeda
  - Disponibilidade
  - SKU e brand

### Sitemap XML
**URL:** `/sitemap.xml`

**Inclui:**
- Todas as páginas estáticas
- Todos os produtos com URLs amigáveis
- Prioridades e frequências de atualização

### Robots.txt
**URL:** `/robots.txt`

**Configuração:**
- Permite todos os crawlers
- Referência ao sitemap
- Sem bloqueios

### URLs Amigáveis
**Produtos:**
- Antigo: `/product/123`
- Novo: `/shop/botanical-placemat-green-1`
- Gerado automaticamente do nome do produto
- Único (timestamp adicionado)

### Alt Text em Imagens
Todas as imagens incluem texto alternativo descritivo para:
- Acessibilidade
- SEO
- Fallback quando imagem não carrega

---

## ⚙️ Configurações Técnicas

### Variáveis de Ambiente
**Já configuradas automaticamente:**
```
BUILT_IN_FORGE_API_KEY - API key para S3
BUILT_IN_FORGE_API_URL - URL do serviço S3
JWT_SECRET - Segredo para tokens
OAUTH_SERVER_URL - URL do servidor OAuth
OWNER_NAME - Seu nome
OWNER_OPEN_ID - Seu ID de usuário
STRIPE_SECRET_KEY - Chave secreta Stripe
VITE_STRIPE_PUBLISHABLE_KEY - Chave pública Stripe
VITE_APP_TITLE - Título do app
VITE_APP_LOGO - Logo do app
```

### Banco de Dados
**Tabelas principais:**
- `users` - Usuários e administradores
- `products` - Catálogo de produtos
- `cart_items` - Itens no carrinho
- `orders` - Pedidos realizados
- `order_items` - Itens de cada pedido
- `coupons` - Cupons de desconto

### Acesso ao Banco
**Via Management UI:**
1. Abra Management UI (painel direito)
2. Clique em "Database"
3. Selecione a tabela
4. Visualize, edite ou adicione dados

**Via SQL direto:**
- Use a ferramenta de execução SQL
- Cuidado: mudanças são permanentes

### Storage (S3)
**Configuração:**
- Provider: Manus Storage (S3-compatible)
- Pasta de produtos: `products/`
- Nomenclatura: `{timestamp}-{filename}`
- URLs públicas geradas automaticamente

**Serviços alternativos para imagens:**
- Imgur (https://imgur.com) - gratuito
- Cloudinary (https://cloudinary.com) - plano free
- ImgBB (https://imgbb.com) - simples

### Autenticação
**Sistema:** Manus OAuth  
**Roles:**
- `user` - Cliente padrão
- `admin` - Acesso ao painel administrativo

**Seu usuário:**
- Role: `admin`
- Acesso completo ao painel

---

## 📊 Estatísticas e Analytics

### Métricas Disponíveis
- Total de produtos cadastrados
- Total de pedidos
- Total de cupons ativos
- Vendas por status
- Cupons mais usados

### Analytics Configurado
- Website ID: `VITE_ANALYTICS_WEBSITE_ID`
- Endpoint: `VITE_ANALYTICS_ENDPOINT`
- Rastreamento de pageviews
- Eventos personalizados

---

## 🚀 Próximos Passos Recomendados

### 1. **Substituir Imagens Placeholder**
- Acesse `/admin/products`
- Edite cada produto
- Faça upload de fotos reais dos produtos ILE ALA

### 2. **Configurar Stripe em Produção**
- Obtenha chaves de produção em https://dashboard.stripe.com
- Atualize em Settings → Secrets

### 3. **Testar Fluxo Completo**
- Adicione produtos ao carrinho
- Aplique cupom WELCOME10
- Complete checkout
- Verifique pagamento

### 4. **Publicar o Site**
- Clique em "Publish" na interface
- Configure domínio ileala.ae
- Aponte DNS para Manus

### 5. **Criar Mais Cupons**
- Cupons sazonais (SUMMER2024, WINTER2024)
- Cupons VIP para clientes especiais
- Cupons de primeira compra

### 6. **Adicionar Mais Produtos**
- Use o painel admin
- Organize por coleções
- Marque produtos em destaque

---

## 📞 Suporte e Ajuda

### Documentação
- Este guia completo
- README.md do projeto
- Comentários no código

### Recursos Úteis
- Stripe Dashboard: https://dashboard.stripe.com
- Manus Help: https://help.manus.im

### Contato
Para questões sobre a plataforma Manus, visite https://help.manus.im

---

**Última atualização:** Novembro 2025  
**Versão do site:** 890d3e79
