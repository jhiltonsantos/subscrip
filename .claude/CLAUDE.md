# Claude Code Instructions — Subscrip

Use `.agents` as the shared source of truth:

1. Read `.agents/project-context.md` for product and stack context.
2. Read `.agents/engineering-standards.md` before code changes.
3. Read `.agents/v1-scope.md` before expanding product scope.
4. Read `.agents/agent-playbook.md` for workflow and validation.

## Project Priorities

- Keep v1 focused on reliable auth, subscriptions, finance planner, dashboard, settings, setup and quality gates.
- Treat `prisma/schema.prisma` as the persisted data source of truth.
- Enforce multi-tenant boundaries with session-derived `userId`.
- Preserve i18n and dark/light mode behavior.
- Avoid editing local `.env` files or exposing secrets.

## Validation

Prefer targeted checks while iterating:

- `pnpm exec eslint <files>`
- `pnpm exec tsc --noEmit --pretty false --incremental false`
- JSON parse checks for translation files

See `.claude/commands/README.md` for common workflows.
