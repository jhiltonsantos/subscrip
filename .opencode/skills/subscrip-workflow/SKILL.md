---
name: subscrip-workflow
description: Use when validating changes, checking project state, or preparing to commit. Covers the agent workflow: what to read before coding, how to validate, and how to report.
---

# Subscrip — Agent Workflow & Validation

## Before Changing Code

1. Read the relevant docs under `docs/`, especially `docs/roadmap/v1-readiness-audit.md` and `docs/roadmap/v1-closure-plan.md`
2. Inspect existing implementation in `src/app`, `src/components`, `src/server/actions`, and `prisma/schema.prisma`
3. Check whether the task affects user-owned data and identify the required `userId` boundary
4. Prefer current local patterns over new dependencies

## During Implementation

- Keep changes small and targeted
- Do not edit `.env` or commit secrets
- Do not use destructive database or git commands unless explicitly requested
- For schema changes, use Prisma migrations
- For UI, preserve i18n and dark/light mode
- For Server Actions, validate input and return structured results

## Validation (narrowest useful check first)

- Edited TS/TSX files: `pnpm exec eslint <files>`
- Type safety: `pnpm exec tsc --noEmit --pretty false --incremental false`
- Full gate: `pnpm check` (lint + typecheck + test)
- JSON translations: `node -e "JSON.parse(require('fs').readFileSync('src/translations/client/en.json','utf8')); JSON.parse(require('fs').readFileSync('src/translations/client/pt.json','utf8'));"`
- Database state: `pnpm exec prisma migrate status`
- App behavior: check protected route redirects and, when possible, test in the browser

## Reporting

Summaries should state:
- What changed
- What was validated
- Any remaining risks or manual checks

Do not claim production readiness without checking migrations, env vars, auth, seed, and deployment configuration.
