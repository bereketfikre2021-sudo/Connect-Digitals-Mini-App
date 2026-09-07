<<<<<<< HEAD
# Connect Digitals — Telegram Mini App

Customer-facing Telegram Mini App for the Connect Digitals Promotion Platform.

## Stack

- React 18, TypeScript, Vite
- React Router v6, TanStack Query v5
- Zustand (auth state)
- Telegram Web App SDK (`@twa-dev/sdk`)
- Deploys to **Netlify** (static SPA)

## Setup

```bash
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm install
npm run dev
```

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://your-api.onrender.com/api/v1` |

## Deploy to Netlify

1. Push this repo to GitHub
2. New site → Import from GitHub → select this repo
3. Build settings are auto-detected from `netlify.toml`
4. Add `VITE_API_URL` environment variable in Netlify → Site settings → Environment variables
5. Deploy

### Netlify build settings (already in `netlify.toml`)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

## After deployment

1. Copy the Netlify URL (e.g. `https://connect-digitals.netlify.app`)
2. In @BotFather → Edit Bot → Edit Menu Button → set URL to your Netlify URL
3. Set `VITE_API_URL` in Netlify env vars to your backend URL
4. Redeploy

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | TypeScript check only |
=======
# Connect-Digitals-Mini-App
>>>>>>> b26ffb382eef29430dd2ff2b6abc2424fd879cda
