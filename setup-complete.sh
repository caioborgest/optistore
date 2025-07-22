#!/bin/bash

echo "🚀 Configurando OptiStore - Sistema de Gestão Completo"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Verificar se arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado"
    echo "📝 Criando arquivo .env.local a partir do exemplo..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
    echo "⚠️  IMPORTANTE: Configure suas credenciais do Supabase no arquivo .env.local"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar configuração do Supabase
echo ""
echo "🔧 CONFIGURAÇÃO DO SUPABASE NECESSÁRIA:"
echo "======================================="
echo "1. Acesse https://supabase.com e crie um projeto"
echo "2. Vá para Settings > API e copie:"
echo "   - Project URL"
echo "   - anon/public key"
echo "3. Atualize o arquivo .env.local com suas credenciais"
echo "4. No SQL Editor do Supabase, execute o arquivo setup_database.sql"
echo ""

# Mostrar próximos passos
echo "📋 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Configure o Supabase (instruções acima)"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:5173"
echo "4. Registre sua empresa (primeiro usuário será admin)"
echo "5. Use o código de convite para adicionar funcionários"
echo ""

echo "🎉 FUNCIONALIDADES ATIVADAS:"
echo "============================"
echo "✅ Sistema de Autenticação"
echo "✅ Gestão de Empresas e Usuários"
echo "✅ Tarefas Simples e Recorrentes"
echo "✅ Chat em Tempo Real"
echo "✅ Notificações Push"
echo "✅ Dashboard Personalizado por Papel"
echo "✅ Upload de Arquivos"
echo "✅ PWA (Progressive Web App)"
echo "✅ Sistema de Permissões"
echo "✅ Relatórios e Métricas"
echo ""

echo "📚 DOCUMENTAÇÃO:"
echo "================"
echo "- README.md - Informações gerais"
echo "- ARQUITETURA_SISTEMA.md - Arquitetura técnica"
echo "- activate-features.md - Status das funcionalidades"
echo "- database_schema.sql - Schema completo do banco"
echo "- setup_database.sql - Script de configuração inicial"
echo ""

echo "🆘 SUPORTE:"
echo "==========="
echo "- Verifique os logs do console para erros"
echo "- Confirme se o Supabase está configurado corretamente"
echo "- Teste as funcionalidades passo a passo"
echo ""

echo "✨ OptiStore está pronto para uso!"
echo "Transforme a gestão operacional da sua loja! 🏗️"