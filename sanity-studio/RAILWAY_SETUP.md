# ✅ Configuração Railway para Sanity Studio

## ⚠️ IMPORTANTE: Configurar Root Directory

O Railway precisa saber que o código está na pasta `sanity-studio/`.

### Passos:

1. **Railway Dashboard** → Service: `ileala-sanity-studio`
2. **Settings** → **Root Directory**
3. Defina: `sanity-studio`
4. **Save**

---

## 📋 Variáveis de Ambiente Necessárias

No Railway, service `ileala-sanity-studio` → **Variables**:

- `SANITY_STUDIO_PROJECT_ID` = `anyz9zel`
- `SANITY_STUDIO_DATASET` = `production`
- `SANITY_STUDIO_PREVIEW_URL` = `https://www.ileala.ae`
- `PORT` = (deixar vazio - Railway define automaticamente)

---

## 🔧 Como Funciona

1. **Build:** Railway executa `npm install` (não `npm ci`) na pasta `sanity-studio/`
2. **Build:** Executa `npm run build` para gerar `dist/`
3. **Start:** Executa `npx serve -s dist -l $PORT` para servir os arquivos

---

## ✅ Verificação

Após configurar o Root Directory e fazer redeploy:

- ✅ Build deve completar sem erro `npm ci`
- ✅ Deploy deve iniciar corretamente
- ✅ Sanity Studio deve estar acessível na URL do Railway

---

**Última atualização:** 21 de Novembro de 2025

