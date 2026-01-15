# 🧪 Como Testar as Cores

Guia passo a passo para testar as novas cores localmente e depois fazer deploy.

---

## 🚀 Opção 1: Testar Localmente (Recomendado)

### Passo 1: Iniciar o Servidor de Desenvolvimento

No terminal, execute:

```bash
cd /Users/elmabichara/site-ileala-oficial/ileala-website
pnpm dev
```

Ou se preferir npm:

```bash
cd /Users/elmabichara/site-ileala-oficial/ileala-website
npm run dev
```

### Passo 2: Acessar o Site

1. **Aguarde** o servidor iniciar (você verá uma URL como `http://localhost:5173`)
2. **Abra no navegador:** `http://localhost:5173`

### Passo 3: Verificar as Cores

**Site Oficial:**
- ✅ Verifique se os botões e links estão com verde `#255238`
- ✅ Verifique se os textos estão com cor `#214430`
- ✅ Navegue pelas páginas e verifique consistência

**Painel Admin:**
1. **Acesse:** `http://localhost:5173/login`
2. **Faça login:**
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla@2025`
3. **Use código de backup 2FA:** (ex: `E30C-081A`)
4. **Verifique:**
   - ✅ Sidebar verde `#214430`
   - ✅ Botões verdes `#26553a`
   - ✅ Textos brancos na sidebar

---

## 🌐 Opção 2: Fazer Deploy e Testar em Produção

### Passo 1: Fazer Commit e Push

```bash
cd /Users/elmabichara/site-ileala-oficial
git add .
git commit -m "feat: Atualizar cores do site e painel admin

- Site oficial: verde #255238, letras #214430
- Painel admin: sidebar #214430, botões #26553a
- Ajustar textos da sidebar para branco"
git push
```

### Passo 2: Aguardar Deploy no Railway

1. **Acesse:** https://railway.app
2. **Vá para seu projeto**
3. **Acompanhe o deploy** em "Deployments"
4. **Aguarde 2-5 minutos** para completar

### Passo 3: Testar em Produção

**Site Oficial:**
- ✅ Acesse: https://www.ileala.ae
- ✅ Verifique as cores

**Painel Admin:**
- ✅ Acesse: https://admin.ileala.ae/login
- ✅ Faça login e verifique as cores

---

## 🎨 O Que Verificar

### Site Oficial:
- [ ] Botões primários estão verdes `#255238`
- [ ] Links e hover states estão verdes `#255238`
- [ ] Textos estão com cor `#214430`
- [ ] Elementos de destaque estão verdes

### Painel Admin:
- [ ] Sidebar está verde `#214430`
- [ ] Textos da sidebar estão brancos
- [ ] Botões estão verdes `#26553a`
- [ ] Links ativos estão com fundo `#26553a`
- [ ] Hover states funcionam corretamente

---

## 🔧 Se Algo Não Estiver Correto

1. **Limpar cache do navegador:**
   - `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
   
2. **Verificar console do navegador:**
   - `F12` → Console
   - Verificar erros

3. **Verificar se o CSS foi carregado:**
   - `F12` → Network → Recarregar
   - Verificar se `index.css` foi carregado

---

## ✅ Próximos Passos

1. **Teste localmente primeiro** (Opção 1)
2. **Se estiver tudo certo, faça deploy** (Opção 2)
3. **Teste em produção**

---

**Vamos começar testando localmente?** 🚀

