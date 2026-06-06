# SkillUp LMS Portal

A role-based Learning Management System for a training institute — with Admin, Trainer, and Student dashboards, public course enquiry, email notifications, WhatsApp redirect, and embedded Jitsi live classes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with demo data
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `MAIL_USERNAME` (optional), `MAIL_PASSWORD` (optional)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Email: Nodemailer (Gmail)
- Auth: Session-based (bcryptjs password hashing)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, courses, enrollments, enquiries, live-classes)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, courses, enrollments, enquiries, live-classes, dashboard)
- `artifacts/skillup/src/` — React frontend (pages for all 3 roles + public)
- `attached_assets/skill_up_logo_1780416699830.png` — SkillUp logo (imported via `@assets/` alias)

## Architecture decisions

- Session-based auth (express-session + bcryptjs) — simple, works without JWTs
- Enquiry email is non-blocking (fire-and-forget) so the WhatsApp redirect happens immediately
- WhatsApp redirect URL is returned from the API (not hardcoded in frontend) for flexibility
- Jitsi Meet embedded via iframe modal with room name from database
- MAIL_USERNAME/MAIL_PASSWORD are optional — email is silently skipped if not set

## Product

- **Public**: Landing page, course enquiry form (sends email + redirects to WhatsApp)
- **Admin**: Dashboard stats, user management, course management, enrollment management, enquiry inbox, live class management
- **Trainer**: Course overview, student roster, live class management
- **Student**: Browse/enroll in courses, my courses, join live classes

## Demo credentials

- Admin: `admin@skillup.com` / `admin123`
- Trainer: `murali@skillup.com` / `trainer123`
- Student: `arjun@skillup.com` / `student123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` after schema changes to rebuild db/api-zod before typechecking the api-server
- bcryptjs is used (not bcrypt) — pure JS, no native build step needed
- MAIL_USERNAME/MAIL_PASSWORD must be Gmail app passwords (not regular passwords) when using Gmail

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
