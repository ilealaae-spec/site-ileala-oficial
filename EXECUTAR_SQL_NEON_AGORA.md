# ✅ Executar SQL no Neon - Agora!

Você está no SQL Editor do Neon. Siga estes passos:

---

## 🎯 Passo a Passo

### Passo 1: Apagar o Código de Exemplo

1. **Selecione TODO o código** que está no editor (Ctrl+A ou Cmd+A)
2. **Delete** (Delete ou Backspace)
3. **O editor deve ficar vazio**

### Passo 2: Colar o SQL

**Cole este SQL completo:**

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

### Passo 3: Executar

1. **Clique no botão "▷ Correr"** (Run) que está abaixo do editor
2. **Ou pressione:** Ctrl+Enter (Windows/Linux) ou Cmd+Enter (Mac)

### Passo 4: Copiar os Códigos

1. **Aguarde** a execução terminar
2. **Na última query (SELECT)**, você verá os resultados
3. **Na coluna `codigos_backup`**, copie o valor
4. **Será algo como:** `["A3F2-B8C1", "D9E4-2A7B", "1C5D-9E3F", ...]`
5. **Guarde os códigos em local seguro!**

---

## 📋 Resumo Visual

```
1. Selecione tudo (Cmd+A)
2. Delete
3. Cole o SQL acima
4. Clique em "▷ Correr"
5. Copie os códigos da última query
```

---

## ✅ Pronto!

Depois de executar, você terá os códigos de backup do 2FA e poderá fazer login mantendo a segurança habilitada!

---

**Execute agora! 🚀**

