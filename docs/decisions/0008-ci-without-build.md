# 0008. CI roda lint, testes e typecheck; o build é da Vercel

- **Status:** accepted
- **Related:** `.github/workflows/ci.yml`

## Context
O deploy é feito pela Vercel via integração com o GitHub, que já executa o build.

## Decision
O workflow de CI (push e pull request para `staging` e `main`) roda `pnpm lint`, `pnpm test` e `pnpm typecheck` com `pnpm install --frozen-lockfile`. Não roda `next build` e não exige secrets. O build e o deploy ficam a cargo da Vercel (preview em `staging`, produção em `main`).

## Alternatives considered
- Rodar `next build` no CI: mais lento e exigiria variáveis de ambiente.

## Consequences
- Positive: feedback rápido, sem secrets.
- Negative: erros que só aparecem no build são detectados no deploy. O nome do job ("Lint, Test & Build") sugere o contrário e deve ser alinhado.
