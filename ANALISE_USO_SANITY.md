# Análise do Uso do Sanity CMS no Projeto

## Data: 03/12/2025

---

## 📊 ARQUIVOS QUE USAM SANITY

### 1. **client/src/lib/sanity.ts** - Configuração principal
**Funções exportadas:**
- `sanityClient` - Cliente configurado
- `urlFor()` - Helper para URLs de imagens
- `getAllProducts()` - Buscar todos os produtos
- `getProductsByCategory()` - Buscar por categoria
- `getProductBySlug()` - Buscar por slug
- `getFeaturedProducts()` - Produtos em destaque
- `getNewProducts()` - Produtos novos
- `getSaleProducts()` - Produtos em promoção

### 2. **client/src/components/SanityVisualEditing.tsx**
- Componente para edição visual do Sanity
- Usado apenas em modo de desenvolvimento/preview

### 3. **Páginas com arquivos .sanity-backup**
Encontrados backups de páginas que usavam Sanity:
- `Accessories.tsx.sanity-backup`
- `CollectionPage.tsx.sanity-backup`
- `HomeAccents.tsx.sanity-backup`
- `NapkinRings.tsx.sanity-backup`
- `PetCollection.tsx.sanity-backup`
- `SanityProductDetail.tsx.sanity-backup`
- `Shop.tsx.sanity-backup`
- `TableEssentials.tsx.sanity-backup`

**Conclusão:** Já houve uma migração parcial! As páginas atuais NÃO usam mais Sanity diretamente.

### 4. **Páginas específicas do Sanity (ainda existem)**
- `SanityCart.tsx`
- `SanityProductDetail.tsx`
- `SanityProducts.tsx`

Essas páginas provavelmente não estão sendo usadas nas rotas principais.

---

## ✅ BOA NOTÍCIA!

**A maior parte do frontend JÁ FOI MIGRADA!**

As páginas principais (PetCollection, Accessories, Shop, etc.) já não usam mais as funções do Sanity diretamente. Elas provavelmente já estão usando o backend tRPC.

---

## 🔍 VERIFICAÇÃO NECESSÁRIA

Preciso verificar:

1. **Como as páginas atuais buscam dados?**
   - Estão usando tRPC?
   - Estão buscando do backend próprio?

2. **O backend já tem endpoints para produtos?**
   - Verificar `server/` para APIs tRPC

3. **Há dados no banco Neon?**
   - Produtos já foram migrados?
   - Coleções já existem?

---

## 🎯 PLANO DE REMOÇÃO DO SANITY

### Fase 1: Verificar Backend ✅ (PRÓXIMO)
- Analisar rotas tRPC existentes
- Verificar se já existem endpoints para:
  - Produtos (CRUD)
  - Coleções
  - Categorias
  - Mídia

### Fase 2: Verificar Dados no Banco
- Conectar ao Neon
- Verificar se tabelas têm dados
- Se não tiverem, executar scripts de migração existentes

### Fase 3: Remover Código Sanity
- Deletar `client/src/lib/sanity.ts`
- Deletar `client/src/components/SanityVisualEditing.tsx`
- Deletar páginas `Sanity*.tsx`
- Deletar arquivos `.sanity-backup`
- Remover dependências do `package.json`:
  - `@sanity/client`
  - `@sanity/image-url`
  - `@sanity/visual-editing`

### Fase 4: Deletar Sanity Studio
- Remover pasta `sanity-studio/`
- Remover referências no código

### Fase 5: Atualizar Variáveis de Ambiente
- Remover variáveis Sanity do `.env`
- Adicionar variáveis Cloudinary

### Fase 6: Testar Tudo
- Verificar se site público funciona
- Verificar se admin funciona
- Testar upload de imagens via Cloudinary

---

## 📋 PRÓXIMA AÇÃO IMEDIATA

**Analisar o backend tRPC** para entender quais endpoints já existem e se o sistema já está funcionando sem Sanity.
