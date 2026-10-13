# 0010. Semântica de ativa, cancelada e excluída em assinaturas

- **Status:** proposed
- **Related:** `src/server/actions/subscriptions/update.ts`, `delete.ts`, `prisma/schema.prisma` (`Subscription.active`)

## Context
`Subscription.active` pode ser alterado por update, e `delete.ts` remove a linha de fato (hard delete). Não está definido se "inativa" significa pausada ou cancelada, nem como isso afeta o planejamento mensal (`PlannedExpense` vinculada).

## Decision
A decidir. Pontos a fechar: significado de `active=false`; se cancelar é distinto de pausar; se excluir é permitido quando há despesas planejadas vinculadas; comportamento no mês corrente e nos futuros.

## Alternatives considered
- Apenas `active` (pausar/reativar) e hard delete.
- Adicionar um status explícito (ativa, pausada, cancelada) e soft delete.

## Consequences
- A definir ao aceitar.
