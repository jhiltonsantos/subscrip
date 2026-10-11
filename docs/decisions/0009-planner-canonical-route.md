# 0009. Rota canônica do planejamento: /finance-planner ou /plan

- **Status:** proposed
- **Related:** `src/app/(platform)/finance-planner/`, `src/app/(platform)/plan/page.tsx`

## Context
Duas rotas coexistem: `/finance-planner` é a implementação e `/plan` é um alias que redireciona para ela via `localizedRedirect`. Documentos antigos usavam nomes diferentes.

## Decision
A decidir. Proposta: manter `/finance-planner` como rota canônica e `/plan` apenas como alias de compatibilidade, ou remover o alias.

## Alternatives considered
- Migrar tudo para `/plan`: URL mais curta, mas exige mudar links, traduções e testes.
- Manter os dois como está.

## Consequences
- A definir ao aceitar.
