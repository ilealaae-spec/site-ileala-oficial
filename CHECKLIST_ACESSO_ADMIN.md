# Checklist: Resolver Acesso ao Painel de Admin

**Data:** 29 de Novembro de 2024  
**Status:** 🔴 Em andamento

---

## 📋 Checklist de Verificação

### ✅ 1. Verificar Servidor e Banco de Dados

- [ ] **Servidor está rodando?**
  - Verificar no Railway se o serviço `ileala-admin` está online
  - URL: https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9
  - Status esperado: ✅ On-line (verde)

- [ ] **Banco de dados está acessível?**
  - Verificar variável `DATABASE_URL` no Railway
  - Testar conexão com o banco

- [ ] **Variáveis de ambiente configuradas?**
  - `DATABASE_URL` - String de conexão PostgreSQL
  - `JWT_SECRET` - Chave secreta para JWT
  - `NODE_ENV` - Deve ser `production`

---

### ✅ 2. Verificar Usuário Admin

- [ ] **Usuário admin existe no banco?**
  - Email: `ceo@ileala.ae`
  - Executar script: `pnpm tsx fix-admin-access.ts`

- [ ] **Role está como 'admin'?**
  - Verificar campo `role` na tabela `users`
  - Deve ser `'admin'` (não `'user'`)

- [ ] **Senha está correta?**
  - Senha esperada: `IleAla@2025`
  - Se não funcionar, executar script de correção

---

### ✅ 3. Verificar 2FA (Two-Factor Authentication)

- [ ] **2FA está desabilitado?**
  - Campo `twoFactorEnabled` deve ser `0` (não `1`)
  - Se estiver habilitado, desabilitar com o script

- [ ] **Se 2FA estiver habilitado:**
  - Opção 1: Desabilitar 2FA (recomendado para acesso imediato)
  - Opção 2: Usar código do autenticador (Google Authenticator, Authy, etc.)

---

### ✅ 4. Verificar Autenticação e Sessão

- [ ] **API tRPC está funcionando?**
  - Testar endpoint: `https://admin.ileala.ae/api/trpc/auth.me`
  - Deve retornar dados do usuário ou `null`

- [ ] **Cookies estão sendo definidos?**
  - Verificar no DevTools → Application → Cookies
  - Cookie `__session` deve existir após login

- [ ] **Sessão está sendo criada?**
  - Após login, verificar se cookie contém dados do usuário
  - Deve incluir `role: 'admin'`

---

### ✅ 5. Testar Acesso

- [ ] **Login com credenciais de emergência:**
  - Email: `ceo@ileala.ae`
  - Senha: `IleAla@2025`
  - URL: `https://ileala.ae/login` ou `https://admin.ileala.ae/login`

- [ ] **Acesso direto ao painel:**
  - URL: `https://admin.ileala.ae/admin`
  - Deve redirecionar para login se não autenticado

- [ ] **Login de emergência:**
  - URL: `https://ileala.ae/admin-emergency-login`
  - Credenciais: `ceo@ileala.ae` / `IleAla2025!Admin#Emergency`

---

## 🔧 Scripts de Correção

### Script Principal: `fix-admin-access.ts`

Este script faz tudo automaticamente:

```bash
cd /Users/elmabichara/site-ileala-oficial
pnpm tsx fix-admin-access.ts
```

**O que o script faz:**
1. ✅ Verifica conexão com banco de dados
2. ✅ Cria usuário admin se não existir
3. ✅ Garante que role é 'admin'
4. ✅ Desabilita 2FA se estiver habilitado
5. ✅ Atualiza senha se necessário

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "Access Denied" após login

**Causa:** Usuário não tem role 'admin' ou sessão não está sendo criada

**Solução:**
1. Executar script `fix-admin-access.ts`
2. Verificar no banco se `role = 'admin'`
3. Limpar cookies e tentar novamente

---

### Problema 2: Tela de 2FA aparece

**Causa:** 2FA está habilitado para o usuário

**Solução:**
1. Executar script `fix-admin-access.ts` (desabilita 2FA automaticamente)
2. Ou usar código do autenticador se tiver acesso

---

### Problema 3: "Invalid email or password"

**Causa:** Senha incorreta ou usuário não existe

**Solução:**
1. Executar script `fix-admin-access.ts` (cria/atualiza usuário e senha)
2. Verificar se email está correto: `ceo@ileala.ae`
3. Verificar se senha está correta: `IleAla@2025`

---

### Problema 4: API tRPC não responde

**Causa:** Servidor não está rodando ou há erro no handler

**Solução:**
1. Verificar no Railway se serviço está online
2. Verificar logs do Railway para erros
3. Verificar variáveis de ambiente

---

### Problema 5: Redirecionamento infinito

**Causa:** Sessão não está sendo criada ou cookie não está sendo lido

**Solução:**
1. Limpar todos os cookies do site
2. Verificar se cookie `__session` está sendo criado após login
3. Verificar se domínio do cookie está correto

---

## 📝 Credenciais de Acesso

### Credenciais Principais (Email/Password)
- **Email:** `ceo@ileala.ae`
- **Senha:** `IleAla@2025`

### Credenciais de Emergência (AdminEmergencyLogin)
- **Email:** `ceo@ileala.ae`
- **Senha:** `IleAla2025!Admin#Emergency`

---

## 🔗 URLs Importantes

- **Site principal:** https://ileala.ae
- **Admin:** https://admin.ileala.ae/admin
- **Login:** https://ileala.ae/login
- **Login Admin:** https://admin.ileala.ae/login
- **Login Emergência:** https://ileala.ae/admin-emergency-login
- **Railway Dashboard:** https://railway.com/project/4b039d16-8347-467a-847a-5cce593cd0c9

---

## ✅ Próximos Passos

1. **Executar script de correção:**
   ```bash
   pnpm tsx fix-admin-access.ts
   ```

2. **Testar login:**
   - Acessar https://ileala.ae/login
   - Usar credenciais: `ceo@ileala.ae` / `IleAla@2025`

3. **Verificar acesso:**
   - Após login, deve redirecionar para `/admin`
   - Se não redirecionar, acessar manualmente: https://admin.ileala.ae/admin

4. **Se ainda não funcionar:**
   - Verificar logs do Railway
   - Verificar console do navegador (F12)
   - Verificar cookies no DevTools

---

**Última atualização:** 29 de Novembro de 2024

