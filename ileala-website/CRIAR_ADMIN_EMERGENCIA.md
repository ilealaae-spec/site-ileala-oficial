# 🔧 Criar Admin de Emergência

## ✅ Correções Aplicadas

1. ✅ Senha atualizada para: `IleAla@2025`
2. ✅ Rota `/api/create-emergency-admin` adicionada no servidor
3. ✅ Código atualizado para aceitar a senha correta

---

## 🚀 Como Criar o Admin de Emergência

### Opção 1: Usar a Rota API (Recomendado)

1. **Aguarde o deploy** das últimas mudanças no Railway
2. **Acesse no navegador ou use curl:**
   ```
   https://www.ileala.ae/api/create-emergency-admin
   ```
   Ou use curl:
   ```bash
   curl -X POST https://www.ileala.ae/api/create-emergency-admin
   ```
3. **Você receberá uma resposta JSON** com instruções
4. **O usuário será criado/atualizado** automaticamente

### Opção 2: Usar o Login Direto (Se o Usuário Já Existe)

1. **Acesse:** `https://www.ileala.ae/admin-emergency-login`
2. **Email:** `ceo@ileala.ae`
3. **Senha:** `IleAla@2025`
4. Clique em **"Emergency Login"**

---

## 📋 Credenciais

- **Email:** `ceo@ileala.ae`
- **Senha:** `IleAla@2025`
- **URL de Login:** `https://www.ileala.ae/admin-emergency-login`

---

## ⚠️ Se Ainda Não Funcionar

### Verificar se o Usuário Existe

1. **Acesse a rota de criação:**
   ```
   https://www.ileala.ae/api/create-emergency-admin
   ```
2. **Verifique a resposta:**
   - Se retornar `success: true` → Usuário criado/atualizado
   - Se retornar erro → Verifique os logs do Railway

### Verificar Logs do Railway

1. Railway Dashboard → Service: `ileala-website` → **Logs**
2. Procure por erros relacionados a:
   - `DATABASE_URL` não configurado
   - Erro de conexão com banco
   - Erro ao criar/atualizar usuário

---

## 🔍 Troubleshooting

### Erro: "Database connection not configured"
- **Causa:** `DATABASE_URL` não está configurado no Railway
- **Solução:** Adicione `DATABASE_URL` nas variáveis do Railway

### Erro: "User not found" no login
- **Causa:** Usuário não foi criado ainda
- **Solução:** Acesse `/api/create-emergency-admin` primeiro

### Erro: "Invalid emergency credentials"
- **Causa:** Senha incorreta
- **Solução:** Use exatamente `IleAla@2025` (com @ e maiúsculas)

---

## ✅ Checklist

- [ ] Deploy das últimas mudanças concluído
- [ ] Rota `/api/create-emergency-admin` acessível
- [ ] Usuário criado/atualizado com sucesso
- [ ] Login funciona com `ceo@ileala.ae` / `IleAla@2025`
- [ ] Redirecionamento para `/admin` funciona

---

**Última atualização:** 21 de Novembro de 2025




