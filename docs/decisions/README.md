# Architecture Decision Records

Decisions that are costly to reverse. Flow and rules: skill `subscrip-sdd`. Use `/adr <title>` or the `adr-writer` subagent.

- Numbers are sequential 4 digits, never reused; file names kebab-case.
- Accepted ADRs are not rewritten. To change a decision, add a new ADR and mark the old one `superseded by NNNN`.
- Template: `0000-template.md`.

| # | Title | Status |
|---|---|---|
| [0001](0001-proxy-instead-of-middleware.md) | Proxy instead of middleware for auth and i18n | accepted |
| [0002](0002-email-otp-only-auth.md) | Better Auth with email OTP only | accepted |
| [0003](0003-server-actions-data-layer.md) | Server actions as the data layer, userId from session | accepted |
| [0004](0004-redux-seeded-from-rsc-props.md) | Redux seeded from RSC props | accepted |
| [0005](0005-reminders-deferred-to-v1-1.md) | Lembretes e notificações automáticas ficam para a v1.1 | accepted |
| [0006](0006-planned-income-expense-model.md) | Planejamento mensal com PlannedIncome e PlannedExpense | accepted |
| [0007](0007-test-strategy.md) | Estratégia de testes: Vitest com mocks globais | accepted |
| [0008](0008-ci-without-build.md) | CI roda lint, testes e typecheck; o build é da Vercel | accepted |
| [0009](0009-planner-canonical-route.md) | Rota canônica do planejamento | proposed |
| [0010](0010-subscription-lifecycle-semantics.md) | Semântica de ativa, cancelada e excluída em assinaturas | proposed |
