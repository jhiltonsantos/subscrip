# Subscrip — Planejamento de Desenvolvimento

## 8. Roadmap de Desenvolvimento — Etapas e Períodos

Cada etapa contém suas tarefas com status de conclusão. O checkbox `[x]` indica o que já foi feito e `[ ]` indica o que falta.

---

### FASE 1 — Fundação e Setup (Semana 1)

> **Objetivo:** Inicializar o projeto, configurar a stack base e o banco de dados.

#### 1A — Setup Inicial

- [x] Inicializar projeto Next.js 16 com TypeScript e App Router
- [x] Configurar Tailwind CSS 4 e variáveis de design tokens (`globals.css`)
- [x] Configurar Shadcn UI (estilo New York, Lucide icons)
- [x] Configurar `next.config.ts` com React Compiler
- [x] Criar utilitários base: `cn()`, `formatCurrency()`

#### 1B — Banco de Dados e Prisma

- [x] Instalar e configurar Prisma com PostgreSQL
- [x] Criar `docker-compose.yml` para PostgreSQL 16 local (desenvolvimento)
- [x] Criar schema do banco: `User`, `Account`, `Session`, `VerificationToken`, `Subscription`
- [x] Criar novos models: `ServiceTemplate` (base de assinaturas populares), `Reminder` (lembretes)
- [x] Criar enums: `Currency`, `BillingCycle`, `Category` (+ `FITNESS`, `OTHER`), `ReminderChannel`, `Theme`
- [x] Adicionar campos de preferências no `User`: `theme`, `preferredCurrency`, `defaultReminderDays`, `defaultReminderChannel`
- [x] Configurar singleton do PrismaClient (`lib/prisma.ts`)

#### 1C — Seed e Ambiente

- [x] Criar seed completo com:
  - Usuário de teste (`test@subscrip.dev`)
  - 24 service templates (Netflix, Spotify, AWS, Vercel, Notion, etc.)
  - 5 assinaturas de exemplo vinculadas ao usuário
- [x] Criar `.env.example` com configuração Docker local e Neon (produção)
- [x] Adicionar scripts no `package.json`: `docker:up`, `docker:down`, `db:studio`, `setup`

**Status: ✅ COMPLETA**

---

### FASE 2 — Autenticação Passwordless (Semana 2)

> **Objetivo:** Implementar o fluxo completo de autenticação sem senha.

#### 2A — Implementação Atual (NextAuth — será substituída)

- [x] Instalar e configurar NextAuth v5 com PrismaAdapter
- [x] Configurar provider Nodemailer (Magic Links via AWS SES)
- [x] Criar `auth.config.ts` com Split Configuration (Edge Runtime)
- [x] Configurar Middleware de proteção de rotas (`middleware.ts`)
- [x] Criar Server Actions: `login()` e `register()` com validação de existência de usuário
- [x] Criar página de Login (`/auth/login`) com formulário de email
- [x] Criar página de Registro (`/auth/register`) com nome + email
- [x] Criar página de verificação (`/auth/login/verify`) — "verifique seu email"
- [x] Configurar catch-all route NextAuth (`/api/auth/[...nextauth]`)
- [x] Implementar lógica de redirecionamento (usuário logado → dashboard, não logado → login)
- [x] Tratar erro de "usuário não encontrado" no login

#### 2B — Migração para Better Auth com OTP (Semana 2–3)

- [x] Instalar `better-auth` e `@better-auth/prisma-adapter`
- [x] Remover `next-auth`, `@auth/prisma-adapter` do projeto
- [x] Configurar Better Auth (`lib/auth.ts`) com adapter Prisma
- [x] Configurar plugin de **Email OTP** no Better Auth
- [x] Atualizar schema Prisma para o modelo de dados do Better Auth (`Account`, `Session`, `Verification`)
- [x] Criar novo endpoint de API para Better Auth (`/api/auth/[...all]/route.ts`)
- [x] Criar cliente Better Auth (`lib/auth-client.ts`) para uso no frontend
- [x] Refatorar Server Actions (`getSession`, `signOut`)
- [x] Refatorar Middleware de proteção de rotas para Better Auth (`getSessionCookie`)
- [x] Atualizar página de Login: trocar Magic Link por input de **código OTP**
- [x] Criar componente de input OTP (6 dígitos) com auto-focus entre campos (`components/ui/input-otp.tsx`)
- [x] Atualizar página de Registro para fluxo OTP
- [x] Remover página de verificação antiga (`/auth/login/verify`)
- [x] Configurar envio de OTP via Resend (com fallback para console em dev)
- [x] Atualizar Dashboard para usar Better Auth session e filtrar por `userId`
- [x] Testar fluxo completo: registro → OTP → dashboard → logout → login → OTP → dashboard

**Status: ✅ COMPLETA (pendente teste manual)**

---

### FASE 3 — Landing Page com GSAP (Semana 3)

> **Objetivo:** Transformar a landing page básica em uma experiência visual impactante com animações GSAP.

- [x] Criar estrutura base da landing page (header, hero, CTA)
- [ ] Instalar `gsap` e o plugin `@gsap/react` (useGSAP hook)
- [ ] Criar componente `LandingPage` como Client Component (`'use client'`)
- [ ] **Hero Section:** animação de fade-in + slide-up no título e subtítulo com `gsap.from()` e stagger
- [ ] **Header:** animação de entrada suave do navbar
- [ ] **CTA Button:** animação de pulse/glow sutil no botão principal
- [ ] **Seção de Features:** criar seção com 3-4 cards de funcionalidades
  - [ ] Animação de scroll-trigger nos cards (aparecem ao scrollar)
  - [ ] Cards: "Painel Unificado", "Alertas Inteligentes", "Conversão de Moedas", "Previsão de Gastos"
- [ ] **Seção de como funciona:** 3 passos visuais com animações sequenciais
- [ ] **Seção de pricing/planos** (se aplicável) com animação de entrada
- [ ] **Footer:** informações institucionais e links
- [ ] Garantir responsividade completa (mobile-first)
- [ ] Otimizar performance: registrar plugins GSAP apenas no client, cleanup no unmount

**Status: 🔴 PENDENTE**

---

### FASE 4 — Dashboard Completo (Semana 4–5)

> **Objetivo:** Transformar o dashboard básico em uma visão consolidada de assinaturas + planejamento financeiro mensal.

#### 4A — Layout e Navegação

- [x] Criar layout do dashboard com **sidebar** (Shadcn Sidebar ou custom)
- [x] Implementar navegação: Dashboard, Assinaturas, Configurações
- [x] Criar componente de **Header do Dashboard** com avatar, nome e logout
- [x] Implementar tema dark/light toggle
- [x] Animações GSAP de transição entre páginas/seções

#### 4B — Cards de Métricas (Refatoração)

- [x] Card: Gasto Mensal Estimado (com conversão básica USD→BRL)
- [x] Card: Assinaturas Ativas (contagem)
- [x] Card: Próxima Fatura (data + nome)
- [ ] Card: Receitas planejadas do mês
- [ ] Card: Outras saídas planejadas do mês
- [ ] Card: Total de saídas consolidadas (planejamento + assinaturas)
- [ ] Card: Saldo previsto do mês
- [ ] Card: Gasto Anual Estimado
- [ ] Animação GSAP nos números (counter animation ao carregar)
- [ ] Conversão de moedas com taxa real (API de câmbio ou config manual)

#### 4C — Lista de Assinaturas (Refatoração)

- [x] Listagem básica de assinaturas com nome, categoria, ciclo, preço e vencimento
- [ ] Adicionar badge de status (ativa/pausada/cancelada)
- [ ] Adicionar ícone/logo de cada serviço
- [ ] Implementar filtros por categoria e status
- [ ] Implementar ordenação (preço, vencimento, nome)
- [ ] Implementar busca por nome
- [ ] Adicionar ações: editar, pausar, cancelar
- [ ] Animação GSAP de entrada na lista (stagger nos items)

#### 4D — Filtrar por Usuário (Segurança Multi-tenant)

- [ ] Refatorar queries do dashboard para filtrar por `userId` da sessão autenticada
- [ ] Garantir isolamento total de dados entre usuários
- [ ] Seed vinculado a um usuário de teste
- [ ] Garantir isolamento por `userId` também em `MonthlyPlan`, `PlannedIncome` e `PlannedExpense`

**Status: 🟡 PARCIALMENTE IMPLEMENTADA**

---

### FASE 4.5 — Planejamento Financeiro Mensal (Semana 5)

> **Objetivo:** Implementar a camada de planejamento do mês com entradas, saídas e saldo previsto.

#### 4.5A — Modelagem e Persistência

- [ ] Adicionar model `MonthlyPlan` com chave única por `userId + year + month`
- [ ] Adicionar model `PlannedIncome` para entradas mensais
- [ ] Adicionar model `PlannedExpense` com enum `ExpenseBucket`
- [ ] Criar índices para leitura eficiente por mês/usuário
- [ ] Atualizar seed com plano mensal de exemplo para usuário de teste

#### 4.5B — Backend (Server Actions + Validação)

- [ ] Criar função `getOrCreateMonthlyPlan(userId, year, month)`
- [ ] Criar Server Actions para CRUD de `PlannedIncome`
- [ ] Criar Server Actions para CRUD de `PlannedExpense`
- [ ] Validar payloads com Zod (nome, valor, moeda, bucket)
- [ ] Implementar agregador `monthSummary` no servidor

#### 4.5C — Interface de Planejamento

- [ ] Criar rota `/plan` (ou `/dashboard/plan`) com seletor de mês/ano
- [ ] Exibir colunas de entradas e saídas em formato de planejamento mensal
- [ ] Exibir resumo: receber total, custos totais, assinaturas, saldo
- [ ] Garantir experiência mobile-first para edição rápida

**Status: 🔴 PENDENTE**

---

### FASE 5 — CRUD de Assinaturas (Semana 5–6)

> **Objetivo:** Implementar o fluxo completo de criação, edição e exclusão de assinaturas.

#### 5A — Wizard de Criação (Redux Toolkit)

- [ ] Configurar Redux Store (`lib/store/`)
- [ ] Criar slice de "Subscription Wizard" com steps:
  - **Step 1:** Nome e categoria do serviço
  - **Step 2:** Preço, moeda e ciclo de cobrança
  - **Step 3:** Data de início e próximo vencimento
  - **Step 4:** Revisão e confirmação
- [ ] Criar Provider do Redux no layout do dashboard
- [ ] Criar componente de Wizard com progress bar
- [ ] Implementar navegação entre steps (voltar/avançar)
- [ ] Validação com Zod em cada step
- [ ] Server Action para persistir assinatura no banco
- [ ] Animações GSAP de transição entre steps do wizard

#### 5B — Modal/Dialog de Criação Rápida

- [ ] Criar Dialog (Shadcn) para criação rápida em formulário único
- [ ] Vinculado ao botão "Nova Assinatura" no dashboard

#### 5C — Edição e Exclusão

- [ ] Criar página/modal de edição de assinatura
- [ ] Server Action para update de assinatura
- [ ] Server Action para soft-delete (marcar `active: false`) ou hard-delete
- [ ] Confirmação antes de excluir (Dialog de confirmação)

**Status: 🔴 PENDENTE**

---

### FASE 6 — Alertas e Notificações (Semana 6–7)

> **Objetivo:** Notificar o usuário sobre faturas próximas e renovações.

- [ ] Definir modelo de notificação no Prisma (ou usar campo `notifiedAt` na Subscription)
- [ ] Criar lógica de verificação de faturas próximas (cron job ou Vercel Cron)
- [ ] Enviar email de alerta X dias antes do vencimento (Resend)
- [ ] Criar página/seção de notificações no dashboard
- [ ] Criar componente de badge de notificações no header
- [ ] Toast de notificação in-app (Shadcn Toast/Sonner)

**Status: 🔴 PENDENTE**

---

### FASE 7 — Conversão de Moedas (Semana 7)

> **Objetivo:** Converter automaticamente valores em moeda estrangeira para BRL.

- [x] Conversão básica hardcoded (USD 1 = R$ 6)
- [ ] Integrar API de câmbio (ex: AwesomeAPI, Open Exchange Rates)
- [ ] Cachear taxa de câmbio (revalidar a cada X horas)
- [ ] Exibir taxa de câmbio utilizada no dashboard
- [ ] Permitir que o usuário configure taxa manual como alternativa
- [ ] Suportar EUR e outras moedas futuras

**Status: 🟡 BÁSICO IMPLEMENTADO**

---

### FASE 8 — Animações GSAP na Plataforma (Semana 7–8)

> **Objetivo:** Enriquecer a experiência do usuário dentro da plataforma com micro-interações GSAP.

- [ ] Animação de entrada do sidebar (slide-in)
- [ ] Animação de entrada dos cards de métricas (fade + scale com stagger)
- [ ] Animação de counter nos valores numéricos (0 → valor final)
- [ ] Animação de entrada da lista de assinaturas (stagger nos rows)
- [ ] Animação de transição ao abrir/fechar modals
- [ ] Animação de transição entre steps do Wizard
- [ ] Animação de hover nos cards interativos
- [ ] Animação de feedback visual ao criar/editar/excluir assinatura
- [ ] Garantir que animações respeitam `prefers-reduced-motion`
- [ ] Cleanup correto de animações com `useGSAP()` hook

**Status: 🔴 PENDENTE**

---

### FASE 9 — Configurações e Perfil (Semana 8)

> **Objetivo:** Permitir que o usuário gerencie seus dados e preferências.

- [ ] Criar página `/dashboard/settings`
- [ ] Seção de perfil: editar nome e email
- [ ] Seção de preferências: moeda padrão, tema (dark/light)
- [ ] Seção de conta: excluir conta (com confirmação)
- [ ] Server Actions para atualização de perfil
- [ ] Logout funcional com redirecionamento

**Status: 🔴 PENDENTE**

---

### FASE 10 — Gráficos e Analytics (Semana 9)

> **Objetivo:** Visualizações que ajudem o usuário a entender seus gastos.

- [ ] Instalar biblioteca de gráficos (Recharts ou similar compatível com SSR)
- [ ] Gráfico de pizza: gastos por categoria (incluindo buckets do planejamento mensal)
- [ ] Gráfico de linha: evolução mensal de receitas vs saídas
- [ ] Gráfico de barras: comparação entre assinaturas
- [ ] Integrar gráficos no dashboard como seção
- [ ] Animação GSAP de entrada nos gráficos

**Status: 🔴 PENDENTE**

---

### FASE 11 — Testes e Qualidade (Semana 9–10)

> **Objetivo:** Garantir estabilidade e confiabilidade do projeto.

- [ ] Configurar Vitest (ou Jest) para testes unitários
- [ ] Testes unitários para Server Actions (auth, subscriptions)
- [ ] Testes unitários para utilitários (`formatCurrency`, `cn`)
- [ ] Configurar Playwright para testes E2E
- [ ] Testes E2E: fluxo de registro → login → dashboard
- [ ] Testes E2E: CRUD de assinaturas
- [ ] Configurar CI com GitHub Actions (lint + type-check + testes)

**Status: 🔴 PENDENTE**

---

### FASE 12 — Deploy e Produção (Semana 10)

> **Objetivo:** Colocar o projeto em produção.

- [ ] Configurar projeto na Vercel
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Configurar domínio customizado (se aplicável)
- [ ] Configurar Resend em produção (verificar domínio)
- [ ] Executar migration em produção
- [ ] Testar fluxo completo em produção
- [ ] Configurar monitoramento básico (Vercel Analytics)
- [ ] Criar README.md final com instruções de setup

**Status: 🔴 PENDENTE**
