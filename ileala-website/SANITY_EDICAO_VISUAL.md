# Sanity CMS - Edição Visual

**Data:** 20 de Novembro de 2024  
**Status:** ⚠️ **Edição Visual NÃO Configurada**

---

## 📋 RESUMO

Você **TEM** o Sanity CMS instalado, mas atualmente ele está configurado apenas para **edição por formulários**, não para **edição visual** (WYSIWYG no site).

---

## ✅ O QUE VOCÊ TEM AGORA

### Sanity Studio (Atual)
- ✅ **Localização:** `sanity-studio/`
- ✅ **URL:** Provavelmente em `https://ileala.sanity.studio` ou similar
- ✅ **Funcionalidades:**
  - Edição de produtos via formulários
  - Upload de imagens
  - Campos de texto, números, etc.
  - Estrutura básica de documentos

### Configuração Atual
```typescript
// sanity-studio/sanity.config.ts
plugins: [
  structureTool(),  // ✅ Ferramenta de estrutura básica
  visionTool(),     // ✅ Query builder (GROQ)
]
```

**O que isso significa:**
- Você pode editar produtos, textos, imagens
- Mas é através de **formulários** no Sanity Studio
- **NÃO** é edição visual direto no site (arrastar e soltar, clicar e editar)

---

## 🎨 O QUE É EDIÇÃO VISUAL?

### Edição por Formulários (O que você tem)
```
1. Acessa Sanity Studio
2. Abre formulário de produto
3. Preenche campos (nome, preço, descrição)
4. Salva
5. Site atualiza automaticamente
```

### Edição Visual (O que você quer)
```
1. Acessa o site (ileala.ae)
2. Clica em um texto na página
3. Edita diretamente no site
4. Clica em uma imagem
5. Troca a imagem arrastando e soltando
6. Salva
7. Mudanças aparecem imediatamente
```

---

## 🚀 COMO ADICIONAR EDIÇÃO VISUAL

O Sanity **SUPORTA** edição visual através de plugins adicionais:

### Opção 1: Sanity Presentation (Recomendado)
**Plugin:** `@sanity/presentation`

**O que faz:**
- Permite editar conteúdo diretamente no site
- Preview em tempo real
- Edição visual de textos e imagens
- Sincronização automática

**Como instalar:**
```bash
cd sanity-studio
npm install @sanity/presentation
```

**Configuração:**
```typescript
// sanity-studio/sanity.config.ts
import {presentationTool} from '@sanity/presentation'

export default defineConfig({
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      // Configuração do preview
      resolve: {
        mainDocuments: async (query) => {
          // Configurar quais documentos podem ser editados
        },
      },
    }),
  ],
})
```

### Opção 2: Sanity Visual Editing
**Plugin:** `@sanity/visual-editing`

**O que faz:**
- Edição visual inline no site
- Overlay de edição
- Modo de edição ativado/desativado

**Como instalar:**
```bash
cd sanity-studio
npm install @sanity/visual-editing
```

**Configuração no frontend:**
```typescript
// client/src/App.tsx ou similar
import {VisualEditing} from '@sanity/visual-editing'

function App() {
  return (
    <>
      {/* Seu app */}
      {import.meta.env.DEV && <VisualEditing />}
    </>
  )
}
```

---

## 📊 COMPARAÇÃO

| Recurso | Formulários (Atual) | Edição Visual |
|---------|---------------------|---------------|
| **Onde edita** | Sanity Studio | Site direto |
| **Interface** | Formulários | Clicar e editar |
| **Preview** | Preview separado | Preview no site |
| **Facilidade** | Média | Alta |
| **Configuração** | ✅ Já configurado | ⚠️ Precisa instalar |

---

## 🛠️ O QUE PRECISA SER FEITO

### Para Habilitar Edição Visual:

1. **Instalar Plugin:**
   ```bash
   cd sanity-studio
   npm install @sanity/presentation
   # ou
   npm install @sanity/visual-editing
   ```

2. **Configurar no Sanity Studio:**
   - Adicionar plugin no `sanity.config.ts`
   - Configurar preview URLs
   - Configurar quais documentos podem ser editados

3. **Configurar no Frontend:**
   - Adicionar componente de edição visual
   - Configurar autenticação Sanity
   - Configurar preview mode

4. **Testar:**
   - Acessar o site
   - Ativar modo de edição
   - Testar edição de textos e imagens

---

## 🎯 RECOMENDAÇÃO

### Para Você (Não-técnico):
**Use o Sanity Studio atual** (formulários) por enquanto:
- ✅ Já está funcionando
- ✅ Mais simples de usar
- ✅ Não precisa de configuração adicional

### Para Adicionar Edição Visual:
**Contrate um desenvolvedor** para:
1. Instalar e configurar `@sanity/presentation`
2. Integrar com o frontend
3. Configurar autenticação
4. Testar e documentar

**Tempo estimado:** 4-8 horas de desenvolvimento

---

## 📝 CONCLUSÃO

**Status Atual:**
- ✅ Sanity CMS instalado e funcionando
- ✅ Edição por formulários disponível
- ❌ Edição visual NÃO configurada

**Para ter edição visual:**
- Precisa instalar plugins adicionais
- Precisa configurar integração com frontend
- Requer conhecimento técnico

**Recomendação:**
- Use o Sanity Studio atual (formulários) por enquanto
- Se quiser edição visual, contrate um desenvolvedor para configurar

---

## 🔗 LINKS ÚTEIS

- [Sanity Presentation Docs](https://www.sanity.io/docs/presentation)
- [Sanity Visual Editing Docs](https://www.sanity.io/docs/visual-editing)
- [Sanity Studio](https://www.sanity.io/docs/sanity-studio)

---

**Última atualização:** 20 de Novembro de 2024

