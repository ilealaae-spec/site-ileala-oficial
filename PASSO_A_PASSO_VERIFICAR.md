# 📋 Passo a Passo: Verificar e Gerar Códigos

## ✅ Passo 1: Verificar se o Usuário Foi Criado

**Cole este SQL no editor e execute:**

```sql
SELECT 
  id,
  email,
  name,
  role,
  "twoFactorEnabled"
FROM "users" 
WHERE email = 'ceo@ileala.ae';
```

**O que esperar:**
- Deve mostrar 1 linha com os dados do usuário
- `role` deve ser `admin`
- `twoFactorEnabled` deve ser `1`

**Se não aparecer nada:**
- O usuário não foi criado
- Execute novamente a parte 2 do SQL (INSERT)

---

## ✅ Passo 2: Se o Usuário Existe, Gerar Códigos de Backup

**Cole este SQL e execute:**

```sql
-- Gerar códigos de backup do 2FA
DO $$
DECLARE
  codes_array text[];
  code_text text;
  i integer;
  user_id INTEGER;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO user_id FROM "users" WHERE email = 'ceo@ileala.ae';
  
  -- Se usuário não existe, criar
  IF user_id IS NULL THEN
    INSERT INTO "users" (email, name, password, role, "twoFactorEnabled", "emailVerified")
    VALUES (
      'ceo@ileala.ae',
      'CEO Admin',
      '$2b$10$HvBfygcg3oXZ4lF7t6OzDuRFyjdJ/aw0KUeY1x4W/hRHYiZTEVf1.',
      'admin',
      1,
      1
    ) RETURNING id INTO user_id;
  END IF;
  
  -- Gerar 10 códigos de backup
  codes_array := ARRAY[]::text[];
  FOR i IN 1..10 LOOP
    code_text := upper(
      substring(md5(random()::text || clock_timestamp()::text || i::text), 1, 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text || i::text), 5, 4)
    );
    codes_array := array_append(codes_array, code_text);
  END LOOP;
  
  -- Atualizar códigos no banco
  UPDATE "users" 
  SET 
    "twoFactorBackupCodes" = array_to_json(codes_array)::text,
    "updatedAt" = NOW()
  WHERE id = user_id;
  
  -- Mostrar códigos gerados
  RAISE NOTICE 'Códigos gerados: %', array_to_string(codes_array, ', ');
END $$;
```

---

## ✅ Passo 3: Ver os Códigos Gerados

**Cole este SQL e execute:**

```sql
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup
FROM "users" 
WHERE email = 'ceo@ileala.ae';
```

**O que esperar:**
- Deve mostrar a coluna `codigos_backup` com um array JSON
- Algo como: `["A3F2-B8C1", "D9E4-2A7B", ...]`

**Copie esse valor!**

---

## 🔍 Se Ainda Não Funcionar

Execute este SQL para ver o que está no banco:

```sql
SELECT * FROM "users" WHERE email = 'ceo@ileala.ae';
```

Isso mostra todos os campos do usuário.

---

**Siga os passos acima e me diga o que aparece em cada um!**

