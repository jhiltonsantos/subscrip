import { describe, it, expect } from "vitest"
import { vi } from "vitest"
import { makeStore } from "@/store"
import {
  setSelectedMonth,
  clearFinanceState,
  fetchMonthlyPlan,
  fetchMonthSummary,
  fetchFinanceFormOptions,
  createPlannedIncomeAction,
  updatePlannedIncomeAction,
  deletePlannedIncomeAction,
  createPlannedExpenseAction,
  updatePlannedExpenseAction,
  deletePlannedExpenseAction,
} from "@/store/features/finance"
import {
  getMonthlyPlan,
  getMonthSummary,
  getFinancePlannerFormOptions,
  createPlannedIncome,
  updatePlannedIncome,
  deletePlannedIncome,
  createPlannedExpense,
  updatePlannedExpense,
  deletePlannedExpense,
} from "@/server/actions/finance-planner"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createStore() {
  return makeStore()
}

/**
 * Build minimal mock data that matches what getMonthlyPlan returns.
 * In production getMonthlyPlan returns { plan: SerializedMonthlyPlan, summary: SerializedMonthSummary }.
 */
function buildMockPlanData(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    plan: {
      id: "plan-1",
      userId: "user-1",
      year: 2026,
      month: 7,
      incomes: [
        {
          id: "income-1",
          monthlyPlanId: "plan-1",
          name: "Salary",
          description: null,
          amount: "5000",
          currency: "USD",
          sortOrder: 0,
          expectedDate: null,
          receivedAt: null,
          isReceived: false,
          recurrenceKind: null,
          recurrenceGroupId: null,
          recurrenceNumber: null,
          recurrenceTotal: null,
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      expenses: [],
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
    summary: {
      incomeTotal: "5000",
      receivedTotal: "0",
      expenseTotal: "0",
      paidTotal: "0",
      subscriptionTotal: "0",
      creditCardTotal: "0",
      balance: "5000",
      pendingIncomeTotal: "5000",
      pendingExpenseTotal: "0",
    },
    ...overrides,
  }
}

function buildMockSummary(overrides: Partial<Record<string, string>> = {}) {
  return {
    incomeTotal: "3000",
    receivedTotal: "2000",
    expenseTotal: "1500",
    paidTotal: "1000",
    subscriptionTotal: "500",
    creditCardTotal: "200",
    balance: "1500",
    pendingIncomeTotal: "1000",
    pendingExpenseTotal: "500",
    ...overrides,
  }
}

function buildMockFormOptions() {
  return {
    paymentMethods: [
      { id: "pm-1", name: "Visa", type: "CREDIT", paymentCard: null },
    ],
    subscriptions: [],
    creditCardInvoices: [],
    installmentPurchases: [],
  }
}

// ---------------------------------------------------------------------------
// Section 1 – Initial state
// ---------------------------------------------------------------------------
describe("finance slice", () => {
  describe("initial state", () => {
    it("has selected year/month matching current date", () => {
      const store = createStore()
      const now = new Date()
      const state = store.getState().finance
      expect(state.selectedYear).toBe(now.getFullYear())
      expect(state.selectedMonth).toBe(now.getMonth() + 1)
    })

    it("has plan, summary, formOptions as null", () => {
      const store = createStore()
      const state = store.getState().finance
      expect(state.plan).toBeNull()
      expect(state.summary).toBeNull()
      expect(state.formOptions).toBeNull()
    })

    it("has isLoading false and error null", () => {
      const store = createStore()
      const state = store.getState().finance
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 2 – setSelectedMonth
  // -----------------------------------------------------------------------
  describe("setSelectedMonth", () => {
    it("updates selectedYear and selectedMonth from payload", () => {
      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2025, month: 12 }))
      const state = store.getState().finance
      expect(state.selectedYear).toBe(2025)
      expect(state.selectedMonth).toBe(12)
    })

    it("can set to any valid year/month", () => {
      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2030, month: 1 }))
      const state = store.getState().finance
      expect(state.selectedYear).toBe(2030)
      expect(state.selectedMonth).toBe(1)

      store.dispatch(setSelectedMonth({ year: 2020, month: 6 }))
      const updated = store.getState().finance
      expect(updated.selectedYear).toBe(2020)
      expect(updated.selectedMonth).toBe(6)
    })
  })

  // -----------------------------------------------------------------------
  // Section 3 – clearFinanceState
  // -----------------------------------------------------------------------
  describe("clearFinanceState", () => {
    it("resets plan, summary, formOptions, isLoading, and error", () => {
      const store = createStore()

      // Manually populate to a non-default state
      store.dispatch({
        type: "finance/fetchMonthlyPlan/fulfilled",
        payload: buildMockPlanData(),
      })
      store.dispatch({
        type: "finance/fetchFormOptions/fulfilled",
        payload: buildMockFormOptions(),
      })

      const populated = store.getState().finance
      expect(populated.plan).not.toBeNull()
      expect(populated.summary).not.toBeNull()
      expect(populated.formOptions).not.toBeNull()

      store.dispatch(clearFinanceState())

      const state = store.getState().finance
      expect(state.plan).toBeNull()
      expect(state.summary).toBeNull()
      expect(state.formOptions).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 4 – fetchMonthlyPlan
  // -----------------------------------------------------------------------
  describe("fetchMonthlyPlan", () => {
    it("pending: sets isLoading=true and clears error", async () => {
      const store = createStore()
      const promise = store.dispatch(fetchMonthlyPlan({ year: 2026, month: 7 }))

      const state = store.getState().finance
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()

      await promise
    })

    it("fulfilled: sets plan and summary from action payload", async () => {
      const mockData = buildMockPlanData({
        plan: {
          id: "plan-1",
          userId: "user-1",
          year: 2026,
          month: 7,
          incomes: [
            {
              id: "income-1",
              monthlyPlanId: "plan-1",
              name: "Salary",
              description: null,
              amount: "5000",
              currency: "USD",
              sortOrder: 0,
              expectedDate: null,
              receivedAt: null,
              isReceived: true,
              recurrenceKind: null,
              recurrenceGroupId: null,
              recurrenceNumber: null,
              recurrenceTotal: null,
              createdAt: "2026-07-01T00:00:00.000Z",
              updatedAt: "2026-07-01T00:00:00.000Z",
            },
          ],
          expenses: [],
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
        summary: {
          incomeTotal: "5000",
          receivedTotal: "5000",
          expenseTotal: "0",
          paidTotal: "0",
          subscriptionTotal: "0",
          creditCardTotal: "0",
          balance: "5000",
          pendingIncomeTotal: "0",
          pendingExpenseTotal: "0",
        },
      })

      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockData,
      } as never)

      const store = createStore()
      await store.dispatch(fetchMonthlyPlan({ year: 2026, month: 7 }))

      const state = store.getState().finance
      expect(state.isLoading).toBe(false)
      expect(state.plan).toEqual(mockData.plan)
      expect(state.summary).toEqual(mockData.summary)
      expect(state.error).toBeNull()
    })

    it("rejected: sets isLoading=false and stores error message", async () => {
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: false,
        error: "Failed to load monthly plan",
      } as never)

      const store = createStore()
      await store.dispatch(fetchMonthlyPlan({ year: 2026, month: 7 }))

      const state = store.getState().finance
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe("Failed to load monthly plan")
      expect(state.plan).toBeNull()
      expect(state.summary).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 5 – fetchMonthSummary
  // -----------------------------------------------------------------------
  describe("fetchMonthSummary", () => {
    it("fulfilled: sets summary without touching plan", async () => {
      const summary = buildMockSummary({ incomeTotal: "3000" })

      vi.mocked(getMonthSummary).mockResolvedValue({
        success: true,
        data: summary,
      } as never)

      const store = createStore()
      // Pre-populate a plan so we can verify it's not touched
      store.dispatch({
        type: "finance/fetchMonthlyPlan/fulfilled",
        payload: buildMockPlanData(),
      })
      const planBefore = store.getState().finance.plan

      await store.dispatch(fetchMonthSummary({ year: 2026, month: 7 }))

      const state = store.getState().finance
      expect(state.summary).toEqual(summary)
      // plan must remain unchanged
      expect(state.plan).toEqual(planBefore)
      // The pending/fulfilled handlers for fetchMonthSummary don't touch isLoading,
      // but we should still have a clean error
      expect(state.error).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 6 – fetchFinanceFormOptions
  // -----------------------------------------------------------------------
  describe("fetchFinanceFormOptions", () => {
    it("fulfilled: sets formOptions to payload", async () => {
      const options = buildMockFormOptions()
      vi.mocked(getFinancePlannerFormOptions).mockResolvedValue({
        success: true,
        data: options,
      } as never)

      const store = createStore()
      await store.dispatch(fetchFinanceFormOptions())

      expect(store.getState().finance.formOptions).toEqual(options)
    })

    it("rejected: does not set formOptions and rejected action is dispatched", async () => {
      vi.mocked(getFinancePlannerFormOptions).mockResolvedValue({
        success: false,
        error: "Unauthorized",
      } as never)

      const store = createStore()
      const result = await store.dispatch(fetchFinanceFormOptions())

      // The slice has no rejected handler for this thunk, so formOptions stays null
      // and state.error is not set by the rejected action
      const state = store.getState().finance
      expect(state.formOptions).toBeNull()
      expect(state.error).toBeNull()
      // The dispatch result itself carries the rejection info
      expect(result.meta.requestStatus).toBe("rejected")
    })
  })

  // -----------------------------------------------------------------------
  // Section 7 – createPlannedIncomeAction
  // -----------------------------------------------------------------------
  describe("createPlannedIncomeAction", () => {
    it("calls createPlannedIncome with payload and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)
      vi.mocked(createPlannedIncome).mockResolvedValue({
        success: true,
        data: { id: "new-income-1" },
      } as never)

      const store = createStore()
      // Set the selected month so the chained dispatch uses known values
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(createPlannedIncomeAction({ name: "Freelance", amount: "2000" }))

      // 1 — server action called with correct payload
      expect(createPlannedIncome).toHaveBeenCalledTimes(1)
      expect(createPlannedIncome).toHaveBeenCalledWith({ name: "Freelance", amount: "2000" })

      // 2 — chained fetchMonthlyPlan was dispatched with current selected year/month
      expect(getMonthlyPlan).toHaveBeenCalledTimes(1)
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — final state reflects the chained dispatch data
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("sets error when createPlannedIncome fails", async () => {
      vi.mocked(createPlannedIncome).mockResolvedValue({
        success: false,
        error: "Validation failed",
      } as never)

      const store = createStore()
      await store.dispatch(createPlannedIncomeAction({ name: "Bad" }))

      const state = store.getState().finance
      expect(state.error).toBe("Validation failed")
      expect(state.isLoading).toBe(false)
      // getMonthlyPlan should NOT have been called since the create failed
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Section 8 – updatePlannedIncomeAction
  // -----------------------------------------------------------------------
  describe("updatePlannedIncomeAction", () => {
    it("calls updatePlannedIncome with id, data, mode and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        updatePlannedIncomeAction({
          id: "income-1",
          data: { name: "Updated Salary" },
          mode: "future",
        })
      )

      // 1 — server action called with correct params
      expect(updatePlannedIncome).toHaveBeenCalledTimes(1)
      expect(updatePlannedIncome).toHaveBeenCalledWith(
        "income-1",
        { name: "Updated Salary" },
        "future"
      )

      // 2 — chained fetchMonthlyPlan was dispatched
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — state updated from chained dispatch
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("calls updatePlannedIncome without mode (defaults to undefined) and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        updatePlannedIncomeAction({
          id: "income-1",
          data: { name: "Updated Salary" },
        })
      )

      expect(updatePlannedIncome).toHaveBeenCalledWith(
        "income-1",
        { name: "Updated Salary" },
        undefined
      )
    })

    it("sets error when updatePlannedIncome fails", async () => {
      vi.mocked(updatePlannedIncome).mockResolvedValue({
        success: false,
        error: "Not found",
      } as never)

      const store = createStore()
      await store.dispatch(
        updatePlannedIncomeAction({ id: "missing", data: { name: "Nope" } })
      )

      const state = store.getState().finance
      expect(state.error).toBe("Not found")
      expect(state.isLoading).toBe(false)
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Section 9 – deletePlannedIncomeAction
  // -----------------------------------------------------------------------
  describe("deletePlannedIncomeAction", () => {
    it("calls deletePlannedIncome with id and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(deletePlannedIncomeAction("income-1"))

      // 1 — server action called with correct id
      expect(deletePlannedIncome).toHaveBeenCalledTimes(1)
      expect(deletePlannedIncome).toHaveBeenCalledWith("income-1")

      // 2 — chained fetchMonthlyPlan dispatched
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — state updated from chained dispatch
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("sets error when deletePlannedIncome fails", async () => {
      vi.mocked(deletePlannedIncome).mockResolvedValue({
        success: false,
        error: "Forbidden",
      } as never)

      const store = createStore()
      await store.dispatch(deletePlannedIncomeAction("income-1"))

      const state = store.getState().finance
      expect(state.error).toBe("Forbidden")
      expect(state.isLoading).toBe(false)
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Section 10 – createPlannedExpenseAction
  // -----------------------------------------------------------------------
  describe("createPlannedExpenseAction", () => {
    it("calls createPlannedExpense with payload and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)
      vi.mocked(createPlannedExpense).mockResolvedValue({
        success: true,
        data: { id: "new-expense-1" },
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        createPlannedExpenseAction({
          name: "Rent",
          amount: "1200",
          expenseBucket: "MONTHLY_BILLS",
        })
      )

      // 1 — server action called with correct payload
      expect(createPlannedExpense).toHaveBeenCalledTimes(1)
      expect(createPlannedExpense).toHaveBeenCalledWith({
        name: "Rent",
        amount: "1200",
        expenseBucket: "MONTHLY_BILLS",
      })

      // 2 — chained fetchMonthlyPlan dispatched
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — state updated from chained dispatch
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("sets error when createPlannedExpense fails", async () => {
      vi.mocked(createPlannedExpense).mockResolvedValue({
        success: false,
        error: "Validation failed",
      } as never)

      const store = createStore()
      await store.dispatch(
        createPlannedExpenseAction({ name: "Bad", amount: "-1", expenseBucket: "OTHER" })
      )

      const state = store.getState().finance
      expect(state.error).toBe("Validation failed")
      expect(state.isLoading).toBe(false)
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Section 11 – updatePlannedExpenseAction
  // -----------------------------------------------------------------------
  describe("updatePlannedExpenseAction", () => {
    it("calls updatePlannedExpense with id, data, mode and chains fetchMonthlyPlan", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        updatePlannedExpenseAction({
          id: "expense-1",
          data: { name: "Updated Rent" },
          mode: "single",
        })
      )

      // 1 — server action called with correct params
      expect(updatePlannedExpense).toHaveBeenCalledTimes(1)
      expect(updatePlannedExpense).toHaveBeenCalledWith(
        "expense-1",
        { name: "Updated Rent" },
        "single"
      )

      // 2 — chained fetchMonthlyPlan dispatched
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — state updated from chained dispatch
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("calls updatePlannedExpense without mode (defaults to undefined)", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        updatePlannedExpenseAction({ id: "expense-1", data: { name: "Rent" } })
      )

      expect(updatePlannedExpense).toHaveBeenCalledWith(
        "expense-1",
        { name: "Rent" },
        undefined
      )
    })

    it("sets error when updatePlannedExpense fails", async () => {
      vi.mocked(updatePlannedExpense).mockResolvedValue({
        success: false,
        error: "Not found",
      } as never)

      const store = createStore()
      await store.dispatch(
        updatePlannedExpenseAction({ id: "missing", data: { name: "Nope" } })
      )

      const state = store.getState().finance
      expect(state.error).toBe("Not found")
      expect(state.isLoading).toBe(false)
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Section 12 – deletePlannedExpenseAction
  // -----------------------------------------------------------------------
  describe("deletePlannedExpenseAction", () => {
    it("calls deletePlannedExpense when passed a string", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(deletePlannedExpenseAction("expense-1"))

      // 1 — server action called with string id and default mode "single"
      expect(deletePlannedExpense).toHaveBeenCalledTimes(1)
      expect(deletePlannedExpense).toHaveBeenCalledWith("expense-1", "single")

      // 2 — chained fetchMonthlyPlan dispatched
      expect(getMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 7 })

      // 3 — state updated from chained dispatch
      const state = store.getState().finance
      expect(state.plan).toEqual(mockPlanData.plan)
      expect(state.summary).toEqual(mockPlanData.summary)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("calls deletePlannedExpense with mode when passed an object", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(
        deletePlannedExpenseAction({ id: "expense-1", mode: "future" })
      )

      expect(deletePlannedExpense).toHaveBeenCalledWith("expense-1", "future")
    })

    it("calls deletePlannedExpense with single mode when object has no mode", async () => {
      const mockPlanData = buildMockPlanData()
      vi.mocked(getMonthlyPlan).mockResolvedValue({
        success: true,
        data: mockPlanData,
      } as never)

      const store = createStore()
      store.dispatch(setSelectedMonth({ year: 2026, month: 7 }))

      await store.dispatch(deletePlannedExpenseAction({ id: "expense-1" }))

      // When mode is undefined in the object, the thunk passes undefined
      // and the server action defaults to "single"
      expect(deletePlannedExpense).toHaveBeenCalledWith("expense-1", undefined)
    })

    it("sets error when deletePlannedExpense fails", async () => {
      vi.mocked(deletePlannedExpense).mockResolvedValue({
        success: false,
        error: "Forbidden",
      } as never)

      const store = createStore()
      await store.dispatch(deletePlannedExpenseAction("expense-1"))

      const state = store.getState().finance
      expect(state.error).toBe("Forbidden")
      expect(state.isLoading).toBe(false)
      expect(getMonthlyPlan).not.toHaveBeenCalled()
    })
  })
})
