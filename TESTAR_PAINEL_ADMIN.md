# ✅ Testar Acesso ao Painel Admin - Passo a Passo

Agora que os códigos de backup foram gerados, vamos testar o acesso!

---

## 🚀 Passo a Passo para Testar

### Passo 1: Fazer Login

1. **Acesse:** https://ileala.ae/login
2. **Preencha as credenciais:**
   - **Email:** `ceo@ileala.ae`
   - **Senha:** `IleAla@2025`
3. **Clique em "Sign In" ou "Entrar"**

---

### Passo 2: Verificar 2FA

**Quando aparecer a tela de 2FA:**

1. **Você verá uma tela pedindo um código de 6 dígitos**
2. **Use um dos códigos de backup que você gerou:**
   - Exemplo: `E30C-081A`
   - **IMPORTANTE:** Digite apenas os 8 caracteres (sem o hífen)
   - Ou seja: `E30C081A` (sem o hífen `-`)
3. **Ou use o código do seu app autenticador** (se tiver configurado)

**⚠️ ATENÇÃO:** 
- Os códigos de backup têm formato `XXXX-XXXX` (com hífen)
- Mas ao digitar, você pode precisar digitar sem o hífen: `XXXXXXXX`
- Ou o sistema pode aceitar com hífen: `XXXX-XXXX`
- **Teste ambos os formatos se um não funcionar**

---

### Passo 3: Acessar o Painel

**Após verificar o 2FA:**

1. **Você será redirecionado automaticamente** para o painel admin
2. **Ou acesse manualmente:** https://admin.ileala.ae/admin
3. **Você deve ver o painel admin** com todas as funcionalidades

---

## 🔍 Se Não Funcionar

### Problema 1: "Invalid verification code"

**Solução:**
- Tente digitar o código **sem o hífen** (ex: `E30C081A` em vez de `E30C-081A`)
- Ou tente **com o hífen** (ex: `E30C-081A`)
- Tente outro código de backup
- Verifique se digitou corretamente (sem espaços)

---

### Problema 2: "Access Denied" após login

**Solução:**
1. **Verifique se o usuário tem role admin:**
   ```sql
   SELECT email, role FROM "users" WHERE email = 'ceo@ileala.ae';
   ```
   Deve mostrar: `role = 'admin'`

2. **Se não for admin, execute:**
   ```sql
   UPDATE "users" SET role = 'admin' WHERE email = 'ceo@ileala.ae';
   ```

---

### Problema 3: Tela de 2FA não aparece

**Solução:**
- Verifique se 2FA está habilitado:
  ```sql
  SELECT "twoFactorEnabled" FROM "users" WHERE email = 'ceo@ileala.ae';
  ```
  Deve ser `1`

- Se for `0`, habilite:
  ```sql
  UPDATE "users" SET "twoFactorEnabled" = 1 WHERE email = 'ceo@ileala.ae';
  ```

---

## 📋 Checklist de Teste

- [ ] Fazer login em https://ileala.ae/login
- [ ] Tela de 2FA aparece
- [ ] Digitar código de backup
- [ ] Login bem-sucedido
- [ ] Redirecionado para /admin
- [ ] Painel admin carrega corretamente
- [ ] Não aparece "Access Denied"

---

## 🎯 Códigos de Backup Disponíveis

Você tem estes códigos para usar:

1. `E30C-081A` (ou `E30C081A`)
2. `08D8-9244` (ou `08D89244`)
3. `C072-C77F` (ou `C072C77F`)
4. `1FFD-091E` (ou `1FFD091E`)
5. `F77F-0149` (ou `F77F0149`)
6. `DE25-A83B` (ou `DE25A83B`)
7. `245B-C19C` (ou `245BC19C`)
8. `E1DC-ADFA` (ou `E1DCADFA`)
9. `7844-3834` (ou `78443834`)
10. `3178-3A79` (ou `31783A79`)

**Cada código só pode ser usado UMA vez!**

---

## ✅ Próximos Passos

1. **Teste o login agora**
2. **Use um código de backup quando aparecer 2FA**
3. **Acesse o painel admin**
4. **Se funcionar, você está pronto!**

---

**Boa sorte! Teste agora e me diga se funcionou! 🚀**

