# 🔄 MIGRAÇÃO: AWS S3 → Cloudinary

**Data:** 4 de Dezembro de 2025

## 📋 SITUAÇÃO ATUAL

- ✅ Sistema tem suporte para Cloudinary (`storage-cloudinary.ts`)
- ❌ Sistema está usando AWS S3 (`storage.ts`)
- ❌ Imagens não aparecem no Cloudinary

## 🎯 OBJETIVO

Migrar o sistema de upload de imagens de AWS S3 para Cloudinary, para que:
- ✅ Imagens apareçam automaticamente no Cloudinary
- ✅ Fácil gerenciamento via dashboard do Cloudinary
- ✅ Transformações de imagem automáticas
- ✅ CDN global do Cloudinary

---

## ✅ PASSO 1: Configurar Variáveis de Ambiente no Railway

No Railway Dashboard → Service `ileala-website` → Variables:

Adicionar/Verificar:
- `CLOUDINARY_CLOUD_NAME` = `dbwoo62fx` (seu cloud name)
- `CLOUDINARY_API_KEY` = (sua API key)
- `CLOUDINARY_API_SECRET` = (seu API secret)

**Onde encontrar no Cloudinary:**
1. Cloudinary Dashboard → Settings → Product Environment
2. Copiar:
   - **Cloud name**: `dbwoo62fx`
   - **API Key**: (mostrar)
   - **API Secret**: (mostrar)

---

## ✅ PASSO 2: Mudar Import no Código

**Arquivo:** `ileala-website/server/routers.ts`

**Mudança:**
```typescript
// ANTES:
import { storagePut } from './storage';

// DEPOIS:
import { storagePut } from './storage-cloudinary';
```

---

## ✅ PASSO 3: Verificar Dependências

**Arquivo:** `ileala-website/package.json`

Verificar se tem:
```json
"cloudinary": "^2.0.0"
```

Se não tiver, adicionar.

---

## ✅ PASSO 4: Testar Upload

1. Acessar admin panel
2. Criar/editar produto
3. Fazer upload de imagem
4. Verificar se aparece no Cloudinary Dashboard
5. Verificar se URL é do Cloudinary (ex: `https://res.cloudinary.com/...`)

---

## ⚠️ NOTAS IMPORTANTES

### Imagens Existentes
- Imagens já no S3 continuarão funcionando (URLs antigas)
- Novas imagens irão para Cloudinary
- Para migrar imagens antigas, pode fazer upload manual ou script de migração

### Estrutura no Cloudinary
- Todas as imagens vão para pasta `ileala/`
- Formato: `ileala/products/{timestamp}-{filename}`

### Variáveis de Ambiente
- **NÃO remover** variáveis do S3 ainda (pode precisar)
- Adicionar variáveis do Cloudinary
- Sistema usará Cloudinary se variáveis estiverem configuradas

---

## 🚀 PRÓXIMOS PASSOS

1. **Configurar variáveis** no Railway
2. **Mudar import** no código
3. **Fazer deploy**
4. **Testar upload** de imagem
5. **Verificar** no Cloudinary Dashboard

---

**Status:** ⏳ Aguardando confirmação para migrar  
**Última atualização:** 4 de Dezembro de 2025

