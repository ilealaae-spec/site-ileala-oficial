# Correção do Deployment no Vercel

## Problema Identificado

O Vercel estava falhando com o erro:
```
The specified Root Directory "ileala-website/" does not exist. 
Please update your Project Settings.
```

## Causa Raiz

O repositório tem a seguinte estrutura:
```
site-ileala-oficial/           ← Raiz do repositório
├── ileala-website/           ← Código do site (Vite + React)
├── sanity-studio/            ← Código do Sanity CMS
├── package.json              ← Package.json na raiz
└── outros arquivos...
```

O Vercel estava configurado com:
- **Root Directory**: `ileala-website/`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/public`

**Problema:** O Vercel estava tentando rodar `pnpm run build` na raiz, mas o `package.json` correto está dentro de `ileala-website/`!

## Tentativas de Solução

### Tentativa 1: vercel.json na raiz ❌
Criado `vercel.json` na raiz com `buildCommand`, `outputDirectory` e `installCommand`.
**Resultado:** Não funcionou - essas propriedades não são suportadas no vercel.json.

### Tentativa 2: package.json na raiz com scripts ✅
Atualizado o `package.json` na raiz com scripts que delegam para `ileala-website/`:

```json
{
  "name": "site-ileala-oficial",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "cd ileala-website && npm install && npm run build",
    "dev": "cd ileala-website && npm run dev",
    "preview": "cd ileala-website && npm run preview"
  },
  "dependencies": {
    "postgres": "^3.4.7",
    "resend": "^6.4.2"
  },
  "workspaces": [
    "ileala-website",
    "sanity-studio"
  ]
}
```

## Solução Final

### 1. Package.json na Raiz
O `package.json` na raiz agora tem um script `build` que:
1. Entra na pasta `ileala-website`
2. Instala as dependências
3. Roda o build

### 2. Configurações do Vercel
As configurações do Vercel devem ser:
- **Root Directory**: *(vazio - deixar em branco)*
- **Build Command**: `npm run build` *(ou deixar no padrão)*
- **Output Directory**: `ileala-website/dist/public`
- **Install Command**: *(padrão - npm install)*

## Commits Realizados

1. `fix: add root vercel.json to configure build correctly` (55077626)
   - Tentativa inicial com vercel.json (não funcionou)
   
2. `fix: update root package.json with build script for Vercel` (7e28968c)
   - ✅ Solução correta com package.json na raiz

## Próximos Passos

1. ✅ Commit e push realizados
2. ⏳ Aguardar Vercel detectar o push e fazer novo deployment
3. ⏳ Verificar se o deployment foi bem-sucedido
4. ⏳ Testar o site no domínio do Vercel
5. ⏳ Verificar a funcionalidade da newsletter
6. ⏳ Corrigir link do Instagram
7. ⏳ Configurar domínio ileala.ae

## Environment Variables Configuradas

- VITE_APP_TITLE
- VITE_SANITY_PROJECT_ID
- VITE_SANITY_DATASET
- SITE_URL
- RESEND_API_KEY
- DATABASE_URL (do Render)

## Status Atual

🟡 **Aguardando novo deployment no Vercel**

- **Data**: 2025-11-15
- **Hora**: 00:43 GMT-3
- **Último Commit**: 7e28968c
- **Aguardando**: Novo deployment no Vercel

---

**Observação:** Se o deployment ainda falhar, verificar:
1. Se o Output Directory está configurado como `ileala-website/dist/public`
2. Se o Root Directory está vazio (não configurado)
3. Logs de build no Vercel para identificar o erro específico
