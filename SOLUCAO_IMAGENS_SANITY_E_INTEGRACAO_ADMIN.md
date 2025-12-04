# 🔧 Solução: Imagens do Sanity e Integração Admin → Site

## 🔴 Problemas Identificados:

### 1. **Imagens do Sanity**
- **Problema**: Produtos no banco ainda têm URLs do Sanity (`cdn.sanity.io`)
- **Causa**: Produtos foram migrados do Sanity mas as URLs das imagens não foram atualizadas
- **Sintoma**: Imagens não carregam, aparece "Failed to load image" com URL do Sanity

### 2. **Painel Admin Não Integrado**
- **Problema**: Produtos criados no admin não aparecem no site
- **Causa**: Produtos podem estar com `active = 0` ou sem `category`/`collection` corretos
- **Sintoma**: Produtos criados no admin não aparecem nas páginas do site

## ✅ Correções Aplicadas:

### 1. **Validação de URLs do Sanity**
- Adicionado aviso quando URL de imagem contém `cdn.sanity.io`
- Sistema avisa: "Warning: Image URL is from Sanity. Please upload a new image to S3."

### 2. **Produtos Ativos por Padrão**
- Produtos criados no admin agora têm `active = 1` por padrão
- Campo "Active" adicionado no formulário (sempre marcado para novos produtos)
- Backend garante que novos produtos sempre têm `active = 1`

### 3. **Campo Active no Formulário**
- Novo campo checkbox "Active (visible on site)" no formulário
- Para novos produtos: sempre marcado e desabilitado (sempre ativo)
- Para produtos existentes: pode ser editado para ativar/desativar

## 🎯 O que você precisa fazer:

### **1. Corrigir Imagens do Sanity**

Para cada produto que tem imagem do Sanity:

#### **Opção A: Upload Manual (Recomendado)**
1. Acesse `admin.ileala.ae`
2. Vá em **Produtos**
3. Encontre o produto com imagem do Sanity (o sistema avisará)
4. Clique em **Editar**
5. Faça upload de uma nova imagem (será salva no S3)
6. Salve o produto

#### **Opção B: Verificar se a imagem existe no S3**
1. Se você já fez upload da imagem para S3 antes
2. Copie a URL do S3
3. Cole no campo "Image URL" do produto
4. Salve

### **2. Verificar Produtos que Não Aparecem**

Para produtos que não aparecem no site:

1. Acesse `admin.ileala.ae` → **Produtos**
2. Encontre o produto que não aparece
3. Clique em **Editar**
4. Verifique:
   - ✅ **Active** está marcado? (deve estar)
   - ✅ **Category** está preenchido? (se for categoria específica)
   - ✅ **Collection** está preenchido? (se for coleção específica)
5. Se não estiver, preencha e salve

### **3. Verificar Produtos da Coleção "La Mer"**

Para produtos da coleção "La Mer" não aparecerem:

1. Acesse `admin.ileala.ae` → **Produtos**
2. Encontre produtos que devem estar em "La Mer"
3. Verifique se `collection = "La Mer"` (exato, com maiúsculas)
4. Verifique se `active = 1`
5. Verifique se `imageUrl` está preenchido (e não é do Sanity)

## 📋 Checklist de Verificação:

### **Para cada produto no admin:**

- [ ] `active = 1` (produto ativo)
- [ ] `imageUrl` não contém `cdn.sanity.io` (se contém, fazer upload novo)
- [ ] `category` preenchido (se produto deve aparecer em página de categoria)
- [ ] `collection` preenchido corretamente (ex: "La Mer", "Napkin Rings")
- [ ] `price` está em AED (ex: 580.00 = 58000 fils no banco)

### **Para produtos da "La Mer":**

- [ ] `collection = "La Mer"` (exato, com maiúsculas)
- [ ] `active = 1`
- [ ] `imageUrl` preenchido e não é do Sanity
- [ ] Imagem carrega corretamente no site

## 🚨 Importante:

### **URLs do Sanity não funcionam mais!**
- O Sanity foi desativado
- URLs `cdn.sanity.io` não carregam mais
- **Você DEVE fazer upload de novas imagens para S3**

### **Produtos criados no admin agora aparecem automaticamente:**
- Novos produtos têm `active = 1` por padrão
- Aparecem imediatamente no site (após cache limpar)
- Não precisa mais verificar manualmente

## 🔍 Como Identificar Produtos com Problemas:

### **No Painel Admin:**
1. Vá em **Produtos**
2. Procure por produtos que:
   - Têm `imageUrl` vazio
   - Têm `imageUrl` contendo `cdn.sanity.io`
   - Têm `active = 0` (se você desativou manualmente)

### **No Site:**
1. Acesse páginas de coleção/categoria
2. Se produtos não aparecem, verifique no admin:
   - `active = 1`?
   - `collection`/`category` correto?
   - `imageUrl` preenchido?

## 🚀 Próximos Passos:

1. **Aguarde o deploy** (Railway deve detectar o commit automaticamente)
2. **Limpe o cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Teste criar um novo produto** no admin - deve aparecer no site
4. **Corrija imagens do Sanity** - faça upload de novas imagens para S3
5. **Verifique produtos existentes** - garanta que estão ativos e com dados corretos

