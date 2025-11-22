# 🧪 Teste Local do Sanity

## 🔍 Como Testar se o Sanity Está Funcionando

### Teste 1: Verificar Variáveis de Ambiente

No seu terminal local:

```bash
cd ileala-website
cat .env.local | grep SANITY
```

Deve mostrar:
- `VITE_SANITY_PROJECT_ID=anyz9zel`
- `VITE_SANITY_DATASET=production`
- `VITE_SANITY_TOKEN=sk...` (opcional)

### Teste 2: Testar Conexão com Sanity

Crie um arquivo de teste:

```bash
cd ileala-website
cat > test-sanity.js << 'EOF'
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'anyz9zel',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-11-10',
});

async function test() {
  try {
    const query = '*[_type == "product"][0...5]';
    const products = await client.fetch(query);
    console.log('✅ Sucesso! Produtos encontrados:', products.length);
    console.log('Primeiro produto:', products[0]?.name || 'Nenhum produto');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();
EOF

node test-sanity.js
```

### Teste 3: Verificar se Há Produtos no Sanity

1. Acesse: https://www.sanity.io/manage/personal/project/anyz9zel/content
2. Verifique se há produtos criados
3. Se não houver, crie alguns produtos de teste

---

## 🚨 Problemas Comuns

### 1. Token Inválido
- **Sintoma:** Erro 401
- **Solução:** Remova o token ou use um token válido

### 2. Sem Produtos no Sanity
- **Sintoma:** Array vazio retornado
- **Solução:** Crie produtos no Sanity Dashboard

### 3. Project ID Incorreto
- **Sintoma:** Erro de conexão
- **Solução:** Verifique se `VITE_SANITY_PROJECT_ID=anyz9zel`

---

**Última atualização:** 21 de Novembro de 2025




