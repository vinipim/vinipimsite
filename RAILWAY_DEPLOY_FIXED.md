# 🚂 Guia de Deploy Railway - CORRIGIDO

## ✅ Problemas Corrigidos

### 1. **Conflito Next.js Removido**
- ❌ Removido `next.config.mjs`
- ❌ Removido diretório `app/` (Next.js App Router)
- ✅ Projeto agora é **puramente Express + Vite**

### 2. **Health Check Adicionado**
- ✅ Endpoint `/health` criado em `server/_core/index.ts`
- ✅ Configurado no `railway.toml`

### 3. **Porta Corrigida**
- ✅ Servidor usa porta exata do Railway em produção
- ✅ Bind em `0.0.0.0` para aceitar conexões externas

### 4. **Scripts Melhorados**
- ✅ `pnpm build` agora valida tipos antes de buildar
- ✅ `pnpm db:push` simplificado para Railway
- ✅ `pnpm db:setup` para configuração inicial

### 5. **Configuração Railway Otimizada**
- ✅ Build command explícito
- ✅ Migração automática no deploy
- ✅ Health check configurado
- ✅ Restart policy otimizado

---

## 🚀 Passo a Passo para Deploy

### Passo 1: Preparar Repositório GitHub

```bash
# Fazer commit das alterações
git add .
git commit -m "fix: remove Next.js conflicts and configure for Railway"
git push origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório `vinipim/vinipimsite`

### Passo 3: Adicionar Banco de Dados MySQL

1. No projeto Railway, clique em **"New"** → **"Database"** → **"Add MySQL"**
2. Aguarde o MySQL ser provisionado
3. Copie a variável `DATABASE_URL` do serviço MySQL

### Passo 4: Configurar Variáveis de Ambiente

No serviço da aplicação (não no MySQL), adicione estas variáveis:

#### **Obrigatórias:**
```env
DATABASE_URL=mysql://root:SENHA@mysql.railway.internal:3306/railway
JWT_SECRET=<gerar com: openssl rand -base64 32>
NODE_ENV=production
```

#### **Opcionais (OAuth):**
```env
OAUTH_SERVER_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=auto
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

#### **Opcionais (AWS S3 para uploads):**
```env
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=seu_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket
```

### Passo 5: Conectar Serviços

1. No Railway, clique no serviço da aplicação
2. Vá em **"Settings"** → **"Service Variables"**
3. Clique em **"Add Reference"**
4. Selecione o serviço MySQL
5. Escolha a variável `DATABASE_URL`

Isso garante que a aplicação sempre use o URL correto do MySQL.

### Passo 6: Deploy Automático

O Railway vai automaticamente:
1. ✅ Detectar `railway.toml`
2. ✅ Instalar dependências com `pnpm`
3. ✅ Executar `pnpm build`
4. ✅ Executar `pnpm db:push` (migrações)
5. ✅ Iniciar com `pnpm start`
6. ✅ Verificar health check em `/health`

### Passo 7: Verificar Deploy

1. Aguarde o build completar (3-5 minutos)
2. Clique no URL gerado pelo Railway
3. Verifique se o site carrega corretamente
4. Teste o endpoint de health: `https://seu-app.railway.app/health`

---

## 🔍 Verificação de Logs

### Logs de Build
```bash
# No Railway, vá em "Deployments" → Clique no deployment → "Build Logs"
```

**O que procurar:**
- ✅ `pnpm install` completa sem erros
- ✅ `vite build` gera arquivos em `dist/public`
- ✅ `esbuild` gera `dist/index.js`
- ✅ Build completa com sucesso

### Logs de Deploy
```bash
# No Railway, vá em "Deployments" → Clique no deployment → "Deploy Logs"
```

**O que procurar:**
- ✅ `pnpm db:push` executa migrações
- ✅ `✅ Server running on port XXXX`
- ✅ `Environment: production`
- ✅ `Database: Connected`

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'dist/index.js'"

**Causa:** Build falhou ou não gerou o arquivo.

**Solução:**
```bash
# Verificar se o build está correto localmente
pnpm build
ls -la dist/

# Deve mostrar:
# dist/index.js
# dist/public/
```

### Erro: "Port already in use"

**Causa:** Configuração antiga de porta.

**Solução:** Já corrigido! O servidor agora usa a porta exata do Railway em produção.

### Erro: "Database connection failed"

**Causa:** `DATABASE_URL` não configurado ou incorreto.

**Solução:**
1. Verificar se a variável `DATABASE_URL` está definida
2. Verificar se o formato está correto: `mysql://user:pass@host:port/database`
3. Verificar se o serviço MySQL está rodando
4. Usar "Add Reference" no Railway para conectar automaticamente

### Erro: "Health check failed"

**Causa:** Servidor não está respondendo em `/health`.

**Solução:** Já corrigido! O endpoint `/health` foi adicionado.

### Erro: "Build timeout"

**Causa:** Muitas dependências ou build muito lento.

**Solução:**
1. Limpar cache do Railway: Settings → "Clear Build Cache"
2. Considerar remover dependências não utilizadas do `package.json`

---

## 📊 Estrutura de Arquivos Após Deploy

```
vinipimsite/
├── dist/                    # Gerado pelo build
│   ├── index.js            # Servidor Express bundled
│   └── public/             # Frontend Vite bundled
│       ├── index.html
│       └── assets/
├── client/                  # Código fonte frontend
│   ├── src/
│   └── index.html
├── server/                  # Código fonte backend
│   ├── _core/
│   │   └── index.ts        # ✅ Health check adicionado
│   └── db.ts
├── drizzle/                 # Schema do banco
│   └── schema.ts
├── railway.toml             # ✅ Configuração Railway
├── nixpacks.json            # ✅ Configuração Nixpacks
├── package.json             # ✅ Scripts corrigidos
└── .npmrc                   # ✅ Configuração pnpm
```

---

## 🎯 Checklist Final

Antes de fazer deploy, verifique:

- [ ] ✅ Arquivos Next.js removidos (`next.config.mjs`, `app/`)
- [ ] ✅ Health check endpoint `/health` adicionado
- [ ] ✅ Porta corrigida para Railway
- [ ] ✅ Scripts de build e start atualizados
- [ ] ✅ `railway.toml` configurado
- [ ] ✅ Variáveis de ambiente configuradas no Railway
- [ ] ✅ MySQL provisionado no Railway
- [ ] ✅ Serviços conectados (app → MySQL)
- [ ] ✅ Código commitado e pushed para GitHub

---

## 🚀 Deploy em 5 Minutos

```bash
# 1. Commit e push
git add .
git commit -m "fix: configure for Railway deployment"
git push origin main

# 2. No Railway:
# - Criar projeto
# - Adicionar MySQL
# - Configurar variáveis de ambiente
# - Conectar serviços

# 3. Aguardar deploy automático

# 4. Acessar URL gerado

# 5. Testar health check:
curl https://seu-app.railway.app/health
```

---

## 📚 Recursos Adicionais

- [Railway Documentation](https://docs.railway.app/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## ✅ Status: PRONTO PARA DEPLOY

Todas as correções foram aplicadas. O projeto está configurado corretamente para deploy no Railway! 🎉

