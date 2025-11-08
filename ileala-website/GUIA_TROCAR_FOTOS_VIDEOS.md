# 📸 Guia Completo: Como Trocar Fotos e Vídeos no Site ILE ALA

## 📁 Localização dos Arquivos

### Caminho Completo:
```
/home/ubuntu/ileala-website/client/public/images/
```

### Como Acessar:

**Opção 1: Via Interface Manus**
1. Clique em "Code" no painel de gerenciamento (lado direito)
2. Navegue até: `client` → `public` → `images`
3. Você verá todas as imagens do site

**Opção 2: Via Linha de Comando**
```bash
cd /home/ubuntu/ileala-website/client/public/images/
ls -lah
```

---

## 📋 Lista Completa de Imagens Atuais

| Arquivo | Tamanho | Usado Em | Pode Trocar? |
|---------|---------|----------|--------------|
| `logo_ile_ala.png` | 22KB | Header/Footer | ✅ Sim |
| `logo_ile_ala.webp` | 20KB | Header/Footer | ✅ Sim |
| `hero_home_table_setting.png` | 756KB | Página Inicial (Hero) | ✅ Sim |
| `hero_home_table_setting.webp` | 548KB | Página Inicial (Hero) | ✅ Sim |
| `collection_botanical.png` | 126KB | Card Coleção Botanica | ✅ Sim |
| `collection_botanical.webp` | 106KB | Card Coleção Botanica | ✅ Sim |
| `collection_khata.jpeg` | 51KB | Card Coleção Khata | ✅ Sim |
| `collection_khata.webp` | 256KB | Card Coleção Khata | ✅ Sim |
| `collection_la_mer.jpeg` | 79KB | Card Coleção La Mer | ✅ Sim |
| `collection_la_mer.webp` | 358KB | Card Coleção La Mer | ✅ Sim |
| `collection_soul_stamps.jpeg` | 88KB | Card Coleção Soul Stamps | ✅ Sim |
| `collection_soul_stamps.webp` | 348KB | Card Coleção Soul Stamps | ✅ Sim |
| `collections_hero_porcelain.jpeg` | 190KB | Hero Página Collections | ✅ Sim |
| `collections_hero_porcelain.webp` | 958KB | Hero Página Collections | ✅ Sim |
| `our_collections_card.jpeg` | 32KB | Card "Our Collections" | ✅ Sim |
| `our_collections_card.webp` | 149KB | Card "Our Collections" | ✅ Sim |
| `our_values_card.png` | 51KB | Card "Our Values" | ✅ Sim |
| `our_values_card.webp` | 44KB | Card "Our Values" | ✅ Sim |
| `about_me_card.jpeg` | 17KB | Card "About Me" | ✅ Sim |
| `about_me_card.webp` | 96KB | Card "About Me" | ✅ Sim |
| `fundacao_wahibi_logo.png` | 13KB | Logo Fundação | ✅ Sim |
| `fundacao_wahibi_logo.webp` | 11KB | Logo Fundação | ✅ Sim |

**Total**: 22 arquivos de imagem

---

## 🔄 Como Trocar uma Foto (Passo a Passo)

### Método 1: Via Interface Manus (Mais Fácil)

**Passo 1: Preparar sua nova imagem**
- Renomeie sua imagem com o **mesmo nome** da imagem que quer substituir
- Exemplo: Se quer trocar o hero da home, renomeie para `hero_home_table_setting.webp`
- Formatos aceitos: `.png`, `.jpg`, `.jpeg`, `.webp`

**Passo 2: Fazer upload**
1. Abra o painel "Code" no gerenciamento
2. Navegue até `client/public/images/`
3. Clique em "Upload" ou arraste sua imagem
4. Confirme a substituição quando perguntado

**Passo 3: Verificar**
1. Aguarde alguns segundos
2. Recarregue a página do site (Ctrl+F5)
3. A nova imagem deve aparecer

---

### Método 2: Via Linha de Comando

```bash
# 1. Navegue até o diretório de imagens
cd /home/ubuntu/ileala-website/client/public/images/

# 2. Faça backup da imagem antiga (opcional)
cp hero_home_table_setting.webp hero_home_table_setting.webp.backup

# 3. Copie sua nova imagem para o diretório
# (assumindo que você fez upload para /home/ubuntu/minha_nova_foto.webp)
cp /home/ubuntu/minha_nova_foto.webp hero_home_table_setting.webp

# 4. Verifique se a imagem foi copiada
ls -lh hero_home_table_setting.webp
```

---

## 🎥 Como Adicionar Vídeos

### Opção 1: Vídeos do YouTube (Recomendado)

**Vantagens**:
- ✅ Não ocupa espaço no servidor
- ✅ Carregamento mais rápido
- ✅ Player profissional
- ✅ Funciona em todos os dispositivos

**Como fazer**:
1. Faça upload do vídeo no YouTube
2. Copie o ID do vídeo (exemplo: `dQw4w9WgXcQ`)
3. Use o código:

```tsx
<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/SEU_VIDEO_ID"
  title="Título do Vídeo"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
```

---

### Opção 2: Vídeos Hospedados no Site

**Passo 1: Preparar o vídeo**
- Formato recomendado: `.mp4` (H.264)
- Tamanho máximo recomendado: 50MB
- Resolução recomendada: 1920x1080 (Full HD)

**Passo 2: Upload do vídeo**
```bash
# Copie o vídeo para o diretório public
cp /caminho/do/seu/video.mp4 /home/ubuntu/ileala-website/client/public/videos/meu_video.mp4
```

**Passo 3: Usar no código**
```tsx
<video
  width="100%"
  height="auto"
  controls
  poster="/images/thumbnail_video.webp"
>
  <source src="/videos/meu_video.mp4" type="video/mp4" />
  Seu navegador não suporta vídeos HTML5.
</video>
```

---

## 📐 Tamanhos Recomendados de Imagens

| Tipo de Imagem | Largura | Altura | Formato | Tamanho Máximo |
|----------------|---------|--------|---------|----------------|
| **Hero (Banner Principal)** | 1920px | 1080px | WebP/JPEG | 500KB |
| **Cards de Coleção** | 800px | 1000px | WebP/JPEG | 200KB |
| **Produtos** | 1200px | 1200px | WebP/PNG | 300KB |
| **Logo** | 500px | 500px | PNG/WebP | 50KB |
| **Thumbnails** | 400px | 400px | WebP/JPEG | 100KB |

---

## 🎨 Dicas de Otimização

### 1. Use WebP quando possível
WebP oferece melhor compressão que JPEG/PNG:
- **JPEG**: 100KB → **WebP**: 60KB (mesma qualidade)

### 2. Ferramentas de Otimização Online
- **TinyPNG**: https://tinypng.com (PNG/JPEG)
- **Squoosh**: https://squoosh.app (todos os formatos)
- **CloudConvert**: https://cloudconvert.com (conversão para WebP)

### 3. Sempre mantenha backup
Antes de substituir uma imagem, faça backup:
```bash
cp imagem_original.webp imagem_original.webp.backup
```

---

## 🔍 Onde Cada Imagem É Usada

### Página Inicial (Home)
- `hero_home_table_setting.webp` → Banner principal
- `our_collections_card.webp` → Card "Nossas Coleções"
- `our_values_card.webp` → Card "Nossos Valores"
- `about_me_card.webp` → Card "Sobre Mim"

### Página Collections
- `collections_hero_porcelain.webp` → Banner do topo
- `collection_botanical.webp` → Card Botanica
- `collection_khata.webp` → Card Khata
- `collection_la_mer.webp` → Card La Mer
- `collection_soul_stamps.webp` → Card Soul Stamps

### Header e Footer
- `logo_ile_ala.webp` → Logo do site
- `fundacao_wahibi_logo.webp` → Logo da fundação

---

## ⚠️ Avisos Importantes

### ❌ NÃO FAÇA:
- ❌ Não delete imagens sem substituir (quebra o site)
- ❌ Não use imagens muito grandes (>2MB) - site fica lento
- ❌ Não mude o nome dos arquivos sem atualizar o código
- ❌ Não use espaços nos nomes (use `_` ou `-`)

### ✅ SEMPRE FAÇA:
- ✅ Mantenha os mesmos nomes de arquivo
- ✅ Otimize imagens antes de fazer upload
- ✅ Teste em diferentes dispositivos após trocar
- ✅ Faça backup antes de substituir
- ✅ Use formatos modernos (WebP quando possível)

---

## 🚀 Checklist Após Trocar Imagens

- [ ] Imagem foi otimizada (tamanho adequado)
- [ ] Nome do arquivo está correto
- [ ] Upload foi feito no diretório correto
- [ ] Site foi recarregado (Ctrl+F5)
- [ ] Imagem aparece corretamente no desktop
- [ ] Imagem aparece corretamente no mobile
- [ ] Não há erros no console do navegador
- [ ] Backup da imagem antiga foi feito

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas ou problemas ao trocar imagens/vídeos:

1. **Verifique o console do navegador** (F12)
2. **Confira se o nome do arquivo está correto**
3. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
4. **Me pergunte!** Estou aqui para ajudar 😊

---

## 📊 Resumo Rápido

| Ação | Comando/Caminho |
|------|-----------------|
| **Ver imagens** | `/home/ubuntu/ileala-website/client/public/images/` |
| **Listar arquivos** | `ls -lah /home/ubuntu/ileala-website/client/public/images/` |
| **Fazer backup** | `cp imagem.webp imagem.webp.backup` |
| **Copiar nova imagem** | `cp /caminho/nova.webp /home/ubuntu/ileala-website/client/public/images/` |
| **Verificar tamanho** | `ls -lh imagem.webp` |

---

**Última atualização**: 02 de Novembro de 2025  
**Versão do guia**: 1.0
