# 🔴 Problema: Produtos Não Aparecem no Site

## ✅ O que foi corrigido:

### 1. **Menu Completo Restaurado**
- **Problema**: Filtro estava removendo "Pet Collection" e outras categorias
- **Solução**: Adicionados links fixos para todas as páginas principais:
  - Collections (link fixo)
  - Napkin Rings (link fixo)
  - Table Essentials (link fixo)
  - Home Accents (link fixo)
  - Accessories (link fixo)
  - Pet Collection (link fixo)
- **Resultado**: Todas as páginas aparecem no menu novamente

## 🔴 Problema Principal: Produtos Não Aparecem

### **Causa Raiz:**
Os produtos não aparecem porque:
1. **Produtos podem não estar no banco PostgreSQL** (ainda estão no Sanity)
2. **Produtos podem ter categoria/coleção incorreta** no banco
3. **Produtos podem estar com `active = 0`** (inativos)

### **Como cada página busca produtos:**

#### **Pet Collection** (`/pet-collection`)
- Busca produtos com `category = 'pet-collection'` E `active = 1`
- **Verificar no admin**: Produtos devem ter `category = "pet-collection"`

#### **Napkin Rings** (`/napkin-rings`)
- Busca produtos com `collection` contendo "napkin" E `active = 1`
- **Verificar no admin**: Produtos devem ter `collection = "Napkin Rings"` (ou similar)

#### **Accessories** (`/accessories`)
- Busca produtos com `category = 'bags-accessories'` E `active = 1`
- **Verificar no admin**: Produtos devem ter `category = "bags-accessories"`

#### **Table Essentials** (`/table-essentials`)
- Busca produtos com `collection` em: "Tablecloth", "Table Runner", "Cocktail Napkin", "Coaster"
- **Verificar no admin**: Produtos devem ter `collection` correspondente

#### **Home Accents** (`/home-accents`)
- Busca produtos com `collection` em: "Cushion", "Hand Towel"
- **Verificar no admin**: Produtos devem ter `collection` correspondente

## 🎯 O que você precisa fazer AGORA:

### **1. Verificar se os produtos estão no banco**
1. Acesse `admin.ileala.ae`
2. Vá em **Produtos**
3. Verifique se há produtos cadastrados
4. Se não houver, você precisa **migrar os produtos do Sanity para o PostgreSQL**

### **2. Verificar categoria/coleção de cada produto**
Para cada produto que deve aparecer:

#### **Pet Collection:**
- `category` deve ser `"pet-collection"` (exato)
- `active` deve ser `1`

#### **Napkin Rings:**
- `collection` deve conter `"napkin"` ou `"Napkin Rings"`
- `active` deve ser `1`

#### **Accessories:**
- `category` deve ser `"bags-accessories"` (exato)
- `active` deve ser `1`

#### **Table Essentials:**
- `collection` deve ser uma dessas: `"Tablecloth"`, `"Table Runner"`, `"Cocktail Napkin"`, `"Coaster"`
- `active` deve ser `1`

#### **Home Accents:**
- `collection` deve ser uma dessas: `"Cushion"`, `"Hand Towel"`
- `active` deve ser `1`

### **3. Verificar imagens**
- Cada produto deve ter `imageUrl` preenchido
- Se não tiver, faça upload da imagem no painel admin

### **4. Verificar preços**
- Preços devem estar em **AED** (ex: 360.00)
- O sistema converte automaticamente para fils (36000)

## 🚨 Se os produtos não estão no banco:

Você precisa **migrar os dados do Sanity para o PostgreSQL**. Opções:

### **Opção 1: Migração Manual (Recomendado)**
1. Acesse o Sanity Studio (se ainda estiver acessível)
2. Copie os dados de cada produto
3. Crie os produtos no painel admin (`admin.ileala.ae`)

### **Opção 2: Script de Migração**
- Posso criar um script para migrar automaticamente do Sanity para PostgreSQL
- Mas preciso de acesso ao Sanity API

## 📋 Checklist Rápido:

- [ ] Verificar se há produtos no banco (`admin.ileala.ae`)
- [ ] Para cada produto, verificar `category` e `collection` estão corretos
- [ ] Verificar `active = 1` para produtos que devem aparecer
- [ ] Verificar `imageUrl` está preenchido
- [ ] Verificar preços estão em AED
- [ ] Testar cada página após correções

## ⚠️ Importante:

O código está correto agora. O problema é que **os dados não estão no banco PostgreSQL** ou estão com **categoria/coleção incorreta**.

Você precisa:
1. **Migrar produtos do Sanity para PostgreSQL** (se ainda não fez)
2. **Corrigir categoria/coleção de cada produto** no painel admin
3. **Garantir que produtos estão ativos** (`active = 1`)

