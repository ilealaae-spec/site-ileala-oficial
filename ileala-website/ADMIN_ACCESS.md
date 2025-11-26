# 🔐 GUIA DE ACESSO ADMINISTRATIVO - ILEALA

## 📋 CREDENCIAIS DE EMERGÊNCIA

**Email**: `ceo@ileala.ae`  
**Senha**: `IleAla@2025`  
**Role**: `admin`

> ⚠️ **IMPORTANTE**: Estas credenciais estão hardcoded no código para garantir acesso de emergência mesmo se o banco de dados falhar.

---

## 🚀 COMO FAZER LOGIN

### Método 1: Via Interface Web
1. Acesse: `https://ileala.ae/login`
2. Digite o email: `ceo@ileala.ae`
3. Digite a senha: `IleAla@2025`
4. Clique em "Sign In"
5. Você será redirecionado para `/admin`

### Método 2: Acesso Direto ao Admin
1. Acesse: `https://ileala.ae/admin`
2. Se não estiver logado, será redirecionado para `/login`
3. Faça login com as credenciais acima

---

## 🛠️ CRIAR USUÁRIO ADMIN PERMANENTE

Para criar um usuário admin permanente no banco de dados (recomendado):

### Opção A: Usar Script Automatizado

```bash
cd /path/to/ileala-website
pnpm tsx scripts/create-admin.ts
```

**O que o script faz**:
- ✅ Verifica se o usuário já existe
- ✅ Cria hash seguro da senha com bcrypt
- ✅ Insere ou atualiza o usuário no banco
- ✅ Define role como 'admin'
- ✅ Mostra confirmação com detalhes do usuário

### Opção B: Executar SQL Manualmente

```sql
-- 1. Gerar hash da senha (use bcrypt com salt rounds = 10)
-- Hash de "IleAla@2025": $2a$10$... (gere usando bcrypt)

-- 2. Inserir usuário admin
INSERT INTO users (
  open_id,
  email,
  password_hash,
  name,
  role,
  login_method,
  created_at,
  updated_at
) VALUES (
  'admin-permanent-001',
  'ceo@ileala.ae',
  '$2a$10$...',  -- substitua pelo hash real
  'CEO Admin',
  'admin',
  'email',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  updated_at = NOW();
```

---

## 🔄 COMO FUNCIONA O LOGIN DE EMERGÊNCIA

### 1. Login Hardcoded (Código)

O arquivo `server/routers.ts` contém duas rotas de login com credenciais de emergência:

#### Rota `user.login` (linhas 34-67)
```typescript
if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
  // Cria/atualiza usuário admin
  // Cria sessão
  // Retorna sucesso
}
```

#### Rota `auth.login` (linhas 79-124)
```typescript
// Verifica credenciais de emergência PRIMEIRO
if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
  // Cria/atualiza usuário admin
  // Busca usuário no banco
  // Cria sessão
  // Retorna sucesso
}
// Se não for emergência, verifica banco de dados normal
```

**Vantagens**:
- ✅ Funciona mesmo se o banco de dados estiver vazio
- ✅ Não depende de migrações ou seeds
- ✅ Sempre disponível para recuperação de emergência

**Desvantagens**:
- ❌ Senha está no código (mas em repositório privado)
- ❌ Difícil de trocar sem fazer commit

### 2. Login via Banco de Dados (Recomendado)

Após criar usuário permanente com o script:
- ✅ Senha hashada com bcrypt (seguro)
- ✅ Pode trocar senha sem alterar código
- ✅ Pode criar múltiplos admins
- ✅ Auditoria de acessos

---

## 🔒 COMO TROCAR A SENHA

### Opção A: Trocar Senha no Banco (Recomendado)

```sql
-- 1. Gerar novo hash da senha
-- Use: bcrypt.hash('NovaSenha123!', 10)

-- 2. Atualizar no banco
UPDATE users 
SET password_hash = '$2a$10$...',  -- novo hash
    updated_at = NOW()
WHERE email = 'ceo@ileala.ae';
```

### Opção B: Trocar Senha Hardcoded (Emergência)

1. Edite `server/routers.ts`
2. Procure por `'IleAla@2025'`
3. Substitua pela nova senha
4. Faça commit e push
5. Aguarde deployment do Railway

> ⚠️ **ATENÇÃO**: Trocar senha hardcoded requer deployment!

---

## 👥 CRIAR NOVOS USUÁRIOS ADMIN

### Via Interface (Futuro)
_Funcionalidade ainda não implementada_

### Via Banco de Dados

```sql
INSERT INTO users (
  open_id,
  email,
  password_hash,
  name,
  role,
  login_method,
  created_at,
  updated_at
) VALUES (
  'admin-' || gen_random_uuid(),  -- ID único
  'novo.admin@ileala.ae',
  '$2a$10$...',  -- hash da senha
  'Nome do Admin',
  'admin',
  'email',
  NOW(),
  NOW()
);
```

---

## 🚨 RECUPERAÇÃO DE ACESSO

### Cenário 1: Esqueci a Senha

**Se tiver acesso ao banco de dados**:
1. Use o script `scripts/create-admin.ts` para resetar
2. Ou execute SQL para atualizar `password_hash`

**Se NÃO tiver acesso ao banco**:
1. Use as credenciais de emergência: `ceo@ileala.ae` / `IleAla@2025`
2. Elas sempre funcionam (hardcoded no código)

### Cenário 2: Site Está Offline

1. Acesse Railway Dashboard
2. Verifique Deploy Logs para erros
3. Verifique variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
4. Force redeploy se necessário

### Cenário 3: Login Não Funciona

**Diagnóstico**:
1. Abra console do navegador (F12)
2. Tente fazer login
3. Veja erros no console
4. Verifique Network tab para ver resposta da API

**Soluções**:
- Se erro 401: Credenciais incorretas
- Se erro 500: Problema no servidor (veja logs do Railway)
- Se erro 404: Rota não existe (código desatualizado)

---

## 📊 ROLES E PERMISSÕES

### Role: `admin`
- ✅ Acesso total ao admin panel
- ✅ Gerenciar produtos
- ✅ Gerenciar usuários
- ✅ Gerenciar pedidos
- ✅ Gerenciar conteúdo (CMS)
- ✅ Gerenciar mídia
- ✅ Ver analytics

### Role: `user` (padrão)
- ✅ Fazer pedidos
- ✅ Ver histórico de pedidos
- ✅ Atualizar perfil
- ❌ Acesso ao admin panel

---

## 🔍 VERIFICAR SE LOGIN ESTÁ FUNCIONANDO

### Teste Rápido via cURL

```bash
curl -X POST https://ileala.ae/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ceo@ileala.ae",
    "password": "IleAla@2025"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "ceo@ileala.ae",
    "name": "Emergency Admin",
    "role": "admin"
  }
}
```

### Teste via Browser Console

```javascript
// Abra console (F12) em https://ileala.ae
fetch('/api/trpc/auth.login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ceo@ileala.ae',
    password: 'IleAla@2025'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📝 CHECKLIST DE SEGURANÇA

Antes de fazer deployment:

- [ ] Credenciais de emergência funcionam (`ceo@ileala.ae`)
- [ ] Usuário admin existe no banco de dados
- [ ] `JWT_SECRET` está configurada no Railway
- [ ] `DATABASE_URL` está configurada e válida
- [ ] Senha está hashada com bcrypt (não em texto plano)
- [ ] Role está definida como `'admin'`
- [ ] Cookie de sessão está sendo setado corretamente
- [ ] Redirecionamento para `/admin` funciona após login

---

## 🆘 CONTATOS DE EMERGÊNCIA

**Desenvolvedor**: Manus AI  
**Repositório**: `https://github.com/ilealaae-spec/site-ileala-oficial`  
**Railway**: `https://railway.app/project/...`

**Em caso de emergência**:
1. Verifique este documento primeiro
2. Use credenciais de emergência
3. Execute script `create-admin.ts`
4. Verifique logs do Railway
5. Entre em contato com suporte se necessário

---

## 📚 REFERÊNCIAS

- **Documentação tRPC**: https://trpc.io/docs
- **Documentação bcrypt**: https://www.npmjs.com/package/bcryptjs
- **Documentação Railway**: https://docs.railway.app

---

*Última atualização: 26 de Novembro de 2025*  
*Versão: 1.0*
