# PushForward (The System)

A gamified habit tracker with AI-powered difficulty ratings, daily challenges, weekly insights, and an in-app assistant.

## Tech Stack

- Frontend: React + Vite + TypeScript, Tailwind, shadcn/ui (Radix), TanStack Query, Framer Motion
- Backend: Express + TypeScript (ESM)
- DB: Postgres + Drizzle ORM
- AI: Google Gemini (`@google/genai`)

## Key Features

- Habit tracking with tags (`STR/AGI/INT/VIT/PER`), streaks, achievements, tiers, and per-habit levels
- Skill points:
  - Habit completion adds skill points per assigned tag based on difficulty stars (1→0.2, 2→0.6, 3→1.0, 4→1.4, 5→2.0)
  - Habit level-up adds `+1` point per assigned tag
- Daily challenges with XP and completion toggles
- AI difficulty analysis (1–5 stars) with stored results on the habit
- Personalization profile (stored in DB) used to tailor AI outputs

## Project Layout

- `client/` – React app
- `server/` – Express API
- `shared/` – shared types/schema (Drizzle + Zod)
- `drizzle.config.ts` – Drizzle config

## Setup

### Requirements

- Node.js 20+
- PostgreSQL

### Environment Variables

Minimum required:

- `DATABASE_URL` – Postgres connection string

Optional (enables AI):

- `GEMINI_API_KEY`

Auth (Replit Auth):

- `REPLIT_DOMAINS`
- `REPL_ID`
- `SESSION_SECRET` (recommended)
- `ISSUER_URL` (defaults to `https://replit.com/oidc`)

Note: if Replit Auth vars are not configured, the server falls back to a mock authenticated user for development, but `DATABASE_URL` is still required.

## Scripts

- `npm run dev` – run the server in development
- `npm run build` – build client + server into `dist/`
- `npm run start` – run the production build
- `npm run check` – TypeScript typecheck
- `npm run db:push` – push schema to Postgres (Drizzle Kit)

## Personalization Profile

Users can set a “Personalization Profile” in Settings → Personalization.
It is stored as a row in the `settings` table under the key `personalizationProfile`, and is used to tailor:

- habit difficulty analysis
- daily challenges
- weekly insights
- assistant replies

## UI Notes

- For scrollable panels where a custom scrollbar is desired, apply the `settings-scroll` class.
