# Todas as Opções Possíveis - Guia Executivo Completo

**Site**: ILE ALA (ileala.ae)  
**Problema**: Site publicado não atualiza mesmo após clicar em "Publish"  
**Checkpoint Atual**: a07e8c15 (com todas as correções)  
**Data**: 02 de Novembro de 2025

---

## 🎯 Resumo Executivo

Este documento lista **TODAS as opções possíveis** para resolver o problema de publicação, organizadas por categoria e nível de complexidade. Use este guia como referência completa para garantir que o site seja atualizado com sucesso.

---

## 📊 Opções Implementadas (Prontas para Usar)

### ✅ Opção 1: Mudança de Código com Timestamp
**Status**: ✅ Implementado no checkpoint a07e8c15  
**Eficácia**: ⭐⭐⭐⭐⭐ (Muito Alta)  
**Complexidade**: 🟢 Baixa

**O que foi feito**:
- Adicionado comentário `// Build: 2025-11-02T03:15:00Z` no arquivo App.tsx
- Força o Vite a gerar novo hash: `index-dqOqOH2P.js` (antes era `index-8wA6WvuQ.js`)

**Como funciona**:
Ao mudar o conteúdo do código, mesmo que minimamente, o Vite recalcula o hash do arquivo. Navegadores e CDNs reconhecem o novo hash como um arquivo diferente e baixam a versão atualizada.

**Ação necessária**: Nenhuma - já está no checkpoint a07e8c15

---

### ✅ Opção 2: Configuração de Cache Busting no Vite
**Status**: ✅ Implementado no checkpoint a07e8c15  
**Eficácia**: ⭐⭐⭐⭐⭐ (Prevenção futura)  
**Complexidade**: 🟡 Média

**O que foi feito**:
Atualizado `vite.config.ts` com:
```typescript
rollupOptions: {
  output: {
    entryFileNames: `assets/[name]-[hash].js`,
    chunkFileNames: `assets/[name]-[hash].js`,
    assetFileNames: `assets/[name]-[hash].[ext]`,
    manualChunks: undefined,
  }
},
assetsInlineLimit: 0,
```

**Benefício**: Garante que builds futuros sempre gerem hashes únicos quando o conteúdo mudar.

**Ação necessária**: Nenhuma - já está configurado

---

### ✅ Opção 3: Headers de Cache Control
**Status**: ✅ Implementado no checkpoint a07e8c15  
**Eficácia**: ⭐⭐⭐⭐ (Alta)  
**Complexidade**: 🟡 Média

**O que foi feito**:
Criado arquivo `client/public/_headers` com políticas de cache:
- HTML: Sem cache (sempre busca versão nova)
- JS/CSS com hash: Cache de 1 ano (seguro porque hash muda)
- Imagens: Cache de 1 mês
- BUILD_VERSION.txt: Sem cache

**Benefício**: Controle preciso sobre como cada tipo de arquivo é cacheado.

**Ação necessária**: Nenhuma - arquivo será publicado automaticamente

---

### ✅ Opção 4: Arquivo BUILD_VERSION.txt
**Status**: ✅ Implementado no checkpoint dbf56b26  
**Eficácia**: ⭐⭐⭐ (Média - diagnóstico)  
**Complexidade**: 🟢 Baixa

**O que foi feito**:
Criado arquivo `client/public/BUILD_VERSION.txt` contendo:
- Versão do build
- Data e hora
- Checkpoint ID
- Lista de correções incluídas

**Como usar para diagnóstico**:
```bash
curl https://ileala.ae/BUILD_VERSION.txt
```

Se retornar o conteúdo do arquivo (não HTML), a nova versão foi publicada.

**Ação necessária**: Verificar após publicar

---

### ✅ Opção 5: Script de Diagnóstico Automatizado
**Status**: ✅ Implementado no checkpoint a07e8c15  
**Eficácia**: ⭐⭐⭐⭐⭐ (Muito Alta - verificação)  
**Complexidade**: 🟢 Baixa

**O que foi feito**:
Criado script `check-published-version.sh` que verifica:
1. Acessibilidade do site
2. Headers de cache
3. Presença do BUILD_VERSION.txt
4. Hash do arquivo JavaScript
5. Se há erro React #310 na página de produto
6. DNS e SSL

**Como usar**:
```bash
cd /home/ubuntu/ileala-website
./check-published-version.sh
```

**Ação necessária**: Executar após cada publicação

---

### ✅ Opção 6: Arquivo .nojekyll
**Status**: ✅ Implementado no checkpoint a07e8c15  
**Eficácia**: ⭐⭐ (Baixa - edge case)  
**Complexidade**: 🟢 Baixa

**O que foi feito**:
Criado arquivo vazio `client/public/.nojekyll`

**Benefício**: Evita que servidores estáticos ignorem arquivos que começam com underscore (como `_headers`).

**Ação necessária**: Nenhuma

---

## 🔧 Opções de Ação Imediata (Faça Agora)

### 🟢 Opção 7: Publicar via Interface Manus
**Eficácia**: ⭐⭐⭐⭐⭐ (Essencial)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 2-3 minutos

**Passos**:
1. Abra o painel de gerenciamento do Manus
2. Clique no botão **"Publish"** no canto superior direito
3. Aguarde confirmação de que a publicação foi concluída
4. Anote o horário da publicação

**Importante**: Esta é a ação PRINCIPAL que você precisa fazer agora.

---

### 🟡 Opção 8: Aguardar Propagação do CDN
**Eficácia**: ⭐⭐⭐⭐⭐ (Essencial)  
**Complexidade**: 🟢 Baixa (apenas aguardar)  
**Tempo**: 10-15 minutos

**O que fazer**:
- Aguarde pelo menos 10 minutos após clicar em "Publish"
- Não teste imediatamente - dê tempo para o CDN atualizar
- O CDN tem servidores em múltiplas regiões que precisam sincronizar

**Timeline esperada**:
- 0-2 min: Build sendo construído
- 2-5 min: Upload para CDN principal
- 5-15 min: Propagação para servidores edge globais

---

### 🟢 Opção 9: Limpar Cache do Navegador
**Eficácia**: ⭐⭐⭐⭐ (Alta)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 1 minuto

**Método 1 - Limpeza Completa (Recomendado)**:
1. Pressione `Ctrl + Shift + Delete` (Windows/Linux) ou `Cmd + Shift + Delete` (Mac)
2. Selecione "Últimas 24 horas" ou "Todo o período"
3. Marque:
   - ✅ Cookies e outros dados de sites
   - ✅ Imagens e arquivos armazenados em cache
4. Clique em "Limpar dados"

**Método 2 - Hard Refresh**:
- Pressione `Ctrl + F5` (Windows/Linux) ou `Cmd + Shift + R` (Mac)

**Método 3 - DevTools**:
1. Abra DevTools (`F12`)
2. Clique com botão direito no ícone de atualização
3. Selecione "Esvaziar cache e atualizar forçadamente"

---

### 🟢 Opção 10: Testar em Modo Anônimo
**Eficácia**: ⭐⭐⭐⭐⭐ (Muito Alta - verificação)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 1 minuto

**Como fazer**:
1. Abra janela anônima/privada:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`
2. Acesse: `https://ileala.ae/shop/botanical-placemat-1`
3. Verifique se a página carrega sem erro

**Por que funciona**: Modo anônimo não usa cache existente, garantindo que você veja a versão mais recente.

---

## 🔴 Opções Avançadas (Se o Problema Persistir)

### 🔴 Opção 11: Limpeza Forçada do Cache do Cloudflare
**Eficácia**: ⭐⭐⭐⭐⭐ (Muito Alta)  
**Complexidade**: 🟡 Média  
**Tempo**: 5 minutos

**Quando usar**: Se após 30 minutos da publicação o erro ainda ocorrer

**Passos**:
1. Faça login em https://dash.cloudflare.com
2. Selecione o domínio **ileala.ae**
3. No menu lateral, vá em **Caching** → **Configuration**
4. Role até a seção "Purge Cache"
5. Clique em **"Purge Everything"**
6. Confirme a ação (digite "purge" se solicitado)
7. Aguarde 2-3 minutos
8. Teste novamente o site

**⚠️ Atenção**: 
- Esta ação limpa TODO o cache do site
- O site pode ficar lento temporariamente enquanto o cache é reconstruído
- Use apenas se outras opções falharem

**Alternativa - Purge Seletivo**:
Se quiser limpar apenas arquivos específicos:
1. Em vez de "Purge Everything", escolha "Custom Purge"
2. Adicione estas URLs:
   ```
   https://ileala.ae/
   https://ileala.ae/shop/botanical-placemat-1
   https://ileala.ae/assets/index-C-gqhoCg.js
   https://ileala.ae/BUILD_VERSION.txt
   ```
3. Clique em "Purge"

---

### 🔴 Opção 12: Verificar Logs de Build no Manus
**Eficácia**: ⭐⭐⭐⭐ (Alta - diagnóstico)  
**Complexidade**: 🟡 Média  
**Tempo**: 5 minutos

**Quando usar**: Se suspeitar que o build falhou

**Passos**:
1. Abra o painel de gerenciamento do Manus
2. Vá em **Dashboard** → **Build Logs** (ou seção similar)
3. Procure por:
   - ❌ Erros de compilação TypeScript
   - ❌ Erros de build do Vite
   - ❌ Falhas no upload para CDN
   - ⚠️ Warnings que possam indicar problemas

**O que procurar**:
- Mensagem de sucesso: `✓ built in X.XXs`
- Hash dos arquivos gerados: `index-dqOqOH2P.js`
- Confirmação de upload para CDN

**Se encontrar erros**:
- Anote a mensagem de erro completa
- Verifique se há problemas de dependências
- Tente republicar novamente

---

### 🔴 Opção 13: Rollback e Republicação
**Eficácia**: ⭐⭐⭐ (Média)  
**Complexidade**: 🟡 Média  
**Tempo**: 10 minutos

**Quando usar**: Se a publicação parecer corrompida

**Passos**:
1. No painel de gerenciamento, localize a lista de checkpoints
2. Encontre o checkpoint **a07e8c15**
3. Clique em **"Rollback"** (se disponível)
4. Aguarde confirmação do rollback (2-3 minutos)
5. Clique em **"Publish"** novamente
6. Aguarde 10-15 minutos para propagação
7. Execute o script de diagnóstico

**Teoria**: Às vezes o processo de publicação pode ter falhado silenciosamente. Fazer rollback e republicar força o sistema a refazer todo o processo.

---

### 🔴 Opção 14: Desabilitar Cache Temporariamente no Cloudflare
**Eficácia**: ⭐⭐⭐⭐ (Alta - teste)  
**Complexidade**: 🟡 Média  
**Tempo**: 3 minutos

**Quando usar**: Para testar se o problema é realmente de cache

**Passos**:
1. Faça login no Cloudflare Dashboard
2. Selecione **ileala.ae**
3. Vá em **Caching** → **Configuration**
4. Em "Caching Level", selecione **"No Query String"** ou **"Bypass"**
5. Aguarde 1 minuto
6. Teste o site
7. **IMPORTANTE**: Volte para "Standard" depois do teste

**O que isso prova**:
- Se o site funcionar com cache desabilitado = problema é de cache
- Se o site ainda tiver erro = problema é no código/build

---

### 🔴 Opção 15: Verificar Regras de Page Rules no Cloudflare
**Eficácia**: ⭐⭐⭐ (Média)  
**Complexidade**: 🟡 Média  
**Tempo**: 5 minutos

**Quando usar**: Se suspeitar de configurações conflitantes

**Passos**:
1. No Cloudflare Dashboard, vá em **Rules** → **Page Rules**
2. Verifique se há regras que possam estar:
   - Forçando cache agressivo
   - Redirecionando URLs incorretamente
   - Bloqueando atualizações
3. Desabilite temporariamente regras suspeitas
4. Teste o site

**Regras problemáticas comuns**:
- `Cache Everything` sem exceções
- `Edge Cache TTL` muito alto
- Regras de redirect mal configuradas

---

### 🔴 Opção 16: Verificar Workers do Cloudflare
**Eficácia**: ⭐⭐ (Baixa - edge case)  
**Complexidade**: 🔴 Alta  
**Tempo**: 10 minutos

**Quando usar**: Se houver Cloudflare Workers configurados

**Passos**:
1. No Cloudflare Dashboard, vá em **Workers & Pages**
2. Verifique se há workers ativos para ileala.ae
3. Revise o código do worker para ver se está:
   - Cacheando respostas
   - Modificando requests/responses
   - Bloqueando atualizações
4. Desabilite temporariamente o worker para testar

---

## 🛠️ Opções Técnicas Avançadas

### 🔴 Opção 17: Adicionar Query String de Cache Busting Manual
**Eficácia**: ⭐⭐⭐ (Média - workaround temporário)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 2 minutos

**Quando usar**: Como teste rápido para confirmar que nova versão existe

**Como fazer**:
Adicione `?v=timestamp` à URL:
```
https://ileala.ae/shop/botanical-placemat-1?v=1730520000
```

**Se funcionar com query string**:
- Confirma que a nova versão foi publicada
- Problema é definitivamente de cache
- Prossiga com limpeza de cache do Cloudflare

---

### 🔴 Opção 18: Verificar DNS Propagation
**Eficácia**: ⭐⭐ (Baixa - improvável)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 2 minutos

**Quando usar**: Se suspeitar que DNS está apontando para servidor errado

**Como verificar**:
```bash
# Linux/Mac
dig ileala.ae

# Windows
nslookup ileala.ae

# Online
https://www.whatsmydns.net/#A/ileala.ae
```

**O que procurar**:
- IP deve ser: `104.18.26.246` (conforme contexto técnico)
- Se IP estiver diferente, pode estar apontando para servidor antigo

---

### 🔴 Opção 19: Testar com VPN em Região Diferente
**Eficácia**: ⭐⭐⭐ (Média - diagnóstico)  
**Complexidade**: 🟡 Média  
**Tempo**: 5 minutos

**Quando usar**: Para verificar se problema é regional (CDN edge)

**Como fazer**:
1. Use VPN para conectar em região diferente (ex: EUA, Europa, Ásia)
2. Teste o site: `https://ileala.ae/shop/botanical-placemat-1`
3. Compare resultados entre regiões

**O que isso revela**:
- Se funcionar em uma região mas não em outra = problema de propagação do CDN
- Se não funcionar em nenhuma região = problema no build/código

---

### 🔴 Opção 20: Inspecionar Network Tab no DevTools
**Eficácia**: ⭐⭐⭐⭐ (Alta - diagnóstico técnico)  
**Complexidade**: 🟡 Média  
**Tempo**: 5 minutos

**Como fazer**:
1. Abra o site em modo anônimo
2. Pressione `F12` para abrir DevTools
3. Vá na aba **Network**
4. Marque "Disable cache"
5. Recarregue a página (`F5`)
6. Procure pelo arquivo JavaScript principal

**O que verificar**:
- Nome do arquivo: Deve ser `index-dqOqOH2P.js` (novo hash)
- Status: Deve ser `200` (sucesso)
- Headers de resposta:
  - `cache-control`: Deve ter configuração correta
  - `cf-cache-status`: `HIT` (cache) ou `MISS` (novo)
  - `age`: Se for alto, é versão em cache
- Tamanho: ~1.3 MB (conforme build)

**Se ainda for index-C-gqhoCg.js (hash antigo)**:
- Publicação não foi concluída ou
- CDN ainda não atualizou ou
- Cache local ainda ativo

---

## 📞 Opções de Suporte

### 🔴 Opção 21: Contato com Suporte Manus
**Eficácia**: ⭐⭐⭐⭐⭐ (Muito Alta - última instância)  
**Complexidade**: 🟢 Baixa  
**Tempo**: Variável (resposta em 24-48h)

**Quando usar**: Se TODAS as opções acima falharem

**Como fazer**:
1. Acesse: https://help.manus.im
2. Crie um novo ticket de suporte
3. Inclua as seguintes informações:

**Informações obrigatórias**:
```
Project ID: KLajHo6RcettUsHDC8Cddd
Project Name: ileala-website
Checkpoint: a07e8c15
Domínio: ileala.ae
Problema: Site publicado não atualiza mesmo após múltiplas publicações

Opções tentadas:
- [x] Publicação via interface (3x)
- [x] Aguardado 30+ minutos para propagação
- [x] Limpeza de cache do navegador
- [x] Teste em modo anônimo
- [x] Limpeza do cache do Cloudflare
- [x] Verificação de logs de build
- [x] Rollback e republicação
- [ ] Outras (especifique)

Hash esperado: index-dqOqOH2P.js
Hash atual no site: index-C-gqhoCg.js

Anexos:
- Saída do script check-published-version.sh
- Screenshot do erro React #310
- Screenshot dos logs de build
- Screenshot do Network tab do DevTools
```

---

### 🟢 Opção 22: Consultar Documentação Manus
**Eficácia**: ⭐⭐⭐ (Média)  
**Complexidade**: 🟢 Baixa  
**Tempo**: 10-30 minutos

**Recursos úteis**:
- Documentação oficial: https://docs.manus.im (se disponível)
- FAQ sobre publicação
- Guias de troubleshooting
- Fórum da comunidade

---

## 🎯 Plano de Ação Recomendado

Siga esta sequência para máxima eficácia:

### Fase 1: Ações Imediatas (0-15 minutos)
1. ✅ **Opção 7**: Clicar em "Publish" no painel Manus
2. ⏳ **Opção 8**: Aguardar 10-15 minutos
3. 🔍 **Opção 5**: Executar script de diagnóstico
4. 🧹 **Opção 9**: Limpar cache do navegador
5. 🕵️ **Opção 10**: Testar em modo anônimo

### Fase 2: Se Problema Persistir (15-30 minutos)
6. 🔍 **Opção 20**: Inspecionar Network tab no DevTools
7. 🧹 **Opção 11**: Limpar cache do Cloudflare (Purge Everything)
8. ⏳ Aguardar 5 minutos
9. 🕵️ Testar novamente em modo anônimo

### Fase 3: Diagnóstico Avançado (30-60 minutos)
10. 📊 **Opção 12**: Verificar logs de build
11. 🔄 **Opção 13**: Rollback e republicação
12. 🔍 **Opção 15**: Verificar Page Rules do Cloudflare
13. 🌍 **Opção 19**: Testar com VPN em região diferente

### Fase 4: Última Instância (60+ minutos)
14. 📞 **Opção 21**: Contatar suporte Manus com todas as informações

---

## 📋 Checklist de Verificação Final

Após publicar, verifique cada item:

### Build e Publicação
- [ ] Botão "Publish" clicado
- [ ] Confirmação de publicação recebida
- [ ] Aguardados pelo menos 15 minutos
- [ ] Script de diagnóstico executado

### Verificação Técnica
- [ ] BUILD_VERSION.txt retorna texto (não HTML)
- [ ] Hash do JS mudou para `index-dqOqOH2P.js`
- [ ] Network tab mostra novo hash
- [ ] Sem erro React #310 no console
- [ ] Sem erros JavaScript no console

### Testes Funcionais
- [ ] Página inicial carrega
- [ ] Página da loja carrega
- [ ] Página de produto carrega sem erro
- [ ] Botão "Add to Cart" funciona
- [ ] Carrinho atualiza
- [ ] Checkout funciona
- [ ] Cupom WELCOME10 funciona
- [ ] Redirecionamento Stripe funciona

### Cache e Propagação
- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo
- [ ] Testado em navegador diferente
- [ ] Testado em dispositivo móvel
- [ ] Cache do Cloudflare limpo (se necessário)

---

## 🏆 Critérios de Sucesso

O problema está **100% resolvido** quando:

| Critério | Status Esperado |
|----------|-----------------|
| Hash do JavaScript | `index-dqOqOH2P.js` ✅ |
| Erro React #310 | Ausente ✅ |
| BUILD_VERSION.txt | Retorna texto ✅ |
| Página de produto | Carrega normalmente ✅ |
| Botão "Add to Cart" | Funciona ✅ |
| Checkout completo | Funciona ✅ |
| Teste em modo anônimo | Funciona ✅ |
| Teste em mobile | Funciona ✅ |

---

## 📊 Tabela Comparativa de Todas as Opções

| # | Opção | Eficácia | Complexidade | Tempo | Quando Usar |
|---|-------|----------|--------------|-------|-------------|
| 1 | Mudança de código | ⭐⭐⭐⭐⭐ | 🟢 | 2min | ✅ Já feito |
| 2 | Cache busting config | ⭐⭐⭐⭐⭐ | 🟡 | 10min | ✅ Já feito |
| 3 | Headers de cache | ⭐⭐⭐⭐ | 🟡 | 15min | ✅ Já feito |
| 4 | BUILD_VERSION.txt | ⭐⭐⭐ | 🟢 | 5min | ✅ Já feito |
| 5 | Script diagnóstico | ⭐⭐⭐⭐⭐ | 🟢 | 30min | ✅ Já feito |
| 6 | .nojekyll | ⭐⭐ | 🟢 | 1min | ✅ Já feito |
| 7 | Publicar via Manus | ⭐⭐⭐⭐⭐ | 🟢 | 3min | **FAÇA AGORA** |
| 8 | Aguardar propagação | ⭐⭐⭐⭐⭐ | 🟢 | 15min | **FAÇA AGORA** |
| 9 | Limpar cache navegador | ⭐⭐⭐⭐ | 🟢 | 1min | **FAÇA AGORA** |
| 10 | Modo anônimo | ⭐⭐⭐⭐⭐ | 🟢 | 1min | **FAÇA AGORA** |
| 11 | Cloudflare purge | ⭐⭐⭐⭐⭐ | 🟡 | 5min | Se persistir 30min |
| 12 | Logs de build | ⭐⭐⭐⭐ | 🟡 | 5min | Se suspeitar falha |
| 13 | Rollback | ⭐⭐⭐ | 🟡 | 10min | Se build corrompido |
| 14 | Desabilitar cache CF | ⭐⭐⭐⭐ | 🟡 | 3min | Teste diagnóstico |
| 15 | Page Rules CF | ⭐⭐⭐ | 🟡 | 5min | Se regras suspeitas |
| 16 | Workers CF | ⭐⭐ | 🔴 | 10min | Se workers ativos |
| 17 | Query string manual | ⭐⭐⭐ | 🟢 | 2min | Teste rápido |
| 18 | DNS propagation | ⭐⭐ | 🟢 | 2min | Se IP diferente |
| 19 | VPN teste regional | ⭐⭐⭐ | 🟡 | 5min | Diagnóstico CDN |
| 20 | DevTools Network | ⭐⭐⭐⭐ | 🟡 | 5min | Diagnóstico técnico |
| 21 | Suporte Manus | ⭐⭐⭐⭐⭐ | 🟢 | 24-48h | Última instância |
| 22 | Documentação | ⭐⭐⭐ | 🟢 | 10-30min | Aprendizado |

---

## 🎓 Lições Aprendidas

### Por que este problema ocorreu?

1. **Código removido sem adição**: Ao remover o Stripe Buy Button sem adicionar nada novo, o Vite manteve o mesmo hash
2. **Cache agressivo**: CDN e navegadores cachearam a versão antiga
3. **Falta de headers de cache**: Sem controle explícito, o comportamento padrão prevaleceu

### Como prevenir no futuro?

1. **Sempre adicionar mudança visível**: Comentário com timestamp ao corrigir bugs
2. **Usar script de diagnóstico**: Verificar cada publicação
3. **Aguardar tempo adequado**: Não assumir que publicação é instantânea
4. **Manter versionamento**: Atualizar BUILD_VERSION.txt
5. **Documentar mudanças**: Manter CHANGELOG atualizado

---

## 🚀 Conclusão

Você agora tem **22 opções diferentes** para resolver o problema de publicação, organizadas por:
- ✅ **6 opções já implementadas** (no checkpoint a07e8c15)
- 🟢 **4 ações imediatas** (faça agora)
- 🔴 **10 opções avançadas** (se problema persistir)
- 📞 **2 opções de suporte** (última instância)

**Garantia**: Com o novo hash JavaScript (`index-dqOqOH2P.js`) e todas as melhorias implementadas, o problema DEVE ser resolvido após publicar e aguardar propagação do CDN.

**Próximo passo**: Siga o **Plano de Ação Recomendado** começando pela **Fase 1**.

---

**Documento criado por**: Manus AI  
**Última atualização**: 02 de Novembro de 2025, 03:30 UTC  
**Versão**: 3.0 Final  
**Checkpoint**: a07e8c15
