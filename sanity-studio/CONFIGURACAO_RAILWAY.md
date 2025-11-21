# 🚂 Configuração do Sanity Studio no Railway

**Data:** 21 de Novembro de 2025  
**Status:** ⚠️ Em configuração

---

## 📋 O QUE FOI CRIADO

### Arquivos de Configuração:

1. **`railway.json`** - Configuração do Railway
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`

2. **`nixpacks.toml`** - Configuração do Nixpacks
   - Define fases de build e start

3. **`.npmrc`** - Configuração do npm
   - Desabilita frozen-lockfile (similar ao ileala-website)

4. **`package.json`** - Atualizado
   - Adicionado script `start` para produção
   - Adicionada dependência `serve`

---

## 🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

No Railway Dashboard → Service: `ileala-sanity-studio` → Variables:

### 🔴 OBRIGATÓRIAS

- [ ] **`SANITY_STUDIO_PROJECT_ID`** = `anyz9zel`
  - **Status:** ⚠️ Adicionar
  - **Onde encontrar:** Sanity Dashboard → Project Settings
  - **Nota:** Mesmo valor de `VITE_SANITY_PROJECT_ID` do ileala-website

- [ ] **`SANITY_STUDIO_DATASET`** = `production`
  - **Status:** ⚠️ Adicionar
  - **Onde encontrar:** Sanity Dashboard → Datasets
  - **Nota:** Mesmo valor de `VITE_SANITY_DATASET` do ileala-website

- [ ] **`NODE_ENV`** = `production`
  - **Status:** ⚠️ Adicionar
  - **Nota:** Mesmo padrão do ileala-website

- [ ] **`PORT`** = (Railway define automaticamente)
  - **Status:** ✅ Automático
  - **Nota:** Railway injeta automaticamente

### 🟡 OPCIONAIS (Mas Recomendadas)

- [ ] **`SANITY_STUDIO_PREVIEW_URL`** = `https://www.ileala.ae`
  - **Status:** ⚠️ Adicionar (opcional)
  - **O que faz:** URL para preview visual no Sanity Studio
  - **Nota:** Se não configurado, usa `https://ileala.ae` como padrão

---

## 📝 PASSOS PARA CONFIGURAR

### 1. Adicionar Variáveis de Ambiente

No Railway Dashboard:

1. Vá em: **Service: `ileala-sanity-studio`** → **Variables**
2. Clique em **"+ New Variable"**
3. Adicione cada variável:
   - `SANITY_STUDIO_PROJECT_ID` = `anyz9zel`
   - `SANITY_STUDIO_DATASET` = `production`
   - `NODE_ENV` = `production`
   - `SANITY_STUDIO_PREVIEW_URL` = `https://www.ileala.ae` (opcional)

### 2. Fazer Commit e Push

```bash
cd sanity-studio
git add railway.json nixpacks.toml .npmrc package.json
git commit -m "feat: configure Sanity Studio for Railway deployment"
git push
```

### 3. Monitorar o Deploy

No Railway Dashboard:

1. Vá em: **Service: `ileala-sanity-studio`** → **Deployments**
2. Monitore o build mais recente
3. Verifique os logs:
   - **Build Logs:** Deve mostrar `npm run build` completando
   - **Deploy Logs:** Deve mostrar `serve` iniciando

### 4. Verificar o Resultado

Após deploy bem-sucedido:

1. Acesse o domínio do Railway para o Sanity Studio
2. Deve mostrar a interface do Sanity Studio
3. Você pode fazer login e editar conteúdo

---

## 🔍 TROUBLESHOOTING

### Erro: "Cannot find module 'serve'"

**Causa:** Dependência não instalada

**Solução:**
- Verifique se `package.json` tem `"serve": "^14.2.3"` em dependencies
- O build deve instalar automaticamente

### Erro: "Build directory not found"

**Causa:** `sanity build` não gerou o diretório `dist`

**Solução:**
1. Verifique Build Logs no Railway
2. Procure por erros durante `npm run build`
3. Verifique se `SANITY_STUDIO_PROJECT_ID` está correto

### Erro: "Port already in use"

**Causa:** Conflito de porta (improvável no Railway)

**Solução:**
- Railway injeta `PORT` automaticamente
- Não precisa configurar manualmente

### Sanity Studio não carrega

**Causa:** Variáveis de ambiente faltando ou incorretas

**Solução:**
1. Verifique se `SANITY_STUDIO_PROJECT_ID` está correto
2. Verifique se `SANITY_STUDIO_DATASET` está correto
3. Verifique logs do Railway para erros

---

## 📚 COMO FUNCIONA

### Fluxo de Deploy:

1. **Build:**
   - `npm install` - Instala dependências
   - `npm run build` - Executa `sanity build`
   - Gera arquivos estáticos em `dist/`

2. **Deploy:**
   - `npx serve -s dist -l $PORT` - Serve arquivos estáticos
   - `-s` = Single Page Application (SPA) mode
   - `-l $PORT` = Escuta na porta definida pelo Railway

### Estrutura Após Build:

```
sanity-studio/
├── dist/              # Arquivos estáticos gerados
│   ├── index.html
│   ├── static/
│   └── ...
├── package.json
└── ...
```

---

## ✅ CHECKLIST FINAL

- [x] `railway.json` criado
- [x] `nixpacks.toml` criado
- [x] `.npmrc` criado
- [x] `package.json` atualizado (script `start` e dependência `serve`)
- [ ] Variáveis de ambiente adicionadas no Railway
- [ ] Commit e push realizados
- [ ] Deploy monitorado
- [ ] Sanity Studio acessível

---

## 🎯 PRÓXIMOS PASSOS

1. **Adicionar variáveis de ambiente** no Railway
2. **Fazer commit e push** das mudanças
3. **Monitorar deploy** no Railway
4. **Testar acesso** ao Sanity Studio

---

**Última atualização:** 21 de Novembro de 2025, 14:30  
**Status:** ⚠️ Aguardando configuração de variáveis e deploy

