# 🔄 Recuperar/Criar Projeto no Neon

Você quer continuar usando o Neon. Vamos recuperar ou recriar o projeto.

---

## 🔍 Opção 1: Verificar se o Projeto Está em Outra Organização

### Passo 1: Verificar Outras Organizações

1. **No Neon Dashboard**, no canto superior direito, clique no seu email
2. **Procure por "Switch Organization"** ou "Trocar Organização"
3. **Veja se há outras organizações** listadas
4. **Se houver, clique e verifique** se o projeto está lá

### Passo 2: Verificar Outras Contas

O projeto pode estar em outra conta de email. Verifique:
- Outras contas de email que você usa
- Contas de equipe/organização
- Contas compartilhadas

---

## ✅ Opção 2: Criar Novo Projeto no Neon (Recomendado)

Se não encontrar o projeto, vamos criar um novo e conectar:

### Passo 1: Criar Novo Projeto

1. **No Neon Dashboard**, clique em **"Criar projeto"** (Create project)
2. **Preencha:**
   - **Nome do projeto:** `ileala-database` ou `ileala-prod`
   - **Região:** Escolha a mais próxima (ex: US East)
   - **PostgreSQL Version:** 15 ou 16 (recomendado)
3. **Clique em "Criar projeto"**

### Passo 2: Obter Nova Connection String

1. **No projeto criado**, vá em **"Connection Details"** ou **"Detalhes de Conexão"**
2. **Copie a connection string** (será algo como):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Passo 3: Migrar Dados do Banco Antigo

Você tem duas opções:

#### Opção A: Usar DBeaver para Migrar

1. **Conecte no banco antigo** (usando a connection string do Railway)
2. **Conecte no banco novo** (usando a nova connection string do Neon)
3. **Use a ferramenta de migração do DBeaver:**
   - Botão direito no banco antigo → "Tools" → "Export Data"
   - Ou use "Database Transfer" para copiar todas as tabelas

#### Opção B: Usar pg_dump (Terminal)

1. **Fazer backup do banco antigo:**
   ```bash
   pg_dump "postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql
   ```

2. **Restaurar no banco novo:**
   ```bash
   psql "postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" < backup.sql
   ```

### Passo 4: Atualizar Connection String no Railway

1. **No Railway**, vá em `ileala-admin` → **Variáveis**
2. **Encontre a variável `URL_DO_BANCO_DE_DADOS`**
3. **Edite** e cole a **nova connection string** do Neon
4. **Salve**

---

## 🔄 Opção 3: Conectar Projeto Existente (Se Encontrar)

Se você encontrar o projeto em outra organização:

### Passo 1: Acessar o Projeto

1. **Troque para a organização** onde o projeto está
2. **Clique no projeto**
3. **Vá em "Connection Details"**
4. **Copie a connection string**

### Passo 2: Verificar se Está Correta

Compare com a connection string do Railway:
- **Railway:** `ep-snowy-rice-ada9q7p8.c-2.us-east-1.aws.neon.tech`
- **Neon:** Deve ser a mesma ou similar

Se for a mesma, o projeto já está conectado!

---

## 📋 Checklist Completo

- [ ] Verificar outras organizações no Neon
- [ ] Verificar outras contas de email
- [ ] Se não encontrar, criar novo projeto no Neon
- [ ] Obter nova connection string
- [ ] Migrar dados do banco antigo para o novo
- [ ] Atualizar `URL_DO_BANCO_DE_DADOS` no Railway
- [ ] Testar conexão
- [ ] Executar SQL para gerar códigos de backup

---

## 🎯 Recomendação

**Criar um novo projeto** é mais rápido e garantido:
1. ✅ Você terá controle total
2. ✅ Pode ver no dashboard
3. ✅ Pode usar o SQL Editor do Neon
4. ✅ É gratuito (plano Free do Neon)

Depois de criar, você pode:
- Usar o SQL Editor do Neon diretamente
- Executar o SQL para gerar códigos de backup
- Ter tudo organizado em um lugar

---

## 🚀 Próximos Passos

1. **Crie um novo projeto no Neon**
2. **Migre os dados** (se necessário)
3. **Atualize a connection string no Railway**
4. **Use o SQL Editor do Neon** para executar o SQL

---

**Quer ajuda com algum passo específico? Me avise!**

