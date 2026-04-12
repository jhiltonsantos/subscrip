# Subscrip — Paginas e Componentes

## Paginas Principais

- `/(landing)`: pagina institucional
- `/(auth)/auth/login`: login OTP
- `/(auth)/auth/register`: cadastro OTP
- `/(platform)/dashboard`: resumo financeiro e assinaturas
- `/subscriptions` (planejada): gestao completa de assinaturas
- `/plan` (planejada): planejamento mensal (entradas/saidas/consolidacao)
- `/settings` (planejada): perfil e preferencias

## Estrutura de Navegacao

- Sidebar/Desktop:
  - Dashboard
  - Assinaturas
  - Planejamento
  - Configuracoes
- Mobile Dock:
  - Atalhos equivalentes para rotas principais

## Componentes-Chave

### Layout

- `PlatformLayout`
- `Sidebar`
- `HeaderDock`
- `MobileDock`

### UI Base

- `Button`
- `Card`
- `Dialog`
- `Form`
- `Input`
- `InputOTP`

### Dominio (planejado)

- `MonthlySummaryCards`
- `MonthlyEntriesTable`
- `PaymentMethodSelector`
- `SubscriptionList`
- `UpcomingBillsList`

## Diretrizes de Interface

- Mobile-first em todas as telas de plataforma
- Mesmos tokens visuais em dark/light mode
- Componentizacao por dominio para reduzir acoplamento
