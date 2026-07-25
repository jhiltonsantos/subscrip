# Subscrip — Schema e Diagramas

## Modelo de Dados (Visao)

```prisma
enum Currency { BRL, USD, EUR }
enum BillingCycle { MONTHLY, YEARLY, WEEKLY }
enum Category { INFRASTRUCTURE, ENTERTAINMENT, EDUCATION, TOOLS, FITNESS, OTHER }
enum ReminderChannel { EMAIL, PUSH, BOTH }
enum ExpenseBucket { MONTHLY_BILLS, CREDIT_CARD, FIXED_CARD, OTHER }
enum PaymentMethodType { CREDIT_CARD, DEBIT_CARD, PIX, BANK_TRANSFER, BOLETO, CASH, OTHER }
enum PlanEntryType { INCOME, EXPENSE }
enum PlanEntrySourceType { MANUAL, SUBSCRIPTION, CREDIT_CARD, OTHER }

model User {
  ... subscriptions[], reminders[]
  ... monthlyPlans[], paymentMethods[], paymentCards[]
}

model Subscription {
  ... userId -> User
  ... paymentMethodId? -> PaymentMethod
  ... reminders[], planEntries[]
}

model PaymentMethod {
  ... userId -> User
  ... paymentCard?, subscriptions[], expenses[], planEntries[]
}

model PaymentCard {
  ... userId -> User
  ... paymentMethodId (unique) -> PaymentMethod
  ... planEntries[]
}

model MonthlyPlan {
  ... userId -> User
  ... incomes[], expenses[], entries[]
}

model PlannedIncome { ... monthlyPlanId -> MonthlyPlan }
model PlannedExpense { ... monthlyPlanId -> MonthlyPlan, paymentMethodId? -> PaymentMethod }

model MonthlyPlanEntry {
  ... monthlyPlanId -> MonthlyPlan
  ... paymentMethodId? -> PaymentMethod
  ... paymentCardId? -> PaymentCard
  ... subscriptionId? -> Subscription
  ... sourceType/sourceId + occursOn para deduplicacao
}
```

> Referencia oficial de implementacao: `prisma/schema.prisma`.

---

## Fluxo de Agregacao Financeira

```mermaid
flowchart LR
  subgraph dataSources [FontesDeDados]
    Sub[Subscription]
    Inc[PlannedIncome]
    Exp[PlannedExpense]
    PM[PaymentMethod]
    PC[PaymentCard]
  end
  Entries[MonthlyPlanEntry]
  Calc[monthSummary]
  Dash[Dashboard]
  PlanPage[PlanPage]

  Sub --> Entries
  PM --> Entries
  PC --> Entries
  Exp --> Entries
  Entries --> Calc
  Inc --> Calc
  Calc --> Dash
  Entries --> PlanPage
  Inc --> PlanPage
```

## Diagrama de Caso de Uso

```mermaid
flowchart TB
  User[Usuario]
  UC1[GerenciarAssinaturas]
  UC2[PlanejarMes]
  UC3[RegistrarEntradas]
  UC4[RegistrarSaidas]
  UC5[VisualizarResumoMensal]
  UC6[VerProximaFatura]
  UC7[ReceberLembretes]
  UC8[GerenciarFormasPagamento]
  UC9[GerenciarCartoes]
  UC10[ConsolidarCobrancasDoMes]

  User --> UC1
  User --> UC2
  User --> UC3
  User --> UC4
  User --> UC5
  User --> UC6
  User --> UC7
  User --> UC8
  User --> UC9

  UC2 --> UC3
  UC2 --> UC4
  UC2 --> UC5
  UC2 --> UC10
  UC10 --> UC1
  UC10 --> UC8
  UC10 --> UC9
  UC1 --> UC6
  UC1 --> UC7
```
