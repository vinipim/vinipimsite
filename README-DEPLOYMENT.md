# Railway Deployment Guide for Vinipim Portfolio

This guide provides step-by-step instructions for deploying your Vinipim Portfolio to Railway.

## Prerequisites

- A [Railway](https://railway.app/) account
- A GitHub account with this repository pushed to it

## Step 1: Create a Railway Project

1. Sign up or log in to [Railway](https://railway.app/)
2. Click "New Project" on your dashboard
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select this repository from the list

## Step 2: Add a MySQL Database

1. In your Railway project, click "New" → "Database" → "Add MySQL"
2. Wait for the database to be provisioned
3. Click on the MySQL service
4. Go to the "Connect" tab
5. Copy the "MySQL Connection URL" - you'll need this in the next step

## Step 3: Configure Environment Variables

1. Click on your main service (not the MySQL service)
2. Go to the "Variables" tab
3. Add the following environment variables:
   ```
   DATABASE_URL=<paste the MySQL Connection URL from step 2>
   JWT_SECRET=<generate with: openssl rand -base64 32 or use a secure random string>
   NODE_ENV=production
   ```

## Step 4: Deploy Your Application

1. Railway will automatically detect your railway.toml and nixpacks.json configuration
2. It will build and deploy your application
3. Wait for the deployment to complete

## Step 5: Run Database Migrations

1. After deployment, go to your main service
2. Click on the "Shell" tab
3. Run the following command to create the database tables:
   ```bash
   pnpm db:push
   ```

## Step 6: Create Admin Account

1. In the Railway shell, run:
   ```bash
   cd scripts
   tsx create-admin.ts
   ```
2. This will create an admin account with the credentials specified in the script:
   - Email: admin@example.com
   - Password: SecurePassword123!
   - (You can edit scripts/create-admin.ts to change these values before running)

## Step 7: Access Your Application

1. Go to the "Settings" tab of your main service
2. Find the "Domains" section
3. Click on the generated domain to access your application
4. Navigate to `/admin-login` to log in with your admin credentials

## Troubleshooting

### Database Connection Issues

- Verify that the DATABASE_URL environment variable is correctly set
- Make sure the MySQL service is running
- Try running `pnpm db:push` again

### Admin Login Issues

- If you can't log in, try creating a new admin account:
  ```bash
  tsx scripts/create-admin.ts
  ```
- Or directly insert into the database using SQL:
  ```sql
  INSERT INTO adminCredentials (id, email, passwordHash, name)
  VALUES (
    UUID(),
    'your-email@example.com',
    SHA2('your-password', 256),
    'Your Name'
  );
  ```

### Deployment Failures

- Check the build logs for specific errors
- Verify that all dependencies are in package.json
- Make sure the environment variables are correctly set

## Updating Your Application

To update your application after making changes:

1. Push your changes to GitHub
2. Railway will automatically redeploy your application
3. No additional steps are needed unless you've made database schema changes
4. If you've changed the database schema, run `pnpm db:push` again after deployment
