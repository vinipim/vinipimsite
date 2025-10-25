# Railway Deployment - FIXED

## What Was Wrong

**railway.toml** had wrong startCommand:
```toml
startCommand = "npx tsx src/server/index.ts"  # ❌ Wrong
```

Server needs to run compiled dist, not TypeScript.

## What Was Fixed

**railway.toml** line 5:
```toml
startCommand = "node dist/server/index.js"  # ✅ Correct
```

Matches `package.json` `"start": "node dist/server/index.js"`

## Deployment Chain

1. **Build**: `pnpm install --frozen-lockfile && pnpm build`
   - Vite compiles React → `dist/index.html`, `dist/assets/*`
   - esbuild compiles server → `dist/server/index.js`

2. **Start**: `node dist/server/index.js`
   - Serves static files from `dist/`
   - Express at `:3000`
   - Health check: `/health`

3. **Static Serving** (`src/server/index.ts`):
   ```js
   app.use(express.static(path.join(process.cwd(), 'dist')));
   app.get("/", (req, res) => res.sendFile('dist/index.html'));
   ```

## Status

✅ Build works  
✅ Types pass  
✅ dist/server/index.js builds  
✅ Ready to push to Railway
