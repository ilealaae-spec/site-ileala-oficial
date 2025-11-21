# ✅ Configuração Root Directory - Sanity Studio

## 📍 O que configurar

### ✅ CORRETO:
- **Root Directory:** `/sanity-studio`
- **Nome do Serviço:** `ileala-sanity-studio` (já está correto)

### ❌ INCORRETO:
- **Root Directory:** `ileala-sanity-studio` (NÃO é isso!)
- **Root Directory:** `/` (raiz do repositório)

---

## 🔧 Como configurar no Railway

### Passo 1: Acessar Settings
1. Railway Dashboard
2. Service: **ileala-sanity-studio**
3. Aba: **Settings**

### Passo 2: Configurar Root Directory
1. Procure a seção **"Root Directory"**
2. No campo de texto, digite: `/sanity-studio`
3. Ou selecione do dropdown se aparecer
4. Clique em **Save**

---

## ✅ Verificação

Após configurar, você deve ver:
- ✅ Root Directory: `/sanity-studio`
- ✅ Build deve encontrar `package.json` em `/sanity-studio/package.json`
- ✅ Build deve encontrar `railway.json` em `/sanity-studio/railway.json`

---

## 🐛 Se não aparecer no dropdown

1. **Digite manualmente:** `/sanity-studio`
2. **Verifique se o commit foi feito:** O Railway precisa do código no repositório
3. **Force redeploy:** Após salvar, force um novo deploy

---

## 📁 Estrutura esperada

```
site-ileala-oficial/          ← Raiz do repositório
├── ileala-website/           ← Outro serviço
└── sanity-studio/            ← Root Directory deste serviço
    ├── package.json           ✅ Deve estar aqui
    ├── railway.json          ✅ Deve estar aqui
    ├── nixpacks.toml         ✅ Deve estar aqui
    ├── Dockerfile            ✅ Deve estar aqui
    └── ...
```

---

**Última atualização:** 21 de Novembro de 2025

