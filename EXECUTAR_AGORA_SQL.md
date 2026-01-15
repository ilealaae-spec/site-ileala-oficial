# 🚀 EXECUTAR AGORA - Solução SQL Completa

**Copie e cole este SQL completo no Railway Database → Query**

---

## 📋 SQL Completo para Copiar

```sql
-- ============================================================================
-- GERAR CÓDIGOS DE BACKUP DO 2FA
-- Execute este script completo no Railway Database → Query
-- ============================================================================

-- 1. Verificar status atual
SELECT 
  id,
  email,
  name,
  role,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN '❌ Nenhum código'
    WHEN "twoFactorBackupCodes" = '[]' THEN '❌ Nenhum código'
    ELSE '✅ Códigos existentes'
  END as status_backup
FROM users 
WHERE email = 'ceo@ileala.ae';

-- 2. Gerar 10 códigos de backup (formato: XXXX-XXXX)
DO $$
DECLARE
  codes_array text[];
  code_text text;
  i integer;
BEGIN
  -- Gerar 10 códigos aleatórios
  codes_array := ARRAY[]::text[];
  FOR i IN 1..10 LOOP
    -- Gerar código no formato XXXX-XXXX
    code_text := upper(
      substring(md5(random()::text || clock_timestamp()::text || i::text), 1, 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text || i::text), 5, 4)
    );
    codes_array := array_append(codes_array, code_text);
  END LOOP;
  
  -- Atualizar banco de dados
  UPDATE users 
  SET 
    "twoFactorBackupCodes" = array_to_json(codes_array)::text,
    "updatedAt" = NOW()
  WHERE email = 'ceo@ileala.ae'
    AND "twoFactorEnabled" = 1;
    
  -- Mostrar códigos gerados
  RAISE NOTICE 'Códigos de backup gerados:';
  FOR i IN 1..array_length(codes_array, 1) LOOP
    RAISE NOTICE '%: %', i, codes_array[i];
  END LOOP;
END $$;

-- 3. Ver os códigos gerados (copie esta coluna!)
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup,
  json_array_length("twoFactorBackupCodes"::json) as quantidade_codigos
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## ✅ Passo a Passo

### 1. Acesse o Railway

- https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
- Vá em seu serviço → **Database** → **Query**

### 2. Cole o SQL acima

- Copie todo o bloco SQL
- Cole no editor de query do Railway
- Clique em **"Run"** ou **"Execute"**

### 3. Copie os Códigos

- Na última query, você verá a coluna `codigos_backup`
- Copie o valor (será um array JSON como: `["A3F2-B8C1", "D9E4-2A7B", ...]`)
- **Guarde em local seguro!**

### 4. Fazer Login

1. Acesse: https://ileala.ae/login
2. Email: `ceo@ileala.ae`
3. Senha: `IleAla@2025`
4. Quando aparecer 2FA, use um dos códigos de backup

---

## 🔍 Se Precisar Ver os Códigos Novamente

Execute apenas esta query:

```sql
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## 📝 Formato dos Códigos

Os códigos têm formato: `XXXX-XXXX`

Exemplo:
- `A3F2-B8C1`
- `D9E4-2A7B`
- `1C5D-9E3F`

**Cada código só pode ser usado UMA vez!**

---

## 🔒 Segurança

✅ 2FA permanece habilitado  
✅ Códigos de backup permitem acesso  
✅ Cada código só funciona uma vez  
✅ Pode gerar novos códigos quando necessário  

---

**Pronto! Execute o SQL acima no Railway e você terá acesso mantendo a segurança do 2FA!**

