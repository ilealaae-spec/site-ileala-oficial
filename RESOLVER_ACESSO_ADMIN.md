# 🔧 Resolver Acesso ao Painel de Admin - Guia Completo

**Data:** 29 de Novembro de 2024

---

## 🎯 Problema

Não consigo acessar o painel de admin da Ile Ala.

---

## ✅ Solução Rápida

### 🔐 SOLUÇÃO COM SEGURANÇA: Usar Códigos de Backup do 2FA (Recomendado)

**Se você quer manter o 2FA habilitado por segurança:**

1. **Gere códigos de backup:**
   ```bash
   npx tsx gerar-codigos-backup-2fa.ts
   ```

2. **Guarde os códigos em local seguro**

3. **Faça login e use um código de backup quando aparecer a tela de 2FA**

📄 **Veja guia completo:** `SOLUCAO_2FA_COM_SEGURANCA.md`

---

### 🚨 SOLUÇÃO TEMPORÁRIA: Desabilitar 2FA (Apenas se necessário)

**Se os logs do Railway mostram que 2FA está habilitado, use esta solução:**

1. **Acesse o Railway Dashboard:**
   - https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
   - Vá em seu serviço → Database → Query

2. **Execute este SQL:**
   ```sql
   UPDATE users 
   SET 
     "twoFactorEnabled" = 0,
     "twoFactorSecret" = NULL,
     "twoFactorBackupCodes" = NULL
   WHERE email = 'ceo@ileala.ae';
   
   UPDATE users 
   SET role = 'admin'
   WHERE email = 'ceo@ileala.ae';
   ```

3. **Verifique:**
   ```sql
   SELECT email, role, "twoFactorEnabled" 
   FROM users 
   WHERE email = 'ceo@ileala.ae';
   ```
   
   Deve mostrar: `role = 'admin'` e `twoFactorEnabled = 0`

4. **Teste o login:** https://ileala.ae/login

**📄 Arquivo SQL pronto:** Veja `desabilitar-2fa.sql` na raiz do projeto

---

### Opção 2: Executar Script de Correção

Execute o script que corrige automaticamente todos os problemas:

```bash
cd /Users/elmabichara/site-ileala-oficial
npx tsx fix-admin-access.ts
```

**Nota:** Este script precisa de `DATABASE_URL` configurada. Se não tiver, use a Opção 1 (SQL) acima.

### Passo 2: Testar Login

1. Acesse: **https://ileala.ae/login**
2. Use as credenciais:
   - **Email:** `ceo@ileala.ae`
   - **Senha:** `IleAla@2025`
3. Após login, você será redirecionado para o painel admin

### Passo 3: Acesso Direto (se necessário)

Se o redirecionamento automático não funcionar:

1. Acesse diretamente: **https://admin.ileala.ae/admin**
2. Se pedir login novamente, use as mesmas credenciais

---

## 🔍 O Que o Script Faz

O script `fix-admin-access.ts` verifica e corrige automaticamente:

1. ✅ **Conexão com banco de dados** - Verifica se está acessível
2. ✅ **Usuário admin existe** - Cria se não existir
3. ✅ **Role é 'admin'** - Garante que o usuário tem permissões de admin
4. ✅ **2FA desabilitado** - Remove 2FA se estiver bloqueando o acesso
5. ✅ **Senha correta** - Define/atualiza a senha para `IleAla@2025`

---

## 📋 Checklist Manual (se o script não funcionar)

### 1. Verificar Servidor Railway

- [ ] Acesse: https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
- [ ] Verifique se o serviço `ileala-admin` está **On-line** (verde)
- [ ] Se estiver offline, clique em "Deploy" ou "Restart"

### 2. Verificar Variáveis de Ambiente

No Railway, vá em **Settings → Variables** e verifique:

- [ ] `DATABASE_URL` - String de conexão PostgreSQL (deve estar configurada)
- [ ] `JWT_SECRET` - Chave secreta (deve estar configurada)
- [ ] `NODE_ENV` - Deve ser `production`

### 3. Verificar Usuário no Banco

Execute no banco de dados (via Railway → Database → Query):

```sql
SELECT id, email, role, "twoFactorEnabled" 
FROM users 
WHERE email = 'ceo@ileala.ae';
```

**Resultado esperado:**
- `email` = `ceo@ileala.ae`
- `role` = `admin` (não `user`)
- `twoFactorEnabled` = `0` (não `1`)

**Se não estiver correto, execute:**

```sql
-- Atualizar role para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'ceo@ileala.ae';

-- Desabilitar 2FA
UPDATE users 
SET "twoFactorEnabled" = 0,
    "twoFactorSecret" = NULL,
    "twoFactorBackupCodes" = NULL
WHERE email = 'ceo@ileala.ae';
```

### 4. Verificar Senha

Se a senha não funcionar, você pode resetá-la:

**Opção 1: Via Script (recomendado)**
```bash
tsx fix-admin-access.ts
```

**Opção 2: Via SQL (se tiver acesso direto ao banco)**
```sql
-- Hash da senha 'IleAla@2025' (bcrypt, 10 rounds)
-- Nota: Você precisa gerar o hash com bcrypt primeiro
UPDATE users 
SET password = '$2a$10$...' -- Substitua pelo hash gerado
WHERE email = 'ceo@ileala.ae';
```

---

## 🚨 Problemas Comuns

### Problema 1: "Access Denied" após login

**Causa:** Usuário não tem role 'admin'

**Solução:**
1. Execute o script `fix-admin-access.ts`
2. Ou execute no banco: `UPDATE users SET role = 'admin' WHERE email = 'ceo@ileala.ae';`

---

### Problema 2: Tela de 2FA aparece

**Causa:** 2FA está habilitado

**Solução:**
1. Execute o script `fix-admin-access.ts` (desabilita automaticamente)
2. Ou execute no banco:
   ```sql
   UPDATE users 
   SET "twoFactorEnabled" = 0 
   WHERE email = 'ceo@ileala.ae';
   ```

---

### Problema 3: "Invalid email or password"

**Causa:** Senha incorreta ou usuário não existe

**Solução:**
1. Execute o script `fix-admin-access.ts` (cria/atualiza usuário e senha)
2. Verifique se email está correto: `ceo@ileala.ae`
3. Verifique se senha está correta: `IleAla@2025`

---

### Problema 4: Redirecionamento infinito

**Causa:** Sessão não está sendo criada

**Solução:**
1. Limpe todos os cookies do site (DevTools → Application → Cookies)
2. Tente fazer login novamente
3. Verifique se o cookie `__session` está sendo criado após login

---

### Problema 5: API não responde

**Causa:** Servidor não está rodando ou há erro

**Solução:**
1. Verifique no Railway se o serviço está online
2. Verifique os logs do Railway para erros
3. Tente reiniciar o serviço no Railway

---

## 🔑 Credenciais de Acesso

### Credenciais Principais
- **Email:** `ceo@ileala.ae`
- **Senha:** `IleAla@2025`

### Credenciais de Emergência (AdminEmergencyLogin)
- **Email:** `ceo@ileala.ae`
- **Senha:** `IleAla2025!Admin#Emergency`
- **URL:** https://ileala.ae/admin-emergency-login

---

## 🔗 URLs Importantes

- **Site principal:** https://ileala.ae
- **Admin:** https://admin.ileala.ae/admin
- **Login:** https://ileala.ae/login
- **Login Admin:** https://admin.ileala.ae/login
- **Login Emergência:** https://ileala.ae/admin-emergency-login
- **Railway Dashboard:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9

---

## 📝 Próximos Passos

1. ✅ **Execute o script:** `tsx fix-admin-access.ts`
2. ✅ **Teste o login:** https://ileala.ae/login
3. ✅ **Acesse o painel:** https://admin.ileala.ae/admin

Se ainda não funcionar após seguir todos os passos:

1. Verifique os logs do Railway
2. Verifique o console do navegador (F12)
3. Verifique os cookies no DevTools
4. Entre em contato com suporte técnico

---

**Última atualização:** 29 de Novembro de 2024

