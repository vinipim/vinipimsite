#!/bin/bash

echo "🔍 Verificando configuração para deploy no Railway..."
echo ""

# Verificar se arquivos conflitantes foram removidos
echo "1. Verificando arquivos conflitantes..."
if [ -f "next.config.mjs" ]; then
    echo "   ❌ next.config.mjs ainda existe - REMOVER"
    EXIT_CODE=1
else
    echo "   ✅ next.config.mjs removido"
fi

if [ -d "app" ]; then
    echo "   ❌ Diretório app/ ainda existe - REMOVER"
    EXIT_CODE=1
else
    echo "   ✅ Diretório app/ removido"
fi

# Verificar arquivos essenciais
echo ""
echo "2. Verificando arquivos essenciais..."
if [ -f "railway.toml" ]; then
    echo "   ✅ railway.toml existe"
else
    echo "   ❌ railway.toml não encontrado"
    EXIT_CODE=1
fi

if [ -f "nixpacks.json" ]; then
    echo "   ✅ nixpacks.json existe"
else
    echo "   ❌ nixpacks.json não encontrado"
    EXIT_CODE=1
fi

if [ -f ".npmrc" ]; then
    echo "   ✅ .npmrc existe"
else
    echo "   ⚠️  .npmrc não encontrado (recomendado)"
fi

# Verificar estrutura de diretórios
echo ""
echo "3. Verificando estrutura de diretórios..."
if [ -d "client" ]; then
    echo "   ✅ Diretório client/ existe"
else
    echo "   ❌ Diretório client/ não encontrado"
    EXIT_CODE=1
fi

if [ -d "server" ]; then
    echo "   ✅ Diretório server/ existe"
else
    echo "   ❌ Diretório server/ não encontrado"
    EXIT_CODE=1
fi

if [ -d "drizzle" ]; then
    echo "   ✅ Diretório drizzle/ existe"
else
    echo "   ❌ Diretório drizzle/ não encontrado"
    EXIT_CODE=1
fi

# Verificar health check endpoint
echo ""
echo "4. Verificando health check endpoint..."
if grep -q "/health" server/_core/index.ts; then
    echo "   ✅ Endpoint /health encontrado"
else
    echo "   ❌ Endpoint /health não encontrado"
    EXIT_CODE=1
fi

# Verificar configuração de porta
echo ""
echo "5. Verificando configuração de porta..."
if grep -q "0.0.0.0" server/_core/index.ts; then
    echo "   ✅ Bind em 0.0.0.0 configurado"
else
    echo "   ⚠️  Bind em 0.0.0.0 não encontrado (pode causar problemas)"
fi

# Verificar scripts no package.json
echo ""
echo "6. Verificando scripts no package.json..."
if grep -q '"build":' package.json; then
    echo "   ✅ Script build existe"
else
    echo "   ❌ Script build não encontrado"
    EXIT_CODE=1
fi

if grep -q '"start":' package.json; then
    echo "   ✅ Script start existe"
else
    echo "   ❌ Script start não encontrado"
    EXIT_CODE=1
fi

if grep -q '"db:push":' package.json; then
    echo "   ✅ Script db:push existe"
else
    echo "   ❌ Script db:push não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -z "$EXIT_CODE" ]; then
    echo "✅ TODAS AS VERIFICAÇÕES PASSARAM!"
    echo "   O projeto está pronto para deploy no Railway."
    echo ""
    echo "Próximos passos:"
    echo "1. git add ."
    echo "2. git commit -m 'fix: configure for Railway deployment'"
    echo "3. git push origin main"
    echo "4. Configurar Railway conforme RAILWAY_DEPLOY_FIXED.md"
else
    echo "❌ ALGUMAS VERIFICAÇÕES FALHARAM"
    echo "   Corrija os problemas acima antes de fazer deploy."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit ${EXIT_CODE:-0}

