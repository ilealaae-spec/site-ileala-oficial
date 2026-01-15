# 🎯 Próximo Passo: Executar SQL no Railway

A modal "Conectar ao Postgres" é para conectar serviços, não para executar SQL.

---

## ✅ Solução: Usar DBeaver (Mais Fácil e Rápido)

### Passo 1: Obter Connection String

1. **Feche a modal** (clique no X)
2. **Na modal do Postgres**, clique na aba **"Credenciais"** (Credentials)
3. **Procure por `DATABASE_URL` ou `POSTGRES_URL`**
4. **Copie o valor completo** (clique no ícone de copiar)

A connection string será algo como:
```
postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway
```

---

### Passo 2: Instalar DBeaver

1. **Baixe:** https://dbeaver.io/download/
2. **Escolha:** "DBeaver Community Edition" (gratuito)
3. **Instale** (é rápido, ~2 minutos)

---

### Passo 3: Conectar no DBeaver

1. **Abra o DBeaver**
2. **Clique em "Nova Conexão"** (ícone de plug no topo)
3. **Selecione "PostgreSQL"** → Next
4. **Na aba "Principal":**
   - Se tiver a connection string completa, cole no campo "URL"
   - Ou preencha manualmente:
     - **Host:** (extraia do DATABASE_URL)
     - **Port:** 5432
     - **Database:** (extraia do DATABASE_URL)
     - **Username:** postgres
     - **Password:** (extraia do DATABASE_URL)
5. **Clique em "Testar Conexão"**
6. **Se funcionar, clique em "Finish"**

---

### Passo 4: Executar SQL

1. **No DBeaver**, clique com botão direito na conexão que você criou
2. **Selecione:** "SQL Editor" → "New SQL Script"
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
4. **Execute:** Ctrl+Enter (Mac: Cmd+Enter) ou clique no botão "Execute SQL Script"
5. **Copie os códigos** da última query (coluna `codigos_backup`)

---

## 🎯 Resumo Rápido

1. ✅ Feche a modal
2. ✅ Vá em "Credenciais" → Copie `DATABASE_URL`
3. ✅ Instale DBeaver
4. ✅ Conecte usando a connection string
5. ✅ Execute o SQL
6. ✅ Copie os códigos

---

**DBeaver é a forma mais fácil! Leva ~5 minutos no total. 🚀**

