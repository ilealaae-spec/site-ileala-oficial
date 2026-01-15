# 🔐 Como Autenticar no Git Push

O terminal está pedindo autenticação. Siga estes passos:

---

## 📝 Passo a Passo

### 1. **Username (usuário do GitHub)**
- Digite seu **username do GitHub** (ex: `ilealaae-spec` ou seu username pessoal)
- Pressione **Enter**

### 2. **Password (senha)**
- **NÃO use sua senha do GitHub!**
- Use um **Personal Access Token (PAT)**
- Se não tiver um, veja como criar abaixo

---

## 🔑 Criar Personal Access Token (PAT)

### Opção 1: Via GitHub Web

1. **Acesse:** https://github.com/settings/tokens
2. **Clique em:** "Generate new token" → "Generate new token (classic)"
3. **Preencha:**
   - **Note:** `Railway Deploy` (ou qualquer nome)
   - **Expiration:** `90 days` (ou o que preferir)
   - **Scopes:** Marque `repo` (acesso completo ao repositório)
4. **Clique em:** "Generate token"
5. **COPIE O TOKEN** (você só verá uma vez!)

### Opção 2: Via Terminal (mais rápido)

Se você já tem um token, apenas cole quando pedir a senha.

---

## ✅ Como Usar

1. **No terminal, quando pedir "Username":**
   ```
   Username for 'https://github.com': ilealaae-spec
   ```

2. **Quando pedir "Password":**
   - Cole o **Personal Access Token** (não a senha!)
   - Pressione **Enter**

---

## 🔄 Alternativa: Configurar SSH (Recomendado)

Para não precisar digitar sempre:

```bash
# Verificar se já tem SSH key
ls -al ~/.ssh

# Se não tiver, criar uma nova
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar a chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub: Settings → SSH and GPG keys → New SSH key
```

Depois, troque a URL do remote:
```bash
git remote set-url origin git@github.com:ilealaae-spec/site-ileala-oficial.git
```

---

## 🚀 Depois da Autenticação

Após autenticar com sucesso:
- O push será executado
- Railway detectará automaticamente
- O deploy começará em 1-2 minutos

---

**Digite seu username agora e depois o token quando pedir!** 🎯

