---
description: Inspect project state — shows git status and Prisma migration status.
---

Run project state inspection:

```bash
git status --short
pnpm exec prisma migrate status
```

Summarize the current state: what's changed, what's staged, and whether the database is in sync with migrations.
