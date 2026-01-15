# 🚀 Executar SQL no Neon (Mais Fácil!)

Se você já tem Neon configurado, use o Neon diretamente! É muito mais fácil.

---

## ✅ Passo a Passo no Neon

### Passo 1: Acesse o Neon Dashboard

1. **Abra:** https://console.neon.tech
2. **Faça login** na sua conta
3. **Selecione o projeto** do Ile Ala

### Passo 2: Abra o SQL Editor

1. **No dashboard do Neon**, procure por:
   - **"SQL Editor"** ou
   - **"Query"** ou
   - **"SQL"** ou
   - Um botão com ícone de terminal/editor

2. **Clique** para abrir o editor SQL

### Passo 3: Cole e Execute o SQL

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

### Passo 4: Execute

1. **Clique no botão "Run"** ou **"Execute"** ou pressione **Ctrl+Enter**
2. **Aguarde** a execução
3. **Na última query (SELECT)**, você verá os códigos na coluna `codigos_backup`

### Passo 5: Copie os Códigos

- **Copie o valor** da coluna `codigos_backup`
- Será algo como: `["A3F2-B8C1", "D9E4-2A7B", "1C5D-9E3F", ...]`
- **Guarde em local seguro!**

---

## 🔍 Onde Encontrar o SQL Editor no Neon

O Neon geralmente tem o SQL Editor em:

1. **Menu lateral esquerdo** → "SQL Editor"
2. **Ou no topo** → Aba "SQL" ou "Query"
3. **Ou no dashboard principal** → Botão "New Query" ou "SQL Editor"

---

## 📋 Verificar se Está no Banco Certo

Antes de executar, verifique se está conectado ao banco correto:

```sql
SELECT current_database();
```

Deve mostrar o nome do banco do Ile Ala.

---

## ✅ Vantagens do Neon

- ✅ Interface SQL mais amigável
- ✅ Editor visual melhor
- ✅ Mais fácil de usar
- ✅ Já está configurado

---

## 🆘 Se Não Encontrar o SQL Editor

1. **Procure por "Query"** ou "SQL" no menu
2. **Ou use o botão "Connect"** que pode abrir um terminal SQL
3. **Ou vá em "Branches" → Seu branch → "SQL Editor"**

---

**Pronto! Use o Neon que é muito mais fácil! 🎉**

