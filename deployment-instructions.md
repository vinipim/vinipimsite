# Fix Your Portfolio Deployment on Vercel

## Problem
Your portfolio is an Express + Vite full-stack app, but Vercel is trying to deploy it as Next.js.

## Solution

### Step 1: Add vercel.json to your GitHub repo
Copy the `vercel.json` file I created above to the root of your GitHub repository.

### Step 2: Update package.json scripts
In your GitHub repo's package.json, add this script:

\`\`\`json
"scripts": {
  "vercel-build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
}
\`\`\`

### Step 3: Configure Vercel Environment Variables
In your Vercel project dashboard, go to Settings → Environment Variables and add:

- DATABASE_URL (your PlanetScale connection string)
- JWT_SECRET (any random secure string)
- BUILT_IN_FORGE_API_KEY=auto
- BUILT_IN_FORGE_API_URL=https://api.manus.im
- OAUTH_SERVER_URL=https://api.manus.im

### Step 4: Update Vercel Build Settings
In Vercel project Settings → General:

- Framework Preset: Other
- Build Command: pnpm vercel-build
- Output Directory: dist/public
- Install Command: pnpm install

### Step 5: Redeploy
Push these changes to GitHub and Vercel will automatically redeploy.

## Alternative: Use Railway or Render
Since your app uses Express with a custom server, it might be easier to deploy on:
- Railway.app (supports Express apps natively)
- Render.com (free tier for full-stack apps)

Both platforms work better with Express + Vite setups out of the box.
