# Railway Deployment Quick Start 🚂

This guide will help you deploy your Vinipim Portfolio site to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- MySQL database service on Railway
- GitHub repository connected to Railway

## Step 1: Create a Railway Project

1. Go to https://railway.app and create a new project
2. Choose "Deploy from GitHub repo" and select your repository

## Step 2: Add MySQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "MySQL"
3. Railway will automatically provision a MySQL database

## Step 3: Configure Environment Variables

Add these environment variables to your Railway service:

### Required Variables:

```
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:port/database
PORT=3000
```

### Optional Admin Credentials (recommended):

```
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Your Name
```

**Note:** Railway automatically provides `DATABASE_URL` when you add a MySQL database. Just reference it using the variable reference syntax: `${{MySQL.DATABASE_URL}}`

## Step 4: Configure Build & Deploy

Railway should automatically detect the configuration from `nixpacks.json` and `railway.toml`.

### Verify these settings in Railway dashboard:

- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Health Check Path**: `/health`

## Step 5: Deploy

1. Push your code to GitHub
2. Railway will automatically build and deploy
3. Monitor the deployment logs for any issues

## Step 6: Setup Database (First Deploy)

After first deployment, you need to initialize the database:

### Option A: Using Railway CLI

```bash
railway run pnpm db:setup
railway run pnpm create:admin
```

### Option B: Using Railway Dashboard

1. Go to your service settings
2. Open the "Deploy" logs
3. Wait for first deployment to complete
4. Use the Railway console to run:
   ```bash
   pnpm db:setup
   pnpm create:admin
   ```

## Step 7: Verify Deployment

1. Open your Railway service URL
2. Check the health endpoint: `https://your-app.railway.app/health`
3. You should see:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ",
     "environment": "production"
   }
   ```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **Check DATABASE_URL**: Make sure it's properly set with Railway's variable reference
2. **Check MySQL Service**: Ensure the MySQL service is running
3. **Network Issues**: Check Railway's status page
4. **Logs**: Review deployment logs for specific error messages

### Build Failures

Common issues:

- **Out of Memory**: Upgrade your Railway plan
- **Missing Dependencies**: Check `package.json` and `pnpm-lock.yaml`
- **TypeScript Errors**: Run `pnpm check` locally first

### Health Check Failing

1. Check if the server is starting correctly in logs
2. Verify PORT environment variable is set
3. Make sure `/health` endpoint returns 200 status
4. Check database connectivity

## Post-Deployment

### Change Admin Password

1. Login with the credentials from environment variables
2. Navigate to admin settings
3. Update your password immediately

### Setup Custom Domain (Optional)

1. Go to Railway project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

Railway provides built-in monitoring:

- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History and rollback options

## Useful Commands

```bash
# View logs
railway logs

# Run database setup
railway run pnpm db:setup

# Create admin user
railway run pnpm create:admin

# Open project in browser
railway open

# Connect to database
railway connect MySQL
```

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository's issues page

## Environment Variables Reference

| Variable         | Required | Description             | Default              |
| ---------------- | -------- | ----------------------- | -------------------- |
| `NODE_ENV`       | Yes      | Environment mode        | `production`         |
| `DATABASE_URL`   | Yes      | MySQL connection string | -                    |
| `PORT`           | No       | Server port             | `3000`               |
| `HOST`           | No       | Server host             | `0.0.0.0`            |
| `ADMIN_EMAIL`    | No       | Initial admin email     | `admin@example.com`  |
| `ADMIN_PASSWORD` | No       | Initial admin password  | `SecurePassword123!` |
| `ADMIN_NAME`     | No       | Initial admin name      | `Admin User`         |

---

**Important Security Notes:**

- Always use strong passwords
- Change default admin credentials after first login
- Keep your environment variables secure
- Don't commit `.env` files to git
- Use Railway's secrets for sensitive data
