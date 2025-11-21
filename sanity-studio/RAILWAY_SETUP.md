# ✅ Configuração Railway para Sanity Studio

## ⚠️ IMPORTANTE: Configurar Root Directory

O Railway precisa saber que o código está na pasta `sanity-studio/`.

### Passos OBRIGATÓRIOS:

1. **Railway Dashboard** → Service: `ileala-sanity-studio`
2. **Settings** → **Root Directory**
3. Defina: `sanity-studio`
4. **Save**

**SEM ISSO, O BUILD VAI FALHAR!**

---

## 🔧 Opções de Build

O Railway tentará usar nesta ordem:
1. **Dockerfile** (se existir) - ✅ Criado
2. **nixpacks.toml** (se existir) - ✅ Criado
3. **railway.json** (se existir) - ✅ Criado
4. Detecção automática

---

## 📋 Variáveis de Ambiente Necessárias

No Railway, service `ileala-sanity-studio` → **Variables**:

- `SANITY_STUDIO_PROJECT_ID` = `anyz9zel`
- `SANITY_STUDIO_DATASET` = `production`
- `SANITY_STUDIO_PREVIEW_URL` = `https://www.ileala.ae`
- `PORT` = (deixar vazio - Railway define automaticamente)

---

## 🔄 Se o Build Ainda Falhar

### Opção 1: Usar Dockerfile (Recomendado)

1. No Railway, service `ileala-sanity-studio`
2. **Settings** → **Build**
3. **Builder** → Selecione: `Dockerfile`
4. Force redeploy

### Opção 2: Usar Nixpacks

1. No Railway, service `ileala-sanity-studio`
2. **Settings** → **Build**
3. **Builder** → Selecione: `Nixpacks`
4. Force redeploy

---

## ✅ Verificação

Após configurar o Root Directory e fazer redeploy:

- ✅ Build deve completar sem erro `nix-env`
- ✅ Deploy deve iniciar corretamente
- ✅ Sanity Studio deve estar acessível na URL do Railway

---

## 🐛 Troubleshooting

### Erro: "nix-env failed"
- **Solução:** Configure o Root Directory como `sanity-studio`
- **Solução alternativa:** Use o Dockerfile (mude o builder no Railway)

### Erro: "package-lock.json not found"
- **Solução:** O `.npmrc` já está configurado para não gerar lockfile
- **Solução:** O build usa `npm install --legacy-peer-deps` diretamente

### Erro: "dist folder not found"
- **Solução:** Verifique se `npm run build` está executando corretamente
- **Solução:** Verifique os logs de build no Railway

---

**Última atualização:** 21 de Novembro de 2025
