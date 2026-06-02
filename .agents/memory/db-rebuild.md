---
name: DB lib rebuild needed
description: After adding new schema files to lib/db, must rebuild libs before api-server typecheck
---

Adding new files to lib/db/src/schema/ and re-exporting from index.ts is not enough.
The api-server imports from the compiled lib output. You must run `pnpm run typecheck:libs` (which runs `tsc --build`) to regenerate the .d.ts declarations before `pnpm --filter @workspace/api-server run typecheck` can see the new exports.

**Why:** lib/db is a composite TypeScript project — its declarations are emitted to dist/, not inferred at check-time from source. Leaf packages import the emitted types.
**How to apply:** Any time you add or rename a schema file in lib/db, run `pnpm run typecheck:libs` before typechecking any artifact.
