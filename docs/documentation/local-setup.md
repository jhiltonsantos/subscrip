# Local Setup

Este fluxo separa setup local de operações de produção.

## Primeira Execução Local

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `DIRECT_URL` (Postgres local), `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. `RESEND_API_KEY` é opcional em dev: sem ela o OTP aparece no console.
2. Suba o banco:

```bash
pnpm docker:up
```

3. Gere o Prisma Client, aplique migrations e rode seed:

```bash
pnpm db:setup
```

4. Inicie a aplicação:

```bash
pnpm dev
```

## Desenvolvimento Diário

Use `pnpm docker:up` para subir o banco e `pnpm dev` para iniciar o app. Rode
`pnpm db:migrate` apenas quando alterar `prisma/schema.prisma`.

## Reset Local

`pnpm db:reset` é destrutivo e deve ser usado somente no banco local. Ele apaga
dados e recria o schema a partir das migrations.

## Produção

Não use `db:push`, `db:reset` ou seed destrutivo em produção. O fluxo de produção
deve usar migrations versionadas e variáveis de ambiente separadas.

## Deploy

Hospedagem na Vercel, banco Postgres gerenciado (Neon ou compatível com Prisma) e Resend para o OTP. Configure no ambiente de produção, separado do de preview:

- `DATABASE_URL` e `DIRECT_URL` (conexão direta, usada nas migrations)
- `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`
- `RESEND_API_KEY` e `EMAIL_FROM`

Antes do primeiro deploy: `pnpm db:deploy` (generate + `migrate deploy`). Nunca rode seed destrutivo em produção. O CI não faz build; a Vercel builda (ver ADR 0008).

## Smoke test manual

1. Registrar em `/auth/register`, informar o OTP e chegar ao dashboard; sair e entrar de novo.
2. Com cookie de sessão inválido, abrir uma rota protegida e confirmar que não há loop de redirect.
3. Em `/subscriptions`: criar, editar, filtrar e excluir uma assinatura.
4. Em `/finance-planner`: criar, editar e excluir entrada e saída; conferir o resumo do mês.
5. Em `/payment-methods`: criar método e cartão e vincular a uma assinatura/despesa.
6. Em `/dashboard`: conferir que os totais refletem os dados acima.
7. Em `/settings`: alterar idioma e tema.
8. Com dois usuários, confirmar que um não vê os dados do outro.
