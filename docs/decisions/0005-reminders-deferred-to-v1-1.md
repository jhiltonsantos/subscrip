# 0005. Lembretes e notificações automáticas ficam para a v1.1

- **Status:** accepted
- **Related:** `prisma/schema.prisma` (`Reminder`), `src/components/settings/settings-form.tsx`

## Context
O modelo `Reminder` e as preferências padrão de lembrete existem, mas não há agendador, envio de email de renovação nem CRUD de lembretes por assinatura.

## Decision
A v1 mantém apenas a estrutura de dados (`Reminder`), as preferências padrão em `/settings` e a exibição de lembretes já existentes no detalhe da assinatura. CRUD de lembretes, cron (Vercel Cron), email de renovação via Resend, push e badge de notificações ficam para a v1.1. O produto não deve prometer notificações automáticas.

## Alternatives considered
- Entregar cron + email na v1: aumenta escopo e superfície operacional antes de o fluxo principal estar fechado.

## Consequences
- Positive: v1 menor e testável.
- Negative: o campo `Reminder` e as preferências existem sem efeito automático; a UI deve comunicar isso.
