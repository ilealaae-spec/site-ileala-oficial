# 📍 ONDE Executar o SQL para Gerar Códigos de Backup

**NÃO é no GitHub!** É no **Railway Dashboard**.

---

## ✅ ONDE Executar: Railway Dashboard

### Passo 1: Acesse o Railway

1. Abra seu navegador
2. Acesse: **https://railway.com**
3. Faça login na sua conta
4. Vá para o projeto: **ILEALA**

### Passo 2: Encontre o Banco de Dados

Você tem **duas opções**:

#### Opção A: Via Serviço do Banco de Dados

1. No Railway Dashboard, procure por um serviço chamado:
   - `PostgreSQL` ou
   - `Database` ou
   - `Neon` ou
   - Qualquer serviço que seja o banco de dados

2. Clique no serviço do banco de dados

3. Procure por uma aba ou botão:
   - **"Query"** ou
   - **"SQL Editor"** ou
   - **"Database"** → **"Query"**

#### Opção B: Via Variável DATABASE_URL

1. No Railway Dashboard, vá em qualquer serviço (ex: `ileala-admin`)
2. Clique em **"Settings"** ou **"Variables"**
3. Procure pela variável `DATABASE_URL`
4. Copie a connection string
5. Use um cliente SQL (DBeaver, pgAdmin, etc.) para conectar

---

## 🚀 Como Executar o SQL

### Método 1: Railway Database Query (Mais Fácil)

1. **Acesse:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9

2. **Encontre o serviço do banco de dados:**
   - Pode estar listado como "PostgreSQL", "Database", ou similar
   - Ou pode estar integrado em outro serviço

3. **Clique no serviço do banco**

4. **Procure por:**
   - Aba **"Query"** ou
   - Botão **"SQL Editor"** ou
   - **"Database"** → **"Query"**

5. **Cole o SQL:**
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

6. **Clique em "Run" ou "Execute"**

7. **Copie os códigos** da última query (coluna `codigos_backup`)

---

### Método 2: Cliente SQL Externo (Alternativa)

Se o Railway não tiver interface de query:

1. **Instale um cliente SQL:**
   - **DBeaver** (gratuito): https://dbeaver.io/download/
   - **pgAdmin** (gratuito): https://www.pgadmin.org/download/
   - **TablePlus** (pago, mas tem trial): https://tableplus.com/

2. **Conecte ao banco:**
   - No Railway, vá em **Settings** → **Variables**
   - Copie o valor de `DATABASE_URL`
   - Use essa connection string no cliente SQL

3. **Execute o SQL** no cliente

---

## ❌ ONDE NÃO Executar

- ❌ **GitHub** - GitHub é apenas para código, não executa SQL
- ❌ **Git** - Sistema de versionamento, não executa queries
- ❌ **Editor de código local** - Não tem acesso ao banco

---

## 🔍 Como Saber se Está no Lugar Certo

Você está no lugar certo se:
- ✅ Vê uma interface com campo de texto para digitar SQL
- ✅ Vê botões como "Run", "Execute", "Query"
- ✅ Está no Railway Dashboard (não GitHub)
- ✅ Consegue ver tabelas do banco de dados

---

## 📸 Onde Procurar no Railway

No Railway Dashboard, procure por:

1. **Lista de serviços** (lado esquerdo ou central)
2. **Serviço do banco de dados** (pode ter ícone de banco de dados)
3. **Aba "Query" ou "SQL"** dentro do serviço
4. **Ou Settings → Database → Query**

---

## 🆘 Se Não Encontrar

1. **Verifique se o banco está conectado:**
   - No Railway, vá em **Settings** → **Variables**
   - Deve existir `DATABASE_URL`

2. **Use um cliente SQL externo:**
   - Instale DBeaver ou pgAdmin
   - Conecte usando a `DATABASE_URL`

3. **Verifique a documentação do Railway:**
   - Railway pode ter mudado a interface
   - Procure por "How to run SQL queries" na documentação

---

## 📝 Resumo

✅ **ONDE:** Railway Dashboard → Database → Query  
❌ **NÃO:** GitHub, Git, ou editor local  
🔧 **ALTERNATIVA:** Cliente SQL externo (DBeaver, pgAdmin)  

---

**Precisa de ajuda para encontrar? Me diga o que você vê no Railway Dashboard!**

