# Railway Deployment Guide

## Required Environment Variables

Add these in your Railway project settings:

### Database (Required)
- `DATABASE_URL` - Your MySQL connection string (format: `mysql://user:password@host:port/database`)

### Authentication (Required)
- `JWT_SECRET` - Any random secure string (generate with: `openssl rand -base64 32`)

### OAuth (If using OAuth features)
- `OAUTH_SERVER_URL` - Your OAuth server URL
- `BUILT_IN_FORGE_API_KEY` - Your API key
- `BUILT_IN_FORGE_API_URL` - Your API URL

### AWS S3 (If using file uploads)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Deployment Steps

1. **Connect your GitHub repo to Railway**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `vinipim/portfolio` repository

2. **Add environment variables**
   - Go to your project → Variables tab
   - Add all required variables listed above

3. **Set up MySQL database**
   - In Railway, click "New" → "Database" → "Add MySQL"
   - Copy the `DATABASE_URL` from the MySQL service
   - Add it to your app's environment variables

4. **Deploy**
   - Railway will automatically build and deploy
   - Check logs if there are any errors

## Common Issues

### Build fails with "Cannot find module"
- Make sure `pnpm` is being used (check railway.toml)
- Verify all dependencies are in package.json

### Database connection errors
- Verify DATABASE_URL is correct
- Make sure MySQL service is running
- Run migrations: `pnpm db:push` (you may need to do this manually first)

### Port binding errors
- Railway automatically sets PORT env var
- Your app already handles this in server/_core/index.ts

### App crashes on startup
- Check Railway logs for specific error
- Verify all required env vars are set
- Make sure database is accessible
