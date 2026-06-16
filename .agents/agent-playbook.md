# Subscrip — Agent Playbook

## Before Changing Code

1. Read the relevant docs under `docs/`, especially `docs/v1-readiness-audit.md` and `docs/v1-closure-plan.md`.
2. Inspect the existing implementation in `src/app`, `src/components`, `src/server/actions` and `prisma/schema.prisma`.
3. Check whether the task affects user-owned data and identify the required `userId` boundary.
4. Prefer current local patterns over new dependencies.

## During Implementation

- Keep changes small and targeted.
- Do not edit `.env` or commit secrets.
- Do not use destructive database or git commands unless explicitly requested.
- For schema changes, use Prisma migrations.
- For UI, preserve i18n and dark/light mode.
- For Server Actions, validate input and return structured results.

## Validation

Use the narrowest useful validation first:

- Edited TS/TSX files: `pnpm exec eslint <files>`.
- Type safety: `pnpm exec tsc --noEmit --pretty false --incremental false`.
- JSON translations: parse with Node before finishing.
- App behavior: check protected route redirects and, when possible, test in the browser.

## Reporting

Summaries should state:

- What changed.
- What was validated.
- Any remaining risks or manual checks.

Do not claim production readiness without checking migrations, env vars, auth, seed, and deployment configuration.
