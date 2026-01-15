# 🔧 Solução: Usar DBeaver com Connection String do Railway

O projeto Neon pode estar em outra conta. Vamos usar DBeaver diretamente com a connection string que você viu no Railway.

---

## ✅ Passo a Passo

### Passo 1: Copiar Connection String do Railway

1. **No Railway**, você já está vendo a variável `URL_DO_BANCO_DE_DADOS`
2. **Clique no ícone de copiar** ao lado do valor
3. **A connection string é:**
   ```
   postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### Passo 2: Instalar DBeaver

1. **Baixe:** https://dbeaver.io/download/
2. **Escolha:** "DBeaver Community Edition" (gratuito)
3. **Instale** (é rápido, ~2 minutos)

### Passo 3: Conectar no DBeaver

1. **Abra o DBeaver**
2. **Clique em "Nova Conexão"** (ícone de plug no topo, ou File → New → Database Connection)
3. **Selecione "PostgreSQL"** → Next

4. **Na aba "Principal":**
   - **Host:** `ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech`
   - **Port:** `5432`
   - **Database:** `neondb`
   - **Username:** `neondb_owner`
   - **Password:** `npg_z73MLTX1JCin`
   - **Ou cole a URL completa** no campo "URL" (se houver essa opção)

5. **Na aba "SSL":**
   - Marque **"Use SSL"**
   - SSL Mode: **"require"**

6. **Clique em "Testar Conexão"**
   - Se pedir para baixar driver PostgreSQL, clique "Download"
   - Aguarde o download

7. **Se a conexão funcionar, clique em "Finish"**

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

-- Ver os códigos gerados (COPIE ESTA COLUNA!)
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup
FROM users 
WHERE email = 'ceo@ileala.ae';
```

4. **Execute:** 
   - **Mac:** Cmd+Enter
   - **Windows/Linux:** Ctrl+Enter
   - Ou clique no botão "Execute SQL Script" (ícone de play)

5. **Copie os códigos** da última query (coluna `codigos_backup`)

---

## 🔍 Por Que o Projeto Não Aparece no Neon?

Possíveis razões:

1. **Projeto está em outra organização** - O projeto pode estar em uma organização diferente do Neon
2. **Projeto foi deletado** - Mas a connection string ainda funciona (pode estar em cache)
3. **Conta diferente** - O projeto foi criado com outra conta de email
4. **Projeto foi movido** - Para outra organização

**Mas não importa!** A connection string funciona, então podemos usar DBeaver diretamente.

---

## 📋 Resumo

1. ✅ Copie a connection string do Railway (`URL_DO_BANCO_DE_DADOS`)
2. ✅ Instale DBeaver
3. ✅ Conecte usando os dados da connection string
4. ✅ Execute o SQL
5. ✅ Copie os códigos gerados

---

**DBeaver funciona mesmo sem ver o projeto no Neon Dashboard! 🚀**

