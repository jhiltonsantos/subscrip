# Subscrip v1 Smoke Test

Use este checklist antes de considerar uma build como candidata de v1.

## Pré-requisitos

- Banco local rodando via Docker.
- `.env` apontando para o banco local correto.
- Migrations aplicadas com `pnpm db:setup` ou `pnpm db:migrate && pnpm db:seed`.
- App rodando com `pnpm dev`.

## Login e Sessão

- Acessar `/auth/register` e criar conta com email de teste.
- Informar o OTP recebido pelo console/Resend e entrar no dashboard.
- Fazer logout e login novamente pelo OTP.
- Abrir `/auth/login` com sessão válida e confirmar redirecionamento ao dashboard.
- Expirar/remover sessão no banco e confirmar que cookies antigos não geram loop.

## Assinaturas

- Abrir `/subscriptions`.
- Criar uma assinatura com nome, preço, moeda, categoria, ciclo e próxima cobrança.
- Editar nome/plano/preço.
- Filtrar por busca, status e categoria.
- Desativar e reativar a assinatura.
- Abrir os detalhes da assinatura e confirmar dados e lembretes existentes.

## Métodos de Pagamento

- Abrir `/settings`.
- Criar método de pagamento comum.
- Criar cartão de crédito com apelido, bandeira, últimos 4 dígitos, fechamento, vencimento e limite.
- Editar um método/cartão.
- Desativar um método e confirmar que ele deixa de aparecer nos formulários novos.

## Planejamento Financeiro

- Abrir `/finance-planner`.
- Criar uma entrada do mês e marcar como recebida.
- Criar uma saída do mês e marcar como paga.
- Editar entrada e saída.
- Excluir entrada e saída.
- Criar saída vinculada a método/cartão quando disponível.
- Alterar mês/ano e confirmar que o resumo muda sem reload manual.

## Dashboard

- Abrir `/dashboard`.
- Confirmar cards de receitas planejadas, despesas planejadas, assinaturas, total de saídas e saldo previsto.
- Confirmar que próxima cobrança e lista de assinaturas batem com `/subscriptions`.
- Confirmar que um usuário novo não enxerga dados do usuário seedado.

## Settings

- Alterar nome, moeda, tema, idioma e preferências padrão de lembrete.
- Confirmar que tema e idioma refletem na plataforma após salvar.
- Confirmar que email permanece somente leitura.

## Quality Gate

- Rodar `pnpm lint`.
- Rodar `pnpm typecheck`.
- Rodar `pnpm check`.
- Registrar qualquer falha antes de liberar a v1.
