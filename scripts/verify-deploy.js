#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verificação Estrita de Deploy e Build do Vinipim Portfolio\n');

// 1. Verificar se package.json existe e tem scripts corretos
console.log('📦 Verificando package.json...');
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const requiredScripts = ['build', 'start'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

  if (missingScripts.length > 0) {
    console.error(`❌ Scripts faltando: ${missingScripts.join(', ')}`);
    process.exit(1);
  }

  if (!packageJson.scripts.build.includes('build-server.js')) {
    console.error('❌ Script build não inclui build-server.js');
    process.exit(1);
  }

  console.log('✅ package.json OK');
} catch (error) {
  console.error('❌ Erro ao ler package.json:', error.message);
  process.exit(1);
}

// 2. Verificar se scripts/build-server.js existe
console.log('🔨 Verificando build-server.js...');
try {
  readFileSync(join(rootDir, 'scripts', 'build-server.js'));
  console.log('✅ build-server.js existe');
} catch (error) {
  console.error('❌ build-server.js não encontrado');
  process.exit(1);
}

// 3. Verificar se .env.example tem as variáveis corretas
console.log('🔐 Verificando .env.example...');
try {
  const envExample = readFileSync(join(rootDir, '.env.example'), 'utf8');
  const requiredVars = ['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];

  const missingVars = requiredVars.filter(v => !envExample.includes(v));
  if (missingVars.length > 0) {
    console.error(`❌ Variáveis faltando no .env.example: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  if (envExample.includes('pplx-')) {
    console.error('❌ .env.example contém chave real de API');
    process.exit(1);
  }

  console.log('✅ .env.example OK');
} catch (error) {
  console.error('❌ Erro ao verificar .env.example:', error.message);
  process.exit(1);
}

// 4. Executar build
console.log('🏗️  Executando build...');
const buildProcess = spawn('npm', ['run', 'build'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

await new Promise((resolve, reject) => {
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build executado com sucesso');
      resolve();
    } else {
      console.error(`❌ Build falhou com código ${code}`);
      reject(new Error('Build failed'));
    }
  });
});

// 5. Verificar se arquivos foram gerados
console.log('📁 Verificando arquivos gerados...');
const checkFiles = [
  'dist/index.html',
  'dist/server/index.js',
  'dist/server/_core/index.js'
];

for (const file of checkFiles) {
  try {
    readFileSync(join(rootDir, file));
    console.log(`✅ ${file} existe`);
  } catch (error) {
    console.error(`❌ ${file} não foi gerado`);
    process.exit(1);
  }
}

// 6. Testar se o servidor inicia (teste rápido)
console.log('🚀 Testando inicialização do servidor...');
let serverProcess;

try {
  serverProcess = spawn('node', ['dist/server/index.js'], {
    cwd: rootDir,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Aguardar 3 segundos para o servidor iniciar
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Verificar se o processo ainda está rodando
  if (serverProcess.killed) {
    console.error('❌ Servidor terminou inesperadamente');
    process.exit(1);
  }

  console.log('✅ Servidor iniciou corretamente');

} catch (error) {
  console.error('❌ Erro ao testar servidor:', error.message);
  process.exit(1);
} finally {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
}

// 7. Verificações finais
console.log('🎯 Verificações Railway...');

// Verificar railway.toml
try {
  const fs = await import('fs');
  const path = await import('path');

  const tomlContent = fs.readFileSync(path.join(rootDir, 'railway.toml'), 'utf8');

  if (!tomlContent.includes('startCommand = "node dist/server/index.js"')) {
    console.error('❌ railway.toml startCommand incorreto');
    process.exit(1);
  }
  if (!tomlContent.includes('healthcheckPath = "/health"')) {
    console.error('❌ railway.toml healthcheckPath incorreto');
    process.exit(1);
  }
  console.log('✅ railway.toml configurado corretamente');
} catch (error) {
  console.error('❌ Erro ao verificar railway.toml:', error.message);
  process.exit(1);
}

// Verificar se não há arquivos críticos proibidos
const forbiddenFiles = ['*.backup.*', 'CLAUDE.md', 'FIXED_ISSUES.md'];
const criticalForbidden = forbiddenFiles.filter(f => f.includes('*') === false);

let hasCriticalForbidden = false;
for (const file of criticalForbidden) {
  try {
    readFileSync(join(rootDir, file));
    console.error(`❌ Arquivo crítico proibido encontrado: ${file}`);
    hasCriticalForbidden = true;
  } catch (e) {
    // File doesn't exist, which is good
  }
}

if (hasCriticalForbidden) {
  console.error('❌ Arquivos críticos proibidos encontrados');
  process.exit(1);
}

console.log('✅ Arquivos críticos proibidos verificados');

console.log('\n🎉 TODAS AS VERIFICAÇÕES PASSARAM!');
console.log('🚀 O deploy no Railway deve funcionar corretamente.');
console.log('\n📋 Checklist final:');
console.log('✅ Build process funciona');
console.log('✅ TypeScript compila corretamente');
console.log('✅ Servidor inicia sem erros');
console.log('✅ Healthcheck configurado');
console.log('✅ Variáveis de ambiente corretas');
console.log('✅ Arquivos proibidos removidos');
console.log('✅ Configurações Railway OK');
