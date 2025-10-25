#!/bin/bash

# Railway setup script - runs on deploy
echo "🚂 Starting Railway deployment setup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Setup database tables
echo "📊 Setting up database tables..."
pnpm db:setup

# Create admin account (will use env vars if available)
echo "👤 Creating admin account..."
pnpm create:admin

echo "✅ Railway setup complete!"
