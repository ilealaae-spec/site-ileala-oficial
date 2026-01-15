# 📋 Como Colar Token no Terminal macOS

O terminal às vezes bloqueia colar senhas/tokens. Tente estas soluções:

---

## ✅ Solução 1: Menu do Terminal

1. **Clique com botão direito** no campo de senha
2. **Selecione "Paste"** (ou "Colar" em português)

---

## ✅ Solução 2: Menu Edit

1. **No menu do Terminal**, clique em **"Edit"** (Editar)
2. **Selecione "Paste"** (ou pressione `Cmd+V`)

---

## ✅ Solução 3: Terminal → Preferências

1. **Terminal** → **Preferences** (Preferências)
2. **Profiles** → **Keyboard**
3. **Marque:** "Use Option as Meta key"
4. **Tente colar novamente**

---

## ✅ Solução 4: Digitar Manualmente (Último Recurso)

Se nada funcionar, você pode:

1. **Abra o token em outra janela** (não feche!)
2. **Digite manualmente** (cuidado com maiúsculas/minúsculas)
3. **Ou use um editor de texto** para ver o token enquanto digita

---

## ✅ Solução 5: Usar SSH (Evita Este Problema)

Configure SSH para não precisar digitar token toda vez:

```bash
# Criar SSH key (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub: Settings → SSH and GPG keys → New SSH key

# Trocar URL do remote
git remote set-url origin git@github.com:ilealaae-spec/site-ileala-oficial.git

# Agora o push não pedirá senha!
git push
```

---

## 🎯 Recomendação Imediata

**Tente primeiro:**
1. **Botão direito** → **Paste**
2. Ou **Edit** → **Paste**

**Se não funcionar, configure SSH** (Solução 5) para evitar este problema no futuro!

---

**Tente colar agora usando o botão direito ou o menu Edit!** 🚀

