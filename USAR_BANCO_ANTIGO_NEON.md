# ✅ Solução: Usar o Banco Antigo do Neon (Que Já Tem Dados)

O banco novo está vazio. Vamos usar o banco ANTIGO que já tem os dados do usuário admin.

---

## 🎯 Solução: Conectar no Banco Antigo

### Passo 1: Obter Connection String do Banco Antigo

1. **No Railway**, vá em `ileala-admin` → **Variáveis**
2. **Encontre `URL_DO_BANCO_DE_DADOS`**
3. **Copie a connection string completa:**
   ```
   postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### Passo 2: Usar DBeaver para Conectar

1. **Abra DBeaver**
2. **Nova Conexão → PostgreSQL**
3. **Preencha com os dados da connection string:**
   - **Host:** `ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech`
   - **Port:** `5432`
   - **Database:** `neondb`
   - **Username:** `neondb_owner`
   - **Password:** `npg_z73MLTX1JCin`
4. **Na aba SSL:** Marque "Use SSL"
5. **Teste e conecte**

### Passo 3: Executar SQL

1. **Botão direito na conexão** → SQL Editor → New SQL Script
2. **Cole o SQL:**
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
3. **Execute** (Cmd+Enter)
4. **Copie os códigos** da última query

---

## 🔄 Alternativa: Criar Tabelas no Banco Novo

Se você quiser usar o banco novo, precisa criar as tabelas primeiro. Mas isso é mais complexo e você perderá os dados existentes.

**Recomendação:** Use o banco antigo que já tem tudo configurado!

---

**Use DBeaver com a connection string do Railway - é mais rápido! 🚀**

