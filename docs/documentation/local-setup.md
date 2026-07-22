# Local Setup

Este fluxo separa setup local de operações de produção.

## Primeira Execução Local

1. Configure `.env` com a `DATABASE_URL` do Postgres local.
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
