# Basethesis VoiceOS

A cinematic, Hollywood-grade AI Operating System SaaS web application for AI Intent Capture and Voice Agent Generation.

## Overview

VoiceOS is a full production-style SaaS platform that feels like a futuristic AI command center from a sci-fi film. It features:

- **Authentication**: Email + Mobile number login/signup (POC mode, no OTP)
- **Live Dashboard**: Real-time analytics with 3D holographic UI, waveform visualizer, charts, heatmaps
- **Agent Builder**: AI-powered intent capture that generates voice-agent-ready system prompts
- **Voice Session Control**: Start/End calls with 10-minute session cap per phone number
- **Admin Panel**: Full system oversight with CSV export

## Architecture

### Frontend (React + Vite)
- `client/src/App.tsx` — Root component with auth state, SidebarProvider, and layout
- `client/src/pages/auth.tsx` — Login/Signup page with 3D Three.js background
- `client/src/pages/dashboard.tsx` — Live Command Center with real-time analytics
- `client/src/pages/agent-builder.tsx` — AI Agent Synthesis Lab
- `client/src/pages/voice-session.tsx` — Voice Session Control with timer and waveform
- `client/src/pages/admin.tsx` — Admin Control Matrix with CSV export
- `client/src/components/three-background.tsx` — Three.js 3D holographic background
- `client/src/components/ai-cursor.tsx` — Custom AI cursor with particle trail
- `client/src/components/waveform-visualizer.tsx` — Audio waveform visualizer
- `client/src/components/app-sidebar.tsx` — Navigation sidebar with system status

### Backend (Express + PostgreSQL)
- `server/index.ts` — Express server setup
- `server/routes.ts` — All API endpoints + AI intent processing logic
- `server/storage.ts` — Database storage layer using Drizzle ORM
- `server/db.ts` — PostgreSQL connection via drizzle-orm/node-postgres
- `shared/schema.ts` — Database schema: users, agents, voice_sessions, intent_logs

### Key Features
- Three.js 3D holographic grid floor, particle fog, neural network lines, ambient orbs
- Custom AI cursor with energy core, outer ring, and particle trail
- Audio waveform visualization using Web Audio API
- Framer Motion page transitions with cinematic fade+zoom effects
- Glassmorphism, neon glow effects, metallic gradients
- Holographic card hover effects with perspective tilt
- Real-time session timer with 10-minute cap enforcement
- AI intent processing with domain detection for 6 categories:
  - Financial Services / Debt Recovery
  - Insurance Services
  - Law Enforcement Assistance
  - Education Finance
  - Telecommunications
  - General Customer Service

### Design System
- Primary color: `#00d4ff` (Neon Cyan)
- Accent color: `#8b5cf6` (Neon Purple)
- Font: Oxanium (sci-fi sans-serif)
- Mono font: JetBrains Mono
- Pure dark theme with deep navy backgrounds
- Glassmorphism panels with cyan border glow

## Database

PostgreSQL with the following tables:
- `users` — Authentication (email + mobile + country code)
- `agents` — AI voice agents with full prompt metadata
- `voice_sessions` — Call logs with duration and termination reason
- `intent_logs` — Captured intent records per user

## Seed Data

Pre-seeded with:
- 5 users (1 admin: admin@basethesis.ai, 4 operators)
- 5 AI agents across different domains
- 10 voice sessions
- 10 intent logs

## API Endpoints

- `POST /api/auth/login` — Login with email + mobile
- `POST /api/auth/signup` — Create account
- `GET /api/dashboard/stats` — Real-time dashboard data
- `GET /api/agents?userId=` — Get user's agents
- `POST /api/agents/generate` — Generate AI agent from intent
- `GET /api/sessions?userId=` — Get session history
- `POST /api/sessions/start` — Start voice session
- `POST /api/sessions/:id/end` — End voice session
- `GET /api/admin/stats` — Admin overview data
- `GET /api/admin/export` — CSV export

## Admin Access

Login with: `admin@basethesis.ai` (any mobile number, country code +91)
Regular user: `rajesh.kumar@example.com`

## Deploy: Vercel (frontend) + Railway (backend)

- **Vercel** serves the static frontend only (no serverless API).
- **Railway** runs the Express API. Set `VITE_API_URL` on Vercel to your Railway API URL so the frontend calls the right backend.

### 1. Deploy backend to Railway

1. Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo** and select this repo.
2. **Settings** (or **Variables**):
   - **Root Directory:** leave default (repo root).
   - **Build Command:** leave empty or `npm install`.
   - **Start Command:** `npm start` (runs `tsx server/index.ts`).
   - **Environment variables:** add:
     - `DATABASE_URL` — PostgreSQL connection string (e.g. Neon).
     - `ULTRAVOX_API_KEY` — If you use voice/Ultravox.
   - Railway sets `PORT` and `NODE_ENV=production` automatically. Do **not** set `VERCEL` (so the server listens).
3. Deploy. Copy the public URL (e.g. `https://your-app.up.railway.app`). This is your **API base URL**.
4. Run migrations against the same DB: `npm run db:push` (with `DATABASE_URL` in `.env` locally or in Railway).

### 2. Deploy frontend to Vercel

1. [vercel.com](https://vercel.com) → New Project → Import your Git repository.
2. **Build:** use `vercel.json` defaults: Build Command `npm run build:vercel`, Output Directory `public`. Leave **Start Command** empty.
3. **Environment variables** (Vercel project → Settings → Environment Variables):
   - `VITE_API_URL` — Your Railway API URL (e.g. `https://your-app.up.railway.app`). **Required** so the frontend calls the backend.
4. **Important:** Vite bakes `VITE_API_URL` into the bundle at **build time**. After adding or changing it, you **must redeploy** (e.g. `vercel --prod` or trigger a new deployment). Then hard-refresh the site (⌘+Shift+R / Ctrl+Shift+R) so the browser loads the new JS. Otherwise requests stay on the Vercel origin and `/api/*` returns 404.
5. Deploy. The site will be static; all API requests go to the URL in `VITE_API_URL`.

### 3. CORS

The Express app allows `Access-Control-Allow-Origin: *`. For production you can restrict this to your Vercel domain in `server/app.ts` if you prefer.

### 4. Login / "Connection Error" checklist

If INITIALIZE shows "Connection Error" or "Neural link disrupted":

1. **Vercel** — Settings → Environment Variables: `VITE_API_URL` = your Railway API URL (e.g. `https://your-app.up.railway.app`). No trailing slash. Save, then **redeploy** (Deployments → ⋮ → Redeploy). Hard-refresh the site (⌘+Shift+R).
2. **Railway** — Variables: `DATABASE_URL` set (e.g. Neon connection string). Service is running and the deploy succeeded.
3. **DB** — `npm run db:push` has been run against the same `DATABASE_URL` so the `users` table exists.
4. **Network** — In browser DevTools → Network, click INITIALIZE and check the request: URL should be `https://your-railway-url.up.railway.app/api/auth/signup`, not `voice-os-xi.vercel.app/api/...`. If it’s the Vercel URL, the build didn’t get `VITE_API_URL`; redeploy after setting the env.
