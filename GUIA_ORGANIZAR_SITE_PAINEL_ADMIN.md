# 📋 Guia: Como Organizar o Site Usando o Painel Admin

## 🎯 Objetivo

Organizar os dados no painel admin para que o site funcione **exatamente como era antes**, mas com integração completa do painel admin.

## ✅ Integração Admin → Site Público

**SIM, está integrado!** Quando você cria/edita produtos no painel admin:
- ✅ Produtos aparecem imediatamente no site (cache de 5 minutos)
- ✅ Imagens são enviadas para S3 automaticamente
- ✅ Mudanças são refletidas no site público

## 📝 Passo a Passo: Organizar Dados

### 1. Acessar Painel Admin

1. Acesse `admin.ileala.ae`
2. Faça login
3. Vá em **Produtos**

### 2. Organizar Produtos por Coleção

#### Para La Mer:
1. Encontre produtos da coleção La Mer
2. Para cada produto:
   - **Collection**: `La Mer` (exatamente assim, com maiúsculas)
   - **Active**: `1` (ativado)
   - **Image URL**: Deve ter URL do S3 (fazer upload se vazio)
   - **Price**: Em fils (ex: 360 AED = 36000 fils)

#### Para Napkin Rings:
1. Encontre produtos de porta guardanapos
2. Para cada produto:
   - **Collection**: `Napkin Rings` (exatamente assim)
   - **Active**: `1` (ativado)
   - **Image URL**: Deve ter URL do S3
   - **Price**: Em fils

#### Para Pet Collection:
1. Encontre produtos da pet collection
2. Para cada produto:
   - **Category**: `pet-collection` (exatamente assim, minúsculas)
   - **Active**: `1` (ativado)
   - **Image URL**: Deve ter URL do S3
   - **Price**: Em fils

### 3. Organizar Categorias no Menu

**Problema:** Menu mostra "Collections" duas vezes

**Solução:**
1. Acesse **Categorias** no painel admin
2. Verifique se há uma categoria chamada "Collections"
3. Se houver, você pode:
   - **Opção A**: Desativar (`active = 0`) para não aparecer no menu
   - **Opção B**: Renomear para algo diferente (ex: "Shop Categories")

**Menu atual mostra:**
- `/collections` (link fixo - página de apresentação)
- Categorias do banco (dinâmicas)

**Recomendação:** Manter apenas o link fixo `/collections` e remover categorias duplicadas do banco.

### 4. Verificar Imagens

**Se imagens não aparecem:**

1. **Verificar no admin:**
   - Produto tem `imageUrl` preenchido?
   - URL está correta?

2. **Se não, fazer upload:**
   - Editar produto
   - Clicar em "Upload Image"
   - Selecionar imagem
   - Salvar

3. **Verificar S3:**
   - URLs devem começar com: `https://ileala-uploads.s3.us-east-1.amazonaws.com/`
   - Se não, fazer upload novamente

### 5. Verificar Preços

**Importante:** Preços no banco são em **fils** (1 AED = 100 fils)

**Exemplos:**
- 360 AED = 36000 fils
- 150 AED = 15000 fils
- 25.50 AED = 2550 fils

**No painel admin:**
- Quando criar/editar produto, digite o preço em AED
- O sistema converte automaticamente para fils

## 🔧 Correções Específicas

### Corrigir Menu Duplicado

**Problema:** Menu mostra "Collections" duas vezes

**Solução no Admin:**
1. Vá em **Categorias**
2. Encontre categoria "Collections" (se existir)
3. Desative (`active = 0`) ou delete

**Ou no código (se preferir):**
- Remover link fixo `/collections` do Header
- Manter apenas categorias dinâmicas

### Corrigir Napkin Rings

**Problema:** Produtos não aparecem

**Solução:**
1. Vá em **Produtos** no admin
2. Encontre produtos de porta guardanapos
3. Para cada um:
   - **Collection**: `Napkin Rings` (exatamente assim)
   - **Active**: `1`
   - Salvar

### Corrigir La Mer

**Problema:** Produtos não aparecem ou imagens sumiram

**Solução:**
1. Vá em **Produtos** no admin
2. Filtre por `collection = "La Mer"`
3. Para cada produto:
   - Verificar se `collection = "La Mer"` (exatamente assim)
   - Verificar se `active = 1`
   - Verificar se `imageUrl` está preenchido
   - Se `imageUrl` vazio, fazer upload de imagem
   - Salvar

### Corrigir Pet Collection

**Problema:** Produtos não aparecem

**Solução:**
1. Vá em **Produtos** no admin
2. Filtre por `category = "pet-collection"`
3. Para cada produto:
   - Verificar se `category = "pet-collection"` (exatamente assim)
   - Verificar se `active = 1`
   - Verificar se `imageUrl` está preenchido
   - Se `imageUrl` vazio, fazer upload de imagem
   - Salvar

## 📊 Estrutura de Dados Recomendada

### Coleções (Collection)
- `La Mer`
- `Anima`
- `Botanica`
- `Khata`
- `Soul Stamps`
- `Lacea`
- `Terracotta`
- `Nocturne`
- `Aurora`
- `Napkin Rings`
- `Tablecloth`
- `Table Runner`
- `Cocktail Napkin`
- `Coaster`
- `Cushion`
- `Hand Towel`

### Categorias (Category)
- `pet-collection` (para Pet Collection)
- `bags-accessories` (para Accessories)
- Outras categorias conforme necessário

## ✅ Checklist de Organização

### Menu
- [ ] Remover categoria "Collections" duplicada do banco
- [ ] Manter apenas link fixo `/collections` no menu
- [ ] Categorias dinâmicas aparecem corretamente

### Produtos
- [ ] Todos os produtos têm `collection` ou `category` definido
- [ ] Todos os produtos estão `active = 1`
- [ ] Todos os produtos têm `imageUrl` preenchido
- [ ] Preços estão corretos (em fils no banco)

### Coleções Específicas
- [ ] La Mer: produtos têm `collection = "La Mer"`
- [ ] Napkin Rings: produtos têm `collection = "Napkin Rings"`
- [ ] Pet Collection: produtos têm `category = "pet-collection"`
- [ ] Table Essentials: produtos têm coleções corretas
- [ ] Home Accents: produtos têm coleções corretas
- [ ] Accessories: produtos têm `category = "bags-accessories"`

### Imagens
- [ ] Todas as imagens foram enviadas para S3
- [ ] URLs começam com `https://ileala-uploads.s3.us-east-1.amazonaws.com/`
- [ ] Imagens carregam no navegador
- [ ] Não há erros de CORS no console

## 🚀 Após Organizar

1. **Aguardar cache (5 minutos)**
   - Cache de produtos é de 5 minutos
   - Ou limpar cache do navegador

2. **Testar site:**
   - `/collections` - deve mostrar todas as coleções
   - `/collections/la-mer` - deve mostrar produtos da La Mer
   - `/napkin-rings` - deve mostrar produtos de Napkin Rings
   - `/pet-collection` - deve mostrar produtos da Pet Collection
   - Todas as imagens devem aparecer

3. **Verificar console:**
   - F12 → Console
   - Não deve haver erros de imagens
   - Não deve haver erros de API

## 📝 Notas Importantes

1. **Cache:** Mudanças no admin podem levar até 5 minutos para aparecer no site
2. **Preços:** Sempre em fils no banco (360 AED = 36000 fils)
3. **Coleções:** Nomes devem corresponder exatamente (case-sensitive)
4. **Imagens:** Devem ser enviadas via painel admin para garantir URL correta
5. **Active:** Apenas produtos com `active = 1` aparecem no site

## 🆘 Se Ainda Não Funcionar

1. **Verificar logs do Railway:**
   - Railway Dashboard → `ileala-website` → Deploy Logs

2. **Verificar console do navegador:**
   - F12 → Console
   - Verificar erros

3. **Verificar dados no banco:**
   - Painel admin → Produtos
   - Verificar se dados estão corretos

4. **Limpar cache:**
   - Limpar cache do navegador
   - Aguardar 5 minutos para cache do servidor

