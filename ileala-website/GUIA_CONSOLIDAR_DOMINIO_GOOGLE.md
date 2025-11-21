# 🔍 Guia: Consolidar Domínio no Google (Resolver 3 Sites)

## 🎯 Problema

O Google está indexando múltiplas versões do site:
- `http://ileala.ae` (sem HTTPS - cadeado preto)
- `https://ileala.ae` (sem www)
- `https://www.ileala.ae` (versão correta ✅)

Isso causa:
- ❌ Divisão de autoridade entre versões
- ❌ Confusão para o Google sobre qual é a versão principal
- ❌ Cadeado preto (não seguro) em algumas versões

---

## ✅ Soluções Implementadas

### 1. Redirecionamentos Automáticos (301)
- ✅ `http://ileala.ae` → `https://www.ileala.ae` (força HTTPS)
- ✅ `https://ileala.ae` → `https://www.ileala.ae` (força www)
- ✅ Todas as versões redirecionam para `https://www.ileala.ae`

### 2. Canonical URLs
- ✅ Todas as páginas usam `https://www.ileala.ae` como URL canônica
- ✅ Meta tags Open Graph sempre usam `www.ileala.ae`

### 3. Arquivos SEO
- ✅ `robots.txt` configurado com domínio preferido
- ✅ `sitemap.xml` atualizado para usar `www.ileala.ae`

---

## 📋 Passos no Google Search Console

### PASSO 1: Acessar Google Search Console

1. Acesse: https://search.google.com/search-console
2. Faça login com sua conta Google
3. Selecione a propriedade `ileala.ae` (ou adicione se não tiver)

---

### PASSO 2: Configurar Domínio Preferido

1. No menu lateral, clique em **"Configurações"** (Settings)
2. Clique em **"Domínio preferido"** (Preferred domain)
3. Selecione: **`Exibir URLs como www.ileala.ae`**
4. Clique em **"Salvar"**

**O que isso faz:**
- Diz ao Google que `www.ileala.ae` é a versão preferida
- Google começará a consolidar todas as versões para `www`

---

### PASSO 3: Enviar Sitemap Atualizado

1. No menu lateral, clique em **"Sitemaps"**
2. Se já houver um sitemap antigo, **remova-o** (se usar `ileala.ae`)
3. Adicione novo sitemap: `https://www.ileala.ae/sitemap.xml`
4. Clique em **"Enviar"** (Submit)

**O que isso faz:**
- Google indexará todas as páginas usando `www.ileala.ae`
- Ajuda a consolidar as versões

---

### PASSO 4: Solicitar Reindexação (Opcional)

1. No menu lateral, clique em **"Inspeção de URL"** (URL Inspection)
2. Digite: `https://www.ileala.ae`
3. Clique em **"Solicitar indexação"** (Request Indexing)
4. Repita para páginas importantes:
   - `https://www.ileala.ae/`
   - `https://www.ileala.ae/shop`
   - `https://www.ileala.ae/collections`

**O que isso faz:**
- Força o Google a reindexar usando a versão correta
- Acelera o processo de consolidação

---

### PASSO 5: Verificar Redirecionamentos

1. No menu lateral, clique em **"Cobertura"** (Coverage)
2. Verifique se há erros de redirecionamento
3. Se houver URLs antigas (`ileala.ae` sem www), o Google deve detectar os redirecionamentos 301

**O que esperar:**
- Após alguns dias, o Google começará a consolidar
- URLs antigas serão marcadas como "redirecionadas"
- Apenas `www.ileala.ae` aparecerá nos resultados

---

## ⏳ Tempo de Consolidação

**Tempo esperado:**
- **Mínimo:** 1-2 semanas
- **Típico:** 2-4 semanas
- **Máximo:** 1-2 meses

**Por que demora?**
- Google precisa reindexar todas as páginas
- Precisa detectar os redirecionamentos 301
- Precisa consolidar histórico de links

---

## 🔍 Como Verificar Progresso

### 1. Verificar no Google Search Console

1. Acesse: **"Cobertura"** → **"Páginas válidas"**
2. Verifique se URLs usam `www.ileala.ae`
3. URLs antigas devem aparecer como "redirecionadas"

### 2. Buscar no Google

1. Digite: `site:ileala.ae`
2. Verifique se resultados mostram `www.ileala.ae`
3. URLs sem `www` devem diminuir com o tempo

### 3. Verificar Redirecionamentos

Teste manualmente:
- `http://ileala.ae` → deve redirecionar para `https://www.ileala.ae`
- `https://ileala.ae` → deve redirecionar para `https://www.ileala.ae`
- `https://www.ileala.ae` → deve carregar normalmente

---

## ✅ Checklist Final

- [ ] Redirecionamentos 301 implementados ✅
- [ ] Canonical URLs configuradas ✅
- [ ] Sitemap.xml atualizado ✅
- [ ] Robots.txt configurado ✅
- [ ] Google Search Console: Domínio preferido configurado
- [ ] Google Search Console: Sitemap enviado
- [ ] Google Search Console: Reindexação solicitada (opcional)
- [ ] Aguardar 2-4 semanas para consolidação

---

## 🆘 Problemas Comuns

### "Ainda aparecem 3 sites no Google"

**Solução:**
- Aguarde mais tempo (pode levar até 2 meses)
- Verifique se redirecionamentos estão funcionando
- Solicite reindexação de páginas importantes

### "Cadeado preto ainda aparece"

**Solução:**
- Verifique se SSL está configurado corretamente
- Teste se `http://` redireciona para `https://`
- Aguarde propagação do certificado SSL

### "Google não detecta redirecionamentos"

**Solução:**
- Verifique se redirecionamentos são 301 (não 302)
- Teste manualmente os redirecionamentos
- Aguarde alguns dias para Google detectar

---

## 📝 Notas Importantes

1. **Não delete URLs antigas no Search Console**
   - Deixe o Google consolidar naturalmente
   - Redirecionamentos 301 são suficientes

2. **Mantenha redirecionamentos ativos**
   - Não remova os redirecionamentos do código
   - Eles são necessários permanentemente

3. **Monitore regularmente**
   - Verifique Search Console semanalmente
   - Acompanhe progresso de consolidação

---

## 🎉 Resultado Esperado

Após consolidação completa:
- ✅ Apenas `https://www.ileala.ae` aparece no Google
- ✅ Todas as versões redirecionam corretamente
- ✅ Cadeado verde em todas as URLs
- ✅ Melhor SEO e autoridade de domínio

