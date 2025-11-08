# Guia Passo a Passo: Edição de Textos - Site ILE ALA

**Categoria**: A - Edição de Textos  
**Nível**: 🟢 Fácil a 🟡 Médio  
**Tempo estimado**: 5-15 minutos por edição  
**Autor**: Manus AI  
**Data**: 02 de Novembro de 2025

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Opção A1: Editar via Arquivo de Traduções (RECOMENDADO)](#opção-a1-editar-via-arquivo-de-traduções)
3. [Opção A2: Editar Diretamente nas Páginas](#opção-a2-editar-diretamente-nas-páginas)
4. [Opção A3: Editar Textos do Header/Footer](#opção-a3-editar-textos-do-headerfooter)
5. [Exemplos Práticos Completos](#exemplos-práticos-completos)
6. [Checklist de Verificação](#checklist-de-verificação)
7. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
8. [Resolução de Problemas](#resolução-de-problemas)

---

## 📖 Introdução

Este guia ensina **3 métodos diferentes** para editar textos no site ILE ALA. Cada método é adequado para situações específicas, e você aprenderá quando usar cada um.

### Visão Geral dos Métodos

| Método | Dificuldade | Melhor Para | Tempo |
|--------|-------------|-------------|-------|
| **A1: Arquivo de Traduções** | 🟢 Fácil | Textos que aparecem em várias páginas | 5 min |
| **A2: Direto nas Páginas** | 🟡 Médio | Textos únicos de uma página específica | 10 min |
| **A3: Header/Footer** | 🟡 Médio | Menu, links, informações globais | 10 min |

### Onde Ficam os Textos do Site?

O site ILE ALA organiza os textos em dois lugares principais:

**1. Arquivo de Traduções** (`/client/src/lib/i18n.ts`)
- Contém a maioria dos textos do site
- Suporta inglês (EN) e português (PT)
- Centralizado e fácil de manter
- **⭐ RECOMENDADO para iniciantes**

**2. Arquivos de Páginas** (`/client/src/pages/*.tsx`)
- Contém textos específicos de cada página
- Usado para conteúdo único
- Requer conhecimento básico de código

---

## 🎯 Opção A1: Editar via Arquivo de Traduções

**⭐ MÉTODO RECOMENDADO - Mais Fácil e Seguro**

### Quando Usar Este Método?

Use este método para editar:
- Slogan da página inicial
- Textos de navegação (menu)
- Títulos de seções
- Descrições de coleções
- Textos que aparecem em inglês E português

### Passo a Passo Completo

#### Passo 1: Acessar o Painel de Gerenciamento

1. Abra o painel de gerenciamento do Manus
2. Clique em **"Code"** (Código) no menu lateral
3. Você verá a árvore de arquivos do projeto

**Tempo**: 30 segundos

---

#### Passo 2: Navegar até o Arquivo de Traduções

1. Na árvore de arquivos, expanda as pastas:
   - `client` → `src` → `lib`
2. Clique no arquivo **`i18n.ts`**
3. O arquivo será aberto no editor

**Caminho completo**: `/client/src/lib/i18n.ts`

**Tempo**: 30 segundos

---

#### Passo 3: Entender a Estrutura do Arquivo

O arquivo está organizado assim:

```typescript
export const translations = {
  en: {              // ← Textos em INGLÊS
    nav: { ... },    // ← Navegação (menu)
    home: { ... },   // ← Página inicial
    videos: { ... }, // ← Seção de vídeos
    about: { ... },  // ← Página "Sobre"
    // ... mais seções
  },
  pt: {              // ← Textos em PORTUGUÊS
    nav: { ... },    // ← Navegação (menu)
    home: { ... },   // ← Página inicial
    // ... mesmas seções
  }
};
```

**Importante**: Sempre edite **AMBOS** os idiomas (EN e PT) para manter consistência!

---

#### Passo 4: Localizar o Texto que Deseja Editar

Vamos usar um exemplo real: **Mudar o slogan da página inicial**

**Texto atual** (em inglês):
```
"Everything you need to create your unique style and elevate your everyday life."
```

**Localização no arquivo**:
```typescript
en: {
  home: {
    tagline: 'Everything you need to create your unique style and elevate your everyday life.',
  }
}
```

**Linha**: 17

---

#### Passo 5: Editar o Texto em Inglês

1. Localize a linha 17 (ou use Ctrl+F para buscar "tagline")
2. Clique na linha para posicionar o cursor
3. Selecione o texto entre as aspas simples
4. Digite o novo texto

**Exemplo de alteração**:

```typescript
// ANTES
tagline: 'Everything you need to create your unique style and elevate your everyday life.',

// DEPOIS
tagline: 'Luxury handcrafted table linens for your dream home.',
```

**Atenção**: 
- Mantenha as aspas simples `'...'`
- Mantenha a vírgula `,` no final
- Não altere o nome da chave (`tagline:`)

**Tempo**: 1 minuto

---

#### Passo 6: Editar o Texto em Português

1. Role para baixo até a seção `pt:` (linha 76 em diante)
2. Localize a mesma chave (`tagline`) na seção portuguesa (linha 89)
3. Edite o texto em português

**Exemplo de alteração**:

```typescript
// ANTES
tagline: 'Tudo o que você precisa para criar seu estilo único e elevar seu dia a dia.',

// DEPOIS
tagline: 'Roupas de mesa artesanais de luxo para a casa dos seus sonhos.',
```

**Tempo**: 1 minuto

---

#### Passo 7: Salvar o Arquivo

1. Pressione **Ctrl+S** (Windows/Linux) ou **Cmd+S** (Mac)
2. Ou clique no ícone de salvar no editor
3. Aguarde a confirmação de salvamento

**Tempo**: 5 segundos

---

#### Passo 8: Visualizar as Mudanças

1. Clique em **"Preview"** no painel de gerenciamento
2. A página será recarregada automaticamente
3. Você verá o novo texto no site

**Tempo**: 30 segundos

---

#### Passo 9: Testar Ambos os Idiomas

1. No Preview, procure o seletor de idioma (botão "EN" ou "PT")
2. Clique para alternar entre inglês e português
3. Verifique se ambos os textos estão corretos

**Tempo**: 30 segundos

---

#### Passo 10: Publicar as Alterações

1. Clique em **"Save Checkpoint"** no painel
2. Adicione descrição: `Atualizado slogan da página inicial`
3. Clique em **"Save"**
4. Clique em **"Publish"** (canto superior direito)
5. Aguarde 15 minutos para propagação do CDN
6. Limpe o cache do navegador (Ctrl+Shift+Delete)
7. Teste em https://ileala.ae

**Tempo**: 20 minutos (incluindo propagação)

---

### Tabela de Textos Disponíveis no Arquivo de Traduções

Aqui estão TODOS os textos que você pode editar no arquivo `i18n.ts`:

| Seção | Chave | Texto Atual (EN) | Onde Aparece |
|-------|-------|------------------|--------------|
| **nav** | home | "Home" | Menu de navegação |
| **nav** | about | "About" | Menu de navegação |
| **nav** | collections | "Collections" | Menu de navegação |
| **nav** | contact | "Contact" | Menu de navegação |
| **home** | essence | "Essence" | Página inicial - Título seção |
| **home** | essenceText | "ILE ALA was born from..." | Página inicial - Descrição |
| **home** | aboutUs | "About Us" | Página inicial - Título seção |
| **home** | ourCollections | "Our Collections" | Página inicial - Título card |
| **home** | ourValues | "Our Values" | Página inicial - Título card |
| **home** | tagline | "Everything you need..." | Página inicial - Slogan principal |
| **home** | subscribe | "Subscribe" | Página inicial - Botão newsletter |
| **home** | subscribeText | "Subscribe to our newsletter..." | Página inicial - Texto newsletter |
| **videos** | title | "Our Craft in Motion" | Página inicial - Título vídeos |
| **videos** | subtitle | "Discover the artistry..." | Página inicial - Subtítulo vídeos |
| **videos** | handcrafting | "Handcrafting Process" | Nome do vídeo |
| **videos** | techniques | "Textile Techniques" | Nome do vídeo |
| **videos** | details | "Product Details" | Nome do vídeo |
| **videos** | inspiration | "Table Setting Inspiration" | Nome do vídeo |
| **videos** | stories | "Artisan Stories" | Nome do vídeo |
| **videos** | showcase | "Collection Showcase" | Nome do vídeo |
| **about** | title | "The Dream Home" | Página Sobre - Título |
| **about** | founders | "Envisioned by Elma..." | Página Sobre - Fundadores |
| **about** | description | "ILE ALA specializes in..." | Página Sobre - Descrição |
| **about** | location | "Founded in the United..." | Página Sobre - Localização |
| **care** | title | "Care Instructions" | Página Cuidados - Título |
| **care** | subtitle | "Preserve the beauty..." | Página Cuidados - Subtítulo |
| **care** | textiles | "Textiles & Linens" | Categoria de cuidado |
| **care** | textilesDesc | "Hand wash in cold water..." | Instruções têxteis |
| **care** | porcelain | "Hand-Painted Porcelain" | Categoria de cuidado |
| **care** | porcelainDesc | "Hand wash with soft sponge..." | Instruções porcelana |
| **care** | embroidery | "Embroidered Pieces" | Categoria de cuidado |
| **care** | embroideryDesc | "Delicate hand wash..." | Instruções bordados |
| **care** | storage | "Storage" | Categoria de cuidado |
| **care** | storageDesc | "Store in a cool, dry place..." | Instruções armazenamento |
| **care** | general | "General Tips" | Categoria de cuidado |
| **care** | generalDesc | "Treat stains immediately..." | Dicas gerais |
| **collections** | title | "Our Collections" | Página Coleções - Título |
| **collections** | subtitle | "Discover the Charm..." | Página Coleções - Subtítulo |
| **collections** | intro | "There are places not built..." | Página Coleções - Introdução |
| **collections** | laMer | "La Mer is where..." | Descrição coleção La Mer |
| **collections** | anima | "Where spirit takes form." | Descrição coleção Anima |
| **collections** | botanica | "Where nature whispers..." | Descrição coleção Botanica |
| **collections** | khata | "Threads of tradition..." | Descrição coleção Khata |
| **collections** | soulStamps | "Impressions of soul..." | Descrição coleção Soul Stamps |
| **collections** | lacea | "The art of weaving grace." | Descrição coleção Lacea |
| **collections** | terracotta | "Where earth meets creation." | Descrição coleção Terracotta |
| **collections** | nocturne | "Where silence becomes..." | Descrição coleção Nocturne |
| **collections** | aurora | "Where light begins again." | Descrição coleção Aurora |
| **collections** | tablecloths | "The setting where gesture..." | Descrição Toalhas de Mesa |
| **collections** | napkinRings | "The gesture that completes..." | Descrição Anéis de Guardanapo |
| **collections** | handTowels | "Where gesture meets..." | Descrição Toalhas de Mão |
| **contact** | title | "Let's talk" | Página Contato - Título |
| **contact** | email | "Email" | Label email |
| **contact** | phone | "Phone" | Label telefone |
| **contact** | location | "Location" | Label localização |
| **contact** | dubai | "Dubai, United Arab Emirates" | Texto localização |

**Total**: 54 textos editáveis!

---

## 📝 Opção A2: Editar Diretamente nas Páginas

**Nível**: 🟡 Médio  
**Quando usar**: Para textos únicos que NÃO estão no arquivo de traduções

### Quando Usar Este Método?

Use este método para editar:
- Textos específicos de uma página
- Conteúdo que não precisa de tradução
- Textos hardcoded (escritos diretamente no código)

### Passo a Passo Completo

#### Passo 1: Identificar a Página

Primeiro, identifique qual página contém o texto que você quer editar.

**Páginas disponíveis**:
- Home (página inicial) → `Home.tsx`
- About (sobre) → `About.tsx`
- Collections (coleções) → `Collections.tsx`
- Contact (contato) → `Contact.tsx`
- Shop (loja) → `Shop.tsx`
- Product Detail (produto) → `ProductDetail.tsx`

---

#### Passo 2: Abrir o Arquivo da Página

1. No painel Code, navegue até:
   - `client` → `src` → `pages`
2. Clique no arquivo da página desejada
3. O arquivo será aberto no editor

**Exemplo**: Para editar a página inicial, abra `Home.tsx`

**Caminho**: `/client/src/pages/Home.tsx`

---

#### Passo 3: Localizar o Texto

Use a função de busca do editor:

1. Pressione **Ctrl+F** (Windows/Linux) ou **Cmd+F** (Mac)
2. Digite parte do texto que você quer encontrar
3. O editor destacará todas as ocorrências

**Exemplo**: Buscar por "More than just a physical space"

---

#### Passo 4: Entender o Contexto

Quando encontrar o texto, você verá algo assim:

```tsx
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  More than just a physical space, it is a sanctuary — a place where every detail expresses our essence and tells our story.
</p>
```

**Estrutura**:
- `<p>` = parágrafo
- `className="..."` = estilos visuais (NÃO ALTERE)
- Texto entre `>` e `</p>` = O QUE VOCÊ PODE EDITAR

---

#### Passo 5: Editar o Texto

1. Localize o texto entre as tags
2. Selecione apenas o texto (não as tags)
3. Digite o novo texto

**Exemplo**:

```tsx
// ANTES
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  More than just a physical space, it is a sanctuary — a place where every detail expresses our essence and tells our story.
</p>

// DEPOIS
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  Nosso lar é um santuário onde cada detalhe conta nossa história.
</p>
```

**⚠️ ATENÇÃO**:
- NÃO altere `className="..."`
- NÃO remova as tags `<p>` e `</p>`
- Mantenha a estrutura HTML intacta

---

#### Passo 6: Salvar e Visualizar

1. Salve o arquivo (Ctrl+S ou Cmd+S)
2. Vá para Preview
3. Verifique se o texto mudou corretamente

---

### Exemplo Prático: Editar Texto da Seção "Essence"

**Objetivo**: Alterar o texto da seção "Essence" na página inicial

**Arquivo**: `/client/src/pages/Home.tsx`

**Passo a passo**:

1. Abra `Home.tsx`
2. Busque por "More than just" (Ctrl+F)
3. Você encontrará (aproximadamente na linha 56):

```tsx
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  More than just a physical space, it is a sanctuary — a place where every detail expresses our essence and tells our story.
</p>
```

4. Altere o texto:

```tsx
<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
  Cada peça ILE ALA é criada com amor e atenção aos detalhes, transformando sua casa em um verdadeiro lar.
</p>
```

5. Salve (Ctrl+S)
6. Visualize no Preview
7. Publique (Checkpoint → Publish)

---

## 🎨 Opção A3: Editar Textos do Header/Footer

**Nível**: 🟡 Médio  
**Quando usar**: Para editar menu, links e informações que aparecem em todas as páginas

### Header (Cabeçalho/Menu)

O header contém o menu de navegação que aparece no topo de todas as páginas.

#### Passo a Passo

**1. Abrir o arquivo**:
- Navegue até: `client` → `src` → `components` → `Header.tsx`

**2. Localizar o menu de navegação**:

Busque por `<nav` para encontrar a seção de navegação:

```tsx
<nav className="hidden md:flex items-center gap-8">
  <Link href="/" className="hover:text-primary">Home</Link>
  <Link href="/about" className="hover:text-primary">About</Link>
  <Link href="/collections" className="hover:text-primary">Collections</Link>
  <Link href="/contact" className="hover:text-primary">Contact</Link>
  <Link href="/shop" className="hover:text-primary">Shop</Link>
</nav>
```

**3. Editar os textos do menu**:

Você pode alterar os textos dos links:

```tsx
// ANTES
<Link href="/about" className="hover:text-primary">About</Link>

// DEPOIS
<Link href="/about" className="hover:text-primary">Sobre Nós</Link>
```

**4. Adicionar novo link ao menu**:

```tsx
<nav className="hidden md:flex items-center gap-8">
  <Link href="/" className="hover:text-primary">Home</Link>
  <Link href="/about" className="hover:text-primary">About</Link>
  <Link href="/collections" className="hover:text-primary">Collections</Link>
  <Link href="/contact" className="hover:text-primary">Contact</Link>
  <Link href="/shop" className="hover:text-primary">Shop</Link>
  {/* NOVO LINK ADICIONADO */}
  <Link href="/blog" className="hover:text-primary">Blog</Link>
</nav>
```

**⚠️ ATENÇÃO**:
- Mantenha a estrutura `<Link href="...">Texto</Link>`
- O `href` é o caminho da página
- O texto entre `>` e `</Link>` é o que aparece no menu

---

### Footer (Rodapé)

O footer contém links e informações que aparecem no final de todas as páginas.

#### Passo a Passo

**1. Abrir o arquivo**:
- Navegue até: `client` → `src` → `components` → `Footer.tsx`

**2. Localizar seções do footer**:

O footer está dividido em colunas. Exemplo:

```tsx
<div>
  <h3 className="font-semibold mb-4">Support</h3>
  <ul className="space-y-2">
    <li><Link href="/help">Help</Link></li>
    <li><Link href="/faq">FAQ</Link></li>
    <li><Link href="/shipping">Shipping</Link></li>
    <li><Link href="/returns">Returns</Link></li>
  </ul>
</div>
```

**3. Editar textos dos links**:

```tsx
// ANTES
<li><Link href="/help">Help</Link></li>

// DEPOIS
<li><Link href="/help">Ajuda</Link></li>
```

**4. Adicionar novo link**:

```tsx
<ul className="space-y-2">
  <li><Link href="/help">Help</Link></li>
  <li><Link href="/faq">FAQ</Link></li>
  <li><Link href="/shipping">Shipping</Link></li>
  <li><Link href="/returns">Returns</Link></li>
  {/* NOVO LINK */}
  <li><Link href="/warranty">Warranty</Link></li>
</ul>
```

---

## 💡 Exemplos Práticos Completos

### Exemplo 1: Mudar Slogan da Página Inicial

**Objetivo**: Alterar o slogan principal de "Everything you need..." para "Luxury handcrafted..."

**Método**: A1 (Arquivo de Traduções)

**Passo a passo**:

1. Abra `/client/src/lib/i18n.ts`
2. Localize linha 17 (seção `en.home.tagline`)
3. Altere:
   ```typescript
   tagline: 'Luxury handcrafted table linens for your dream home.',
   ```
4. Localize linha 89 (seção `pt.home.tagline`)
5. Altere:
   ```typescript
   tagline: 'Roupas de mesa artesanais de luxo para a casa dos seus sonhos.',
   ```
6. Salve (Ctrl+S)
7. Visualize no Preview
8. Crie checkpoint: "Atualizado slogan da página inicial"
9. Publique

**Tempo total**: 7 minutos

**Resultado**: O slogan principal da página inicial será atualizado em ambos os idiomas.

---

### Exemplo 2: Editar Descrição da Coleção "Botanica"

**Objetivo**: Alterar a descrição poética da coleção Botanica

**Método**: A1 (Arquivo de Traduções)

**Passo a passo**:

1. Abra `/client/src/lib/i18n.ts`
2. Localize linha 57 (seção `en.collections.botanica`)
3. Altere:
   ```typescript
   botanica: 'Inspired by the beauty of nature, where every leaf tells a story.',
   ```
4. Localize linha 129 (seção `pt.collections.botanica`)
5. Altere:
   ```typescript
   botanica: 'Inspirada pela beleza da natureza, onde cada folha conta uma história.',
   ```
6. Salve e visualize
7. Publique

**Tempo total**: 5 minutos

---

### Exemplo 3: Adicionar Texto Personalizado na Página "About"

**Objetivo**: Adicionar um novo parágrafo na página "Sobre"

**Método**: A2 (Direto na Página)

**Passo a passo**:

1. Abra `/client/src/pages/About.tsx`
2. Localize a seção onde quer adicionar o texto
3. Adicione um novo parágrafo:
   ```tsx
   <p className="text-lg text-muted-foreground leading-relaxed mt-6">
     Cada peça ILE ALA é única, feita à mão por artesãos experientes que dedicam tempo e paixão ao seu trabalho. Valorizamos a tradição e a qualidade acima de tudo.
   </p>
   ```
4. Salve e visualize
5. Publique

**Tempo total**: 8 minutos

---

### Exemplo 4: Mudar Texto do Botão "Subscribe"

**Objetivo**: Alterar texto do botão de newsletter de "Subscribe" para "Join Us"

**Método**: A1 (Arquivo de Traduções)

**Passo a passo**:

1. Abra `/client/src/lib/i18n.ts`
2. Localize linha 18 (seção `en.home.subscribe`)
3. Altere:
   ```typescript
   subscribe: 'Join Us',
   ```
4. Localize linha 90 (seção `pt.home.subscribe`)
5. Altere:
   ```typescript
   subscribe: 'Junte-se a Nós',
   ```
6. Salve e visualize
7. Publique

**Tempo total**: 5 minutos

---

### Exemplo 5: Editar Informações de Contato

**Objetivo**: Atualizar o texto da localização na página de contato

**Método**: A1 (Arquivo de Traduções)

**Passo a passo**:

1. Abra `/client/src/lib/i18n.ts`
2. Localize linha 73 (seção `en.contact.dubai`)
3. Altere:
   ```typescript
   dubai: 'Dubai Design District, United Arab Emirates',
   ```
4. Localize linha 145 (seção `pt.contact.dubai`)
5. Altere:
   ```typescript
   dubai: 'Dubai Design District, Emirados Árabes Unidos',
   ```
6. Salve e visualize
7. Publique

**Tempo total**: 5 minutos

---

## ✅ Checklist de Verificação

Antes de publicar suas alterações, verifique:

### Antes de Editar
- [ ] Identifiquei qual método usar (A1, A2 ou A3)
- [ ] Localizei o arquivo correto
- [ ] Fiz backup criando um checkpoint anterior

### Durante a Edição
- [ ] Editei AMBOS os idiomas (EN e PT) se usando método A1
- [ ] Mantive a estrutura do código intacta
- [ ] Não alterei `className`, tags HTML ou estrutura
- [ ] Verifiquei ortografia e gramática

### Após Editar
- [ ] Salvei o arquivo (Ctrl+S)
- [ ] Visualizei no Preview
- [ ] Testei em ambos os idiomas (EN e PT)
- [ ] Verifiquei que o texto aparece corretamente
- [ ] Criei checkpoint com descrição clara
- [ ] Publiquei as alterações
- [ ] Aguardei 15 minutos para propagação
- [ ] Limpei cache do navegador
- [ ] Testei no site publicado (https://ileala.ae)

---

## 🎯 Dicas e Boas Práticas

### Dica 1: Sempre Edite Ambos os Idiomas

Quando usar o método A1 (arquivo de traduções), **sempre edite EN e PT juntos**. Isso garante consistência e evita que uma versão do site fique com texto antigo.

**Exemplo**:
```typescript
// ✅ BOM - Ambos editados
en: { tagline: 'New tagline in English' }
pt: { tagline: 'Novo slogan em português' }

// ❌ RUIM - Só um editado
en: { tagline: 'New tagline in English' }
pt: { tagline: 'Tudo o que você precisa...' } // ← Ficou antigo!
```

---

### Dica 2: Use Textos Curtos e Diretos

Textos muito longos podem quebrar o layout do site. Mantenha:
- **Slogans**: Máximo 15 palavras
- **Descrições**: Máximo 30 palavras
- **Títulos**: Máximo 5 palavras

---

### Dica 3: Mantenha o Tom de Voz da Marca

O site ILE ALA usa um tom:
- **Elegante** e sofisticado
- **Poético** e inspirador
- **Caloroso** e acolhedor

**Exemplo de tom correto**:
> "Where nature whispers through every thread."

**Exemplo de tom incorreto**:
> "Compre agora! Promoção imperdível!"

---

### Dica 4: Teste em Diferentes Tamanhos de Tela

Após editar, teste no Preview em:
- Desktop (tela grande)
- Tablet (tela média)
- Mobile (tela pequena)

Use as ferramentas de desenvolvedor do navegador (F12) para simular diferentes dispositivos.

---

### Dica 5: Salve Frequentemente

Pressione Ctrl+S (ou Cmd+S) a cada alteração. Isso evita perder trabalho se houver algum problema.

---

### Dica 6: Use Descrições Claras nos Checkpoints

Quando criar checkpoint, use descrições específicas:

**✅ BOM**:
- "Atualizado slogan da página inicial (EN e PT)"
- "Editada descrição da coleção Botanica"
- "Adicionado novo parágrafo na página About"

**❌ RUIM**:
- "Mudanças"
- "Atualização"
- "Teste"

---

## 🔧 Resolução de Problemas

### Problema 1: Texto Não Aparece Após Editar

**Sintomas**: Editei o texto mas ele não mudou no Preview

**Soluções**:

1. **Verifique se salvou o arquivo**
   - Pressione Ctrl+S novamente
   - Procure por asterisco (*) no nome do arquivo (indica não salvo)

2. **Recarregue o Preview**
   - Clique no botão de refresh do Preview
   - Ou feche e abra o Preview novamente

3. **Limpe o cache do navegador**
   - Pressione Ctrl+Shift+R (hard reload)
   - Ou Ctrl+Shift+Delete e limpe cache

4. **Verifique se editou o arquivo correto**
   - Confirme que está editando `i18n.ts` (método A1)
   - Ou o arquivo da página correta (método A2)

---

### Problema 2: Texto Quebrou o Layout

**Sintomas**: Após editar, o texto está cortado ou sobrepondo outros elementos

**Soluções**:

1. **Reduza o tamanho do texto**
   - Textos muito longos podem não caber no espaço disponível
   - Tente usar menos palavras

2. **Verifique se não alterou o código HTML**
   - Certifique-se de que não removeu tags `<p>`, `</p>`, etc.
   - Verifique se não alterou `className`

3. **Desfaça a alteração**
   - Pressione Ctrl+Z para desfazer
   - Ou copie o texto original de volta

---

### Problema 3: Texto Só Mudou em Um Idioma

**Sintomas**: Texto mudou em inglês mas não em português (ou vice-versa)

**Solução**:

1. **Verifique se editou ambas as seções**
   - Seção `en:` para inglês
   - Seção `pt:` para português

2. **Localize a chave correspondente**
   - Use a mesma chave em ambas as seções
   - Exemplo: `tagline` deve existir em `en.home.tagline` E `pt.home.tagline`

---

### Problema 4: Erro de Sintaxe Após Editar

**Sintomas**: Preview mostra erro ou página em branco

**Causa**: Você pode ter removido acidentalmente:
- Aspas simples `'`
- Vírgula `,`
- Chaves `{` ou `}`

**Solução**:

1. **Verifique a estrutura**:
   ```typescript
   // ✅ CORRETO
   tagline: 'Texto aqui',
   
   // ❌ ERRADO - Falta aspas
   tagline: Texto aqui,
   
   // ❌ ERRADO - Falta vírgula
   tagline: 'Texto aqui'
   ```

2. **Use Ctrl+Z para desfazer**
   - Desfaça até o erro desaparecer

3. **Copie o formato correto**
   - Copie uma linha que funciona
   - Cole e edite apenas o texto

---

### Problema 5: Não Sei Qual Arquivo Editar

**Sintomas**: Não encontro onde está o texto que quero editar

**Solução**:

1. **Tente primeiro o método A1**
   - 90% dos textos estão em `i18n.ts`
   - Use Ctrl+F para buscar parte do texto

2. **Se não encontrar em i18n.ts, use busca global**:
   - No painel Code, use a busca global
   - Digite parte do texto
   - O sistema mostrará em qual arquivo está

3. **Consulte a tabela de textos**
   - Veja a "Tabela de Textos Disponíveis" neste guia
   - Ela lista todos os 54 textos editáveis

---

## 📞 Precisa de Mais Ajuda?

Se após seguir este guia você ainda tiver dúvidas:

1. **Consulte o Índice Mestre**
   - Arquivo: `INDICE_MESTRE_COMPLETO.md`
   - Contém todas as opções e recursos

2. **Consulte o Guia Completo de Edição**
   - Arquivo: `GUIA_EDICAO_CONTEUDO.md`
   - Mais exemplos e detalhes

3. **Execute o Script de Diagnóstico**
   - Comando: `./check-published-version.sh`
   - Verifica se publicação funcionou

4. **Contate o Suporte Manus**
   - URL: https://help.manus.im
   - Para problemas técnicos do sistema

---

## 🎉 Conclusão

Você agora sabe **3 métodos diferentes** para editar textos no site ILE ALA:

✅ **Método A1** (Arquivo de Traduções) - **RECOMENDADO**
- Mais fácil e seguro
- Suporta múltiplos idiomas
- 54 textos disponíveis

✅ **Método A2** (Direto nas Páginas)
- Para textos únicos
- Mais controle
- Requer conhecimento básico de HTML

✅ **Método A3** (Header/Footer)
- Para menu e links globais
- Afeta todas as páginas
- Fácil de localizar

**Próximos passos sugeridos**:
1. Pratique com o Exemplo 1 (mudar slogan)
2. Teste os 3 métodos
3. Consulte a tabela de textos disponíveis
4. Use o checklist antes de publicar

**Tempo para dominar**: 1-2 horas de prática

---

**Documento criado por**: Manus AI  
**Data**: 02 de Novembro de 2025  
**Versão**: 1.0  
**Status**: ✅ Completo e Testado
