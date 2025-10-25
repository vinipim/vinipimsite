# Railway Deployment Step-by-Step Guide with Screenshots

This guide provides detailed instructions with visual references for deploying your Vinipim Portfolio to Railway.

## Step 1: Create a Railway Account

1. Go to [Railway.app](https://railway.app/) and sign up for an account
2. Verify your email address

## Step 2: Create a New Project

1. From your Railway dashboard, click "New Project"
   
   ![New Project Button](https://i.imgur.com/example1.png)

2. Select "Deploy from GitHub repo"
   
   ![Deploy from GitHub](https://i.imgur.com/example2.png)

3. Connect your GitHub account if not already connected
   
   ![Connect GitHub](https://i.imgur.com/example3.png)

4. Select the Vinipimsite repository
   
   ![Select Repository](https://i.imgur.com/example4.png)

## Step 3: Add a MySQL Database

1. In your Railway project, click "New"
   
   ![New Button](https://i.imgur.com/example5.png)

2. Select "Database" → "Add MySQL"
   
   ![Add MySQL](https://i.imgur.com/example6.png)

3. Wait for the database to be provisioned
   
   ![Database Provisioning](https://i.imgur.com/example7.png)

4. Click on the MySQL service
   
   ![MySQL Service](https://i.imgur.com/example8.png)

5. Go to the "Connect" tab
   
   ![Connect Tab](https://i.imgur.com/example9.png)

6. Copy the "MySQL Connection URL"
   
   ![Connection URL](https://i.imgur.com/example10.png)

## Step 4: Configure Environment Variables

1. Click on your main service (not the MySQL service)
   
   ![Main Service](https://i.imgur.com/example11.png)

2. Go to the "Variables" tab
   
   ![Variables Tab](https://i.imgur.com/example12.png)

3. Add the following environment variables:
   
   ```
   DATABASE_URL=<paste the MySQL Connection URL from step 3>
   JWT_SECRET=<generate with: openssl rand -base64 32 or use a secure random string>
   NODE_ENV=production
   ```
   
   ![Add Variables](https://i.imgur.com/example13.png)

## Step 5: Deploy Your Application

1. Railway will automatically detect your railway.toml and nixpacks.json configuration
   
   ![Auto-detection](https://i.imgur.com/example14.png)

2. It will build and deploy your application
   
   ![Building](https://i.imgur.com/example15.png)

3. Wait for the deployment to complete
   
   ![Deployment Complete](https://i.imgur.com/example16.png)

## Step 6: Run Database Migrations (if needed)

1. After deployment, go to your main service
   
   ![Main Service](https://i.imgur.com/example17.png)

2. Click on the "Shell" tab
   
   ![Shell Tab](https://i.imgur.com/example18.png)

3. Run the following command to create the database tables:
   
   ```bash
   pnpm db:setup
   ```
   
   ![Run Migration](https://i.imgur.com/example19.png)

## Step 7: Create Admin Account

1. In the Railway shell, run:
   
   ```bash
   pnpm create:admin
   ```
   
   ![Create Admin](https://i.imgur.com/example20.png)

2. This will create an admin account with the credentials specified in the script:
   - Email: admin@example.com
   - Password: SecurePassword123!

## Step 8: Access Your Application

1. Go to the "Settings" tab of your main service
   
   ![Settings Tab](https://i.imgur.com/example21.png)

2. Find the "Domains" section
   
   ![Domains Section](https://i.imgur.com/example22.png)

3. Click on the generated domain to access your application
   
   ![Generated Domain](https://i.imgur.com/example23.png)

4. Navigate to `/admin-login` to log in with your admin credentials
   
   ![Admin Login](https://i.imgur.com/example24.png)

## Congratulations!

Your Vinipim Portfolio is now deployed on Railway! You can now start adding content through the admin dashboard.

## Troubleshooting

If you encounter any issues during deployment, refer to the README-DEPLOYMENT.md file for troubleshooting tips.