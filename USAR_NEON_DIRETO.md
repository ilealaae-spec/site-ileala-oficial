# 🎉 Perfeito! Você Tem Neon Configurado!

Vi que você tem a variável `URL_DO_BANCO_DE_DADOS` com a connection string do Neon!

---

## ✅ Solução: Usar o Neon Dashboard

### Passo 1: Acesse o Neon Dashboard

1. **Abra:** https://console.neon.tech
2. **Faça login** com a mesma conta
3. **Procure pelo projeto** que contém o banco `neondb`

### Passo 2: Encontre o SQL Editor

No Neon Dashboard, procure por:
- **"SQL Editor"** (geralmente no menu lateral esquerdo)
- Ou **"Query"** no topo
- Ou um botão **"New Query"** ou **"SQL Editor"**

### Passo 3: Execute o SQL

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

### Passo 4: Execute e Copie

1. **Clique em "Run"** ou pressione **Ctrl+Enter** (Mac: Cmd+Enter)
2. **Aguarde** a execução
3. **Na última query (SELECT)**, copie o valor da coluna `codigos_backup`
4. **Guarde os códigos em local seguro!**

---

## 🔍 Se Não Encontrar o SQL Editor no Neon

1. **Procure por "Branches"** → Selecione o branch → "SQL Editor"
2. **Ou procure por "Query"** no menu
3. **Ou use DBeaver** com a connection string que você viu:
   - `postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

---

## 📋 Connection String do Neon

Você pode copiar a connection string do Railway:
- Variável: `URL_DO_BANCO_DE_DADOS`
- Valor: `postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

Use essa connection string no DBeaver se preferir!

---

**Acesse o Neon Dashboard e use o SQL Editor - é muito mais fácil! 🚀**

