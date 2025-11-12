# Rate Limiting Middleware

Este diretório contém os middlewares de rate limiting para proteger os endpoints de autenticação contra spam e ataques de força bruta.

## 📋 Configuração

### Limites por Endpoint

| Endpoint | Limite | Janela | Skip Success | Descrição |
|----------|--------|--------|--------------|-----------|
| **Register** | 3 | 15 min | ❌ | Previne criação massiva de contas |
| **Verify Email** | 10 | 5 min | ✅ | Permite erros de digitação, mas previne força bruta |
| **Resend Email** | 3 | 1 hora | ❌ | Previne spam de emails |
| **Login** | 5 | 15 min | ✅ | Previne força bruta em senhas |
| **Password Reset** | 3 | 1 hora | ❌ | Previne abuso de reset de senha |
| **General API** | 100 | 15 min | ❌ | Proteção geral para todos os endpoints |

### Skip Success

- ✅ **Enabled**: Requisições bem-sucedidas não contam para o limite
- ❌ **Disabled**: Todas as requisições contam para o limite

## 🔧 Arquivos

### `rateLimiter.ts`

Define os rate limiters individuais para cada tipo de endpoint:

```typescript
import { registerLimiter, loginLimiter, ... } from './rateLimiter';
```

### `trpcRateLimiter.ts`

Middleware que intercepta requisições tRPC e aplica o rate limiter apropriado baseado no procedimento chamado.

## 🚀 Uso

O rate limiting é aplicado automaticamente em `server/_core/index.ts`:

```typescript
// Apply rate limiting to tRPC endpoints
app.use("/api/trpc", trpcRateLimiterMiddleware);

// Apply general API rate limiting
app.use("/api", apiLimiter);
```

## 📊 Monitoramento

Os rate limiters registram logs quando bloqueiam requisições:

```
[RateLimit] Applying register limiter for ::1
[RateLimit] Registration blocked for IP: ::1
```

## 🔐 Headers de Resposta

Quando o rate limiting está ativo, os seguintes headers são retornados:

- `RateLimit-Limit`: Número máximo de requisições permitidas
- `RateLimit-Remaining`: Número de requisições restantes
- `RateLimit-Reset`: Timestamp quando o limite será resetado

## ⚠️ Resposta de Erro

Quando o limite é excedido, a API retorna:

```json
{
  "error": {
    "message": "Too many requests from this IP. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

Status Code: `429 Too Many Requests`

## 🛠️ Customização

Para ajustar os limites, edite `rateLimiter.ts`:

```typescript
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Alterar janela de tempo
  max: 3, // Alterar número máximo de requisições
  // ...
});
```

## 📈 Melhorias Futuras

1. **Redis Store**: Usar Redis para compartilhar limites entre múltiplas instâncias
2. **Rate Limiting por Email**: Limitar ações por endereço de email
3. **Dynamic Limits**: Ajustar limites baseado em comportamento do usuário
4. **Whitelist**: Permitir IPs confiáveis sem limitação
5. **Analytics**: Dashboard para monitorar tentativas bloqueadas

## 🔗 Referências

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html#rate-limiting)
