# ✅ Solução Final: Acessar Admin COM 2FA Habilitado

**Status:** ✅ Pronto para executar  
**Tempo:** 2 minutos  
**Segurança:** ✅ Mantida (2FA permanece habilitado)

---

## 🚀 EXECUTAR AGORA (Copiar e Colar)

### Passo 1: Acesse o Railway (NÃO é no GitHub!)

**⚠️ IMPORTANTE:** Execute o SQL no **Railway Dashboard**, não no GitHub!

1. **Abra seu navegador** e acesse: https://railway.com
2. **Faça login** na sua conta Railway
3. **Vá para o projeto:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
4. **Encontre o serviço do banco de dados:**
   - Procure por um serviço chamado "PostgreSQL", "Database", "Neon" ou similar
   - Ou pode estar integrado em outro serviço
5. **Clique no serviço do banco**
6. **Procure por:**
   - Aba **"Query"** ou
   - Botão **"SQL Editor"** ou
   - **"Database"** → **"Query"**

📄 **Veja guia detalhado:** `ONDE_EXECUTAR_SQL.md`

### Passo 2: Execute Este SQL

**Copie TODO este bloco e cole no Railway:**

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

### Passo 3: Copie os Códigos

- Na última query, copie o valor da coluna `codigos_backup`
- Será algo como: `["A3F2-B8C1", "D9E4-2A7B", "1C5D-9E3F", ...]`
- **Guarde em local seguro!** (password manager, arquivo criptografado)

### Passo 4: Fazer Login

1. **Acesse:** https://ileala.ae/login
2. **Email:** `ceo@ileala.ae`
3. **Senha:** `IleAla@2025`
4. **Quando aparecer a tela de 2FA:**
   - Digite um dos códigos de backup (formato: `XXXX-XXXX`)
   - Ou use o código do seu app autenticador
5. **Clique em "Verify & Sign In"**

### Passo 5: Acessar Painel

Após verificar o 2FA, você será redirecionado para:
- https://admin.ileala.ae/admin

---

## 📋 Resumo

✅ **2FA permanece habilitado** - Segurança mantida  
✅ **Códigos de backup gerados** - Acesso garantido  
✅ **Cada código só funciona uma vez** - Segurança adicional  
✅ **Pode gerar novos códigos quando necessário** - Flexibilidade  

---

## 🔍 Ver Códigos Novamente

Se precisar ver os códigos depois:

```sql
SELECT "twoFactorBackupCodes" 
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## 🆘 Se Algo Der Errado

1. **Verifique se 2FA está habilitado:**
   ```sql
   SELECT email, "twoFactorEnabled" 
   FROM users 
   WHERE email = 'ceo@ileala.ae';
   ```
   Deve mostrar: `twoFactorEnabled = 1`

2. **Verifique se os códigos foram gerados:**
   ```sql
   SELECT "twoFactorBackupCodes" 
   FROM users 
   WHERE email = 'ceo@ileala.ae';
   ```
   Não deve ser `NULL` ou `[]`

3. **Se não funcionar, execute o SQL novamente**

---

**Pronto! Execute o SQL acima e você terá acesso mantendo a segurança do 2FA! 🎉**

