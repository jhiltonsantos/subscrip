import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createPlannedExpense,
  createPlannedIncome,
  deletePlannedExpense,
  deletePlannedIncome,
  getFinancePlannerFormOptions,
  getMonthlyPlan,
  getMonthSummary,
  updatePlannedExpense,
  updatePlannedIncome,
  type FinancePlannerFormOptions,
  type SerializedMonthlyPlan,
} from "@/server/actions/finance-planner"

type MonthRef = { year: number; month: number }

type FinanceState = {
  selectedYear: number
  selectedMonth: number
  plan: SerializedMonthlyPlan | null
  summary: {
    incomeTotal: string
    receivedTotal: string
    expenseTotal: string
    paidTotal: string
    subscriptionTotal: string
    creditCardTotal: string
    balance: string
    pendingIncomeTotal: string
    pendingExpenseTotal: string
  } | null
  formOptions: FinancePlannerFormOptions | null
  isLoading: boolean
  error: string | null
}

const now = new Date()
const initialState: FinanceState = {
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  plan: null,
  summary: null,
  formOptions: null,
  isLoading: false,
  error: null,
}

export const fetchMonthlyPlan = createAsyncThunk(
  "finance/fetchMonthlyPlan",
  async (payload: MonthRef) => {
    const result = await getMonthlyPlan(payload)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const fetchMonthSummary = createAsyncThunk(
  "finance/fetchMonthSummary",
  async (payload: MonthRef) => {
    const result = await getMonthSummary(payload)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const fetchFinanceFormOptions = createAsyncThunk(
  "finance/fetchFormOptions",
  async () => {
    const result = await getFinancePlannerFormOptions()
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const createPlannedIncomeAction = createAsyncThunk(
  "finance/createPlannedIncome",
  async (payload: unknown) => {
    const result = await createPlannedIncome(payload)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const updatePlannedIncomeAction = createAsyncThunk(
  "finance/updatePlannedIncome",
  async (payload: { id: string; data: unknown }) => {
    const result = await updatePlannedIncome(payload.id, payload.data)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const deletePlannedIncomeAction = createAsyncThunk(
  "finance/deletePlannedIncome",
  async (id: string) => {
    const result = await deletePlannedIncome(id)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const createPlannedExpenseAction = createAsyncThunk(
  "finance/createPlannedExpense",
  async (payload: unknown) => {
    const result = await createPlannedExpense(payload)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const updatePlannedExpenseAction = createAsyncThunk(
  "finance/updatePlannedExpense",
  async (payload: { id: string; data: unknown }) => {
    const result = await updatePlannedExpense(payload.id, payload.data)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const deletePlannedExpenseAction = createAsyncThunk(
  "finance/deletePlannedExpense",
  async (id: string) => {
    const result = await deletePlannedExpense(id)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

const financeStore = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setSelectedMonth(state, action: { payload: MonthRef }) {
      state.selectedYear = action.payload.year
      state.selectedMonth = action.payload.month
    },
    clearFinanceState(state) {
      state.plan = null
      state.summary = null
      state.formOptions = null
      state.isLoading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyPlan.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMonthlyPlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.plan = action.payload.plan
        state.summary = action.payload.summary
      })
      .addCase(fetchMonthlyPlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? "Failed to fetch monthly plan"
      })
      .addCase(fetchMonthSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })
      .addCase(fetchFinanceFormOptions.fulfilled, (state, action) => {
        state.formOptions = action.payload
      })
  },
})

export const { setSelectedMonth, clearFinanceState } = financeStore.actions
export const financeReducer = financeStore.reducer
