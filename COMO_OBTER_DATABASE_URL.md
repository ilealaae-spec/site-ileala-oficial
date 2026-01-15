# 🔑 Como Obter a DATABASE_URL do Railway

## Método 1: Via Aba Credenciais (Mais Fácil)

1. **No Railway**, na modal do Postgres
2. **Clique na aba "Credenciais"** (Credentials)
3. **Procure por `DATABASE_URL` ou `POSTGRES_URL`**
4. **Copie o valor completo**

---

## Método 2: Via Settings → Variables

1. **No Railway Dashboard**
2. **Clique no serviço Postgres**
3. **Vá em "Settings"** ou **"Variáveis"** (Variables)
4. **Procure por `DATABASE_URL`**
5. **Copie o valor**

---

## Método 3: Via Railway CLI

```bash
railway variables
```

Isso mostrará todas as variáveis, incluindo DATABASE_URL.

---

## 📋 Formato da Connection String

A DATABASE_URL terá este formato:

```
postgresql://usuario:senha@host.railway.app:5432/nome_banco
```

Exemplo:
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

---

## 🔍 Se Não Encontrar DATABASE_URL

Procure por:
- `POSTGRES_URL`
- `POSTGRES_CONNECTION_STRING`
- `DATABASE_CONNECTION_STRING`
- Ou nas credenciais individuais:
  - `POSTGRES_HOST`
  - `POSTGRES_PORT`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`

---

**Depois de obter a DATABASE_URL, use o DBeaver para conectar e executar o SQL!**

