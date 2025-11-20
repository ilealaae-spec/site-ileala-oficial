# Mensagem para Suporte Vercel - Erro Crítico

**Assunto:** Erro crítico: TypeError: request.headers.get is not a function - Ocorre ANTES da execução do handler

---

Olá equipe do suporte Vercel,

Estou enfrentando um erro crítico e persistente que impede 100% das requisições ao meu endpoint tRPC no Vercel. O erro ocorre ANTES do handler ser executado, durante a inspeção/validação do Vercel.

## ÁREA ESPECÍFICA DO PROBLEMA

**Categoria:** Serverless Functions / API Routes  
**Tipo de problema:** Runtime Error (ocorre antes da execução do handler)  
**Componente afetado:** Handler de API Route (`api/trpc.ts`)  
**Runtime:** Node.js 20.x  
**Adapter:** tRPC `nodeHTTPRequestHandler` de `@trpc/server/adapters/node-http`

**Problema específico:**
- O erro ocorre durante a **inspeção/validação do handler pelo Vercel**, ANTES do código do handler ser executado
- Stack trace mostra `at Object.handler`, indicando que o Vercel está wrappando o handler em um objeto
- Durante essa wrapping/inspeção, algo tenta acessar `request.headers.get()`, mas `VercelRequest` não tem esse método
- O erro acontece no momento em que o Vercel processa o handler exportado, não durante a execução da lógica do handler

## ERRO PERSISTENTE

```
TypeError: request.headers.get is not a function at Object.handler (/ve:
```

**Características críticas:**
- O erro ocorre **ANTES** do handler ser executado
- Stack trace mostra `at Object.handler`, indicando que o Vercel wrappea o handler
- Nenhum dos nossos logs aparece antes do erro
- **100% das requisições falham** com o mesmo erro
- O erro acontece durante a inspeção/validação do handler pelo Vercel

## INFORMAÇÕES DO PROJETO

- **Projeto:** ileala-website
- **Organização:** ile-ala
- **URL de produção:** https://ileala.ae
- **Branch:** main
- **Runtime:** Node.js 20.x (configurado em vercel.json)
- **Framework:** Vite + React + tRPC
- **tRPC:** @trpc/server@^11.6.0
- **Adapter tentado:** nodeHTTPRequestHandler de @trpc/server/adapters/node-http

## ESTRUTURA DO HANDLER

**Arquivo:** `api/trpc.ts`

**Handler atual (última tentativa):**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { IncomingMessage, ServerResponse } from 'http';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    // Converter headers para objeto simples ANTES de criar IncomingMessage
    const plainHeaders: Record<string, string | string[]> = {};
    if (req.headers) {
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          plainHeaders[key] = value;
        }
      }
    }
    
    // Criar IncomingMessage com Proxy que intercepta headers.get()
    const nodeReq = new Proxy(
      Object.assign(
        Object.create(IncomingMessage.prototype),
        {
          ...req,
          headers: new Proxy(plainHeaders, {
            get(target, prop) {
              if (prop === 'get') {
                return function(key: string) {
                  const value = target[key];
                  return Array.isArray(value) ? value[0] : value;
                };
              }
              return target[prop as string];
            },
          }),
          url: req.url || '',
          method: req.method || 'GET',
        }
      ) as IncomingMessage,
      {
        get(target, prop) {
          if (prop === 'headers') {
            return new Proxy(plainHeaders, {
              get(headerTarget, headerProp) {
                if (headerProp === 'get') {
                  return function(key: string) {
                    const value = headerTarget[key];
                    return Array.isArray(value) ? value[0] : value;
                  };
                }
                return headerTarget[headerProp as string];
              },
            });
          }
          return (target as any)[prop];
        },
      }
    );
    
    const nodeRes = Object.assign(
      Object.create(ServerResponse.prototype),
      res
    ) as ServerResponse;
    
    await nodeHTTPRequestHandler({
      req: nodeReq,
      res: nodeRes,
      router: appRouter,
      createContext: () => ({ /* contexto */ }),
    });
  } catch (error) {
    res.status(500).json([{ error: { /* ... */ } }]);
  }
}
```

**Configuração `vercel.json`:**

```json
{
  "functions": {
    "api/trpc.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

## TODAS AS TENTATIVAS REALIZADAS

### 1. ✅ fetchRequestHandler com Edge Runtime
- **Implementação:** Usar fetchRequestHandler com Request/Response (Web Standard API)
- **Configuração:** `runtime: 'edge'` no vercel.json
- **Resultado:** ❌ Erro persistiu + Edge Runtime não suporta bcryptjs

### 2. ✅ nodeHTTPRequestHandler com conversão básica
- **Implementação:** Object.assign + Object.create para converter VercelRequest
- **Resultado:** ❌ Erro persistiu

### 3. ✅ Conversão completa de headers para objeto simples
- **Implementação:** Converter headers ANTES de criar IncomingMessage
- **Resultado:** ❌ Erro persistiu

### 4. ✅ Proxy para interceptar headers.get()
- **Implementação:** Proxy duplo que intercepta acesso a headers.get() e retorna função compatível
- **Resultado:** ❌ Erro persistiu (ocorre antes do Proxy ser acessado)

### 5. ✅ Factory function para criar handler dinamicamente
- **Implementação:** Criar handler em função factory para evitar inspeção
- **Resultado:** ❌ Erro persistiu

### 6. ✅ Isolamento completo do Request
- **Implementação:** Criar Request completamente novo antes de qualquer acesso
- **Resultado:** ❌ Erro persistiu

## ANÁLISE TÉCNICA

O problema crítico é que o erro ocorre `at Object.handler`, o que indica:

1. O Vercel wrappea o handler exportado em um objeto (`Object.handler`)
2. Durante essa wrapping/inspeção, algo tenta acessar `request.headers.get()`
3. Isso acontece **ANTES** do nosso código ser executado
4. Nenhum dos nossos logs aparece, confirmando que é durante a inspeção

**Hipóteses:**
- O `nodeHTTPRequestHandler` pode estar sendo importado/avaliado e tentando inspecionar o `req` durante o import
- O Vercel pode estar validando o handler e tentando acessar propriedades do `req`
- Pode haver uma incompatibilidade fundamental entre `VercelRequest` e o que o `nodeHTTPRequestHandler` espera

## EVIDÊNCIAS

### Logs do Vercel (Runtime Logs):
- **Data:** 20 de Novembro de 2024
- **Hora:** ~12:34:09
- **Erro:** `TypeError: request.headers.get is not a function at Object.handler (/ve:`
- **Status:** GET 500
- **Endpoint:** `/api/trpc/auth.me`
- **Frequência:** 100% das requisições

### Build Logs:
- **Build:** ✅ Completa com sucesso
- **Deploy:** ✅ Completa com sucesso
- **TypeScript:** ✅ Sem erros (após correções)
- **Runtime:** ❌ Falha em 100% das requisições

## PERGUNTAS ESPECÍFICAS PARA O SUPORTE

### 1. Como o Vercel processa handlers exportados?
- O Vercel wrappea handlers em objetos? Por quê?
- Quando essa inspeção/validação acontece?
- O que exatamente acontece durante `Object.handler`?

### 2. Por que o erro ocorre ANTES da execução?
- O Vercel valida o handler antes de chamá-lo?
- Como podemos evitar essa validação?
- Há alguma forma de desabilitar essa inspeção?

### 3. Qual é o tipo correto para handlers tRPC no Vercel?
- `IncomingMessage`/`ServerResponse`?
- `VercelRequest`/`VercelResponse`?
- `Request`/`Response` (Fetch API)?
- Há alguma configuração especial necessária?

### 4. O nodeHTTPRequestHandler é compatível com Vercel?
- Há algum adapter específico recomendado para tRPC no Vercel?
- Outros usuários relataram problemas similares?
- Há uma issue aberta sobre isso?

### 5. Como o Vercel cria o objeto req antes de chamar o handler?
- O `req` é uma instância de `VercelRequest`?
- Pode ter `headers` como `Headers` object (com `.get()`) em vez de objeto simples?
- Como garantir que `headers` seja sempre objeto simples?

### 6. Há alguma configuração especial necessária?
- Alguma flag no `vercel.json`?
- Alguma variável de ambiente?
- Alguma configuração de build?

## CÓDIGO DE REFERÊNCIA

**Outros handlers no mesmo projeto que FUNCIONAM:**
- `api/oauth/callback.ts` - Usa `VercelRequest`/`VercelResponse` - ✅ Funciona
- `api/create-emergency-admin.ts` - Usa `VercelRequest`/`VercelResponse` - ✅ Funciona

**Diferença:** Esses handlers não usam tRPC, apenas `VercelRequest`/`VercelResponse` diretamente.

## IMPACTO

- ❌ **100% das requisições** ao endpoint `/api/trpc/*` falham
- ❌ O site está **completamente inoperante**
- ❌ Não consigo fazer login, registrar usuários, ou acessar qualquer funcionalidade
- ❌ O problema persiste há vários dias, mesmo após múltiplas tentativas

## PRÓXIMOS PASSOS SUGERIDOS

1. Investigar como o Vercel processa handlers exportados
2. Verificar se há uma incompatibilidade conhecida entre `nodeHTTPRequestHandler` e Vercel
3. Fornecer orientação específica sobre como usar tRPC no Vercel
4. Possivelmente criar um adapter específico para Vercel ou documentar a solução correta

## INFORMAÇÕES DE CONTATO

Estou disponível para:
- Fornecer acesso ao repositório (se necessário)
- Testar soluções sugeridas imediatamente
- Fornecer logs adicionais ou informações de debug
- Participar de uma chamada para debug em tempo real

**Repositório:** https://github.com/ilealaae-spec/site-ileala-oficial

Agradeço antecipadamente pela assistência. Este é um problema crítico que está impedindo o funcionamento do site em produção.

---

**Atenciosamente,**
[Seu Nome]

