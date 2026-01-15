# 🔐 Resolver 2FA Automaticamente - Guia Rápido

**Objetivo:** Gerar códigos de backup do 2FA mantendo a segurança habilitada.

---

## ✅ Solução Automática via SQL (2 minutos)

### Passo 1: Executar SQL no Railway

1. **Acesse o Railway Dashboard:**
   - https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
   - Vá em seu serviço → **Database** → **Query**

2. **Cole e execute este SQL completo:**

```sql
-- Verificar status atual
SELECT 
  id,
  email,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN 'Nenhum código'
    WHEN "twoFactorBackupCodes" = '[]' THEN 'Nenhum código'
    ELSE 'Códigos existentes'
  END as status_backup
FROM users 
WHERE email = 'ceo@ileala.ae';

-- Gerar 10 códigos de backup
WITH random_codes AS (
  SELECT 
    array_agg(
      upper(
        substring(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
        substring(md5(random()::text || clock_timestamp()::text), 5, 4)
      )
    ) as codes
  FROM generate_series(1, 10)
)
UPDATE users 
SET 
  "twoFactorBackupCodes" = (
    SELECT json_agg(code)::text 
    FROM unnest((SELECT codes FROM random_codes)) as code
  ),
  "updatedAt" = NOW()
WHERE email = 'ceo@ileala.ae'
  AND "twoFactorEnabled" = 1;

-- Ver os códigos gerados
SELECT 
  email,
  "twoFactorBackupCodes" as codigos_backup
FROM users 
WHERE email = 'ceo@ileala.ae';
```

3. **Copie os códigos da última query** (coluna `codigos_backup`)

4. **Guarde os códigos em local seguro:**
   - Password manager (1Password, LastPass, Bitwarden)
   - Arquivo de texto criptografado
   - Anotação segura

### Passo 2: Fazer Login

1. **Acesse:** https://ileala.ae/login
2. **Credenciais:**
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla@2025`
3. **Quando aparecer a tela de 2FA:**
   - Digite um dos códigos de backup gerados
   - Ou use o código do seu app autenticador
4. **Clique em "Verify & Sign In"**

### Passo 3: Acessar Painel Admin

Após verificar o 2FA, você será redirecionado para:
- https://admin.ileala.ae/admin

---

## 🔍 Verificar Códigos Existentes

Se quiser ver os códigos que já existem (sem gerar novos):

```sql
SELECT 
  email,
  "twoFactorBackupCodes"
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## 📋 Formato dos Códigos

Os códigos de backup têm o formato: `XXXX-XXXX`

Exemplo:
- `A3F2-B8C1`
- `D9E4-2A7B`
- `1C5D-9E3F`

Cada código só pode ser usado **uma vez**.

---

## 🔒 Segurança Mantida

✅ **2FA permanece habilitado** - Segurança não é comprometida  
✅ **Códigos de backup permitem recuperação** - Acesso garantido  
✅ **Cada código só pode ser usado uma vez** - Segurança adicional  
✅ **Pode gerar novos códigos quando necessário** - Flexibilidade  

---

## 🆘 Se Precisar Gerar Novos Códigos

Execute o mesmo SQL acima novamente. Isso substituirá os códigos antigos por novos.

---

## 📝 Arquivo SQL Completo

Veja o arquivo `gerar-backup-codes-sql.sql` na raiz do projeto para o script completo.

---

**Última atualização:** 4 de Janeiro de 2026

