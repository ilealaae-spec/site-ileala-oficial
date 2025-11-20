# Guia: Sanity Visual Editing - Como Usar

## ✅ O que foi configurado

1. **Sanity Studio** (`sanity-studio/sanity.config.ts`):
   - ✅ Plugin `presentationTool` configurado
   - ✅ Mapeamento de localizações para produtos
   - ✅ Preview URL configurado

2. **Frontend** (`ileala-website/client/`):
   - ✅ Componente `SanityVisualEditing` criado
   - ✅ Cliente Sanity configurado para preview drafts
   - ✅ Integração com histórico do navegador

## 🚀 Como testar

### Passo 1: Iniciar o Sanity Studio

Abra um terminal e execute:

```bash
cd sanity-studio
pnpm dev
```

Isso vai iniciar o Sanity Studio em ttp://localhost:3333``h

### Passo 2: Iniciar o site (em outro terminal)

Abra outro terminal e execute:

```bash
cd ileala-website
pnpm dev
```

Isso vai iniciar o site em `http://localhost:5173` (ou outra porta)

### Passo 3: Usar o Visual Editing

1. **No Sanity Studio:**
   - Abra um produto
   - Clique no botão **"Open Presentation"** (ou use `Cmd/Ctrl + P`)
   - O Studio vai abrir o site com o overlay de edição visual

2. **No site:**
   - Você verá pontos clicáveis nos elementos editáveis
   - Clique em um elemento para editar diretamente no Studio
   - As mudanças aparecem em tempo real

## 🔧 Variáveis de Ambiente (Opcional)

Se quiser habilitar o visual editing por padrão, adicione no `.env`:

```env
VITE_SANITY_VISUAL_EDITING=true
VITE_SANITY_STUDIO_URL=http://localhost:3333
```

## 📝 URLs de Preview

O visual editing funciona quando:
- ✅ URL contém `?sanityPreview=...` (automático quando abre do Studio)
- ✅ URL contém `?preview=1` (manual)
- ✅ `VITE_SANITY_VISUAL_EDITING=true` no `.env`
- ✅ Modo desenvolvimento (`pnpm dev`)

## 🎯 Próximos Passos

1. Testar a edição visual de produtos
2. Adicionar mais tipos de documento (coleções, páginas, etc.)
3. Configurar preview para outros schemas

## ⚠️ Nota Importante

O visual editing só funciona quando:
- O Sanity Studio está rodando
- O site está acessível (localhost ou produção)
- Você está autenticado no Studio

---

**Última atualização:** 20 de Novembro de 2024

