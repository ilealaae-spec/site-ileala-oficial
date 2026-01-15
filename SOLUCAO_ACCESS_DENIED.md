# 🔧 Solução: "Access Denied" no Painel Admin

**Problema:** Ao acessar `admin.ileala.ae/admin`, aparece a mensagem "Access Denied".

---

## 🔍 Diagnóstico Rápido

Execute o script de diagnóstico para identificar o problema:

```bash
cd /Users/elmabichara/site-ileala-oficial
npx tsx diagnostico-admin.ts
```

Este script verifica:
- ✅ Se o usuário existe no banco
- ✅ Se o role está como 'admin'
- ✅ Se o 2FA está desabilitado
- ✅ Se a senha está definida

---

## 🚀 Solução Passo a Passo

### Passo 1: Executar Script de Correção

```bash
cd /Users/elmabichara/site-ileala-oficial
npx tsx fix-admin-access.ts
```

Este script corrige automaticamente:
- Cria usuário admin se não existir
- Define role como 'admin'
- Desabilita 2FA
- Define senha correta

### Passo 2: Fazer Login

1. **Acesse:** https://ileala.ae/login
2. **Use as credenciais:**
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla@2025`
3. **Após login**, você será redirecionado automaticamente

### Passo 3: Verificar Cookies

Se ainda aparecer "Access Denied" após login:

1. Abra o DevTools (F12)
2. Vá em **Application → Cookies**
3. Verifique se existe o cookie `__session`
4. Se não existir, o login não criou a sessão corretamente

### Passo 4: Verificar Console

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por erros relacionados a:
   - `trpc.auth.me`
   - `TypeError`
   - `401 Unauthorized`
   - `403 Forbidden`

---

## 🔑 Possíveis Causas

### Causa 1: Usuário não tem role 'admin'

**Sintoma:** "Access Denied" mesmo após login bem-sucedido

**Solução:**
```bash
npx tsx fix-admin-access.ts
```

Ou manualmente no banco:
```sql
UPDATE users SET role = 'admin' WHERE email = 'ceo@ileala.ae';
```

---

### Causa 2: API tRPC não está funcionando

**Sintoma:** Erro no console: `TypeError: request.headers.get is not a function`

**Solução:**
1. Verifique se o servidor está rodando no Railway
2. Verifique os logs do Railway para erros
3. Reinicie o serviço se necessário

---

### Causa 3: Cookie não está sendo criado

**Sintoma:** Login funciona mas não cria sessão

**Solução:**
1. Limpe todos os cookies do site
2. Tente fazer login novamente
3. Verifique se o cookie `__session` é criado após login
4. Verifique se o domínio do cookie está correto

---

### Causa 4: 2FA está bloqueando

**Sintoma:** Tela de 2FA aparece após login

**Solução:**
```bash
npx tsx fix-admin-access.ts
```

Ou manualmente no banco:
```sql
UPDATE users 
SET "twoFactorEnabled" = 0,
    "twoFactorSecret" = NULL,
    "twoFactorBackupCodes" = NULL
WHERE email = 'ceo@ileala.ae';
```

---

## 🆘 Login de Emergência

Se nada funcionar, use o login de emergência:

1. **Acesse:** https://ileala.ae/admin-emergency-login
2. **Credenciais:**
   - Email: `ceo@ileala.ae`
   - Senha: `IleAla2025!Admin#Emergency`
3. Isso cria uma sessão de emergência que bypassa algumas verificações

---

## 📋 Checklist Completo

- [ ] Execute `npx tsx diagnostico-admin.ts` para identificar problemas
- [ ] Execute `npx tsx fix-admin-access.ts` para corrigir problemas
- [ ] Faça login em https://ileala.ae/login
- [ ] Verifique se o cookie `__session` foi criado
- [ ] Verifique o console do navegador para erros
- [ ] Tente acessar https://admin.ileala.ae/admin
- [ ] Se ainda não funcionar, use login de emergência

---

## 🔗 URLs Importantes

- **Login:** https://ileala.ae/login
- **Admin:** https://admin.ileala.ae/admin
- **Login Emergência:** https://ileala.ae/admin-emergency-login
- **Railway:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9

---

## 📝 Logs de Debug

O `AdminLayout` agora mostra informações de debug no console:

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por mensagens começando com `[AdminLayout]`
4. Isso mostra:
   - Se o usuário foi encontrado
   - Qual é o role do usuário
   - Se há sessão de emergência
   - Erros da API

---

**Última atualização:** 29 de Novembro de 2024

