# TGN Surf School

Next.js 16 surf school booking app, migrated from Vercel/Supabase to Replit.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Replit PostgreSQL via `pg` Pool (`src/lib/db.ts`)
- **Auth**: iron-session with bcryptjs (`src/lib/session.ts`)
- **Payments**: Stripe (checkout sessions + webhook)
- **Port**: 5000 (0.0.0.0)

## Database Schema

7 tables in Replit PostgreSQL:
- `users` — email, hashed password, role (STUDENT/INSTRUCTOR/ADMIN), surf_level, email verification token
- `classes` — scheduled surf lessons with date/time/level/capacity
- `bookings` — student class reservations with status
- `services` — surf class types/programs
- `user_passes` — student class bundles (BONO_1/5/10)
- `notifications` — in-app notification records
- `class_instructors` — class ↔ instructor assignments

## Auth Flow

1. Registration: bcryptjs hash → store user → send email verification link
2. Login: bcryptjs compare → iron-session cookie (`tgn_session`)
3. Session shape: `{ id, email, name, role, emailVerified }`
4. Middleware: reads session cookie → RBAC redirect for /admin, /instructor, /area-privada

## Key Files

- `src/lib/db.ts` — PostgreSQL pool
- `src/lib/session.ts` — iron-session helpers (getUser, getSession, setSession)
- `src/middleware.ts` — RBAC middleware
- `src/lib/notifications.ts` — notification helpers
- `src/app/auth/` — login, registro, callback, signOut actions
- `src/app/admin/actions.ts` — admin CRUD
- `src/app/reservas/actions.ts` — booking actions
- `src/app/area-privada/` — student dashboard (clases, mis-reservas, perfil, progreso, bonos, documentos)
- `src/app/instructor/` — instructor dashboard
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook

## Environment Variables

- `DATABASE_URL` — Replit PostgreSQL (auto-set)
- `SESSION_SECRET` — iron-session encryption key (32+ chars)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXT_PUBLIC_BASE_URL` — public app URL for redirect links
- `RESEND_API_KEY` — email service for verification emails

## Supabase Removal

Supabase has been fully removed. Stubs remain in:
- `src/lib/supabase.ts` — exports `null as any` for compatibility
- `src/utils/supabase/server.ts` — re-exports from `@/lib/session`
- `src/utils/supabase/client.ts` — empty stub

The npm packages `@supabase/ssr` and `@supabase/supabase-js` are still in package.json but unused.
