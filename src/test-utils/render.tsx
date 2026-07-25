import { type ReactElement, type ReactNode } from "react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider } from "next-themes"
import { NextIntlClientProvider } from "next-intl"
import { render, type RenderOptions } from "@testing-library/react"
import { authReducer } from "@/store/features/auth"
import { subscriptionsReducer } from "@/store/features/subscriptions"
import { financeReducer } from "@/store/features/finance"
import type { AppStore, RootState } from "@/store"
import userEvent from "@testing-library/user-event"

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>
  locale?: string
  messages?: Record<string, unknown>
}

function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      subscriptions: subscriptionsReducer,
      finance: financeReducer,
    },
    preloadedState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) as AppStore
}

export function renderWithProviders(
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
) {
  const { preloadedState, locale = "en", messages = {}, ...renderOptions } = options

  const store = createTestStore(preloadedState)

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </Provider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
    user: userEvent.setup(),
  }
}

export { createTestStore, userEvent }
export * from "@testing-library/react"
