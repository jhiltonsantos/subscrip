# 0007. Estratégia de testes: Vitest com mocks globais de server actions

- **Status:** accepted
- **Related:** `vitest.config.mts`, `vitest.setup.ts`, `src/test-utils/`

## Context
O projeto precisa de testes rápidos para validações, slices Redux, formatadores e componentes, sem depender de banco nem de sessão.

## Decision
Vitest com ambiente `jsdom`; testes colocados ao lado do código (`src/**/*.{test,spec}.{ts,tsx}`). Os módulos `@/server/actions/{auth,subscriptions,finance-planner,payment-methods,user}` e `next/navigation` são mockados globalmente em `vitest.setup.ts`, não por teste. Componentes usam o render com providers de `src/test-utils`. Testes de server actions, quando existirem, usam Prisma mockado.

## Alternatives considered
- Mocks por arquivo de teste: mais repetição e comportamento divergente entre testes.
- Playwright E2E: desejável, fora do escopo atual.

## Consequences
- Positive: testes de unidade e componente rápidos e uniformes.
- Negative: mocks globais escondem o contrato real das actions; regras de multi-tenant não são cobertas por testes de integração.
