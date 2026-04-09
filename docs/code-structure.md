# Subscrip — Estrutura do Codigo

## Estrutura Atual do Projeto

```text
subscrip/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (platform)/
│   │   ├── (auth)/
│   │   ├── (landing)/
│   │   ├── api/auth/[...all]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── global/
│   │   └── ui/
│   ├── contexts/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── auth-client.ts
│   │   ├── prisma.ts
│   │   └── utils/
│   └── server/actions/
├── docs/
└── package.json
```

## Convencoes de Organizacao

- `src/app`: rotas, layouts e paginas (App Router)
- `src/components/ui`: componentes base reutilizaveis
- `src/components/layout`: shell da aplicacao (sidebar, header, dock)
- `src/server/actions`: mutacoes e operacoes de backend
- `src/lib`: integracoes e funcoes compartilhadas
- `prisma`: schema, migrations e seed

## Alvos de Evolucao de Estrutura

- Criar pasta dedicada para dominio financeiro mensal:
  - `src/lib/finance`
  - `src/server/actions/plan`
- Separar actions de assinaturas e meios de pagamento
- Manter schema Prisma como referencia unica de dados
