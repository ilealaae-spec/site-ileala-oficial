# 🎛️ Guia: Onde Fica o Management UI

## 📋 O Que é Management UI?

**Management UI** é o **painel de gerenciamento** do seu projeto na plataforma Manus. É onde você:
- ✅ Visualiza preview do site
- ✅ Acessa código-fonte
- ✅ Gerencia banco de dados
- ✅ Configura secrets (variáveis de ambiente)
- ✅ Configura domínios
- ✅ Publica o site
- ✅ Vê estatísticas e analytics

---

## 📍 Onde Fica o Management UI?

### Localização

O **Management UI** fica no **lado direito da tela** quando você está conversando comigo (Manus AI).

**Layout da interface:**
```
┌─────────────────────────────────────────────────────────────┐
│                    MANUS PLATFORM                           │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  CHATBOX (Esquerda)      │   MANAGEMENT UI (Direita)       │
│  ─────────────────       │   ────────────────────────       │
│                          │                                  │
│  • Conversas comigo      │   • Preview                      │
│  • Mensagens             │   • Code                         │
│  • Cards de projeto      │   • Database                     │
│  • Histórico             │   • Dashboard                    │
│                          │   • Settings                     │
│                          │     - General                    │
│                          │     - Domains                    │
│                          │     - Notifications              │
│                          │     - Secrets ← AQUI!            │
│                          │   • Publish (botão)              │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🚀 Como Acessar o Management UI

### Método 1: Abrir Automaticamente (Recomendado)

Quando você está conversando comigo e eu crio ou atualizo um projeto, o **Management UI abre automaticamente** no lado direito.

**Você verá:**
- Painel lateral direito se expande
- Abas: Preview, Code, Database, Dashboard, Settings
- Botão "Publish" no canto superior direito

---

### Método 2: Abrir Manualmente (Se Fechou)

Se você fechou o Management UI e quer abrir novamente:

#### Opção A: Ícone no Header

1. Olhe para o **canto superior direito** da interface
2. Procure por um **ícone de engrenagem** ⚙️ ou **ícone de painel** 📊
3. Clique no ícone
4. Management UI abrirá no lado direito

**Ícones possíveis:**
- ⚙️ Engrenagem (Settings)
- 📊 Dashboard
- 🔧 Tools
- ☰ Menu (três linhas)

---

#### Opção B: Clicar em Cards do Projeto

Quando eu crio checkpoints ou publico o site, aparecem **cards** no chat. Você pode clicar em botões nesses cards:

**Card de Projeto:**
- Botão **"View"** → Abre Preview no Management UI

**Card de Checkpoint:**
- Botão **"Dashboard"** → Abre Dashboard no Management UI
- Botão **"Publish"** → Abre opção de publicação

**Card de Secrets:**
- Campos de input → Permite inserir secrets

---

### Método 3: Acessar URL Direta

Se você estiver em outra aba ou página, pode acessar diretamente:

**URL da plataforma Manus:**
```
https://manus.im
```

1. Acesse https://manus.im
2. Faça login (se necessário)
3. Você verá seus projetos
4. Clique no projeto **"ileala-website"**
5. Management UI abrirá automaticamente

---

## 🗂️ Estrutura do Management UI

### Abas Principais

Quando o Management UI está aberto, você verá várias **abas** no topo ou lateral:

#### 1. **Preview** 👁️
- Visualização ao vivo do site
- Atualiza em tempo real
- Pode interagir com o site
- Mantém login e estados

#### 2. **Code** 💻
- Árvore de arquivos do projeto
- Visualizar código-fonte
- Baixar todos os arquivos (ZIP)
- Explorar estrutura do projeto

#### 3. **Database** 🗄️
- Interface CRUD para banco de dados
- Visualizar tabelas (products, orders, users, etc.)
- Adicionar/editar/deletar registros
- Exportar dados
- Informações de conexão (canto inferior esquerdo)

#### 4. **Dashboard** 📊
- Estatísticas do site
- UV/PV (visitantes únicos / visualizações de página)
- Analytics em tempo real
- Status de publicação
- Controles de visibilidade

#### 5. **Settings** ⚙️
- **Submenu com várias opções:**

##### 5.1 General
- Nome do site (VITE_APP_TITLE)
- Logo do site (VITE_APP_LOGO)
- Configurações de visibilidade

##### 5.2 Domains
- Domínio temporário (xxxxx.manus.space)
- Adicionar domínio personalizado (ileala.ae)
- Configurar DNS
- Gerenciar certificados SSL

##### 5.3 Notifications
- Configurações de notificações
- API de notificações integrada
- (Requer feature web-db-user)

##### 5.4 Secrets ⭐ **IMPORTANTE**
- **Variáveis de ambiente**
- Visualizar secrets existentes
- Editar valores de secrets
- Deletar secrets
- **Aqui você configura:**
  - STRIPE_WEBHOOK_SECRET
  - STRIPE_SECRET_KEY
  - Outras chaves de API

---

## 🔍 Como Encontrar "Secrets" Especificamente

### Passo a Passo Detalhado:

**1. Abrir Management UI**
- Clique no ícone no canto superior direito
- Ou clique em botão de card no chat

**2. Clicar em "Settings"**
- No menu lateral ou superior do Management UI
- Procure por ⚙️ **"Settings"**
- Clique

**3. Navegar para "Secrets"**
- Você verá um **submenu** com opções:
  - General
  - Domains
  - Notifications
  - **Secrets** ← Clique aqui!

**4. Visualizar Lista de Secrets**
- Você verá todos os secrets configurados:
  ```
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  VITE_STRIPE_PUBLISHABLE_KEY
  JWT_SECRET
  ... (e outros)
  ```

**5. Editar um Secret**
- Encontre o secret que deseja editar
- Clique no ícone de **lápis** ✏️ ao lado
- Janela de edição abrirá
- Edite o valor
- Clique em **"Save"**
- Servidor reiniciará automaticamente

---

## 🎨 Aparência Visual do Management UI

### Como Identificar

**Características visuais:**
- 📍 Localização: Lado direito da tela
- 🎨 Fundo: Geralmente branco ou cinza claro
- 📑 Abas: No topo (Preview, Code, Database, etc.)
- 🔘 Botões: "Publish" destacado no canto superior direito
- 📊 Conteúdo: Varia conforme aba selecionada

### Estado Aberto vs Fechado

**Quando ABERTO:**
```
┌────────────────┬──────────────────┐
│   Chatbox      │   Management UI  │
│   (60%)        │   (40%)          │
│                │   [Abas]         │
│                │   [Conteúdo]     │
└────────────────┴──────────────────┘
```

**Quando FECHADO:**
```
┌─────────────────────────────────────┐
│         Chatbox (100%)              │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 Management UI em Mobile

### Comportamento em Telas Pequenas

Em dispositivos móveis ou telas pequenas:

**Layout adaptativo:**
- Management UI pode aparecer como **modal** (janela sobreposta)
- Ou como **aba separada**
- Acesso via ícone de menu ☰

**Como acessar:**
1. Toque no ícone de **menu** (☰) no canto superior
2. Selecione **"Management"** ou **"Project Settings"**
3. Management UI abrirá em tela cheia

---

## 🆘 Troubleshooting: Não Consigo Encontrar

### Problema 1: Management UI Não Aparece

**Possíveis causas:**

**A) Projeto não foi criado ainda**
- Solução: Peça para criar o projeto primeiro
- Comando: "Crie um projeto web"

**B) Management UI está fechado**
- Solução: Clique no ícone no canto superior direito
- Ou peça: "Abra o Management UI"

**C) Tela muito pequena**
- Solução: Aumente janela do navegador
- Ou use modo landscape em mobile

---

### Problema 2: Não Vejo "Secrets" em Settings

**Possíveis causas:**

**A) Não navegou até Settings**
- Solução: Clique em ⚙️ Settings primeiro

**B) Submenu não expandiu**
- Solução: Clique novamente em Settings
- Ou procure por seta para expandir submenu

**C) Secrets está oculto**
- Solução: Role a página para baixo
- Secrets pode estar no final da lista

---

### Problema 3: Management UI Está em Branco

**Possíveis causas:**

**A) Carregando**
- Solução: Aguarde alguns segundos
- Pode estar carregando dados

**B) Erro de conexão**
- Solução: Recarregue a página (F5)
- Verifique conexão com internet

**C) Aba errada selecionada**
- Solução: Clique em outra aba (Preview, Code, etc.)
- Depois volte para Settings

---

## 🎯 Resumo Rápido

### Onde Fica?
```
👉 Lado DIREITO da tela (painel lateral)
```

### Como Abrir?
```
1. Ícone no canto superior direito ⚙️
2. Ou clicar em botões de cards no chat
3. Ou acessar https://manus.im → Projeto
```

### Como Acessar Secrets?
```
Management UI → Settings → Secrets
```

### O Que Fazer Lá?
```
1. Encontrar STRIPE_WEBHOOK_SECRET
2. Clicar em editar ✏️
3. Colar valor do signing secret
4. Salvar
```

---

## 📸 Guia Visual (Descrição)

### Tela Principal

```
┌─────────────────────────────────────────────────────────────┐
│  MANUS                                            [👤] [⚙️]  │ ← Ícone aqui!
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  💬 CHAT                 │  🎛️ MANAGEMENT UI                │
│  ─────────               │  ─────────────────               │
│                          │                                  │
│  Você: Crie um site      │  ┌─────────────────────────┐    │
│                          │  │ Preview │ Code │ DB │... │    │
│  Manus: Site criado!     │  ├─────────────────────────┤    │
│                          │  │                         │    │
│  [Card: ileala-website]  │  │   [Conteúdo da aba]     │    │
│  └─ [View] [Dashboard]   │  │                         │    │
│                          │  │                         │    │
│                          │  └─────────────────────────┘    │
│                          │                                  │
│                          │  [🚀 Publish]                    │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Navegação para Secrets

```
Management UI (lado direito)
    ↓
Clicar em "Settings" ⚙️
    ↓
Submenu aparece:
  • General
  • Domains
  • Notifications
  • Secrets ← Clicar aqui!
    ↓
Lista de Secrets:
  • STRIPE_SECRET_KEY
  • STRIPE_WEBHOOK_SECRET ← Editar este!
  • VITE_STRIPE_PUBLISHABLE_KEY
  • ...
    ↓
Clicar em ✏️ (editar)
    ↓
Janela de edição:
  Key: STRIPE_WEBHOOK_SECRET
  Value: [whsec_xxx...] ← Colar aqui!
    ↓
Clicar em "Save"
    ↓
✅ Secret configurado!
```

---

## 💡 Dicas Úteis

### Atalhos e Dicas

**1. Manter Management UI Aberto**
- Não feche o painel enquanto trabalha
- Facilita acesso rápido a configurações

**2. Alternar entre Abas**
- Use abas para navegar rapidamente
- Preview → Code → Database → Settings

**3. Usar Busca**
- Em Secrets, use Ctrl+F para buscar
- Digite "STRIPE" para encontrar rapidamente

**4. Salvar Mudanças**
- Sempre clique em "Save" após editar
- Aguarde confirmação antes de fechar

**5. Recarregar se Necessário**
- Se Management UI travar, recarregue (F5)
- Suas mudanças salvas não serão perdidas

---

## 📞 Precisa de Ajuda?

Se ainda não conseguir encontrar o Management UI:

**Opção 1: Me pergunte**
- Diga: "Não consigo encontrar o Management UI"
- Posso guiá-lo passo a passo

**Opção 2: Tire screenshot**
- Tire print da tela que você está vendo
- Envie para mim
- Posso indicar exatamente onde clicar

**Opção 3: Descreva o que vê**
- Diga: "Estou vendo [descrição da tela]"
- Posso orientar baseado na sua descrição

---

## ✅ Checklist de Acesso

Use esta lista para confirmar que encontrou:

- [ ] Abri a plataforma Manus
- [ ] Vejo chatbox no lado esquerdo
- [ ] Vejo painel no lado direito (Management UI)
- [ ] Consigo ver abas: Preview, Code, Database, etc.
- [ ] Cliquei em "Settings" ⚙️
- [ ] Vejo submenu com: General, Domains, Notifications, Secrets
- [ ] Cliquei em "Secrets"
- [ ] Vejo lista de variáveis de ambiente
- [ ] Encontrei STRIPE_WEBHOOK_SECRET
- [ ] Consigo clicar em editar ✏️

---

**Última atualização:** Novembro 2025  
**Projeto:** ileala-website  
**Localização:** Lado direito da interface Manus 👉
