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

## Deploy to Vercel

1. **Connect the repo**  
   Go to [vercel.com](https://vercel.com) → New Project → Import your Git repository.

2. **Configure build**  
   - **Build Command:** `npm run build:vercel` (already set in `vercel.json`)  
   - **Output Directory:** `public`  
   - **Install Command:** `npm install`  
   - **Start Command:** leave **empty**. Do not set `npm start` — Vercel runs the root `index.ts` Express app as a serverless function. Using a start command will start a container and is for Railway, not Vercel.

3. **Environment variables**  
   In the Vercel project → Settings → Environment Variables, add:
   - `VITE_API_URL` — Backend API base URL (e.g. `https://voiceos-production.up.railway.app` if the API runs on Railway). Omit or leave empty if the frontend is served from the same origin as the API.
   - `DATABASE_URL` — PostgreSQL connection string (e.g. Neon)
   - `ULTRAVOX_API_KEY` — For voice sessions (if you use Ultravox)

4. **Database**  
   Ensure your PostgreSQL DB (e.g. Neon) is reachable from the internet and run migrations (e.g. `npm run db:push`) against the production DB before or after first deploy.

5. **Deploy**  
   Push to your main branch or click Deploy. The app will be served from the root; static assets come from `public/` and API routes from the Express app (root `index.ts`).
