# Solicitação de Suporte Vercel - TypeError: request.headers.get is not a function

## Informações do Projeto

**Projeto:** ileala-website  
**Organização:** ile-ala  
**URL de Produção:** https://ileala.ae  
**Repositório:** https://github.com/ilealaae-spec/site-ileala-oficial  
**Runtime:** Node.js 20.x (configurado em `vercel.json`)

## Framework/Biblioteca

**Framework:** tRPC (TypeScript RPC)  
**Versão:** @trpc/server@^11.6.0  
**Adapter Atual:** `nodeHTTPRequestHandler` de `@trpc/server/adapters/node-http`  
**Adapter Anterior (que causava erro):** `fetchRequestHandler` de `@trpc/server/adapters/fetch`

## Descrição do Problema

### Erro Principal
```
TypeError: request.headers.get is not a function at Object.handler (/ve:
```

### Quando Ocorre
O erro ocorre **ANTES** do handler ser executado, durante a inspeção/validação do Vercel. O stack trace mostra `at Object.handler`, indicando que o Vercel está wrappando o handler em um objeto e tentando inspecioná-lo antes de chamá-lo.

### Status Atual
- ✅ **Build:** Completa com sucesso (alguns warnings TypeScript, mas não bloqueantes)
- ✅ **Deploy:** Completa com sucesso
- ❌ **Runtime:** Falha em **TODAS** as requisições com erro 500

### Endpoints Afetados
- `GET /api/trpc/auth.me` - Verificação de autenticação
- `POST /api/trpc/auth.register` - Registro de usuários
- `POST /api/trpc/auth.login` - Login de usuários
- Todos os outros endpoints tRPC

## Mensagens de Erro nos Logs

### Logs de Runtime (Vercel Logs)
```
NOV 20 11:19:11.67 GET 500 ileala-website-... /api/trpc/auth.me 
TypeError: request.headers.get is not a function at Object.handler (/ve:

NOV 20 11:13:43.36 POST 500 ileala.ae /api/trpc/auth.regist... 
TypeError: request.headers.get is not a function at Object.handler (/ve:
```

**Padrão:** Todos os requests retornam 500 com o mesmo erro, independente do método HTTP ou endpoint.

### Logs de Build (TypeScript Warnings)
```
api/trpc.ts(207,15): error TS2339: Property 'setCookie' does not exist on type '{}'.
api/trpc.ts(237,13): error TS2339: Property 'setCookie' does not exist on type '{}'.
api/trpc.ts(251,18): error TS2339: Property 'user' does not exist on type '{}'.
api/trpc.ts(255,11): error TS2339: Property 'clearCookie' does not exist on type '{}'.
```

**Nota:** Esses são warnings TypeScript que não impedem o build, mas podem estar relacionados ao problema.

## Arquivo do Handler

**Localização:** `ileala-website/api/trpc.ts`

### Código Atual (usando nodeHTTPRequestHandler)
```typescript
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(
  req: IncomingMessage, 
  res: ServerResponse
): Promise<void> {
  try {
    await nodeHTTPRequestHandler({
      req,
      res,
      router: appRouter,
      createContext: () => {
        // ... contexto
      },
      onError: ({ error, path, type }) => {
        console.error('[Vercel tRPC] Error in handler:', {
          error: error.message,
          path,
          type,
          stack: error.stack,
        });
      },
    });
  } catch (error) {
    // ... tratamento de erro
  }
}
```

### Código Anterior (que causava o erro com fetchRequestHandler)
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export default async function handler(req: any): Promise<Response> {
  try {
    // Tentativa de converter req para Request
    const validRequest = new Request(url, { method, headers, ... });
    return await handleRequest(validRequest);
  } catch (error) {
    // ...
  }
}
```

## Tentativas de Correção Realizadas

### 1. Isolamento Completo do Request
- Criar Request novo antes de qualquer acesso
- Usar apenas property access (Object.keys) em vez de métodos
- **Resultado:** ❌ Erro persistiu

### 2. Factory Function
- Criar handler dinamicamente para evitar inspeção
- **Resultado:** ❌ Erro persistiu

### 3. Proxy Wrapper
- Interceptar acesso a propriedades durante inspeção
- **Resultado:** ❌ Erro persistiu

### 4. Export Direto
- Exportar handler diretamente como async function
- **Resultado:** ❌ Erro persistiu

### 5. Extração Segura de Headers
- Usar Object.keys em vez de métodos
- Verificar headers.get antes de passar para fetchRequestHandler
- **Resultado:** ❌ Erro persistiu

### 6. Mudança para nodeHTTPRequestHandler (ATUAL)
- Trocar de `fetchRequestHandler` para `nodeHTTPRequestHandler`
- Usar `IncomingMessage`/`ServerResponse` em vez de `Request`/`Response`
- **Resultado:** ⏳ Aguardando deploy para verificar

## Configuração do Vercel

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "installCommand": "pnpm install",
  "functions": {
    "api/trpc.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/trpc/:path*",
      "destination": "/api/trpc"
    }
  ]
}
```

## Ambiente e Dependências

### Versões Principais
- **Node.js:** 20.x (via Vercel)
- **TypeScript:** 5.9.3
- **pnpm:** 10.4.1
- **tRPC:** 11.6.0

### Dependências Relevantes
```json
{
  "@trpc/server": "^11.6.0",
  "@trpc/client": "^11.6.0",
  "@vercel/node": "^3.0.0",
  "@neondatabase/serverless": "^0.9.0"
}
```

## Análise Técnica

### Hipótese Principal
O erro `at Object.handler` sugere que o Vercel está:
1. Wrappando o handler exportado em um objeto (`Object.handler`)
2. Tentando inspecionar/validar o handler antes de executá-lo
3. Durante essa inspeção, tentando acessar `request.headers.get`
4. O objeto `request` passado não é um `Request` válido do Fetch API

### Por que o erro ocorre ANTES da execução?
- O stack trace mostra `at Object.handler`, não dentro do nosso código
- Isso indica que o erro acontece durante o processamento do Vercel, não durante nossa execução
- Nenhum dos nossos logs aparece antes do erro

### Por que nodeHTTPRequestHandler pode resolver?
- `nodeHTTPRequestHandler` trabalha diretamente com `IncomingMessage`/`ServerResponse` do Node.js
- Não requer conversão para `Request`/`Response` do Fetch API
- É mais compatível com o runtime Node.js do Vercel
- Não precisa acessar `request.headers.get` - usa `req.headers` diretamente

## Informações Adicionais

### Estrutura do Projeto
```
ileala-website/
├── api/
│   └── trpc.ts          # Handler principal (problema aqui)
├── server/              # Lógica do servidor
├── client/              # Frontend React
└── vercel.json          # Configuração Vercel
```

### Outros Handlers que Funcionam
- `api/oauth/callback.ts` - Usa `VercelRequest`/`VercelResponse` - ✅ Funciona
- `api/create-emergency-admin.ts` - Usa `VercelRequest`/`VercelResponse` - ✅ Funciona

### Diferença Chave
Os handlers que funcionam usam:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  // ...
}
```

O handler problemático tenta usar `IncomingMessage`/`ServerResponse` ou `Request`/`Response`.

## Perguntas para o Suporte

1. **Como o Vercel processa handlers exportados?** 
   - O Vercel wrappea handlers em objetos? Por quê?
   - Quando essa inspeção/validação acontece?

2. **Qual é o tipo correto para handlers tRPC no Vercel?**
   - `IncomingMessage`/`ServerResponse`?
   - `VercelRequest`/`VercelResponse`?
   - `Request`/`Response` (Fetch API)?

3. **Por que o erro ocorre ANTES da execução do handler?**
   - O Vercel valida o handler antes de chamá-lo?
   - Como podemos evitar essa validação?

4. **Há alguma configuração específica para tRPC no Vercel?**
   - Alguma configuração especial necessária?
   - Algum adapter recomendado?

5. **É um bug conhecido?**
   - Outros usuários relataram problemas similares?
   - Há uma issue aberta sobre isso?

## Logs Completos

### Exemplo de Log de Erro Completo
```
[Timestamp] GET /api/trpc/auth.me
Status: 500
Error: TypeError: request.headers.get is not a function at Object.handler (/ve:
```

### Logs de Build (último deploy)
```
11:19:00.938 Build Completed in /vercel/output [31s]
11:19:01.226 Deploying outputs...
11:19:08.866 Deployment completed
```

## Contato

**Email do Projeto:** (seu email)  
**Deployment ID:** (último deployment que falhou)  
**Data do Problema:** 20 de Novembro de 2025  
**Frequência:** 100% das requisições (todas falham)

---

## Resumo Executivo

**Problema:** Handler tRPC falha com `TypeError: request.headers.get is not a function` antes de ser executado.

**Causa Provável:** Vercel inspeciona o handler antes da execução e tenta acessar `request.headers.get` em um objeto que não é um `Request` válido.

**Impacto:** 100% das requisições API falham (500), impedindo registro, login e outras funcionalidades.

**Tentativas:** 6 diferentes abordagens, todas falharam. Atualmente testando `nodeHTTPRequestHandler`.

**Solicitação:** Orientação sobre o tipo correto de handler para tRPC no Vercel e como evitar a inspeção pré-execução.

