# Deploy v1

Checklist mínimo para publicar a primeira versão fechada.

## Serviços

- Vercel para hospedagem do Next.js.
- Neon ou Postgres gerenciado compatível com Prisma.
- Resend para OTP por email.

## Variáveis

Configure no ambiente de produção:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `RESEND_API_KEY`
- Variáveis públicas já usadas pelo app, se houver.

Mantenha variáveis de preview e produção separadas.

## Banco

Antes do primeiro deploy produtivo:

```bash
pnpm db:generate
pnpm prisma migrate deploy
```

Não rode seed destrutivo em produção. Dados seedados são apenas para
desenvolvimento/local.

## Build

Antes de promover:

```bash
pnpm check
pnpm build
```

## Pós-Deploy

- Testar login por OTP em domínio real.
- Criar assinatura e item financeiro com usuário real de teste.
- Validar dashboard consolidado.
- Validar mudança de idioma/tema em `/settings`.
- Confirmar que Resend envia emails com domínio verificado.

## Fora da v1

Cron de lembretes, emails de renovação e push notifications ficam para v1.1.
