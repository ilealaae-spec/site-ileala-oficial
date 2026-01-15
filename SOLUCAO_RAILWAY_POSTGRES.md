# 🚀 Solução: Executar SQL no Railway Postgres

O banco está no **Railway Postgres**, não no Neon. Vamos usar o Railway diretamente.

---

## ✅ Opção 1: Usar Botão "Conectar" do Railway

### Passo 1: No Railway Dashboard

1. **Acesse:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
2. **Clique no serviço "Postgres"**
3. **Na modal do Postgres**, procure pelo botão **"Conectar"** (Connect) no canto superior direito
4. **Clique em "Conectar"**

Isso pode abrir:
- Um terminal SQL
- Uma interface de query
- Ou mostrar a connection string

---

## ✅ Opção 2: Obter Connection String e Usar Cliente SQL

### Passo 1: Obter Connection String

1. **No Railway**, modal do Postgres
2. **Clique na aba "Credenciais"** (Credentials)
3. **Procure por:**
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - Ou credenciais individuais (host, port, user, password, database)

4. **Copie a connection string completa**

### Passo 2: Usar DBeaver (Mais Fácil)

1. **Baixe DBeaver:** https://dbeaver.io/download/ (gratuito)
2. **Instale**
3. **Abra DBeaver**
4. **Clique em "Nova Conexão" → "PostgreSQL"**
5. **Cole a connection string** ou preencha os campos:
   - Host: (do Railway)
   - Port: 5432
   - Database: (do Railway)
   - Username: postgres
   - Password: (do Railway)
6. **Teste e conecte**
7. **Abra SQL Editor** (botão direito na conexão → SQL Editor → New SQL Script)
8. **Cole o SQL e execute**

---

## ✅ Opção 3: Usar psql (Terminal)

### Passo 1: Instalar psql (se não tiver)

**No Mac:**
```bash
brew install postgresql
```

### Passo 2: Obter Connection String do Railway

No Railway → Postgres → Credenciais, copie a `DATABASE_URL`.

### Passo 3: Conectar

```bash
psql "postgresql://postgres:senha@host.railway.app:5432/railway"
```

Substitua pela sua connection string do Railway.

### Passo 4: Executar SQL

Cole o SQL diretamente no terminal psql.

---

## ✅ Opção 4: Usar Railway CLI

### Passo 1: Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Passo 2: Fazer Login

```bash
railway login
```

### Passo 3: Conectar ao Banco

```bash
railway connect
```

Isso abrirá um terminal PostgreSQL conectado.

### Passo 4: Executar SQL

Cole o SQL diretamente.

---

## 📋 SQL para Executar

```sql
-- Gerar códigos de backup do 2FA
DO $$
DECLARE
  codes_array text[];
  code_text text;
  i integer;
BEGIN
  codes_array := ARRAY[]::text[];
  FOR i IN 1..10 LOOP
    code_text := upper(
      substring(md5(random()::text || clock_timestamp()::text || i::text), 1, 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text || i::text), 5, 4)
    );
    codes_array := array_append(codes_array, code_text);
  END LOOP;
  
  UPDATE users 
  SET 
    "twoFactorBackupCodes" = array_to_json(codes_array)::text,
    "updatedAt" = NOW()
  WHERE email = 'ceo@ileala.ae'
    AND "twoFactorEnabled" = 1;
END $$;

-- Ver os códigos gerados
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## 🎯 Recomendação

**Use DBeaver** - É o mais fácil:
1. Instale DBeaver
2. Obtenha a connection string do Railway (aba Credenciais)
3. Conecte
4. Execute o SQL

---

**Qual opção você prefere tentar primeiro?**

