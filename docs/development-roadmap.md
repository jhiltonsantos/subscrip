# Subscrip — Planejamento de Desenvolvimento

## Roadmap de Desenvolvimento

Cada etapa contem tarefas e status de execucao.

### FASE 1 — Fundacao e Setup (Semana 1)

**Status: Completa**

- Setup Next.js, TypeScript, Tailwind, Shadcn
- Prisma + PostgreSQL
- Seed inicial

### FASE 2 — Autenticacao Passwordless (Semana 2-3)

**Status: Completa (pendente validacao manual final)**

- Migracao de NextAuth para Better Auth com OTP
- Middleware, actions e fluxo de login/cadastro atualizados

### FASE 3 — Landing com GSAP (Semana 3)

**Status: Pendente**

- Animacoes de entrada, secoes e responsividade completa

### FASE 4 — Dashboard Completo (Semana 4-5)

**Status: Parcial**

- Evolucao de cards financeiros
- Lista de assinaturas com filtros e acoes
- Refinamento de navegacao

### FASE 4.5 — Planejamento Financeiro Mensal (Semana 5)

**Status: Pendente**

- Modelagem: `MonthlyPlan`, `PlannedIncome`, `PlannedExpense`, `PaymentMethod`, `PaymentCard`, `MonthlyPlanEntry`
- Integracao: `Subscription.paymentMethodId`
- Consolidacao automatica mensal por origem

### FASE 5 — CRUD de Assinaturas (Semana 5-6)

**Status: Pendente**

- Wizard, criacao rapida, edicao e exclusao

### FASE 6 — Alertas e Notificacoes (Semana 6-7)

**Status: Pendente**

- Logica de cobranca proxima e canais de notificacao

### FASE 7 — Conversao de Moedas (Semana 7)

**Status: Basico implementado**

- Integracao com taxa real e cache ainda pendentes

### FASE 8 — Animacoes da Plataforma (Semana 7-8)

**Status: Pendente**

- Micro-interacoes e feedbacks animados

### FASE 9 — Configuracoes e Perfil (Semana 8)

**Status: Pendente**

- Perfil, preferencias e conta

### FASE 10 — Graficos e Analytics (Semana 9)

**Status: Pendente**

- Graficos de categorias e evolucao mensal

### FASE 11 — Testes e Qualidade (Semana 9-10)

**Status: Pendente**

- Unitarios, E2E e CI

### FASE 12 — Deploy e Producao (Semana 10)

**Status: Pendente**

- Publicacao, variaveis, migration e monitoramento

---

## Setup de Desenvolvimento

### Pre-requisitos

- Node.js 20+
- pnpm
- Conta Neon
- Conta Resend

### Comandos

| Comando | Descricao |
|---|---|
| `pnpm dev` | Iniciar ambiente local |
| `pnpm build` | Build de producao |
| `pnpm lint` | Lint |
| `pnpm db:generate` | Prisma Client |
| `pnpm db:push` | Aplicar schema |
| `pnpm db:seed` | Popular banco |

### Bootstrap local

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```
