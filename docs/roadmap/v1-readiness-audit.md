# Subscrip — Auditoria de Prontidão v1

> Gerado a partir do cruzamento entre `docs/`, `prisma/schema.prisma`, rotas em `src/app`, componentes de domínio e server actions.

## Resumo Executivo

O Subscrip já tem uma base real para uma primeira versão: autenticação OTP, rotas protegidas, dashboard inicial, CRUD de assinaturas, settings persistido e parte forte do modelo/ações do planejamento financeiro.

Os maiores bloqueios para uma v1 fechada são: edição completa no planejamento financeiro, dashboard consolidado com dados do planejamento, gerenciamento de métodos/cartões, lembretes funcionais, quality gate mínimo e documentação sincronizada com o estado atual.

## Matriz de Prontidão

| Área | Estado | Prioridade | Evidência | Lacuna principal |
|---|---|---:|---|---|
| Auth OTP | Feito | v1 bloqueante | `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/(auth)/auth/*` | Ainda falta teste manual/documentado e UX de rate limit/resend mais explícita. |
| Proteção de rotas | Feito | v1 bloqueante | `src/app/(platform)/layout.tsx`, `src/proxy.ts`, `src/lib/proxy/auth.ts` | `docs/ARCHITECTURE.md` ainda descreve padrão antigo de redirect por cookie. |
| Setup local | Parcial | v1 bloqueante | `docker-compose.yml`, `package.json`, `prisma/migrations`, `prisma/seed.ts` | `db:setup` roda seed destrutivo; docs precisam diferenciar setup dev vs produção. |
| Dashboard | Parcial | v1 bloqueante | `src/app/(platform)/dashboard/page.tsx` | Ainda é subscription-first; falta consolidar receitas, despesas, saldo, anual e planejamento mensal. |
| Assinaturas CRUD | Parcial | v1 bloqueante | `src/app/(platform)/subscriptions`, `src/components/subscriptions`, `src/server/actions/subscriptions` | Falta busca/filtros/ordenação, pause/cancel semântico, lembretes por assinatura e logos/badges. |
| Planejamento financeiro | Parcial | v1 bloqueante | `src/app/(platform)/finance-planner/page.tsx`, `src/server/actions/finance-planner`, `src/store/features/finance.ts` | Backend existe, mas UI ainda é muito focada em leitura; faltam forms visíveis para criar/editar/remover itens. |
| Settings | Parcial | v1 importante | `src/app/(platform)/settings/page.tsx`, `src/components/settings/settings-form.tsx`, `src/server/actions/user/update-settings.ts` | Perfil/preferências existem; falta gestão de conta, avatar, email e exclusão, que podem ir para v1.1. |
| Multi-tenant por `userId` | Parcial | v1 bloqueante | `src/server/actions/*`, `src/app/(platform)/dashboard/page.tsx` | Actions principais filtram por sessão, mas precisa auditoria final em todas as queries e seed. |
| Lembretes/notificações | Decidido para v1.1 | v1.1 | `Reminder` em `prisma/schema.prisma`, preferências em `/settings` | Para v1 enxuta, manter apenas estrutura/preferências e não prometer cron, email ou badge real. |
| Métodos/cartões | Falta | v1 bloqueante se finance planner incluir cartão | `PaymentMethod`, `PaymentCard`, `CreditCardInvoice`, `InstallmentPurchase` em `prisma/schema.prisma` | Model/seed existem, mas não há UI/actions de gestão pelo usuário. |
| Conversão de moedas | Básico | v1.1 | `src/app/(platform)/dashboard/page.tsx` | USD usa multiplicador fixo `6`; falta API/cache/taxa exibida/config manual. |
| i18n | Parcial | v1 importante | `src/translations`, `src/lib/i18n`, `src/lib/proxy/i18n.ts` | Finance planner ainda tem strings hardcoded em português. |
| Analytics/gráficos | Falta | pós-v1 ou v1.1 | `docs/development-roadmap.md`, `docs/product-summary-features.md` | Sem biblioteca de gráfico ou componentes de visualização. |
| Testes/CI | Falta | v1 bloqueante | `package.json` | Sem `test`, sem Playwright/Vitest, sem CI configurado. |
| Deploy produção | Falta | v1 bloqueante | `docs/development-roadmap.md` | Vercel/Neon/Resend produção e migrations de prod ainda não documentados/executados. |

## Desalinhamentos de Documentação

- `docs/development-roadmap.md` marca como pendentes itens que já existem parcialmente: subscriptions CRUD, finance planner, settings e models financeiros.
- `docs/pages-components.md` fala em `/plan`, enquanto a implementação atual usa `/finance-planner`.
- `docs/ARCHITECTURE.md` descreve redirect de auth baseado só na presença de cookie, padrão removido para evitar loop com cookie expirado.
- `docs/database-schema-diagrams.md` cita `MonthlyPlanEntry`, mas o schema atual usa `PlannedIncome` e `PlannedExpense` como fontes persistidas principais.
- `docs/tech-stack-architecture.md` fala em split Edge/serverless, mas o projeto atual usa `src/proxy.ts` de Next.js 16.

## Critério Sugerido Para v1 Fechada

### Bloqueante

- Auth OTP, logout e redirect sem loop.
- Setup local reproduzível com Docker, migrations e seed dev explícito.
- Dashboard consolidando assinaturas e planejamento mensal sem vazamento entre usuários.
- Assinaturas com CRUD utilizável e detalhes.
- Planejamento financeiro com criação, edição e remoção visíveis na UI.
- Métodos de pagamento/cartões suficientes para suportar assinaturas e planner.
- Settings básicos funcionando.
- Lint/typecheck e smoke test mínimo documentados.

### Importante, Mas Pode Ser v1.1

- Lembretes por email com cron.
- Busca, filtros e ordenação avançados em assinaturas.
- Conversão de moeda real com cache.
- Gráficos/analytics.
- Gestão de conta mais completa: avatar, email, exclusão.

### Pós-v1

- Push notifications.
- Animações GSAP avançadas.
- Observabilidade completa.
- Múltiplas sessões/dispositivos.

## Próximas Ações Recomendadas

1. Atualizar `docs/development-roadmap.md` e `docs/ARCHITECTURE.md` para refletir o estado atual.
2. Fechar a UI de mutação do finance planner.
3. Criar gestão mínima de métodos/cartões.
4. Consolidar dashboard com dados do mês.
5. Adicionar quality gate mínimo: typecheck, lint direcionado e smoke E2E.
