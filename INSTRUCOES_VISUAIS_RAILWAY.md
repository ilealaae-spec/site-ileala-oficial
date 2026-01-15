# 📍 Instruções Visuais: Executar SQL no Railway

## ✅ Você Está no Lugar Certo!

Você está vendo o serviço **Postgres** no Railway. Perfeito!

---

## 🎯 O Que Fazer Agora

### Passo 1: Clique na Aba "Banco de dados"

Na modal do Postgres que está aberta, você vê várias abas no topo:

- ❌ "Implantações" (Deployments)
- ✅ **"Banco de dados" (Database)** ← **CLIQUE AQUI!**
- ❌ "Cópias de segurança" (Backups) ← Você está aqui agora
- ❌ "Variáveis" (Variables)
- ❌ "Métricas" (Metrics)
- ❌ "Configurações" (Settings)

**Clique na aba "Banco de dados" (Database)**

---

### Passo 2: Encontre o Editor SQL

Dentro da aba "Banco de dados", você deve ver:

- Um campo de texto grande para digitar SQL
- Ou um botão "Query" ou "SQL Editor"
- Ou uma interface para executar queries

---

### Passo 3: Cole o SQL

Cole este SQL completo:

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

---

### Passo 4: Execute

Clique no botão:
- "Run" ou
- "Execute" ou
- "Query" ou
- Similar

---

### Passo 5: Copie os Códigos

Na última query (SELECT), você verá uma coluna `codigos_backup`.

Copie esse valor! Será algo como:
```
["A3F2-B8C1", "D9E4-2A7B", "1C5D-9E3F", ...]
```

---

## 🔍 Se Não Vir a Aba "Banco de dados"

Algumas versões do Railway podem ter interface diferente. Procure por:

1. **Botão "Query"** em algum lugar da página
2. **Link "SQL Editor"** ou "Database Query"
3. **Aba "Data"** ou "Tables"
4. **Ou use um cliente SQL externo:**
   - DBeaver: https://dbeaver.io/download/
   - pgAdmin: https://www.pgadmin.org/download/

---

## 📝 Resumo Visual

```
Railway Dashboard
  ↓
Serviço Postgres (você está aqui ✅)
  ↓
Aba "Banco de dados" ← CLIQUE AQUI
  ↓
Editor SQL
  ↓
Cole o SQL e execute
  ↓
Copie os códigos gerados
```

---

**Pronto! Clique na aba "Banco de dados" e execute o SQL! 🚀**

