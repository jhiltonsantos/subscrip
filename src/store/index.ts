import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "./features/auth"
import { financeReducer } from "./features/finance"
import { subscriptionsReducer } from "./features/subscriptions"

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      subscriptions: subscriptionsReducer,
      finance: financeReducer,
    }
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
