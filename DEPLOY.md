# Railway Deployment Guide

## Quick Deploy (recommended)
- `railway login`
- `pnpm run deploy`

The deploy script installs the Railway CLI if needed, checks your login, links the `vinipimsite` project, runs the production build, and triggers the deploy. You can also run it with `npm run deploy` if you prefer npm.

## Troubleshooting Helper
- `pnpm run fix:railway`

This helper checks for the CLI, verifies the link, validates `railway.toml`, and reruns the build so you can fix common issues before deploying again.

## Manual Deploy (fallback)
1. `pnpm run build`
2. `railway deploy`
3. `railway status` and `railway logs` if you need to inspect the rollout

## Useful Scripts
- `pnpm run build:server` – compile the API layer only
- `pnpm run predeploy:railway` – fast validation before shipping
- `pnpm run verify-deploy` – end-to-end build and smoke test

## Final Checklist
- Railway dashboard shows the service as `Deployed`
- Live URL responds on `/health`
- Frontend is reachable
- API responds under `/api/trpc`

If something fails, grab the logs straight from Railway; the deploy script prints any command that needs manual follow-up.
