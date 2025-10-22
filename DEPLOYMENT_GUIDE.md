# Portfolio Deployment Guide

Your portfolio is a full-stack Express + Vite + tRPC application with MySQL database. Here's how to deploy it properly.

---

## 🚨 CRITICAL: Required Environment Variables

Your app **WILL NOT WORK** without these environment variables:

### Required for ALL platforms:
- `DATABASE_URL` - MySQL connection string (from PlanetScale, Railway MySQL, or Neon)
- `JWT_SECRET` - Random secret for JWT tokens (generate with: `openssl rand -base64 32`)
- `NODE_ENV=production`

### Optional (for OAuth features):
- `BUILT_IN_FORGE_API_KEY=auto`
- `BUILT_IN_FORGE_API_URL=https://api.manus.im`
- `OAUTH_SERVER_URL=https://api.manus.im`

---

## 🚂 Railway Deployment (RECOMMENDED)

Railway handles Express apps perfectly with zero configuration.

### Step 1: Create MySQL Database
1. Go to your Railway project
2. Click "New" → "Database" → "Add MySQL"
3. Copy the `DATABASE_URL` from the MySQL service

### Step 2: Configure Your App
1. Add these environment variables to your app service:
   \`\`\`
   DATABASE_URL=<paste from MySQL service>
   JWT_SECRET=<generate with: openssl rand -base64 32>
   NODE_ENV=production
   \`\`\`

### Step 3: Deploy
1. Connect your GitHub repository
2. Railway will automatically:
   - Detect the build configuration from `railway.toml`
   - Run `pnpm build`
   - Start with `pnpm start`

### Step 4: Run Database Migrations
After first deployment, run this command in Railway's terminal:
\`\`\`bash
pnpm db:push
\`\`\`

---

## ▲ Vercel Deployment

Vercel works but requires more configuration since it's optimized for Next.js.

### Step 1: Database Setup
Use one of these:
- **PlanetScale** (recommended for Vercel)
- **Neon** (Postgres alternative)
- **Railway MySQL** (connect externally)

### Step 2: Environment Variables
Add to your Vercel project:
\`\`\`
DATABASE_URL=<your database connection string>
JWT_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
\`\`\`

### Step 3: Build Settings
- **Framework Preset**: Other
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install`

### Step 4: Deploy
Push to GitHub and Vercel will auto-deploy.

### Step 5: Run Migrations
After deployment, run in Vercel CLI or add to build:
\`\`\`bash
pnpm db:push
\`\`\`

---

## 🔧 Local Development

### 1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

### 2. Create `.env` file:
\`\`\`env
DATABASE_URL=mysql://user:password@localhost:3306/portfolio
JWT_SECRET=your-secret-key-here
NODE_ENV=development
\`\`\`

### 3. Run database migrations:
\`\`\`bash
pnpm db:push
\`\`\`

### 4. Start development server:
\`\`\`bash
pnpm dev
\`\`\`

Server runs on `http://localhost:3000`

---

## 🔐 Create Admin Account

After deployment, you need to create an admin account to access the dashboard.

### Option 1: Direct Database Insert
Run this SQL in your database:
\`\`\`sql
INSERT INTO adminCredentials (id, email, passwordHash, name)
VALUES (
  UUID(),
  'your-email@example.com',
  SHA2('your-password', 256),
  'Your Name'
);
\`\`\`

### Option 2: Use the auth.ts functions
Create a script file `scripts/create-admin.ts`:
\`\`\`typescript
import { upsertAdminCredential } from '../server/auth';

await upsertAdminCredential(
  'your-email@example.com',
  'your-password',
  'Your Name'
);

console.log('Admin created successfully!');
\`\`\`

Then run: `tsx scripts/create-admin.ts`

---

## 🐛 Troubleshooting

### "Database not available" error
- Check that `DATABASE_URL` environment variable is set correctly
- Verify database is accessible from your deployment platform
- Run `pnpm db:push` to create tables

### "Invalid email or password" on admin login
- Make sure you created an admin account (see above)
- Password is hashed with SHA-256

### Build fails on Railway/Vercel
- Check that all dependencies are in `package.json`
- Verify `pnpm` version matches `packageManager` field
- Check build logs for specific errors

### CRUD operations not working
- Verify you're logged in as admin
- Check browser console for tRPC errors
- Ensure database tables exist (run `pnpm db:push`)

---

## 📝 Notes

- **Security**: Posts CRUD now requires admin authentication
- **Database**: Uses Drizzle ORM with MySQL
- **API**: tRPC for type-safe API calls
- **Frontend**: React + Vite + TailwindCSS
- **Routing**: Wouter for client-side routing

Your portfolio is production-ready! 🎉
