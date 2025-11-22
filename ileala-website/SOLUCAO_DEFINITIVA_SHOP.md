# ✅ Solução Definitiva: Página /shop Não Funciona

## ❌ Erro Identificado

```
Error: project user not found for user ID "g-FTfZkEhDRfrP" in project "anyz9zel"
401 Unauthorized
```

**Causa:** O token `VITE_SANITY_TOKEN` no Railway está inválido ou associado a um usuário que não existe.

---

## ✅ Solução Imediata

### Opção 1: Remover Token do Railway (Recomendado)

**Para leitura pública de produtos, o token NÃO é necessário!**

1. **Railway Dashboard** → Service: `ileala-website` → **Variables**
2. Encontre `VITE_SANITY_TOKEN`
3. Clique nos **3 pontos** (⋯) → **"Delete"**
4. Confirme a exclusão
5. **Force redeploy:**
   - Deployments → 3 pontos (⋯) → **"Redeploy"**
6. Aguarde o deploy concluir
7. Teste: `https://www.ileala.ae/shop`

**Resultado esperado:** Produtos devem carregar sem erro 401.

---

### Opção 2: Deixar Token Vazio

1. Railway Dashboard → Variables
2. Edite `VITE_SANITY_TOKEN`
3. Deixe o valor **vazio** ou coloque apenas um espaço
4. Salve
5. Force redeploy

---

## 🔍 Por Que Funciona Sem Token?

- ✅ **Leitura pública** de dados publicados no Sanity **não requer token**
- ✅ O token só é necessário para:
  - Preview de rascunhos
  - Operações de escrita
  - Acesso a dados privados
- ✅ Produtos publicados são acessíveis publicamente via CDN do Sanity

---

## 📋 Verificações Adicionais

### 1. Há Produtos no Sanity?

1. Acesse: https://www.sanity.io/manage/personal/project/anyz9zel/content
2. Verifique se há produtos criados
3. Se não houver, **crie alguns produtos de teste**
4. Certifique-se de que `inStock` está marcado como `true`

### 2. Variáveis Corretas no Railway?

- ✅ `VITE_SANITY_PROJECT_ID` = `anyz9zel`
- ✅ `VITE_SANITY_DATASET` = `production`
- ❌ `VITE_SANITY_TOKEN` = **DELETE ou deixe vazio**

---

## 🚀 Passos para Resolver

1. **Delete `VITE_SANITY_TOKEN` no Railway** ⚠️ **CRÍTICO**
2. **Force redeploy** no Railway
3. **Aguarde deploy concluir**
4. **Teste:** `https://www.ileala.ae/shop`
5. **Verifique console:** Não deve mais aparecer erro 401
6. **Se ainda não funcionar:** Verifique se há produtos no Sanity

---

## ✅ Após Remover o Token

O código agora:
- ✅ Verifica se o token é válido antes de usar
- ✅ Funciona sem token para leitura pública
- ✅ Mostra logs no console para diagnóstico
- ✅ Não causa erro 401 com token inválido

---

## 📝 Checklist Final

- [ ] `VITE_SANITY_TOKEN` deletado ou vazio no Railway
- [ ] Redeploy forçado no Railway
- [ ] Deploy concluído e "Active"
- [ ] Há produtos no Sanity com `inStock: true`
- [ ] Console não mostra mais erro 401
- [ ] Produtos carregam na página `/shop`

---

**Última atualização:** 21 de Novembro de 2025




