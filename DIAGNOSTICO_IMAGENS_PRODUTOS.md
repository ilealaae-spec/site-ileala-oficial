# 🔍 Diagnóstico: Imagens e Produtos Não Aparecendo

## 📋 Problemas Relatados

1. ❌ Foto do produto da coleção La Mer sumiu
2. ❌ Foto do pet collection sumiu
3. ❌ Todos os produtos do napkin rings sumiram

## 🔍 Possíveis Causas

### 1. Imagens Não Carregando

**Causas possíveis:**
- URLs do S3 incorretas ou expiradas
- Problemas de CORS no S3
- Imagens não foram enviadas para o S3
- `imageUrl` vazio ou null no banco de dados

**Como verificar:**
1. Abrir DevTools (F12) → Console
2. Verificar erros de carregamento de imagem
3. Verificar Network tab → ver se requisições para S3 estão falhando
4. Verificar se URLs começam com `https://ileala-uploads.s3.us-east-1.amazonaws.com/`

### 2. Produtos Não Aparecendo (Napkin Rings)

**Causas possíveis:**
- Nome da coleção no banco não corresponde ao filtro
- Produtos estão inativos (`active = 0`)
- Filtro muito restritivo

**Como verificar:**
1. Painel admin → Produtos
2. Verificar se há produtos com `collection = "Napkin Rings"` (exatamente assim)
3. Verificar se `active = 1`
4. Verificar se `imageUrl` está preenchido

### 3. Coleção La Mer

**Causas possíveis:**
- Nome da coleção no banco não corresponde ao slug (`la-mer` → `La Mer`)
- Produtos não têm `collection` definido como "La Mer"
- Produtos estão inativos

**Como verificar:**
1. Painel admin → Produtos
2. Verificar se há produtos com `collection = "La Mer"` (exatamente assim)
3. Verificar se `active = 1`
4. Verificar se `imageUrl` está preenchido

## ✅ Correções Aplicadas

### 1. Filtro Napkin Rings Melhorado
- Agora aceita variações: "napkin", "napkin ring"
- Mais flexível para encontrar produtos

### 2. Logs de Debug de Imagens
- LazyImage agora mostra URL da imagem quando falha
- Console mostra detalhes do erro

### 3. Filtro de Produtos Ativos
- `getProductsByCollection` agora filtra apenas `active = 1`
- `getProductsByCategory` agora filtra apenas `active = 1`

## 🛠️ Próximos Passos

### 1. Verificar Dados no Painel Admin

**Acesse `admin.ileala.ae` e verifique:**

#### Para Napkin Rings:
1. Vá em Produtos
2. Procure produtos que deveriam estar em Napkin Rings
3. Verifique:
   - `collection` está definido? (deve ser "Napkin Rings" ou similar)
   - `active = 1`?
   - `imageUrl` está preenchido?

#### Para La Mer:
1. Vá em Produtos
2. Procure produtos da coleção La Mer
3. Verifique:
   - `collection = "La Mer"` (exatamente assim, com maiúsculas)
   - `active = 1`?
   - `imageUrl` está preenchido?

#### Para Pet Collection:
1. Vá em Produtos
2. Procure produtos da pet collection
3. Verifique:
   - `category = "pet-collection"` (exatamente assim)
   - `active = 1`?
   - `imageUrl` está preenchido?

### 2. Verificar Imagens no S3

**Se imagens não carregam:**
1. Verificar se URLs no banco estão corretas
2. Verificar se bucket S3 está público ou tem CORS configurado
3. Testar URL diretamente no navegador

**URLs devem ser:**
```
https://ileala-uploads.s3.us-east-1.amazonaws.com/products/nome-do-arquivo.webp
```

### 3. Verificar Console do Navegador

**Após limpar cache:**
1. Abrir DevTools (F12) → Console
2. Verificar erros de imagens
3. Verificar Network tab → Imagens
4. Ver se há erros 403, 404, ou CORS

### 4. Corrigir Dados no Admin

**Se produtos não aparecem:**
1. Editar produto no admin
2. Definir `collection` corretamente:
   - La Mer → `collection = "La Mer"`
   - Napkin Rings → `collection = "Napkin Rings"`
3. Definir `category` corretamente:
   - Pet Collection → `category = "pet-collection"`
4. Garantir `active = 1`
5. Fazer upload de imagem se `imageUrl` estiver vazio

## 🔧 Solução Rápida

### Se Produtos Não Aparecem:

1. **Verificar no admin:**
   - Produtos têm `collection` ou `category` definido?
   - Produtos estão `active = 1`?

2. **Se não, corrigir:**
   - Editar cada produto no admin
   - Definir `collection` ou `category` corretamente
   - Garantir `active = 1`
   - Salvar

3. **Aguardar cache (5 minutos)**
   - Cache de produtos é de 5 minutos
   - Ou limpar cache do navegador

### Se Imagens Não Carregam:

1. **Verificar no admin:**
   - Produtos têm `imageUrl` preenchido?
   - URL está correta?

2. **Se não, corrigir:**
   - Editar produto no admin
   - Fazer upload de nova imagem
   - Salvar

3. **Verificar S3:**
   - Bucket está público?
   - CORS está configurado?
   - URLs estão corretas?

## 📝 Checklist de Verificação

- [ ] Produtos têm `collection` ou `category` definido corretamente?
- [ ] Produtos estão `active = 1`?
- [ ] Produtos têm `imageUrl` preenchido?
- [ ] URLs das imagens estão corretas (S3)?
- [ ] Bucket S3 está configurado corretamente?
- [ ] Console do navegador não mostra erros de CORS?
- [ ] Cache do navegador foi limpo?

## 🆘 Se Problemas Persistirem

1. **Verificar logs do Railway:**
   - Railway Dashboard → `ileala-website` → Deploy Logs
   - Verificar erros

2. **Verificar console do navegador:**
   - F12 → Console
   - Verificar erros de API ou imagens

3. **Testar URLs diretamente:**
   - Copiar URL da imagem do banco
   - Colar no navegador
   - Ver se carrega

4. **Verificar permissões S3:**
   - AWS Console → S3 → Bucket `ileala-uploads`
   - Verificar se está público ou tem CORS

