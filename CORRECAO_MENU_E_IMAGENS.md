# 🔧 Correção: Menu Duplicado e Imagens

## ✅ O que foi corrigido:

### 1. **Menu "Collections" Duplicado**
- **Problema**: Havia uma categoria "Collections" no banco que aparecia no menu, mas já existe um link fixo `/collections`
- **Solução**: Filtro adicionado no `Header.tsx` para excluir categorias que contenham "collection" no nome/slug
- **Resultado**: Agora só aparece o link fixo "Collections" no menu

### 2. **Melhoria no Carregamento de Imagens**
- **Problema**: Imagens não apareciam ou causavam layout shift
- **Solução**: 
  - `CategoryPage.tsx` agora usa `LazyImage` (já tinha `aspect-square`)
  - Consistência com outras páginas

## 🎯 O que você precisa fazer no Painel Admin:

### **1. Remover/Desativar Categoria "Collections"**
1. Acesse `admin.ileala.ae`
2. Vá em **Categorias**
3. Encontre a categoria "Collections" (ou "Coleções")
4. **Desative** ela (mude `active` para `0`) ou **delete** ela

### **2. Verificar Imagens dos Produtos**
1. Vá em **Produtos**
2. Para cada produto que não mostra imagem:
   - Clique em **Editar**
   - Verifique se há uma imagem no campo "Image URL"
   - Se não houver, faça upload de uma nova imagem
   - Salve

### **3. Organizar Produtos por Categoria/Coleção**

#### **Para "Napkin Rings":**
- Verifique se os produtos têm `collection = "Napkin Rings"` (ou similar)
- Se não tiverem, edite e defina a coleção correta

#### **Para "La Mer":**
- Verifique se os produtos têm `collection = "La Mer"` (ou similar)
- Verifique se as imagens estão carregadas

#### **Para "Pet Collection":**
- Verifique se os produtos têm `category = "pet-collection"` (ou slug similar)
- Verifique se as imagens estão carregadas

### **4. Verificar Preços**
- Os preços devem estar em **fils** (ex: 36000 = 360.00 AED)
- Se você digitar `360.00` no painel, o sistema converte para `36000` automaticamente
- Verifique se os preços estão corretos

### **5. Verificar Status Ativo**
- Todos os produtos que devem aparecer no site devem ter `active = 1`
- Produtos com `active = 0` não aparecem no site público

## 📋 Checklist Rápido:

- [ ] Remover/desativar categoria "Collections" duplicada
- [ ] Verificar imagens de todos os produtos
- [ ] Fazer upload de imagens faltantes
- [ ] Verificar coleção "Napkin Rings" está correta
- [ ] Verificar coleção "La Mer" está correta
- [ ] Verificar categoria "Pet Collection" está correta
- [ ] Verificar preços estão em AED (não em fils)
- [ ] Verificar produtos estão com `active = 1`

## 🚀 Próximos Passos:

1. **Aguarde o deploy** (Railway deve detectar o commit automaticamente)
2. **Limpe o cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Teste o site** após o deploy
4. **Organize os dados** no painel admin conforme o checklist acima

## ⚠️ Importante:

- O link fixo `/collections` no menu **deve permanecer** (é a página principal de coleções)
- A categoria "Collections" no banco **não deve aparecer** no menu (foi filtrada)
- Se você quiser que "Collections" apareça como categoria, renomeie para algo diferente (ex: "All Collections")

