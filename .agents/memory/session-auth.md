---
name: Session auth pattern
description: How auth is implemented in SkillUp — express-session + bcryptjs, key config details
---

Use bcryptjs (not native bcrypt) — pure JS, no pnpm build approval needed.
SESSION_SECRET is required at app startup (throws if missing).
express-session is mounted in app.ts before routes.
Session cookie: httpOnly, secure in production, 7-day maxAge.
The `declare module "express-session"` SessionData augmentation lives in auth.ts.

**Why:** bcrypt v6 requires a native build script which pnpm blocks by default with a warning. bcryptjs is identical API, no build step.
**How to apply:** Any time auth is needed in this project, use bcryptjs. Never switch to native bcrypt without running `pnpm approve-builds`.
