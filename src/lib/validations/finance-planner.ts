import { z } from "zod"
import { Currency, ExpenseBucket, RecurrenceKind } from "@prisma/client"

export const monthPlanParamsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export const plannedIncomeCreateSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(1000).optional().nullable(),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  currency: z.nativeEnum(Currency).default(Currency.BRL),
  sortOrder: z.coerce.number().int().optional(),
  expectedDate: z.coerce.date().optional().nullable(),
  receivedAt: z.coerce.date().optional().nullable(),
  isReceived: z.boolean().optional(),
  recurrenceKind: z.nativeEnum(RecurrenceKind).optional().nullable(),
  recurrenceGroupId: z.string().uuid().optional().nullable(),
  createMonthlyRecurring: z.boolean().optional(),
  recurrenceMonths: z.coerce.number().int().positive().max(120).optional().nullable(),
})

export const plannedIncomeUpdateSchema = plannedIncomeCreateSchema
  .omit({ year: true, month: true })
  .partial()

export const plannedExpenseCreateSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  merchantName: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  currency: z.nativeEnum(Currency).default(Currency.BRL),
  expenseBucket: z.nativeEnum(ExpenseBucket).default(ExpenseBucket.OTHER),
  sortOrder: z.coerce.number().int().optional(),
  purchaseDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  isPaid: z.boolean().optional(),
  paymentMethodId: z.string().uuid().optional().nullable(),
  paymentCardId: z.string().uuid().optional().nullable(),
  creditCardInvoiceId: z.string().uuid().optional().nullable(),
  subscriptionId: z.string().uuid().optional().nullable(),
  installmentPurchaseId: z.string().uuid().optional().nullable(),
  installmentNumber: z.coerce.number().int().positive().optional().nullable(),
  installmentTotal: z.coerce.number().int().positive().optional().nullable(),
  recurrenceKind: z.nativeEnum(RecurrenceKind).optional().nullable(),
  recurrenceGroupId: z.string().uuid().optional().nullable(),
  createFutureInstallments: z.boolean().optional(),
  createMonthlyRecurring: z.boolean().optional(),
})

export const plannedExpenseUpdateSchema = plannedExpenseCreateSchema
  .omit({ year: true, month: true })
  .partial()

export type MonthPlanParamsInput = z.infer<typeof monthPlanParamsSchema>
export type PlannedIncomeCreateInput = z.infer<typeof plannedIncomeCreateSchema>
export type PlannedIncomeUpdateInput = z.infer<typeof plannedIncomeUpdateSchema>
export type PlannedExpenseCreateInput = z.infer<typeof plannedExpenseCreateSchema>
export type PlannedExpenseUpdateInput = z.infer<typeof plannedExpenseUpdateSchema>
