#!/bin/bash

# Script de Diagnóstico - Verificar Versão Publicada do Site ILE ALA
# Autor: Manus AI
# Data: 2025-11-02

echo "=========================================="
echo "ILE ALA - Diagnóstico de Versão Publicada"
echo "=========================================="
echo ""

DOMAIN="https://ileala.ae"
TEST_URL="$DOMAIN/shop/botanical-placemat-1"

echo "🔍 Verificando domínio: $DOMAIN"
echo ""

# 1. Verificar se o site está acessível
echo "1️⃣ Testando acessibilidade do site..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ Site acessível (HTTP $HTTP_CODE)"
else
    echo "   ❌ Site retornou HTTP $HTTP_CODE"
fi
echo ""

# 2. Verificar headers de cache
echo "2️⃣ Verificando headers de cache..."
curl -s -I "$DOMAIN" | grep -i "cache\|age\|etag\|last-modified" | head -5
echo ""

# 3. Verificar se há arquivo BUILD_VERSION.txt
echo "3️⃣ Verificando arquivo BUILD_VERSION.txt..."
BUILD_VERSION_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/BUILD_VERSION.txt")
if [ "$BUILD_VERSION_CODE" -eq 200 ]; then
    echo "   ✅ BUILD_VERSION.txt encontrado"
    echo "   Conteúdo:"
    curl -s "$DOMAIN/BUILD_VERSION.txt" | head -5
else
    echo "   ❌ BUILD_VERSION.txt não encontrado (HTTP $BUILD_VERSION_CODE)"
    echo "   ⚠️  Isso indica que o site ainda está usando versão antiga"
fi
echo ""

# 4. Verificar hash do arquivo JavaScript principal
echo "4️⃣ Verificando hash do arquivo JavaScript principal..."
JS_FILE=$(curl -s "$DOMAIN" | grep -o 'assets/index-[^"]*\.js' | head -1)
if [ -n "$JS_FILE" ]; then
    echo "   Arquivo JS: $JS_FILE"
    JS_SIZE=$(curl -s -I "$DOMAIN/$JS_FILE" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
    echo "   Tamanho: $JS_SIZE bytes"
else
    echo "   ❌ Não foi possível encontrar arquivo JS principal"
fi
echo ""

# 5. Verificar se a página de produto carrega sem erro
echo "5️⃣ Testando página de produto..."
PRODUCT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")
if [ "$PRODUCT_CODE" -eq 200 ]; then
    echo "   ✅ Página de produto acessível (HTTP $PRODUCT_CODE)"
    
    # Verificar se há erro React no HTML
    if curl -s "$TEST_URL" | grep -q "Minified React error"; then
        echo "   ❌ ERRO DETECTADO: Página contém erro React #310"
        echo "   ⚠️  Site ainda está usando versão antiga com bug"
    else
        echo "   ✅ Nenhum erro React detectado no HTML"
        echo "   ✅ Site parece estar usando versão corrigida!"
    fi
else
    echo "   ❌ Página de produto retornou HTTP $PRODUCT_CODE"
fi
echo ""

# 6. Verificar DNS
echo "6️⃣ Verificando configuração DNS..."
dig +short ileala.ae | head -3
echo ""

# 7. Verificar certificado SSL
echo "7️⃣ Verificando certificado SSL..."
echo | openssl s_client -servername ileala.ae -connect ileala.ae:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null
echo ""

# 8. Resumo e Recomendações
echo "=========================================="
echo "📊 RESUMO E RECOMENDAÇÕES"
echo "=========================================="
echo ""

if [ "$BUILD_VERSION_CODE" -eq 200 ]; then
    echo "✅ BUILD_VERSION.txt encontrado - nova versão foi publicada"
    echo ""
    echo "Próximos passos:"
    echo "1. Limpe o cache do navegador (Ctrl+Shift+Delete)"
    echo "2. Aguarde 5-10 minutos para propagação do CDN"
    echo "3. Teste em modo anônimo: $TEST_URL"
else
    echo "❌ BUILD_VERSION.txt NÃO encontrado - versão antiga ainda ativa"
    echo ""
    echo "Ações recomendadas:"
    echo "1. Verifique se a publicação foi concluída com sucesso"
    echo "2. Tente publicar novamente usando o checkpoint dbf56b26"
    echo "3. Se o problema persistir, limpe o cache do Cloudflare"
    echo "4. Entre em contato com suporte Manus se necessário"
fi
echo ""
echo "=========================================="
echo "Diagnóstico concluído em $(date)"
echo "=========================================="
