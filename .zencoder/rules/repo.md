---
description: Repository Information Overview
alwaysApply: true
---

# Vinipim Portfolio Search Information

## Summary
A full-stack portfolio website built with Express, Vite, React, and tRPC. The application features a blog system, media management, and review capabilities for films, albums, and books. It's designed to be deployed on Railway or Vercel with a MySQL database.

## Structure
- **app/**: Next.js application files
- **client/**: React frontend application using Vite
- **components/**: Shared UI components using Radix UI
- **drizzle/**: Database schema and migration files
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and shared libraries
- **public/**: Static assets
- **server/**: Express backend with tRPC API endpoints
- **scripts/**: Database setup and admin creation scripts
- **styles/**: Global CSS styles

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5+
**Build System**: Vite 7.1.7 for client, esbuild for server
**Package Manager**: pnpm 10.4.1+

## Dependencies
**Main Dependencies**:
- React 19.1.1 with React DOM
- Express for server
- tRPC for type-safe API
- Drizzle ORM with MySQL
- TailwindCSS 4.1.9
- Radix UI components
- AWS SDK for S3 storage
- Next.js 16.0.0
- Zod 4.1.12 for validation

**Development Dependencies**:
- Vite 7.1.7
- TypeScript 5+
- Vitest 2.1.4 for testing
- Tailwind plugins
- esbuild 0.25.0
- Drizzle Kit 0.31.4

## Build & Installation
```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:setup

# Create admin user
pnpm create:admin

# Development
pnpm dev

# Build for production
pnpm build

# Database migrations
pnpm db:push

# Start production server
pnpm start
```

## Docker
**Configuration**: Uses Nixpacks for containerization with Node.js 20 and pnpm.
```json
{
  "phases": {
    "setup": {
      "nixPkgs": ["nodejs_20", "pnpm"]
    },
    "install": {
      "cmds": ["pnpm install --frozen-lockfile"]
    },
    "build": {
      "cmds": ["pnpm build"]
    }
  },
  "start": {
    "cmd": "pnpm start"
  }
}
```

## Database
**ORM**: Drizzle ORM
**Dialect**: MySQL
**Schema**: Includes tables for users, admin credentials, posts, reviews, and media
**Migration Command**: `pnpm db:push`
**Setup Command**: `pnpm db:setup`

## Testing
**Framework**: Vitest
**Run Command**:
```bash
pnpm test
```

## Deployment
**Recommended Platform**: Railway
**Alternative**: Vercel
**Environment Variables**:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `NODE_ENV=production`
- `AWS_S3_BUCKET`: S3 bucket for media storage
- `AWS_REGION`: AWS region for S3

**Railway Configuration**:
- Uses railway.toml for deployment configuration
- Automatic build and deployment with GitHub integration
- Health check endpoint at `/health`

**Vercel Configuration**:
- Custom build settings in vercel.json
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Node.js 20.x runtime