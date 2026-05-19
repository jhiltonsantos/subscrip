import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionFormOptions,
  listSubscriptions,
  updateSubscription,
  type SerializedSubscription,
  type SubscriptionFormOptions,
} from "@/server/actions/subscriptions"

type SubscriptionsState = {
  items: SerializedSubscription[]
  formOptions: SubscriptionFormOptions | null
  isLoading: boolean
  error: string | null
}

const initialState: SubscriptionsState = {
  items: [],
  formOptions: null,
  isLoading: false,
  error: null,
}

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async () => {
    const result = await listSubscriptions()
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const fetchSubscriptionFormOptions = createAsyncThunk(
  "subscriptions/fetchFormOptions",
  async () => {
    const result = await getSubscriptionFormOptions()
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const createSubscriptionAction = createAsyncThunk(
  "subscriptions/create",
  async (payload: unknown) => {
    const result = await createSubscription(payload)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const updateSubscriptionAction = createAsyncThunk(
  "subscriptions/update",
  async (payload: { id: string; data: unknown }) => {
    const result = await updateSubscription(payload.id, payload.data)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

export const deleteSubscriptionAction = createAsyncThunk(
  "subscriptions/delete",
  async (id: string) => {
    const result = await deleteSubscription(id)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data.id
  }
)

const subscriptionsStore = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearSubscriptionsState(state) {
      state.items = []
      state.formOptions = null
      state.error = null
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? "Failed to fetch subscriptions"
      })
      .addCase(fetchSubscriptionFormOptions.fulfilled, (state, action) => {
        state.formOptions = action.payload
      })
      .addCase(createSubscriptionAction.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateSubscriptionAction.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      })
      .addCase(deleteSubscriptionAction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export const { clearSubscriptionsState } = subscriptionsStore.actions
export const subscriptionsReducer = subscriptionsStore.reducer
