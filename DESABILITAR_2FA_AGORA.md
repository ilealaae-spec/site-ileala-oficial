# 🚨 DESABILITAR 2FA AGORA - Solução Rápida

**Problema Identificado:** Os logs do Railway mostram que o 2FA está habilitado para o usuário admin, bloqueando o acesso.

---

## ✅ Solução Rápida (2 minutos)

### Opção 1: Via SQL no Railway (RECOMENDADO - Mais Rápido)

1. **Acesse o Railway Dashboard:**
   - https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9

2. **Vá até o banco de dados:**
   - Clique no serviço que contém o banco de dados
   - Ou vá em **Settings → Database → Query**

3. **Execute este SQL:**
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

4. **Verifique se funcionou:**
   ```sql
   SELECT 
     id,
     email,
     role,
     "twoFactorEnabled"
   FROM users 
   WHERE email = 'ceo@ileala.ae';
   ```
   
   **Resultado esperado:**
   - `role` = `admin`
   - `twoFactorEnabled` = `0`

5. **Teste o login:**
   - Acesse: https://ileala.ae/login
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla@2025`

---

### Opção 2: Via Terminal do Railway

1. **Acesse o Railway Dashboard**
2. **Vá em seu serviço `ileala-admin`**
3. **Clique em "Deployments" → "View Logs"**
4. **Ou use o terminal:**
   - Clique em "Settings" → "Connect" (se disponível)
   - Ou use Railway CLI: `railway run bash`

5. **Execute o script:**
   ```bash
   cd /path/to/project
   npx tsx fix-admin-access.ts
   ```

---

### Opção 3: Via Script Local (se tiver DATABASE_URL)

1. **Configure a variável DATABASE_URL:**
   ```bash
   export DATABASE_URL="postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require"
   ```
   
   **Onde encontrar:**
   - Railway Dashboard → Database → Connection String
   - Ou Neon Dashboard → Connection Details

2. **Execute o script:**
   ```bash
   cd /Users/elmabichara/site-ileala-oficial
   npx tsx fix-admin-access.ts
   ```

---

## 🔍 Verificação

Após executar qualquer uma das opções acima:

1. **Verifique os logs do Railway:**
   - Os logs devem mostrar: `twoFactorEnabled: 0` ou `is2FAEnabled: false`

2. **Teste o login:**
   - Acesse: https://ileala.ae/login
   - Use: `ceo@ileala.ae` / `IleAla@2025`
   - **NÃO deve aparecer tela de 2FA**

3. **Acesse o painel:**
   - https://admin.ileala.ae/admin
   - **NÃO deve aparecer "Access Denied"**

---

## 📋 Checklist Rápido

- [ ] Execute o SQL no Railway (Opção 1 - mais rápida)
- [ ] Verifique se `twoFactorEnabled = 0` no banco
- [ ] Verifique se `role = 'admin'` no banco
- [ ] Teste o login em https://ileala.ae/login
- [ ] Acesse https://admin.ileala.ae/admin
- [ ] Verifique se não aparece mais "Access Denied"

---

## 🆘 Se Ainda Não Funcionar

1. **Limpe os cookies:**
   - DevTools (F12) → Application → Cookies
   - Delete todos os cookies de `ileala.ae` e `admin.ileala.ae`

2. **Use login de emergência:**
   - https://ileala.ae/admin-emergency-login
   - Credenciais: `ceo@ileala.ae` / `IleAla2025!Admin#Emergency`

3. **Verifique os logs do Railway:**
   - Procure por erros relacionados a autenticação
   - Verifique se o servidor está rodando

---

**Última atualização:** 4 de Janeiro de 2026

