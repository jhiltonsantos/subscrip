import { describe, it, expect } from "vitest"
import { makeStore } from "@/store"
import {
  fetchSubscriptions,
  fetchSubscriptionFormOptions,
  createSubscriptionAction,
  updateSubscriptionAction,
  deleteSubscriptionAction,
  clearSubscriptionsState,
} from "@/store/features/subscriptions"
import {
  listSubscriptions,
  getSubscriptionFormOptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/server/actions/subscriptions"
import { vi } from "vitest"

function createStore() {
  return makeStore()
}

// ---------------------------------------------------------------------------
// Helper to build a minimal SerializedSubscription for test assertions
// ---------------------------------------------------------------------------
function buildSubscription(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "mock-id",
    name: "Netflix",
    planLabel: null,
    price: "39.90",
    currency: "BRL",
    billingCycle: "MONTHLY",
    billingDay: 15,
    category: "ENTERTAINMENT",
    hiredAt: null,
    nextBillingDate: null,
    active: true,
    serviceTemplateId: null,
    paymentMethodId: null,
    userId: "user-1",
    serviceTemplate: null,
    paymentMethod: null,
    reminders: [],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Section 1 – Initial state
// ---------------------------------------------------------------------------
describe("subscriptions slice", () => {
  describe("initial state", () => {
    it("has correct default shape", () => {
      const store = createStore()
      expect(store.getState().subscriptions).toEqual({
        items: [],
        formOptions: null,
        isLoading: false,
        error: null,
      })
    })
  })

  // -----------------------------------------------------------------------
  // Section 2 – clearSubscriptionsState
  // -----------------------------------------------------------------------
  describe("clearSubscriptionsState", () => {
    it("resets populated state back to initial values", () => {
      const store = createStore()

      // Manually populate the store to a non-default state
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [buildSubscription()],
      })
      store.dispatch({
        type: "subscriptions/fetchFormOptions/fulfilled",
        payload: { serviceTemplates: [], paymentMethods: [] },
      })

      const populated = store.getState().subscriptions
      expect(populated.items).toHaveLength(1)
      expect(populated.formOptions).not.toBeNull()

      store.dispatch(clearSubscriptionsState())

      expect(store.getState().subscriptions).toEqual({
        items: [],
        formOptions: null,
        isLoading: false,
        error: null,
      })
    })
  })

  // -----------------------------------------------------------------------
  // Section 3 – fetchSubscriptions
  // -----------------------------------------------------------------------
  describe("fetchSubscriptions", () => {
    it("pending: sets isLoading=true and clears error", async () => {
      const store = createStore()

      // Dispatch but don't await yet — the pending action fires synchronously
      const promise = store.dispatch(fetchSubscriptions())

      const state = store.getState().subscriptions
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()

      await promise
    })

    it("fulfilled: sets isLoading=false and populates items", async () => {
      const items = [buildSubscription({ id: "sub-1" }), buildSubscription({ id: "sub-2" })]
      vi.mocked(listSubscriptions).mockResolvedValue({
        success: true,
        data: items,
      } as never)

      const store = createStore()
      await store.dispatch(fetchSubscriptions())

      const state = store.getState().subscriptions
      expect(state.isLoading).toBe(false)
      expect(state.items).toEqual(items)
      expect(state.error).toBeNull()
    })

    it("rejected: sets isLoading=false and stores error", async () => {
      vi.mocked(listSubscriptions).mockResolvedValue({
        success: false,
        error: "Failed to load subscriptions",
      } as never)

      const store = createStore()
      await store.dispatch(fetchSubscriptions())

      const state = store.getState().subscriptions
      expect(state.isLoading).toBe(false)
      expect(state.items).toEqual([])
      expect(state.error).toBe("Failed to load subscriptions")
    })

    it("full integration: dispatches and populates items from server action", async () => {
      const items = [buildSubscription({ id: "int-1" })]
      vi.mocked(listSubscriptions).mockResolvedValue({
        success: true,
        data: items,
      } as never)

      const store = createStore()
      await store.dispatch(fetchSubscriptions())

      expect(listSubscriptions).toHaveBeenCalledTimes(1)
      expect(store.getState().subscriptions.items).toEqual(items)
      expect(store.getState().subscriptions.error).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 4 – fetchSubscriptionFormOptions
  // -----------------------------------------------------------------------
  describe("fetchSubscriptionFormOptions", () => {
    it("fulfilled: sets formOptions to payload", async () => {
      const options = {
        serviceTemplates: [{ id: "t1", name: "Streaming" }],
        paymentMethods: [{ id: "pm1", name: "Visa", type: "CREDIT" }],
      }
      vi.mocked(getSubscriptionFormOptions).mockResolvedValue({
        success: true,
        data: options,
      } as never)

      const store = createStore()
      await store.dispatch(fetchSubscriptionFormOptions())

      expect(store.getState().subscriptions.formOptions).toEqual(options)
    })

    it("rejected: does not populate formOptions on failure", async () => {
      vi.mocked(getSubscriptionFormOptions).mockResolvedValue({
        success: false,
        error: "Unauthorized",
      } as never)

      const store = createStore()
      const result = await store.dispatch(fetchSubscriptionFormOptions())

      // createAsyncThunk always resolves with the action object
      expect(result.meta.requestStatus).toBe("rejected")
      // The slice has no rejected handler, so formOptions stays null
      expect(store.getState().subscriptions.formOptions).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Section 5 – createSubscriptionAction
  // -----------------------------------------------------------------------
  describe("createSubscriptionAction", () => {
    it("fulfilled: pushes new item to items array", async () => {
      const newSub = buildSubscription({ id: "new-1" })
      vi.mocked(createSubscription).mockResolvedValue({
        success: true,
        data: newSub,
      } as never)

      const store = createStore()
      await store.dispatch(createSubscriptionAction({ name: "Netflix" }))

      expect(store.getState().subscriptions.items).toEqual([newSub])
    })

    it("followed by second create: both items present", async () => {
      vi.mocked(createSubscription)
        .mockResolvedValueOnce({
          success: true,
          data: buildSubscription({ id: "first" }),
        } as never)
        .mockResolvedValueOnce({
          success: true,
          data: buildSubscription({ id: "second" }),
        } as never)

      const store = createStore()

      await store.dispatch(createSubscriptionAction({ name: "Sub A" }))
      await store.dispatch(createSubscriptionAction({ name: "Sub B" }))

      const items = store.getState().subscriptions.items
      expect(items).toHaveLength(2)
      expect(items[0].id).toBe("first")
      expect(items[1].id).toBe("second")
    })
  })

  // -----------------------------------------------------------------------
  // Section 6 – updateSubscriptionAction
  // -----------------------------------------------------------------------
  describe("updateSubscriptionAction", () => {
    it("fulfilled: matching item replaced in array", async () => {
      const original = buildSubscription({ id: "sub-1", name: "Old Name" })
      const updated = buildSubscription({ id: "sub-1", name: "New Name" })

      vi.mocked(updateSubscription).mockResolvedValue({
        success: true,
        data: updated,
      } as never)

      const store = createStore()
      // Seed store with the original item
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [original],
      })

      await store.dispatch(updateSubscriptionAction({ id: "sub-1", data: { name: "New Name" } }))

      expect(store.getState().subscriptions.items).toEqual([updated])
    })

    it("non-matching id: array unchanged", async () => {
      const existing = buildSubscription({ id: "other-id", name: "Keep Me" })
      vi.mocked(updateSubscription).mockResolvedValue({
        success: true,
        data: buildSubscription({ id: "mock-id", name: "Should Not Appear" }),
      } as never)

      const store = createStore()
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [existing],
      })

      await store.dispatch(updateSubscriptionAction({ id: "mock-id", data: { name: "Should Not Appear" } }))

      expect(store.getState().subscriptions.items).toEqual([existing])
    })
  })

  // -----------------------------------------------------------------------
  // Section 7 – deleteSubscriptionAction
  // -----------------------------------------------------------------------
  describe("deleteSubscriptionAction", () => {
    it("fulfilled: matching item filtered out", async () => {
      const toDelete = buildSubscription({ id: "delete-me" })
      const toKeep = buildSubscription({ id: "keep-me" })

      vi.mocked(deleteSubscription).mockResolvedValue({
        success: true,
        data: { id: "delete-me" },
      } as never)

      const store = createStore()
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [toDelete, toKeep],
      })

      await store.dispatch(deleteSubscriptionAction("delete-me"))

      expect(store.getState().subscriptions.items).toEqual([toKeep])
    })

    it("last item: array becomes empty", async () => {
      const sole = buildSubscription({ id: "sole" })

      vi.mocked(deleteSubscription).mockResolvedValue({
        success: true,
        data: { id: "sole" },
      } as never)

      const store = createStore()
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [sole],
      })

      await store.dispatch(deleteSubscriptionAction("sole"))

      expect(store.getState().subscriptions.items).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // Section 8 – Rejected paths (all thunks)
  // -----------------------------------------------------------------------
  describe("rejected paths", () => {
    it("fetchSubscriptions sets error on failure", async () => {
      vi.mocked(listSubscriptions).mockResolvedValue({
        success: false,
        error: "Server error",
      } as never)

      const store = createStore()
      await store.dispatch(fetchSubscriptions())

      const state = store.getState().subscriptions
      expect(state.error).toBe("Server error")
      expect(state.isLoading).toBe(false)
    })

    it("fetchSubscriptionFormOptions rejects on failure", async () => {
      vi.mocked(getSubscriptionFormOptions).mockResolvedValue({
        success: false,
        error: "Unauthorized",
      } as never)

      const store = createStore()
      const result = await store.dispatch(fetchSubscriptionFormOptions())

      // The thunk throws, so the dispatch returns a rejected promise.
      // When the rejected action goes through redux the thunk middleware catches it.
      // The result is the rejected action itself, not an error in the dispatch.
      // Check that formOptions remains null.
      expect(store.getState().subscriptions.formOptions).toBeNull()
      // The rejected action should have an error
      expect(result.meta.requestStatus).toBe("rejected")
    })

    it("createSubscriptionAction does not mutate items on failure", async () => {
      vi.mocked(createSubscription).mockResolvedValue({
        success: false,
        error: "Validation failed",
      } as never)

      const store = createStore()
      await store.dispatch(createSubscriptionAction({ name: "Bad" }))

      const state = store.getState().subscriptions
      expect(state.items).toEqual([])
      // The rejected case has no dedicated handler, so error stays null
      expect(state.error).toBeNull()
    })

    it("updateSubscriptionAction does not mutate items on failure", async () => {
      const existing = buildSubscription({ id: "sub-1" })

      vi.mocked(updateSubscription).mockResolvedValue({
        success: false,
        error: "Not found",
      } as never)

      const store = createStore()
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [existing],
      })

      await store.dispatch(updateSubscriptionAction({ id: "sub-1", data: { name: "Nope" } }))

      const state = store.getState().subscriptions
      expect(state.items).toEqual([existing])
      expect(state.error).toBeNull()
    })

    it("deleteSubscriptionAction does not mutate items on failure", async () => {
      const existing = buildSubscription({ id: "sub-1" })

      vi.mocked(deleteSubscription).mockResolvedValue({
        success: false,
        error: "Forbidden",
      } as never)

      const store = createStore()
      store.dispatch({
        type: "subscriptions/fetchAll/fulfilled",
        payload: [existing],
      })

      await store.dispatch(deleteSubscriptionAction("sub-1"))

      const state = store.getState().subscriptions
      expect(state.items).toEqual([existing])
      expect(state.error).toBeNull()
    })
  })
})
