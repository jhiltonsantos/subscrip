# Claude Commands — Subscrip

These are safe reference workflows for Claude Code or any local coding agent.

## Inspect Project State

```bash
git status --short
pnpm exec prisma migrate status
```

## Validate Code Changes

```bash
pnpm exec eslint <changed-files>
pnpm exec tsc --noEmit --pretty false --incremental false
```

## Validate Translations

```bash
node -e "JSON.parse(require('fs').readFileSync('src/translations/client/en.json','utf8')); JSON.parse(require('fs').readFileSync('src/translations/client/pt.json','utf8'));"
```

## Local Database

```bash
pnpm docker:up
pnpm db:migrate
pnpm db:seed
```

Use `pnpm db:setup` only when you intentionally want to run `migrate deploy` and the dev seed. The seed is local/dev oriented and may delete sample data.

## V1 Planning References

```text
docs/v1-readiness-audit.md
docs/v1-closure-plan.md
.agents/v1-scope.md
```

## Safety Notes

- Do not edit `.env` files.
- Do not run destructive git commands unless explicitly requested.
- Do not run destructive database resets without explicit confirmation.
