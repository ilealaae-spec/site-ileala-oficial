# ✅ Próximos Passos no Railway

**Status:** Variável `NODE_VERSION=20.12.0` já adicionada ✅

---

## 📋 O QUE FAZER AGORA

### ✅ Passo 1: LIMPAR CACHE (IMPORTANTE!)

1. No Railway Dashboard → Service `site-ileala-oficial`
2. Vá em **Settings**
3. Role até a seção **Build Cache**
4. Clique em **Clear Build Cache**
5. Confirme a ação

**Por quê?** Remove referências antigas ao arquivo `embroidered-world-map.webp` que não existe mais e pode causar erro.

---

### ✅ Passo 2: FAZER DEPLOY

Você tem 2 opções:

#### Opção A: Deploy Automático (se já fez commit/push)
- Se você já fez `git push`, o Railway vai detectar automaticamente
- Aguarde o deploy iniciar

#### Opção B: Deploy Manual
1. No Railway Dashboard → Service `site-ileala-oficial`
2. Vá em **Deployments**
3. Clique em **Redeploy**
4. Aguarde o build completar

---

### ✅ Passo 3: VERIFICAR LOGS

Durante o build, verifique os logs:

1. Clique no deploy em andamento
2. Veja os **Build Logs**
3. Procure por:

**✅ SUCESSO:**
- `Node.js version: 20.12.0` (ou superior)
- `pnpm install` completou sem erros
- `pnpm run build` completou sem erros
- `Build completed successfully`

**❌ SE AINDA FALHAR:**
- Se ainda aparecer `crypto.hash is not a function` → O Node.js ainda está antigo
- Se aparecer erro sobre `embroidered-world-map.webp` → Cache não foi limpo corretamente

---

## ✅ CHECKLIST

- [x] Variável `NODE_VERSION=20.12.0` adicionada no Railway
- [ ] Cache do Railway foi limpo
- [ ] Commit e push das mudanças feitos
- [ ] Novo deploy foi iniciado
- [ ] Logs mostram Node.js 20.12.0+
- [ ] Build completou sem erros

---

## 🚨 SE AINDA DER ERRO

Se o build ainda falhar após limpar cache e fazer deploy:

1. **Verifique os logs** - veja qual erro específico aparece
2. **Me avise** - posso ajudar a diagnosticar
3. **Alternativa:** Podemos criar um Dockerfile como solução mais robusta

---

**Última atualização:** 23 de Novembro de 2025


