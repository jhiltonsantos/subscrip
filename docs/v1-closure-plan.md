# Subscrip — Plano Para Fechar a v1

Este plano transforma a auditoria em uma sequência de trabalho para chegar a uma primeira versão fechada, testável e apresentável.

## Definição de v1

A v1 deve permitir que um usuário:

1. Crie conta e entre por OTP.
2. Cadastre, edite, liste e remova assinaturas.
3. Cadastre métodos/cartões mínimos para vincular assinaturas e despesas.
4. Planeje o mês com entradas, saídas, assinaturas e saldo previsto.
5. Veja um dashboard consolidado do mês.
6. Ajuste preferências básicas em settings.
7. Rode o projeto localmente com setup documentado.

## Sequência Recomendada

### 1. Sincronizar documentação e baseline

Prioridade: v1 bloqueante.

- Atualizar `docs/development-roadmap.md` com o estado real do código.
- Atualizar `docs/ARCHITECTURE.md` para refletir o proxy atual sem redirect por cookie expirado.
- Resolver a nomenclatura oficial: manter `/finance-planner` ou migrar para `/plan`.
- Documentar diferença entre seed local destrutivo e fluxo de produção.

Resultado esperado: qualquer agent ou dev entende o estado real antes de codar.

### 2. Fechar finance planner editável

Prioridade: v1 bloqueante.

- Expor na UI botões para criar entrada e saída.
- Adicionar edição e exclusão visíveis para `PlannedIncome` e `PlannedExpense`.
- Permitir marcar entrada como recebida e saída como paga.
- Garantir UX mobile-first para edição rápida.
- Remover strings hardcoded em português e mover para `src/translations`.

Arquivos principais:

- `src/components/finance-planner/finance-planner-board.tsx`
- `src/server/actions/finance-planner/*`
- `src/store/features/finance.ts`
- `src/translations/client/*.json`

### 3. Criar gestão mínima de métodos/cartões

Prioridade: v1 bloqueante se o planner continuar com cartão/fatura.

- Criar página ou seção para métodos de pagamento.
- CRUD mínimo para `PaymentMethod`.
- CRUD mínimo para `PaymentCard` quando `type = CREDIT_CARD`.
- Usar esses dados em assinaturas e despesas planejadas.

Opção enxuta: adicionar uma seção em `/settings` ou `/finance-planner` antes de criar uma rota dedicada.

### 4. Consolidar dashboard com dados financeiros

Prioridade: v1 bloqueante.

- Adicionar cards de receitas planejadas, despesas planejadas, assinaturas, total de saídas e saldo.
- Usar `getMonthSummary` ou action equivalente como fonte server-side.
- Manter filtro por usuário em todas as queries.
- Mostrar próxima cobrança e próximas despesas do mês.

Arquivos principais:

- `src/app/(platform)/dashboard/page.tsx`
- `src/server/actions/finance-planner/summary.ts`
- `src/lib/utils/formatters.ts`

### 5. Completar subscriptions para v1

Prioridade: v1 importante.

- Adicionar busca simples por nome.
- Adicionar filtros básicos: status e categoria.
- Melhorar ações: editar, excluir/desativar, reativar.
- Definir semântica oficial entre `active=false`, cancelamento e hard delete.
- Criar lembrete padrão ao criar assinatura, se reminders forem parte da v1.

### 6. Lembretes e notificações

Prioridade: v1.1. Decisão final para v1 enxuta: manter somente a estrutura de dados,
preferências padrão em `/settings` e visualização de lembretes já existentes nos
detalhes da assinatura. CRUD completo de `Reminder`, cron, envio de email e badge
real ficam fora da v1.

- CRUD de `Reminder` por assinatura.
- Agendador com Vercel Cron ou script server-side.
- Email via Resend X dias antes.
- Header badge real.

Texto de produto para v1 deve tratar notificações como “em breve” ou “v1.1”.

### 7. Qualidade e release

Prioridade: v1 bloqueante.

- Adicionar scripts:
  - `typecheck`: `tsc --noEmit --pretty false --incremental false`
  - `check`: lint + typecheck
- Corrigir lints globais atuais antes do release.
- Adicionar pelo menos um smoke test manual documentado.
- Ideal: Playwright básico para login, subscriptions e finance planner.
- Documentar deploy Vercel/Neon/Resend.

## Fora da v1

- Push notifications.
- Gráficos avançados.
- Animações GSAP avançadas.
- Avatar/upload.
- Excluir conta.
- Gestão de múltiplas sessões.
- Observabilidade completa.

## Marco de “v1 pronta”

A v1 está pronta quando:

- Um usuário novo consegue completar login, criar assinatura, planejar o mês e ver o dashboard refletindo os dados.
- Não há dados cruzados entre usuários.
- `pnpm lint` e `pnpm exec tsc --noEmit --pretty false --incremental false` passam.
- Setup local e seed estão documentados e reproduzíveis.
- Roadmap e arquitetura não contradizem o código.
