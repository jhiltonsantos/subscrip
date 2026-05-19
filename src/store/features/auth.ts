import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getSession } from "@/server/actions/auth"
import { getUser } from "@/server/actions/user/get"

type AuthUser = {
  id: string
  name: string | null
  email: string
  image?: string | null
  language?: string
  preferredCurrency?: string
  theme?: string
  defaultReminderDays?: number
}

type AuthState = {
  session: {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  } | null
  profile: AuthUser | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  session: null,
  profile: null,
  isLoading: false,
  error: null,
}

export const fetchSession = createAsyncThunk(
  "auth/fetchSession",
  async () => getSession()
)

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async () => {
    const result = await getUser()
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }
)

const authStore = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState(state) {
      state.session = null
      state.profile = null
      state.error = null
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.session = action.payload
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? "Failed to fetch session"
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload ?? null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? "Failed to fetch user profile"
      })
  },
})

export const { clearAuthState } = authStore.actions
export const authReducer = authStore.reducer
