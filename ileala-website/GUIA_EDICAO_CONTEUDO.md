# Guia Completo de Edição de Conteúdo - Site ILE ALA

**Versão**: 1.0  
**Data**: 02 de Novembro de 2025  
**Autor**: Manus AI  
**Site**: https://ileala.ae

---

## 📚 Índice

1. [Introdução](#introdução)
2. [Estrutura do Site](#estrutura-do-site)
3. [Como Editar Textos](#como-editar-textos)
4. [Como Adicionar/Trocar Imagens](#como-adicionartrocar-imagens)
5. [Como Adicionar Vídeos](#como-adicionar-vídeos)
6. [Como Gerenciar Produtos](#como-gerenciar-produtos)
7. [Como Editar Páginas Específicas](#como-editar-páginas-específicas)
8. [Como Publicar Alterações](#como-publicar-alterações)
9. [Exemplos Práticos](#exemplos-práticos)
10. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

---

## 📖 Introdução

Este guia ensina como editar o conteúdo do site ILE ALA de forma simples e prática. Você aprenderá a alterar textos, trocar imagens, adicionar vídeos e gerenciar produtos sem precisar ser programador.

### O Que Você Pode Editar

O site ILE ALA permite editar diversos tipos de conteúdo através de duas formas principais:

**1. Painel Administrativo** (Mais fácil - Recomendado):
- Produtos (adicionar, editar, remover)
- Pedidos (visualizar, gerenciar)
- Cupons de desconto (criar, editar)

**2. Arquivos de Código** (Mais controle):
- Textos das páginas
- Imagens e vídeos
- Layout e design
- Funcionalidades

### Ferramentas Necessárias

Para editar o site, você precisará de acesso ao **Painel de Gerenciamento do Manus**, onde poderá:
- Editar arquivos de código
- Visualizar mudanças em tempo real
- Publicar atualizações
- Acessar o painel administrativo

---

## 🏗️ Estrutura do Site

Entender a estrutura do site ajuda a localizar rapidamente o que você quer editar.

### Organização de Pastas

```
ileala-website/
├── client/                    # Frontend (parte visual do site)
│   ├── public/               # Arquivos públicos (imagens, vídeos)
│   │   ├── images/          # Todas as imagens do site
│   │   ├── videos/          # Vídeos (se houver)
│   │   └── fonts/           # Fontes personalizadas
│   │
│   └── src/                 # Código-fonte do site
│       ├── pages/           # Páginas do site
│       │   ├── Home.tsx    # Página inicial
│       │   ├── Shop.tsx    # Página da loja
│       │   ├── About.tsx   # Página "Sobre"
│       │   └── ...         # Outras páginas
│       │
│       ├── components/      # Componentes reutilizáveis
│       │   ├── Header.tsx  # Cabeçalho do site
│       │   ├── Footer.tsx  # Rodapé do site
│       │   └── ...
│       │
│       └── locales/         # Traduções (Inglês/Português)
│           ├── en.ts       # Textos em inglês
│           └── pt.ts       # Textos em português
│
├── server/                   # Backend (lógica do servidor)
└── shared/                   # Código compartilhado
```

### Páginas Principais do Site

| Página | Arquivo | URL | Descrição |
|--------|---------|-----|-----------|
| Página Inicial | `Home.tsx` | `/` | Primeira página que visitantes veem |
| Loja | `Shop.tsx` | `/shop` | Catálogo de produtos |
| Produto | `ProductDetail.tsx` | `/shop/[slug]` | Detalhes de cada produto |
| Sobre | `About.tsx` | `/about` | História da marca |
| Coleções | `Collections.tsx` | `/collections` | Todas as coleções |
| Contato | `Contact.tsx` | `/contact` | Formulário de contato |
| Carrinho | `Cart.tsx` | `/cart` | Carrinho de compras |
| Checkout | `Checkout.tsx` | `/checkout` | Finalização de compra |
| Admin | `Admin.tsx` | `/admin` | Painel administrativo |

---

## ✏️ Como Editar Textos

Existem duas formas de editar textos no site: através dos arquivos de tradução (recomendado) ou diretamente nas páginas.

### Método 1: Arquivos de Tradução (Recomendado)

Os textos do site estão organizados em arquivos de tradução que facilitam a manutenção e suportam múltiplos idiomas.

**Localização**: `/client/src/locales/`

**Arquivos**:
- `en.ts` - Textos em inglês
- `pt.ts` - Textos em português

#### Exemplo Prático: Alterar Slogan da Página Inicial

**1. Abra o arquivo de tradução**:

No painel de gerenciamento do Manus:
1. Vá em **Code** (Código)
2. Navegue até `client/src/locales/en.ts`
3. Clique para editar

**2. Localize o texto que deseja alterar**:

```typescript
export const en = {
  home: {
    tagline: 'Everything you need to create your unique style and elevate everyday life',
    essence: 'Essence',
    essenceText: 'ILE ALA was born from the idea that our home should reflect...',
    // ... mais textos
  }
}
```

**3. Altere o texto**:

```typescript
export const en = {
  home: {
    tagline: 'SEU NOVO SLOGAN AQUI',  // ← Altere aqui
    essence: 'Essence',
    essenceText: 'ILE ALA was born from the idea that our home should reflect...',
  }
}
```

**4. Salve o arquivo** (Ctrl+S ou Cmd+S)

**5. Repita para o português** (arquivo `pt.ts`):

```typescript
export const pt = {
  home: {
    tagline: 'SEU NOVO SLOGAN EM PORTUGUÊS',  // ← Altere aqui
    essence: 'Essência',
    essenceText: 'ILE ALA nasceu da ideia de que nossa casa deve refletir...',
  }
}
```

**6. Visualize as mudanças**:
- Clique em **Preview** no painel de gerenciamento
- A página será atualizada automaticamente

### Método 2: Editar Diretamente na Página

Para textos que não estão nos arquivos de tradução, você pode editá-los diretamente no arquivo da página.

#### Exemplo: Alterar Texto da Seção "Essence"

**1. Abra o arquivo da página**:
- Navegue até `client/src/pages/Home.tsx`

**2. Localize o texto**:

```tsx
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  More than just a physical space, it is a sanctuary — a place where every detail expresses our essence and tells our story.
</p>
```

**3. Altere o texto**:

```tsx
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  SEU NOVO TEXTO AQUI
</p>
```

**4. Salve e visualize**

### Tabela de Textos Principais

| Localização | Arquivo | Como Editar |
|-------------|---------|-------------|
| Slogan principal | `locales/en.ts` → `home.tagline` | Arquivo de tradução |
| Textos da página inicial | `locales/en.ts` → `home.*` | Arquivo de tradução |
| Textos da loja | `locales/en.ts` → `shop.*` | Arquivo de tradução |
| Textos do rodapé | `components/Footer.tsx` | Diretamente no componente |
| Textos do menu | `components/Header.tsx` | Diretamente no componente |

---

## 🖼️ Como Adicionar/Trocar Imagens

As imagens do site ficam na pasta `client/public/images/`. Você pode adicionar novas imagens ou substituir as existentes.

### Passo a Passo: Adicionar Nova Imagem

**1. Prepare a imagem**:
- Formato recomendado: `.webp` (menor tamanho, melhor performance)
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`
- Tamanho recomendado: Máximo 2MB por imagem
- Resolução recomendada: 
  - Hero/Banner: 1920x1080px
  - Produtos: 1200x1200px
  - Cards: 800x800px

**2. Nomeie a imagem**:
- Use nomes descritivos em inglês
- Use underscores `_` em vez de espaços
- Exemplo: `hero_home_table_setting.webp`

**3. Faça upload da imagem**:

No painel de gerenciamento do Manus:
1. Vá em **Code** (Código)
2. Navegue até `client/public/images/`
3. Clique com botão direito → **Upload File**
4. Selecione sua imagem
5. Aguarde o upload completar

**4. Use a imagem no código**:

```tsx
<img 
  src="/images/sua_imagem.webp"  // ← Caminho da sua imagem
  alt="Descrição da imagem"      // ← Descrição para SEO
  className="w-full h-full object-cover"
/>
```

### Exemplo Prático: Trocar Imagem do Hero (Banner Principal)

**Imagem atual**: `/images/hero_home_table_setting.webp`

**1. Faça upload da nova imagem**:
- Nomeie como: `hero_home_novo.webp`
- Faça upload para `client/public/images/`

**2. Edite o arquivo `Home.tsx`**:

```tsx
// ANTES
<img 
  src="/images/hero_home_table_setting.webp" 
  alt="ILE ALA Luxury Table Setting"
  className="absolute inset-0 w-full h-full object-cover"
/>

// DEPOIS
<img 
  src="/images/hero_home_novo.webp"  // ← Nova imagem
  alt="ILE ALA Luxury Table Setting"
  className="absolute inset-0 w-full h-full object-cover"
/>
```

**3. Salve e visualize no Preview**

### Tabela de Imagens Principais

| Imagem | Localização | Tamanho Recomendado | Onde Aparece |
|--------|-------------|---------------------|--------------|
| Hero principal | `/images/hero_home_table_setting.webp` | 1920x1080px | Página inicial (banner) |
| About me card | `/images/about_me_card.webp` | 800x800px | Página inicial (card) |
| Collections card | `/images/our_collections_card.webp` | 800x800px | Página inicial (card) |
| Values card | `/images/our_values_card.webp` | 800x800px | Página inicial (card) |
| Logo | Variável (veja abaixo) | 200x200px | Header e footer |

### Como Trocar o Logo

O logo do site é configurado através de variável de ambiente:

**1. Acesse o painel de gerenciamento**

**2. Vá em Settings → General**

**3. Procure por "App Logo" ou `VITE_APP_LOGO`**

**4. Faça upload do novo logo ou insira URL**

**5. Salve as configurações**

---

## 🎥 Como Adicionar Vídeos

O site ILE ALA tem uma seção de vídeos na página inicial chamada "Our Craft in Motion" (Nosso Artesanato em Movimento).

### Método 1: Vídeos do YouTube (Recomendado)

É mais fácil e performático usar vídeos do YouTube.

**1. Faça upload do vídeo no YouTube**:
- Acesse https://youtube.com
- Clique em "Criar" → "Enviar vídeo"
- Faça upload do seu vídeo
- Copie o ID do vídeo (parte após `v=` na URL)
  - Exemplo: `https://youtube.com/watch?v=ABC123` → ID é `ABC123`

**2. Edite o arquivo `Home.tsx`**:

Localize a seção de vídeos (procure por "Our Craft in Motion"):

```tsx
const videos = [
  {
    id: 'handcrafting',
    title: 'Handcrafting Process',
    thumbnail: '/images/video_handcrafting.webp',
    youtubeId: 'ABC123'  // ← Coloque o ID do YouTube aqui
  },
  // ... mais vídeos
];
```

**3. Adicione um novo vídeo**:

```tsx
const videos = [
  {
    id: 'handcrafting',
    title: 'Handcrafting Process',
    thumbnail: '/images/video_handcrafting.webp',
    youtubeId: 'ABC123'
  },
  {
    id: 'novo_video',  // ← ID único
    title: 'Título do Novo Vídeo',  // ← Título
    thumbnail: '/images/video_novo.webp',  // ← Thumbnail
    youtubeId: 'XYZ789'  // ← ID do YouTube
  }
];
```

**4. Crie uma thumbnail (imagem de capa)**:
- Tamanho: 1280x720px (16:9)
- Formato: `.webp` ou `.jpg`
- Faça upload para `/client/public/images/`

### Método 2: Vídeos Hospedados no Site

Se preferir hospedar o vídeo diretamente no site:

**1. Prepare o vídeo**:
- Formato: `.mp4` (mais compatível)
- Tamanho máximo: 50MB (para boa performance)
- Resolução: 1920x1080px ou 1280x720px
- Comprima o vídeo se necessário (use https://handbrake.fr/)

**2. Faça upload**:
- Navegue até `client/public/videos/`
- Faça upload do arquivo `.mp4`

**3. Use no código**:

```tsx
<video 
  src="/videos/seu_video.mp4"
  controls
  className="w-full h-full object-cover"
>
  Seu navegador não suporta vídeos.
</video>
```

### Exemplo Completo: Adicionar Vídeo na Página Inicial

**Arquivo**: `client/src/pages/Home.tsx`

Localize a seção "Our Craft in Motion" e adicione:

```tsx
const videos = [
  {
    id: 'handcrafting',
    title: language === 'en' ? 'Handcrafting Process' : 'Processo Artesanal',
    thumbnail: '/images/video_handcrafting.webp',
    youtubeId: 'dQw4w9WgXcQ'  // Exemplo
  },
  {
    id: 'textile_techniques',
    title: language === 'en' ? 'Textile Techniques' : 'Técnicas Têxteis',
    thumbnail: '/images/video_textile.webp',
    youtubeId: 'dQw4w9WgXcQ'  // Exemplo
  },
  // ADICIONE SEU NOVO VÍDEO AQUI:
  {
    id: 'behind_the_scenes',
    title: language === 'en' ? 'Behind the Scenes' : 'Bastidores',
    thumbnail: '/images/video_bastidores.webp',
    youtubeId: 'SEU_ID_YOUTUBE'
  }
];
```

---

## 🛍️ Como Gerenciar Produtos

A forma mais fácil de gerenciar produtos é através do **Painel Administrativo**.

### Acessar o Painel Administrativo

**1. Acesse**: https://ileala.ae/admin

**2. Faça login** (se necessário)

**3. Você verá três opções**:
- **Products** (Produtos)
- **Orders** (Pedidos)
- **Coupons** (Cupons)

### Adicionar Novo Produto

**1. Clique em "Products"**

**2. Clique no botão "Add New Product"**

**3. Preencha os campos**:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Name (EN)** | Nome em inglês | `Botanical Placemat` |
| **Name (PT)** | Nome em português | `Jogo Americano Botânico` |
| **Description (EN)** | Descrição em inglês | `Elegant placemat from our Botanical collection...` |
| **Description (PT)** | Descrição em português | `Jogo americano elegante da coleção Botânica...` |
| **Price** | Preço em AED (fils) | `15000` (= 150.00 AED) |
| **Stock** | Quantidade em estoque | `50` |
| **Category** | Categoria | `Placemats` |
| **Collection** | Coleção | `Botanica` |
| **Image URL** | URL da imagem | `/images/products/botanical_placemat.webp` |
| **Slug** | URL amigável | `botanical-placemat-1` |

**Importante sobre o preço**: O valor é em **fils** (centavos de AED).
- 1 AED = 100 fils
- Para 150.00 AED, insira: `15000`
- Para 25.50 AED, insira: `2550`

**4. Clique em "Create Product"**

**5. O produto aparecerá na loja automaticamente!**

### Editar Produto Existente

**1. No painel Products, localize o produto**

**2. Clique no ícone de editar (lápis)**

**3. Altere os campos desejados**

**4. Clique em "Update Product"**

### Deletar Produto

**1. No painel Products, localize o produto**

**2. Clique no ícone de deletar (lixeira)**

**3. Confirme a exclusão**

### Adicionar Imagem de Produto

**1. Prepare a imagem**:
- Tamanho: 1200x1200px (quadrada)
- Formato: `.webp` ou `.jpg`
- Fundo: Branco ou transparente
- Qualidade: Alta resolução

**2. Faça upload**:
- Navegue até `client/public/images/products/`
- Faça upload da imagem
- Nomeie como: `nome_produto.webp`

**3. Ao criar/editar produto, use o caminho**:
```
/images/products/nome_produto.webp
```

### Gerenciar Estoque

**Opção 1: Pelo Painel Admin**
1. Edite o produto
2. Altere o campo "Stock"
3. Salve

**Opção 2: Pelo Banco de Dados**
1. Vá em **Database** no painel de gerenciamento
2. Localize a tabela `products`
3. Encontre o produto
4. Edite o campo `stock`
5. Salve

---

## 📄 Como Editar Páginas Específicas

Cada página do site tem seu próprio arquivo. Aqui estão as mais importantes:

### Página Inicial (Home)

**Arquivo**: `client/src/pages/Home.tsx`

**Seções que você pode editar**:

#### 1. Hero (Banner Principal)
```tsx
<h1 className="text-5xl md:text-7xl font-bold mb-6">ILE ALA</h1>
<p className="text-xl md:text-2xl font-light">
  {t.home.tagline}  // ← Edite em locales/en.ts
</p>
```

#### 2. Seção Essence
```tsx
<h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
  {t.home.essence}
</h2>
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
  {t.home.essenceText}  // ← Edite em locales/en.ts
</p>
```

#### 3. Cards "About Us"
```tsx
<Link href="/about">
  <Card className="overflow-hidden group cursor-pointer">
    <img 
      src="/images/about_me_card.webp"  // ← Troque a imagem
      alt="About me"
    />
    <h3 className="text-2xl font-semibold mb-4">About me</h3>
  </Card>
</Link>
```

#### 4. Vídeos "Our Craft in Motion"
```tsx
const videos = [
  {
    id: 'handcrafting',
    title: 'Handcrafting Process',  // ← Edite o título
    thumbnail: '/images/video_handcrafting.webp',  // ← Troque thumbnail
    youtubeId: 'ABC123'  // ← ID do YouTube
  }
];
```

### Página Sobre (About)

**Arquivo**: `client/src/pages/About.tsx`

**Como editar**:

```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-6">
  About ILE ALA  // ← Edite o título
</h1>

<p className="text-lg text-muted-foreground leading-relaxed">
  ILE ALA was born from...  // ← Edite o texto
</p>
```

### Página de Coleções (Collections)

**Arquivo**: `client/src/pages/Collections.tsx`

**Como adicionar nova coleção**:

```tsx
const collections = [
  {
    id: 1,
    name: 'Botanica',
    nameEN: 'Botanica',
    namePT: 'Botânica',
    description: 'Nature-inspired designs...',
    descriptionEN: 'Nature-inspired designs...',
    descriptionPT: 'Designs inspirados na natureza...',
    image: '/images/collections/botanica.webp',
    slug: 'botanica'
  },
  // ADICIONE NOVA COLEÇÃO AQUI:
  {
    id: 2,
    name: 'Nova Coleção',
    nameEN: 'New Collection',
    namePT: 'Nova Coleção',
    description: 'Descrição...',
    descriptionEN: 'Description...',
    descriptionPT: 'Descrição...',
    image: '/images/collections/nova_colecao.webp',
    slug: 'nova-colecao'
  }
];
```

### Página de Contato (Contact)

**Arquivo**: `client/src/pages/Contact.tsx`

**Como editar informações de contato**:

```tsx
<p className="text-muted-foreground">
  Email: contact@ileala.ae  // ← Edite o email
</p>

<p className="text-muted-foreground">
  Phone: +971 XX XXX XXXX  // ← Edite o telefone
</p>

<p className="text-muted-foreground">
  Address: Dubai, UAE  // ← Edite o endereço
</p>
```

### Header (Cabeçalho)

**Arquivo**: `client/src/components/Header.tsx`

**Como editar menu de navegação**:

```tsx
<nav className="hidden md:flex items-center gap-8">
  <Link href="/" className="hover:text-primary">Home</Link>
  <Link href="/about" className="hover:text-primary">About</Link>
  <Link href="/collections" className="hover:text-primary">Collections</Link>
  <Link href="/contact" className="hover:text-primary">Contact</Link>
  <Link href="/shop" className="hover:text-primary">Shop</Link>
  // ADICIONE NOVO LINK AQUI:
  <Link href="/nova-pagina" className="hover:text-primary">Nova Página</Link>
</nav>
```

### Footer (Rodapé)

**Arquivo**: `client/src/components/Footer.tsx`

**Como editar links e informações**:

```tsx
<div>
  <h3 className="font-semibold mb-4">Support</h3>
  <ul className="space-y-2">
    <li><Link href="/help">Help</Link></li>
    <li><Link href="/faq">FAQ</Link></li>
    // ADICIONE NOVO LINK:
    <li><Link href="/novo-link">Novo Link</Link></li>
  </ul>
</div>
```

---

## 🚀 Como Publicar Alterações

Depois de fazer suas alterações, você precisa publicá-las para que apareçam no site ao vivo.

### Passo a Passo

**1. Salve todas as alterações**:
- Certifique-se de que salvou todos os arquivos editados
- Verifique no Preview se está tudo correto

**2. Crie um Checkpoint**:
- No painel de gerenciamento, clique em **"Save Checkpoint"**
- Adicione uma descrição do que foi alterado:
  ```
  Atualizado slogan da página inicial e adicionado novo produto
  ```
- Clique em **"Save"**

**3. Publique**:
- Clique no botão **"Publish"** (canto superior direito)
- Aguarde confirmação (2-3 minutos)

**4. Aguarde Propagação**:
- Aguarde 10-15 minutos para o CDN atualizar globalmente

**5. Limpe o Cache do Navegador**:
- Pressione `Ctrl + Shift + Delete` (Windows/Linux)
- Ou `Cmd + Shift + Delete` (Mac)
- Selecione "Cache" e "Cookies"
- Clique em "Limpar"

**6. Teste o Site**:
- Abra uma janela anônima
- Acesse https://ileala.ae
- Verifique se suas alterações aparecem

### Checklist Antes de Publicar

- [ ] Testei todas as alterações no Preview
- [ ] Verifiquei que não há erros no console (F12)
- [ ] Testei em diferentes páginas
- [ ] Verifiquei que imagens carregam corretamente
- [ ] Testei links e navegação
- [ ] Criei checkpoint com descrição clara
- [ ] Aguardei 15 minutos após publicar
- [ ] Limpei cache do navegador
- [ ] Testei em modo anônimo

---

## 💡 Exemplos Práticos

Aqui estão exemplos completos de edições comuns:

### Exemplo 1: Mudar Slogan da Página Inicial

**Objetivo**: Alterar o texto "Everything you need to create your unique style and elevate everyday life"

**Passos**:

1. Abra `client/src/locales/en.ts`
2. Localize:
   ```typescript
   home: {
     tagline: 'Everything you need to create your unique style and elevate everyday life',
   }
   ```
3. Altere para:
   ```typescript
   home: {
     tagline: 'Luxury handcrafted table linens for your home',
   }
   ```
4. Abra `client/src/locales/pt.ts`
5. Altere também a versão em português:
   ```typescript
   home: {
     tagline: 'Roupas de mesa artesanais de luxo para sua casa',
   }
   ```
6. Salve ambos os arquivos
7. Visualize no Preview
8. Crie checkpoint: "Atualizado slogan da página inicial"
9. Publique

### Exemplo 2: Adicionar Novo Produto

**Objetivo**: Adicionar produto "Golden Napkin Set" por 200 AED

**Passos**:

1. Prepare a imagem do produto:
   - Tamanho: 1200x1200px
   - Nome: `golden_napkin_set.webp`
   
2. Faça upload da imagem:
   - Navegue até `client/public/images/products/`
   - Faça upload de `golden_napkin_set.webp`

3. Acesse o painel admin:
   - Vá para https://ileala.ae/admin
   - Clique em "Products"
   - Clique em "Add New Product"

4. Preencha os campos:
   - Name (EN): `Golden Napkin Set`
   - Name (PT): `Conjunto de Guardanapos Dourados`
   - Description (EN): `Elegant set of 4 golden napkins with embroidered details`
   - Description (PT): `Conjunto elegante de 4 guardanapos dourados com detalhes bordados`
   - Price: `20000` (200.00 AED × 100)
   - Stock: `30`
   - Category: `Napkins`
   - Collection: `Golden`
   - Image URL: `/images/products/golden_napkin_set.webp`
   - Slug: `golden-napkin-set`

5. Clique em "Create Product"

6. Verifique na loja:
   - Acesse https://ileala.ae/shop
   - O produto deve aparecer

7. Crie checkpoint: "Adicionado produto Golden Napkin Set"

8. Publique

### Exemplo 3: Trocar Imagem do Banner Principal

**Objetivo**: Substituir a imagem do hero da página inicial

**Passos**:

1. Prepare a nova imagem:
   - Tamanho: 1920x1080px
   - Formato: `.webp`
   - Nome: `hero_new_collection.webp`

2. Faça upload:
   - Navegue até `client/public/images/`
   - Faça upload de `hero_new_collection.webp`

3. Edite a página inicial:
   - Abra `client/src/pages/Home.tsx`
   - Localize a seção do hero (linha ~28):
   ```tsx
   <img 
     src="/images/hero_home_table_setting.webp" 
     alt="ILE ALA Luxury Table Setting"
   />
   ```

4. Altere para:
   ```tsx
   <img 
     src="/images/hero_new_collection.webp" 
     alt="ILE ALA New Collection"
   />
   ```

5. Salve o arquivo

6. Visualize no Preview

7. Crie checkpoint: "Atualizada imagem do banner principal"

8. Publique

### Exemplo 4: Adicionar Vídeo do YouTube

**Objetivo**: Adicionar vídeo "Collection Showcase" na seção de vídeos

**Passos**:

1. Faça upload do vídeo no YouTube e copie o ID
   - Exemplo: `https://youtube.com/watch?v=XYZ123`
   - ID: `XYZ123`

2. Crie uma thumbnail:
   - Tamanho: 1280x720px
   - Nome: `video_collection_showcase.webp`
   - Faça upload para `client/public/images/`

3. Edite a página inicial:
   - Abra `client/src/pages/Home.tsx`
   - Localize o array `videos` (procure por "Our Craft in Motion")

4. Adicione o novo vídeo:
   ```tsx
   const videos = [
     // ... vídeos existentes
     {
       id: 'collection_showcase',
       title: language === 'en' ? 'Collection Showcase' : 'Mostra de Coleção',
       thumbnail: '/images/video_collection_showcase.webp',
       youtubeId: 'XYZ123'
     }
   ];
   ```

5. Salve o arquivo

6. Visualize no Preview

7. Crie checkpoint: "Adicionado vídeo Collection Showcase"

8. Publique

### Exemplo 5: Editar Informações de Contato

**Objetivo**: Atualizar email e telefone na página de contato

**Passos**:

1. Abra `client/src/pages/Contact.tsx`

2. Localize as informações de contato:
   ```tsx
   <p className="text-muted-foreground">
     Email: contact@ileala.ae
   </p>
   <p className="text-muted-foreground">
     Phone: +971 XX XXX XXXX
   </p>
   ```

3. Altere para os novos dados:
   ```tsx
   <p className="text-muted-foreground">
     Email: hello@ileala.ae
   </p>
   <p className="text-muted-foreground">
     Phone: +971 50 123 4567
   </p>
   ```

4. Salve o arquivo

5. Visualize no Preview

6. Crie checkpoint: "Atualizado email e telefone de contato"

7. Publique

---

## 🎯 Dicas e Boas Práticas

### Antes de Editar

1. **Faça backup**: Sempre crie um checkpoint antes de grandes mudanças
2. **Teste no Preview**: Nunca publique sem testar primeiro
3. **Edite um arquivo por vez**: Facilita identificar problemas
4. **Use nomes descritivos**: Para imagens e arquivos

### Durante a Edição

1. **Mantenha consistência**: Use o mesmo estilo de escrita
2. **Otimize imagens**: Comprima antes de fazer upload
3. **Use traduções**: Sempre edite EN e PT juntos
4. **Salve frequentemente**: Ctrl+S é seu amigo

### Ao Publicar

1. **Descrição clara**: No checkpoint, descreva o que mudou
2. **Aguarde propagação**: 15 minutos é o tempo ideal
3. **Limpe o cache**: Sempre antes de testar
4. **Teste em modo anônimo**: Garante que você vê a versão pública

### Otimização de Imagens

**Ferramentas recomendadas**:
- https://squoosh.app (compressão online)
- https://tinypng.com (compressão PNG/JPG)
- https://cloudconvert.com (conversão para .webp)

**Tamanhos recomendados**:
- Hero/Banner: 1920x1080px, máx 500KB
- Produtos: 1200x1200px, máx 300KB
- Cards: 800x800px, máx 200KB
- Thumbnails: 400x400px, máx 100KB

### SEO (Otimização para Buscadores)

Ao adicionar imagens, sempre use o atributo `alt`:

```tsx
// ❌ Ruim (sem alt)
<img src="/images/produto.webp" />

// ✅ Bom (com alt descritivo)
<img 
  src="/images/produto.webp" 
  alt="Jogo Americano Botânico - Coleção ILE ALA"
/>
```

Ao editar textos, use palavras-chave relevantes:
- "luxury table linens"
- "handcrafted placemats"
- "artisan napkins"
- "Dubai home decor"

### Resolução de Problemas Comuns

**Problema**: Imagem não aparece após upload

**Solução**:
1. Verifique se o caminho está correto (`/images/nome.webp`)
2. Verifique se o arquivo foi realmente enviado
3. Limpe o cache do navegador
4. Aguarde alguns minutos

**Problema**: Texto não atualiza

**Solução**:
1. Verifique se salvou o arquivo
2. Verifique se editou o arquivo correto (EN ou PT)
3. Limpe o cache do navegador
4. Crie novo checkpoint e publique

**Problema**: Site quebrou após edição

**Solução**:
1. Não entre em pânico!
2. Vá no painel de gerenciamento
3. Localize o checkpoint anterior (antes da edição)
4. Clique em "Rollback"
5. O site voltará ao estado anterior

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. **Consulte este guia** - A maioria das dúvidas está respondida aqui
2. **Verifique a documentação técnica** - Arquivos `RESOLUCAO_FINAL_COMPLETA.md` e outros
3. **Entre em contato com o suporte Manus** - https://help.manus.im

---

**Documento criado por**: Manus AI  
**Última atualização**: 02 de Novembro de 2025  
**Versão**: 1.0  
**Site**: https://ileala.ae
