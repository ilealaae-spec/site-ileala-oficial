# 🔓 Resolver Bloqueio no Terminal

O terminal está bloqueado com cadeado. Vamos resolver:

---

## 🛑 Passo 1: Cancelar o Processo

1. **Pressione `Ctrl + C`** no terminal
2. Isso vai cancelar o `git push` atual
3. O terminal voltará ao normal

---

## ✅ Solução: Configurar SSH (Recomendado)

SSH evita esse problema de autenticação. Vamos configurar:

### 1. Criar SSH Key

```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

- Pressione **Enter** para aceitar o local padrão
- Pressione **Enter** para não usar senha (ou crie uma se quiser)
- Pressione **Enter** novamente para confirmar

### 2. Copiar a Chave Pública

```bash
cat ~/.ssh/id_ed25519.pub
```

**COPIE TUDO** que aparecer (começa com `ssh-ed25519`)

### 3. Adicionar no GitHub

1. **Acesse:** https://github.com/settings/ssh/new
2. **Title:** `Mac - Railway Deploy` (ou qualquer nome)
3. **Key:** Cole a chave que você copiou
4. **Clique em:** "Add SSH key"

### 4. Trocar URL do Remote

```bash
git remote set-url origin git@github.com:ilealaae-spec/site-ileala-oficial.git
```

### 5. Fazer Push Agora

```bash
git push
```

**Agora não vai pedir senha!** 🎉

---

## 🔄 Alternativa: GitHub CLI

Se preferir usar GitHub CLI:

```bash
# Instalar GitHub CLI (se não tiver)
brew install gh

# Autenticar
gh auth login

# Fazer push
git push
```

---

## 🎯 Passo a Passo Rápido

1. **Pressione `Ctrl + C`** para cancelar
2. **Execute os comandos SSH acima**
3. **Faça o push novamente**

---

**Pressione `Ctrl + C` agora e depois vamos configurar SSH!** 🚀

