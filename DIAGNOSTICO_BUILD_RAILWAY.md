# 🔍 DIAGNÓSTICO COMPLETO: Problema de Build no Railway

**Data:** 23 de Novembro de 2025  
**Problema:** Build falha com erro `crypto.hash is not a function` relacionado a `embroidered-world-map.webp`

---

## 📋 RESPOSTAS ÀS PERGUNTAS

### 1. Por que o build falha com `crypto.hash is not a function`?

**Resposta:**

Este erro é causado por uma **incompatibilidade entre a versão do Node.js e a versão do Vite** no ambiente do Railway. O Vite 7.x usa `crypto.hash()` que foi introduzido no Node.js 20.12.0+, mas o Railway pode estar usando uma versão anterior do Node.js 20.

**Causas possíveis:**
- Node.js 20.11.0 ou anterior não tem `crypto.hash()` (foi adicionado no 20.12.0)
- O Nixpacks pode estar usando uma versão antiga do Node.js 20
- Incompatibilidade entre Vite 7.1.7 e versões antigas do Node.js 20

**Solução:**
Forçar o uso do Node.js 20.12.0 ou superior no `nixpacks.toml`.

---

### 2. O arquivo `embroidered-world-map.webp` existe no repositório?

**Resposta:**

❌ **NÃO, o arquivo NÃO existe no repositório.**

**Evidências:**
- Busca completa no repositório: **0 resultados** para `embroidered-world-map.webp`
- O componente `ArtisansMap.tsx` **NÃO importa** esse arquivo
- O componente usa **SVG inline** para o mapa do mundo
- A pasta `client/public/images/` não contém esse arquivo

**Conclusão:**
O erro está relacionado a um **cache antigo** ou a uma **referência fantasma** de um build anterior. O Vite está tentando processar um arquivo que não existe mais no código atual.

---

### 3. É possível fazer build do mesmo código em dois services separados?

**Resposta:**

✅ **SIM, é tecnicamente possível**, mas requer:

**Requisitos:**
1. ✅ Mesmo código-fonte (mesmo repositório ou branch)
2. ✅ Mesmas variáveis de ambiente
3. ✅ Mesma configuração de build
4. ⚠️ **Problema:** Se o build falha em um service, vai falhar no outro também

**Por que está falhando:**
- O problema não é a separação de services
- O problema é o **erro de build** que precisa ser resolvido primeiro
- Mesmo código = mesmo erro em qualquer service

---

### 4. Qual a melhor forma de separar admin do site principal no Railway?

**Resposta:**

Existem **3 opções**, ordenadas por recomendação:

## 🎯 OPÇÃO 1: MESMO SERVICE COM DOMÍNIOS DIFERENTES ⭐ (RECOMENDADA)

**Como funciona:**
- Um único service no Railway (`ileala-website`)
- Dois domínios apontando para o mesmo service:
  - `ileala.ae` → site principal
  - `admin.ileala.ae` → painel admin
- Diferenciação por rota no código (`/admin`)

**Vantagens:**
- ✅ Build já funciona (service atual está rodando)
- ✅ Implementação imediata (apenas configurar domínio)
- ✅ Mais simples de manter
- ✅ Mesmas variáveis de ambiente
- ✅ Deploy único para ambos

**Desvantagens:**
- ⚠️ Não é isolamento 100% (mesmo processo)
- ⚠️ Problemas no deploy afetam ambos

**Como implementar:**
1. No Railway Dashboard → Service `ileala-website` → Settings → Domains
2. Adicionar domínio: `admin.ileala.ae`
3. Configurar DNS para apontar `admin.ileala.ae` para o mesmo service
4. Pronto! Ambos os domínios servem o mesmo código

---

## 🎯 OPÇÃO 2: SERVICES SEPARADOS (REQUER CORREÇÃO DO BUILD)

**Como funciona:**
- Dois services separados no Railway:
  - `ileala-website` → site principal (já funciona)
  - `site-ileala-oficial` → admin (build falha)

**Vantagens:**
- ✅ Isolamento completo
- ✅ Deploys independentes
- ✅ Escalabilidade separada

**Desvantagens:**
- ❌ Build não funciona (precisa corrigir primeiro)
- ❌ Mais complexo de manter
- ❌ Duplicação de variáveis de ambiente

**Como corrigir o build:**
1. Atualizar `nixpacks.toml` para usar Node.js 20.12.0+:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --no-frozen-lockfile"]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "pnpm run start"
```

2. Adicionar variável de ambiente no Railway:
   - `NODE_VERSION=20.12.0` (ou superior)

3. Limpar cache do build no Railway:
   - Settings → Clear Build Cache

4. Fazer novo deploy

---

## 🎯 OPÇÃO 3: VERCEL PARA O ADMIN

**Como funciona:**
- Site principal no Railway (`ileala.ae`)
- Admin na Vercel (`admin.ileala.ae`)

**Vantagens:**
- ✅ Admin já estava na Vercel antes
- ✅ Pode funcionar melhor para frontend

**Desvantagens:**
- ❌ Duas plataformas diferentes (mais complexo)
- ❌ Você quer tudo no Railway

---

## 🔧 SOLUÇÃO TÉCNICA PARA O ERRO DE BUILD

Se você quiser continuar com a **OPÇÃO 2** (services separados), aqui está a correção:

### Passo 1: Atualizar `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --no-frozen-lockfile"]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "pnpm run start"
```

### Passo 2: Adicionar variável de ambiente no Railway

No service `site-ileala-oficial`:
- **Name:** `NODE_VERSION`
- **Value:** `20.12.0`

### Passo 3: Limpar cache e fazer novo deploy

1. Railway Dashboard → Service `site-ileala-oficial`
2. Settings → Clear Build Cache
3. Deploy → Redeploy

### Passo 4: Verificar se o erro persiste

Se o erro `embroidered-world-map.webp` ainda aparecer:
- Pode ser cache do Vite
- Adicionar ao `vite.config.ts`:
```typescript
build: {
  // ... outras configurações
  rollupOptions: {
    // ... outras opções
    external: (id) => {
      // Ignorar arquivos que não existem
      if (id.includes('embroidered-world-map.webp')) {
        return true;
      }
      return false;
    }
  }
}
```

---

## 📊 COMPARAÇÃO DAS OPÇÕES

| Critério | Opção 1 (Mesmo Service) | Opção 2 (Services Separados) | Opção 3 (Vercel) |
|----------|------------------------|------------------------------|------------------|
| **Funciona agora?** | ✅ SIM | ❌ NÃO (precisa corrigir) | ✅ SIM |
| **Isolamento** | ⚠️ Parcial | ✅ Completo | ✅ Completo |
| **Complexidade** | 🟢 Baixa | 🟡 Média | 🟡 Média |
| **Manutenção** | 🟢 Fácil | 🟡 Média | 🟡 Média |
| **Custo** | 🟢 1 service | 🟡 2 services | 🟡 2 plataformas |
| **Tempo de implementação** | 🟢 Imediato | 🔴 Requer correção | 🟡 Médio |

---

## 🎯 RECOMENDAÇÃO FINAL

### ⭐ OPÇÃO 1: Mesmo Service com Domínios Diferentes

**Por quê?**
1. ✅ Funciona **agora mesmo** (sem correções)
2. ✅ Admin fica em domínio separado (`admin.ileala.ae`)
3. ✅ Mais simples de manter
4. ✅ Mesmo código, mesmo build que já funciona
5. ⚠️ Não é isolamento 100%, mas resolve o problema principal

**Próximos passos:**
1. No Railway Dashboard → Service `ileala-website`
2. Settings → Domains → Add Domain
3. Adicionar: `admin.ileala.ae`
4. Configurar DNS para apontar para o mesmo service
5. Pronto! ✅

---

## 🔍 ANÁLISE TÉCNICA DO ERRO

### Erro Original:
```
[vite:asset]: Could not load /images/embroidered-world-map.webp
(imported by client/src/components/ArtisansMap.tsx): 
crypto.hash is not a function
```

### Análise:
1. **Arquivo não existe:** `embroidered-world-map.webp` não está no repositório
2. **Componente não importa:** `ArtisansMap.tsx` usa SVG inline, não importa esse arquivo
3. **Erro de crypto:** `crypto.hash()` não existe no Node.js 20.11.0 ou anterior
4. **Causa raiz:** Incompatibilidade Node.js + Vite 7.x

### Solução:
- Atualizar para Node.js 20.12.0+ (corrige `crypto.hash`)
- Ou limpar cache do build (remove referência fantasma)
- Ou usar Opção 1 (evita o problema completamente)

---

## 📝 CONCLUSÃO

O problema **NÃO é** a separação de services. O problema é:
1. ❌ Incompatibilidade Node.js + Vite (erro `crypto.hash`)
2. ❌ Referência fantasma a arquivo que não existe (cache)

**Solução mais rápida:** Opção 1 (mesmo service, domínios diferentes)  
**Solução mais robusta:** Opção 2 (corrigir build + services separados)

---

**Última atualização:** 23 de Novembro de 2025




