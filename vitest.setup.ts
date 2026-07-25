import "@testing-library/jest-dom/vitest"
import { vi, afterEach } from "vitest"

vi.mock("@/server/actions/auth", () => ({
  getSession: vi.fn().mockResolvedValue(null),
  signOut: vi.fn(),
}))

vi.mock("@/server/actions/subscriptions", () => ({
  listSubscriptions: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getSubscription: vi.fn().mockResolvedValue({ success: false, error: "Not found" }),
  createSubscription: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  updateSubscription: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  deleteSubscription: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  getSubscriptionFormOptions: vi.fn().mockResolvedValue({
    success: true,
    data: { serviceTemplates: [], paymentMethods: [] },
  }),
}))

vi.mock("@/server/actions/finance-planner", () => ({
  createPlannedExpense: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  createPlannedIncome: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  deletePlannedExpense: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  deletePlannedIncome: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  getFinancePlannerFormOptions: vi.fn().mockResolvedValue({
    success: true,
    data: {
      paymentMethods: [],
      subscriptions: [],
      creditCardInvoices: [],
      installmentPurchases: [],
    },
  }),
  getMonthlyPlan: vi.fn().mockResolvedValue({ success: true, data: { plan: null, summary: null } }),
  getMonthSummary: vi.fn().mockResolvedValue({ success: true, data: null }),
  getFinanceTrend: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getMonthComparison: vi.fn().mockResolvedValue({ success: true, data: null }),
  updatePlannedExpense: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  updatePlannedIncome: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
}))

vi.mock("@/server/actions/payment-methods", () => ({
  getPaymentMethods: vi.fn().mockResolvedValue({ success: true, data: [] }),
  createPaymentMethod: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  updatePaymentMethod: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
  deactivatePaymentMethod: vi.fn().mockResolvedValue({ success: true, data: { id: "mock-id" } }),
}))

vi.mock("@/server/actions/user", () => ({
  getUser: vi.fn().mockResolvedValue({ success: false, error: "Unauthorized" }),
  changeUserLanguage: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  updateUserSettings: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  updateDarkThemeVariant: vi.fn().mockResolvedValue({ success: true, data: undefined }),
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/en/dashboard"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})
