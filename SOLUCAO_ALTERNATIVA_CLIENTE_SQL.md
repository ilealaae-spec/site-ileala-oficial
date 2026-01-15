# 🔧 Solução Alternativa: Usar Cliente SQL Externo

O Railway pode não ter editor SQL integrado. Vamos usar um cliente SQL externo.

---

## ✅ Opção 1: Usar DBeaver (Gratuito e Fácil)

### Passo 1: Instalar DBeaver

1. **Baixe DBeaver:** https://dbeaver.io/download/
2. **Instale** (é gratuito)
3. **Abra o DBeaver**

### Passo 2: Obter Connection String do Railway

1. **No Railway**, na modal do Postgres, clique na aba **"Credenciais"** (Credentials)
2. **Ou vá em Settings → Variables**
3. **Procure por `DATABASE_URL`**
4. **Copie o valor completo**

A connection string será algo como:
```
postgresql://postgres:senha@host.railway.app:5432/railway
```

### Passo 3: Conectar no DBeaver

1. **Abra DBeaver**
2. **Clique em "Nova Conexão"** (New Connection)
3. **Selecione "PostgreSQL"**
4. **Preencha:**
   - **Host:** (extraia do DATABASE_URL)
   - **Port:** 5432
   - **Database:** (extraia do DATABASE_URL)
   - **Username:** postgres
   - **Password:** (extraia do DATABASE_URL)
5. **Teste a conexão** e clique em "Finish"

### Passo 4: Executar SQL

1. **Clique com botão direito** na conexão
2. **Selecione "SQL Editor" → "New SQL Script"**
3. **Cole o SQL:**
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
4. **Execute** (Ctrl+Enter ou botão "Execute")
5. **Copie os códigos** da última query

---

## ✅ Opção 2: Usar Railway CLI (Terminal)

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

Isso abrirá um terminal PostgreSQL conectado ao banco.

### Passo 4: Executar SQL

Cole o SQL diretamente no terminal.

---

## ✅ Opção 3: Usar psql (Linha de Comando)

### Passo 1: Obter Connection String

No Railway → Postgres → Credenciais, copie a `DATABASE_URL`.

### Passo 2: Conectar

```bash
psql "postgresql://postgres:senha@host.railway.app:5432/railway"
```

### Passo 3: Executar SQL

Cole o SQL no terminal psql.

---

## ✅ Opção 4: Usar pgAdmin (Alternativa)

1. **Baixe:** https://www.pgadmin.org/download/
2. **Instale**
3. **Conecte usando a DATABASE_URL do Railway**
4. **Execute o SQL**

---

## 🎯 Recomendação

**Use DBeaver** - É o mais fácil e visual:
- ✅ Interface gráfica amigável
- ✅ Gratuito
- ✅ Funciona em Mac, Windows e Linux
- ✅ Fácil de usar

---

## 📝 Próximos Passos

1. **Instale DBeaver**
2. **Obtenha a DATABASE_URL do Railway** (aba Credenciais)
3. **Conecte ao banco**
4. **Execute o SQL**
5. **Copie os códigos gerados**

---

**Precisa de ajuda com algum passo? Me avise!**

