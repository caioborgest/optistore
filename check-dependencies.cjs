#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando dependências das melhorias avançadas...\n');

// Verificar package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json não encontrado!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Dependências necessárias
const requiredDeps = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  'framer-motion'
];

console.log('📦 Verificando dependências necessárias:');
let allDepsInstalled = true;

requiredDeps.forEach(dep => {
  if (dependencies[dep]) {
    console.log(`✅ ${dep}: ${dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep}: NÃO INSTALADO`);
    allDepsInstalled = false;
  }
});

console.log('\n🗂️  Verificando arquivos criados:');

// Arquivos que devem existir
const requiredFiles = [
  // Hooks
  'src/hooks/useTheme.tsx',
  'src/hooks/useCustomTheme.tsx',
  'src/hooks/useA11y.tsx',
  'src/hooks/useGestures.tsx',
  
  // Componentes UI
  'src/components/ui/page-transition.tsx',
  'src/components/ui/virtual-list.tsx',
  'src/components/ui/lazy-image.tsx',
  
  // Componentes de Tarefas
  'src/components/tasks/DraggableKanban.tsx',
  'src/components/tasks/SortableTaskCard.tsx',
  'src/components/tasks/TaskColumn.tsx',
  
  // Componentes de Configurações
  'src/components/settings/ThemeSettings.tsx',
  'src/components/settings/AccessibilitySettings.tsx',
  'src/components/Settings.tsx',
  'src/components/TestAdvancedFeatures.tsx',
  
  // Estilos
  'src/styles/theme.css',
  'src/styles/accessibility.css'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}: NÃO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log('\n📋 Verificando imports no App.tsx:');

const appTsxPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  
  const requiredImports = [
    'ThemeProvider',
    'CustomThemeProvider',
    'A11yProvider',
    'PageTransition',
    'theme.css',
    'accessibility.css'
  ];
  
  requiredImports.forEach(imp => {
    if (appContent.includes(imp)) {
      console.log(`✅ ${imp} importado`);
    } else {
      console.log(`❌ ${imp}: NÃO IMPORTADO`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ App.tsx não encontrado!');
  allFilesExist = false;
}

console.log('\n📊 RESUMO:');
console.log(`Dependências: ${allDepsInstalled ? '✅ OK' : '❌ FALTANDO'}`);
console.log(`Arquivos: ${allFilesExist ? '✅ OK' : '❌ FALTANDO'}`);

if (allDepsInstalled && allFilesExist) {
  console.log('\n🎉 TUDO PRONTO! Todas as melhorias foram implementadas com sucesso.');
  console.log('\n🚀 Para testar:');
  console.log('1. npm run dev');
  console.log('2. Acesse /test');
  console.log('3. Teste as funcionalidades avançadas');
} else {
  console.log('\n⚠️  ATENÇÃO: Algumas dependências ou arquivos estão faltando.');
  
  if (!allDepsInstalled) {
    console.log('\n📦 Para instalar dependências faltantes:');
    console.log('npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities framer-motion');
  }
  
  if (!allFilesExist) {
    console.log('\n📁 Verifique se todos os arquivos foram criados corretamente.');
  }
}

console.log('\n📚 Documentação:');
console.log('- MELHORIAS_IMPLEMENTADAS.md: Lista completa das funcionalidades');
console.log('- TESTE_FUNCIONALIDADES.md: Guia de como testar');

process.exit(allDepsInstalled && allFilesExist ? 0 : 1);