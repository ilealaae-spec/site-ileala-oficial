# 🔧 Solução: Site "Sambando" (Elementos se Movendo)

## 📋 Problema

O site está "sambando" ou "mexendo" - elementos se movendo constantemente, layout instável.

## 🔍 Causas Identificadas

### 1. Layout Shift nas Imagens
- **Problema:** `LazyImage` com transição de opacity causava layout shift
- **Sintoma:** Elementos pulando/movendo quando imagens carregam

### 2. Re-renderizações Constantes
- **Problema:** `CartContext` recalculava `totalItems` e `totalPrice` a cada render
- **Sintoma:** Componentes re-renderizando constantemente

### 3. Queries Refazendo Constantemente
- **Problema:** Queries do tRPC refazendo a cada foco da janela
- **Sintoma:** Dados sendo recarregados constantemente, causando re-renders

## ✅ Correções Aplicadas

### 1. LazyImage Melhorado
- ✅ Adicionado `minHeight` e `minWidth` para evitar layout shift
- ✅ Imagem com `opacity-0 absolute` quando não carregada (não ocupa espaço)
- ✅ Transição suave apenas quando carregada
- ✅ `loading="lazy"` para carregamento otimizado
- ✅ `willChange` otimizado

### 2. CartContext Memoizado
- ✅ `totalItems` e `totalPrice` agora são `useMemo`
- ✅ Context value memoizado para evitar re-renders
- ✅ Apenas re-renderiza quando `items` realmente muda

### 3. Queries Otimizadas
- ✅ Adicionado `staleTime: 5 * 60 * 1000` (5 minutos) em todas as queries de produtos
- ✅ Adicionado `staleTime: 10 * 60 * 1000` (10 minutos) em queries de categorias
- ✅ Adicionado `refetchOnWindowFocus: false` para evitar refetch ao focar janela

**Queries corrigidas:**
- `trpc.products.list.useQuery()`
- `trpc.products.byCollection.useQuery()`
- `trpc.products.byCategory.useQuery()`
- `trpc.categories.listActive.useQuery()`
- `trpc.categories.list.useQuery()`

## 🚀 Próximos Passos

### 1. Aguardar Deploy (5-10 minutos)
O Railway deve detectar o novo commit automaticamente.

### 2. Limpar Cache do Navegador
Após o deploy:
- DevTools (F12) → botão direito no recarregar → "Limpar cache e recarregar forçadamente"
- Ou usar modo anônimo

### 3. Verificar se Funcionou
Após limpar cache:
- ✅ Site deve estar estável (não "sambando")
- ✅ Imagens carregam suavemente sem layout shift
- ✅ Elementos não devem se mover durante carregamento
- ✅ Console não deve mostrar muitos re-renders

## 🔍 Como Verificar

### DevTools → Performance
1. Abrir DevTools (F12)
2. Aba **Performance**
3. Clicar em **Record**
4. Interagir com o site
5. Parar gravação
6. Verificar se há muitos re-renders ou layout shifts

### DevTools → React DevTools
1. Instalar React DevTools (extensão do Chrome)
2. Abrir DevTools → aba **Components**
3. Verificar se componentes estão re-renderizando constantemente
4. Se sim, verificar o que está causando

## 📝 Notas Técnicas

### Antes:
- Imagens causavam layout shift ao carregar
- CartContext recalculava valores a cada render
- Queries refaziam constantemente ao focar janela

### Depois:
- Imagens não causam layout shift (posição fixa)
- CartContext memoizado (só recalcula quando necessário)
- Queries com cache de 5-10 minutos (não refazem constantemente)

## 🆘 Se Ainda Estiver "Sambando"

1. **Verificar console:**
   - F12 → Console
   - Verificar se há erros ou warnings
   - Verificar se há muitos logs de re-render

2. **Verificar Performance:**
   - F12 → Performance
   - Gravar interação
   - Verificar o que está causando re-renders

3. **Verificar CSS:**
   - F12 → Elements
   - Verificar se há estilos sendo aplicados/removidos constantemente

4. **Verificar Network:**
   - F12 → Network
   - Verificar se há requisições sendo feitas constantemente

