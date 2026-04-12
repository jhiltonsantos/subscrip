# Subscrip — Stack e Arquitetura

## Stack Tecnologica

### Frontend

| Tecnologia | Funcao |
|---|---|
| Next.js 16 (App Router) | Framework principal |
| TypeScript | Tipagem estatica |
| React 19 | UI |
| Tailwind CSS 4 | Estilizacao |
| Shadcn UI | Componentes base |
| Lucide React | Icones |
| GSAP | Animacoes |
| next-themes | Dark/Light mode |

### Estado e Formularios

| Tecnologia | Funcao |
|---|---|
| Redux Toolkit | Estado global |
| React Hook Form + Zod | Formularios e validacao |

### Backend (BFF)

| Tecnologia | Funcao |
|---|---|
| Next.js Server Actions | Logica de servidor |
| Better Auth | Autenticacao OTP |
| Resend | Emails transacionais |

### Dados e Deploy

| Tecnologia | Funcao |
|---|---|
| Prisma 5 | ORM |
| PostgreSQL (Neon) | Banco de dados |
| Vercel | Hosting e runtime |

---

## Decisoes Arquiteturais

### Better Auth > NextAuth

- Fluxo OTP nativo
- Menor atrito de autenticacao
- Melhor alinhamento com arquitetura atual

### Neon > alternativas

- Serverless nativo
- Integracao com Vercel
- Connection pooling

### Resend > alternativas

- Integracao simples com Next.js
- Fluxo de email transacional com baixo setup

### Split Configuration

- Edge Runtime para roteamento leve (middleware)
- Serverless para logica pesada (Prisma, email, jobs)

### Multi-tenant por `userId`

Toda consulta de dados de assinaturas e planejamento mensal deve ser filtrada por `userId` da sessao.
