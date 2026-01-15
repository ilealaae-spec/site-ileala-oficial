# 🚀 Criar Novo Projeto no Neon - Passo a Passo

Guia detalhado para criar um novo projeto no Neon e conectar ao Railway.

---

## ✅ Passo 1: Criar Projeto no Neon

1. **Acesse:** https://console.neon.tech
2. **Faça login** com sua conta
3. **Clique em "Criar projeto"** (Create project) ou **"New Project"**

4. **Preencha o formulário:**
   - **Nome do projeto:** `ileala-database` ou `ileala-prod`
   - **Região:** Escolha a mais próxima:
     - `US East (Ohio)` - Para EUA
     - `EU (Frankfurt)` - Para Europa
     - `Asia Pacific (Singapore)` - Para Ásia
   - **PostgreSQL Version:** `15` ou `16` (recomendado: 15)
   - **Plano:** `Free` (gratuito, suficiente para começar)

5. **Clique em "Criar projeto"** ou **"Create Project"**

---

## ✅ Passo 2: Obter Connection String

1. **Após criar o projeto**, você será redirecionado para o dashboard
2. **Procure por "Connection Details"** ou **"Detalhes de Conexão"**
3. **Você verá a connection string**, algo como:
   ```
   postgresql://neondb_owner:senha@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copie a connection string completa**

---

## ✅ Passo 3: Migrar Dados (Se Necessário)

### Opção A: Usar DBeaver (Mais Fácil)

1. **Conecte no banco antigo:**
   - Host: `ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `npg_z73MLTX1JCin`

2. **Conecte no banco novo:**
   - Use a nova connection string do Neon

3. **Migrar dados:**
   - Botão direito no banco antigo → "Tools" → "Database Transfer"
   - Selecione todas as tabelas
   - Escolha o banco novo como destino
   - Execute

### Opção B: Usar pg_dump (Terminal)

```bash
# 1. Fazer backup
pg_dump "postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql

# 2. Restaurar no novo banco
psql "postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" < backup.sql
```

---

## ✅ Passo 4: Atualizar Railway

1. **No Railway**, acesse: https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
2. **Vá em `ileala-admin` → Variáveis**
3. **Encontre `URL_DO_BANCO_DE_DADOS`**
4. **Clique em editar** (ícone de lápis)
5. **Cole a nova connection string** do Neon
6. **Salve**

---

## ✅ Passo 5: Usar SQL Editor do Neon

Agora que o projeto está no Neon:

1. **No Neon Dashboard**, clique no seu projeto
2. **Procure por "SQL Editor"** no menu lateral
3. **Ou clique em "Query"** no topo
4. **Cole o SQL para gerar códigos de backup:**

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

5. **Execute** (Ctrl+Enter ou Cmd+Enter)
6. **Copie os códigos** da última query

---

## 📋 Resumo

1. ✅ Criar novo projeto no Neon
2. ✅ Copiar nova connection string
3. ✅ Migrar dados (se necessário)
4. ✅ Atualizar `URL_DO_BANCO_DE_DADOS` no Railway
5. ✅ Usar SQL Editor do Neon para executar queries

---

## 🎯 Vantagens

- ✅ Projeto visível no Neon Dashboard
- ✅ Pode usar SQL Editor do Neon
- ✅ Controle total sobre o banco
- ✅ Gratuito (plano Free)

---

**Pronto! Agora você terá o projeto no Neon e poderá usar o SQL Editor diretamente! 🚀**

