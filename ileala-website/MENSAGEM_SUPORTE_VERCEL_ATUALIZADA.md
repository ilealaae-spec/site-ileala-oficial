# Mensagem para Suporte Vercel - Erro Crítico (ATUALIZADA)

**Assunto:** URGENTE: TypeError: request.headers.get is not a function - TODAS as soluções sugeridas falharam

---

Olá equipe do suporte Vercel,

Estou enfrentando um erro crítico que **impede 100% das requisições** ao meu endpoint tRPC no Vercel. O erro persiste mesmo após implementar **TODAS as soluções sugeridas pelo suporte**.

## SITUAÇÃO ATUAL

- ❌ **100% das requisições** ao endpoint `/api/trpc/*` falham com o mesmo erro
- ❌ O site está **completamente inoperante** há vários dias
- ❌ O favicon do site sumiu na busca do Google (provavelmente devido aos erros)
- ❌ **TODAS as tentativas de correção falharam**

## ERRO PERSISTENTE

```
TypeError: request.headers.get is not a function at Object.handler (/ve:
```

**Características:**
- O erro ocorre **ANTES** do handler ser executado
- Stack trace mostra `at Object.handler`, indicando que o Vercel wrappea o handler
- Nenhum dos nossos logs aparece antes do erro
- O erro acontece durante a **inspeção/validação do handler pelo Vercel**

## TODAS AS SOLUÇÕES TENTADAS

### 1. Opção 1 do Suporte: fetchRequestHandler com Fetch API
**Implementação:**
- Migrei para `fetchRequestHandler` com assinatura `Request/Response`
- Handler: `export default async function handler(request: Request): Promise<Response>`
- **Resultado:** ❌ Erro persiste

### 2. Opção 2 do Suporte: nodeHTTPRequestHandler com `as any`
**Implementação:**
- Usei `nodeHTTPRequestHandler` com `req as any` e `res as any`
- Handler: `export default function handler(req: VercelRequest, res: VercelResponse): void`
- **Resultado:** ❌ Erro persiste

### 3. Conversão VercelRequest → Request
**Implementação:**
- Criei função `createSafeRequest()` que converte VercelRequest para Request
- Conversão acontece ANTES de qualquer acesso aos headers
- Uso `Object.entries()` para converter headers, nunca `.get()`
- **Resultado:** ❌ Erro persiste

### 4. Factory Function
**Implementação:**
- Criei `createHandler()` que retorna o handler dinamicamente
- Handler só é criado quando necessário, não durante inspeção
- **Resultado:** ❌ Erro persiste

### 5. Separação de Conversão
**Implementação:**
- Separei `createSafeRequest()` do handler principal
- Conversão acontece imediatamente no export
- **Resultado:** ❌ Erro persiste

## ANÁLISE DO PROBLEMA

O erro acontece em `Object.handler`, o que indica que:

1. O Vercel está **wrappeando o handler exportado** em um objeto
2. Durante essa wrapping/inspeção, algo tenta acessar `request.headers.get()`
3. O objeto passado não tem o método `.get()` (provavelmente é `VercelRequest`)
4. O erro ocorre **ANTES** do nosso código ser executado

## CÓDIGO ATUAL

```typescript
// api/trpc.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

function createSafeRequest(req: any): Request {
  if (req instanceof Request) {
    return req;
  }
  
  // Converter headers manualmente usando Object.entries
  const headers = new Headers();
  if (req.headers && typeof req.headers === 'object') {
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const v of value) {
            headers.append(key, String(v));
          }
        } else {
          headers.set(key, String(value));
        }
      }
    }
  }
  
  return new Request(req.url || 'http://localhost', {
    method: req.method || 'GET',
    headers,
    body: req.body ? JSON.stringify(req.body) : null,
  });
}

async function handleRequest(request: Request): Promise<Response> {
  // ... lógica do handler ...
}

export default async function handler(req: any): Promise<Response> {
  const request = createSafeRequest(req);
  return handleRequest(request);
}
```

## INFORMAÇÕES DO PROJETO

- **Projeto:** ileala-website
- **Organização:** ile-ala
- **URL de produção:** https://ileala.ae
- **Runtime:** Node.js 20.x (configurado em vercel.json)
- **Framework:** Vite + React + tRPC
- **Repositório:** https://github.com/ilealaae-spec/site-ileala-oficial

## CONFIGURAÇÃO vercel.json

```json
{
  "functions": {
    "api/trpc.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

## PERGUNTAS ESPECÍFICAS

1. **Por que o Vercel está tentando acessar `request.headers.get()` durante a inspeção do handler?**
   - Isso acontece antes do nosso código ser executado
   - Como podemos prevenir essa inspeção?

2. **Existe uma forma de desabilitar a inspeção do handler pelo Vercel?**
   - Ou uma forma de fazer o handler ser completamente opaco?

3. **Há alguma incompatibilidade conhecida entre tRPC e Vercel?**
   - Outros usuários enfrentam o mesmo problema?

4. **Existe um adapter oficial do tRPC para Vercel?**
   - Ou documentação específica sobre como usar tRPC no Vercel?

5. **O problema pode estar relacionado ao runtime Node.js 20.x?**
   - Deveríamos usar Edge Runtime? (mas precisamos de bcryptjs que não funciona no Edge)

## IMPACTO NO NEGÓCIO

- ❌ Site completamente inoperante
- ❌ Impossível fazer login ou registrar usuários
- ❌ Favicon sumiu na busca do Google (provavelmente devido aos erros)
- ❌ Perda de tráfego e conversões
- ❌ Problema persiste há vários dias

## PRÓXIMOS PASSOS NECESSÁRIOS

Preciso urgentemente de:
1. Uma solução que **realmente funcione** (todas as tentadas falharam)
2. Orientação específica sobre como usar tRPC no Vercel
3. Possivelmente um adapter específico ou workaround documentado
4. Investigação técnica profunda do problema

Estou disponível para:
- Fornecer acesso ao repositório
- Testar soluções sugeridas imediatamente
- Participar de uma chamada para debug em tempo real
- Fornecer logs adicionais ou informações de debug

**Este é um problema crítico que está impedindo o funcionamento do site em produção há vários dias.**

---

**Atenciosamente,**
Elma Bichara

https://www.sanity.io/manage