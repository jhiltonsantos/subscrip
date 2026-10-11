# 0006. Planejamento mensal modelado com PlannedIncome e PlannedExpense

- **Status:** accepted
- **Related:** `prisma/schema.prisma`, `src/server/actions/finance-planner/`

## Context
O planejamento financeiro mensal precisa representar entradas, saídas, vínculo com assinaturas, métodos/cartões, faturas e parcelamentos.

## Decision
Cada mês é um `MonthlyPlan` (por usuário) com `PlannedIncome` e `PlannedExpense`. Despesas podem referenciar `Subscription`, `PaymentMethod`, `PaymentCard`, `CreditCardInvoice` e `InstallmentPurchase`. A assinatura continua sendo a fonte oficial da cobrança; a sincronização com despesas planejadas fica em `actions/subscriptions/expense-sync.ts`. Não existe `MonthlyPlanEntry`.

## Alternatives considered
- Tabela única de lançamentos (`MonthlyPlanEntry`) com tipo e origem: descrita em documentação antiga, nunca adotada no schema.

## Consequences
- Positive: modelo explícito por tipo, com relações tipadas.
- Negative: duas tabelas com campos parecidos; mudanças de regra precisam tocar ambas.
