# Investigação do Erro "Unexpected token '<', "<!doctype "..."

## Problema

Ao tentar criar uma conta no site, o frontend recebe HTML em vez de JSON, causando o erro:
```
Unexpected token '<', "<!doctype "... is not valid JSON
```

## Análise do Código

### 1. Configuração do Servidor (server/_core/index.ts)

O servidor Express está configurado corretamente:
- tRPC API montada em `/api/trpc`
- Em produção, usa `serveStatic()` para servir arquivos estáticos
- Fallback para `index.html` em rotas não encontradas

### 2. Configuração do serveStatic (server/_core/vite.ts)

```typescript
app.use(express.static(distPath));

// fall through to index.html if the file doesn't exist
app.use("*", (_req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});
```

**PROBLEMA IDENTIFICADO:**

O fallback `app.use("*", ...)` está capturando TODAS as requisições que não encontram arquivos estáticos, **INCLUINDO as requisições da API tRPC**!

Isso significa que quando o frontend faz uma requisição para `/api/trpc/auth.register`, e essa rota não é reconhecida corretamente, o servidor retorna o `index.html` em vez de uma resposta JSON.

## Causa Raiz

A ordem dos middlewares está incorreta. O middleware de fallback para `index.html` deve ser o ÚLTIMO, mas precisa **excluir** rotas da API.

## Solução

Modificar o fallback para NÃO capturar rotas que começam com `/api/`:

```typescript
// fall through to index.html if the file doesn't exist (except API routes)
app.use("*", (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    // Let tRPC handle API routes, return 404 if not found
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.resolve(distPath, "index.html"));
  }
});
```

## Alternativa

Outra solução seria mover o middleware do tRPC para DEPOIS do `serveStatic`, mas ANTES do fallback. Porém, a ordem atual está correta (API antes de static), então o problema está mesmo no fallback.

## Próximos Passos

1. Aplicar a correção no arquivo `server/_core/vite.ts`
2. Fazer commit e push
3. Aguardar deploy no Render
4. Testar criação de conta novamente
