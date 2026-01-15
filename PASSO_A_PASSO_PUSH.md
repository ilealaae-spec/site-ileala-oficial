# 📝 Passo a Passo - Fazer Push no Terminal

Guia detalhado para fazer o push usando SSH.

---

## ✅ Passo 1: Verificar se a Chave SSH Está no GitHub

**Você já está na página certa!** ✅

- Vejo que você já tem uma chave SSH chamada "MacBook Pro"
- A mensagem "Key is already in use" significa que a chave já está configurada
- **Não precisa adicionar nada!** ✅

**Ação:** Feche esta aba do GitHub (ou deixe aberta, não importa)

---

## ✅ Passo 2: Voltar para o Terminal

1. **Volte para o terminal** (onde estava tentando fazer o push)
2. **Se ainda estiver bloqueado:**
   - Pressione `Ctrl + C` para cancelar
   - Isso vai liberar o terminal

---

## ✅ Passo 3: Verificar se a URL Está Correta

No terminal, digite:

```bash
git remote -v
```

**O que você deve ver:**
```
origin	git@github.com:ilealaae-spec/site-ileala-oficial.git (fetch)
origin	git@github.com:ilealaae-spec/site-ileala-oficial.git (push)
```

**Se aparecer `https://` em vez de `git@`, me avise!**

---

## ✅ Passo 4: Fazer o Push

Agora digite:

```bash
git push
```

**O que vai acontecer:**
- Pode pedir para confirmar a chave SSH (digite `yes` e Enter)
- **NÃO vai pedir senha!** ✅
- O push será executado

---

## ✅ Passo 5: Verificar o Resultado

**Se funcionar, você verá:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
...
To github.com:ilealaae-spec/site-ileala-oficial.git
   [hash] -> main
```

**Isso significa sucesso!** ✅

---

## ❌ Se Der Erro

**Se aparecer algum erro, me envie a mensagem completa!**

Erros comuns:
- "Permission denied" → Chave SSH não está autorizada
- "Host key verification failed" → Digite `yes` quando pedir
- Outro erro → Me envie a mensagem

---

## 🎯 Resumo dos Passos

1. ✅ Chave SSH já está no GitHub (você já fez isso!)
2. ⏭️ Voltar para o terminal
3. ⏭️ Verificar URL (deve ser `git@github.com`)
4. ⏭️ Fazer `git push`
5. ⏭️ Pronto! Railway fará deploy automático

---

**Vamos começar? Volte para o terminal e me diga o que aparece quando você digitar `git remote -v`** 🚀

