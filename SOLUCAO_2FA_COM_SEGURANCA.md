# 🔐 Solução: Acessar Admin COM 2FA Habilitado (Mantendo Segurança)

**Problema:** Não consigo acessar o painel admin porque o 2FA está habilitado, mas **não quero desabilitar** por questões de segurança.

**Solução:** Use códigos de backup do 2FA ou reconfigurar o 2FA.

---

## ✅ Solução 1: Usar Códigos de Backup (Recomendado)

### Passo 1: Gerar/Ver Códigos de Backup

**Opção A: Via Script TypeScript (Recomendado)**

```bash
cd /Users/elmabichara/site-ileala-oficial
npx tsx gerar-codigos-backup-2fa.ts
```

Este script:
- ✅ Verifica se 2FA está habilitado
- ✅ Verifica se há códigos de backup existentes
- ✅ Gera novos códigos se necessário
- ✅ Mostra todos os códigos de backup

**Opção B: Via SQL no Railway**

1. Acesse: https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
2. Vá em Database → Query
3. Execute: `ver-codigos-backup-2fa.sql`

### Passo 2: Fazer Login com Código de Backup

1. **Acesse:** https://ileala.ae/login
2. **Use as credenciais:**
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla@2025`
3. **Quando aparecer a tela de 2FA:**
   - Digite um dos **códigos de backup** gerados
   - Ou use o código do seu app autenticador (Google Authenticator, Authy, etc.)
4. **Clique em "Verify & Sign In"**

### Passo 3: Acessar o Painel

Após verificar o 2FA, você será redirecionado para o painel admin.

---

## ✅ Solução 2: Usar Código do App Autenticador

Se você configurou o 2FA anteriormente e tem acesso ao app autenticador:

1. **Abra seu app autenticador** (Google Authenticator, Authy, Microsoft Authenticator, etc.)
2. **Procure pela conta "ILE ALA" ou "ceo@ileala.ae"**
3. **Use o código de 6 dígitos** que aparece no app
4. **Digite na tela de 2FA** após fazer login

---

## ✅ Solução 3: Reconfigurar 2FA (Se Perdeu Acesso)

Se você perdeu acesso ao app autenticador e não tem códigos de backup:

### Opção A: Gerar Novos Códigos de Backup

```bash
npx tsx gerar-codigos-backup-2fa.ts
```

Isso gera novos códigos de backup sem desabilitar o 2FA.

### Opção B: Reconfigurar 2FA Completamente

**⚠️ ATENÇÃO:** Esta opção requer acesso temporário ao painel admin.

1. **Primeiro, desabilite temporariamente o 2FA:**
   ```sql
   UPDATE users 
   SET "twoFactorEnabled" = 0
   WHERE email = 'ceo@ileala.ae';
   ```

2. **Faça login e acesse o painel admin**

3. **Reconfigure o 2FA:**
   - Vá em Settings → Security → Two-Factor Authentication
   - Siga as instruções para configurar um novo QR code
   - Escaneie com seu app autenticador
   - **Guarde os códigos de backup** que serão gerados

4. **Reabilite o 2FA** (será feito automaticamente ao configurar)

---

## 🔍 Verificar Status do 2FA

Execute este SQL no Railway para verificar:

```sql
SELECT 
  email,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN 'Nenhum código'
    WHEN "twoFactorBackupCodes" = '[]' THEN 'Nenhum código'
    ELSE 'Códigos disponíveis'
  END as status_backup
FROM users 
WHERE email = 'ceo@ileala.ae';
```

---

## 📋 Checklist Completo

- [ ] Execute `npx tsx gerar-codigos-backup-2fa.ts` para gerar códigos
- [ ] **Guarde os códigos de backup em local seguro** (password manager, arquivo criptografado, etc.)
- [ ] Faça login em https://ileala.ae/login
- [ ] Use email: `ceo@ileala.ae` e senha: `IleAla@2025`
- [ ] Quando aparecer tela de 2FA, use um código de backup ou do app autenticador
- [ ] Acesse o painel admin após verificação

---

## 🔒 Segurança Mantida

✅ **2FA permanece habilitado** - Segurança não é comprometida  
✅ **Códigos de backup permitem recuperação** - Acesso garantido  
✅ **Cada código só pode ser usado uma vez** - Segurança adicional  
✅ **Pode gerar novos códigos quando necessário** - Flexibilidade  

---

## 🆘 Se Nada Funcionar

Se você perdeu:
- ❌ Acesso ao app autenticador
- ❌ Todos os códigos de backup
- ❌ E não consegue reconfigurar

**Última opção (temporária):**

1. Desabilite 2FA temporariamente:
   ```sql
   UPDATE users 
   SET 
     "twoFactorEnabled" = 0,
     "twoFactorSecret" = NULL,
     "twoFactorBackupCodes" = NULL
   WHERE email = 'ceo@ileala.ae';
   ```

2. Faça login e acesse o painel

3. **IMEDIATAMENTE reconfigurar o 2FA** no painel admin

4. Guarde os novos códigos de backup em local seguro

---

## 📝 Arquivos Úteis

- `gerar-codigos-backup-2fa.ts` - Script para gerar códigos de backup
- `ver-codigos-backup-2fa.sql` - SQL para verificar status
- `gerar-codigos-backup-2fa.sql` - SQL de referência

---

**Última atualização:** 4 de Janeiro de 2026

