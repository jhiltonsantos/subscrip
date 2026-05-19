"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/formatters"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchFinanceFormOptions,
  fetchMonthlyPlan,
  setSelectedMonth,
} from "@/store/features/finance"
import {
  selectCreditCardExpenses,
  selectFinanceError,
  selectFinanceLoading,
  selectMonthlyBillsExpenses,
  selectPendingIncomes,
  selectSelectedMonth,
  selectSelectedYear,
  selectSummaryBalance,
  selectSummaryCreditCardTotal,
  selectSummaryExpenseTotal,
  selectSummaryIncomeTotal,
  selectSummarySubscriptionTotal,
} from "@/store/selectors"

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function FinancePlannerBoard() {
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const dateLocale = locale === "pt" ? ptBR : enUS

  const selectedYear = useAppSelector(selectSelectedYear)
  const selectedMonth = useAppSelector(selectSelectedMonth)
  const isLoading = useAppSelector(selectFinanceLoading)
  const error = useAppSelector(selectFinanceError)

  const monthlyBills = useAppSelector(selectMonthlyBillsExpenses)
  const pendingIncomes = useAppSelector(selectPendingIncomes)
  const creditCardExpenses = useAppSelector(selectCreditCardExpenses)

  const incomeTotal = useAppSelector(selectSummaryIncomeTotal)
  const expenseTotal = useAppSelector(selectSummaryExpenseTotal)
  const subscriptionTotal = useAppSelector(selectSummarySubscriptionTotal)
  const creditCardTotal = useAppSelector(selectSummaryCreditCardTotal)
  const balance = useAppSelector(selectSummaryBalance)

  const [yearInput, setYearInput] = useState(String(selectedYear))
  const [monthInput, setMonthInput] = useState(String(selectedMonth))

  useEffect(() => {
    dispatch(fetchMonthlyPlan({ year: selectedYear, month: selectedMonth }))
    dispatch(fetchFinanceFormOptions())
  }, [dispatch, selectedYear, selectedMonth])

  const groupedCardExpenses = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        cardName: string
        rows: typeof creditCardExpenses
      }
    >()

    for (const expense of creditCardExpenses) {
      const cardName =
        expense.paymentCard?.nickname ??
        expense.paymentMethod?.name ??
        "Cartao sem identificacao"

      const key = expense.paymentCardId ?? expense.paymentMethodId ?? cardName
      const current = map.get(key)

      if (current) {
        current.rows.push(expense)
      } else {
        map.set(key, { key, cardName, rows: [expense] })
      }
    }

    return Array.from(map.values())
  }, [creditCardExpenses])

  function applyMonthFilter() {
    const nextYear = Number(yearInput)
    const nextMonth = Number(monthInput)

    if (
      Number.isNaN(nextYear) ||
      Number.isNaN(nextMonth) ||
      nextMonth < 1 ||
      nextMonth > 12
    ) {
      return
    }

    dispatch(setSelectedMonth({ year: nextYear, month: nextMonth }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planejador Financeiro</h1>
          <p className="text-muted-foreground">
            Registro mensal de contas, entradas, assinaturas e faturas de cartao.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Mes</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={monthInput}
              onChange={(event) => setMonthInput(event.target.value)}
              className="w-20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Ano</label>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              className="w-24"
            />
          </div>
          <Button onClick={applyMonthFilter} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Aplicar"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title="Receber Total" value={incomeTotal} />
        <SummaryCard title="Custos Totais" value={expenseTotal} />
        <SummaryCard title="Assinaturas" value={subscriptionTotal} />
        <SummaryCard title="Cartao de Credito" value={creditCardTotal} />
        <SummaryCard title="Saldo" value={balance} positive={balance >= 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Planejamento de {monthNames[selectedMonth - 1]} / {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Contas</th>
                    <th className="p-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBills.length === 0 ? (
                    <tr>
                      <td className="p-3 text-muted-foreground" colSpan={2}>
                        Nenhuma conta cadastrada para este mes.
                      </td>
                    </tr>
                  ) : (
                    monthlyBills.map((expense) => (
                      <tr key={expense.id} className="border-b last:border-0">
                        <td className="p-2">{expense.name}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(Number(expense.amount), expense.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">A Receber</th>
                    <th className="p-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingIncomes.length === 0 ? (
                    <tr>
                      <td className="p-3 text-muted-foreground" colSpan={2}>
                        Nenhuma entrada pendente para este mes.
                      </td>
                    </tr>
                  ) : (
                    pendingIncomes.map((income) => (
                      <tr key={income.id} className="border-b last:border-0">
                        <td className="p-2">{income.name}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(Number(income.amount), income.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cartoes - detalhamento mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedCardExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum gasto em cartao para o periodo selecionado.
              </p>
            ) : (
              groupedCardExpenses.map((group) => (
                <div key={group.key} className="overflow-x-auto rounded-lg border">
                  <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                    {group.cardName}
                  </div>
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-2 font-medium">Data</th>
                        <th className="p-2 font-medium">Nome</th>
                        <th className="p-2 text-right font-medium">Valor</th>
                        <th className="p-2 text-right font-medium">Parcela</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((expense) => (
                        <tr key={expense.id} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">
                            {expense.purchaseDate
                              ? format(new Date(expense.purchaseDate), "P", {
                                  locale: dateLocale,
                                })
                              : "-"}
                          </td>
                          <td className="p-2">{expense.name}</td>
                          <td className="p-2 text-right">
                            {formatCurrency(Number(expense.amount), expense.currency)}
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            {expense.installmentNumber && expense.installmentTotal
                              ? `${expense.installmentNumber}/${expense.installmentTotal}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  positive,
}: {
  title: string
  value: number
  positive?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p
          className={[
            "mt-2 text-lg font-semibold",
            positive === undefined ? "" : positive ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          {formatCurrency(value, "BRL")}
        </p>
      </CardContent>
    </Card>
  )
}
