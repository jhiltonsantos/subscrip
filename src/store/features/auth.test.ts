import { describe, it, expect, vi } from "vitest"
import { makeStore } from "@/store"
import {
  fetchSession,
  fetchUserProfile,
  clearAuthState,
} from "@/store/features/auth"
import { getSession } from "@/server/actions/auth"
import { getUser } from "@/server/actions/user/get"

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
// vitest.setup.ts mocks @/server/actions/auth (barrel), which covers the
// getSession import in auth.ts.  However auth.ts imports getUser from
// @/server/actions/user/get (the direct file, not the barrel), so the global
// mock on @/server/actions/user does NOT intercept it.  We mock the exact
// import path here.
vi.mock("@/server/actions/user/get", () => ({
  getUser: vi.fn().mockResolvedValue({ success: false, error: "Unauthorized" }),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("auth slice", () => {
  describe("initial state", () => {
    it("should return correct initial state shape", () => {
      const store = makeStore()
      const state = store.getState().auth

      expect(state).toEqual({
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      })
    })

    it("should have all required fields with correct defaults", () => {
      const store = makeStore()
      const state = store.getState().auth

      expect(state).toHaveProperty("session", null)
      expect(state).toHaveProperty("profile", null)
      expect(state).toHaveProperty("isLoading", false)
      expect(state).toHaveProperty("error", null)
    })
  })

  describe("clearAuthState", () => {
    it("should reset state to initial nulls when state has data", () => {
      const store = makeStore()

      // Populate the store with some data
      const sessionPayload = {
        user: { id: "1", email: "user@test.com", name: "Test" },
      } as unknown as Parameters<typeof fetchSession.fulfilled>[0]
      store.dispatch(fetchSession.fulfilled(sessionPayload, "req-1"))
      store.dispatch(
        fetchUserProfile.fulfilled(
          {
            id: "1",
            email: "user@test.com",
            name: "Test User",
          } as unknown as Parameters<typeof fetchUserProfile.fulfilled>[0],
          "req-1",
        ),
      )

      expect(store.getState().auth.session).not.toBeNull()
      expect(store.getState().auth.profile).not.toBeNull()

      store.dispatch(clearAuthState())

      const state = store.getState().auth
      expect(state.session).toBeNull()
      expect(state.profile).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should behave idempotently on multiple dispatches", () => {
      const store = makeStore()

      store.dispatch(clearAuthState())
      store.dispatch(clearAuthState())

      expect(store.getState().auth).toEqual({
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      })
    })
  })

  describe("fetchSession", () => {
    it("pending should set isLoading=true and error=null", () => {
      const store = makeStore()

      store.dispatch(fetchSession.pending("req-1"))

      const state = store.getState().auth
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it("fulfilled should set isLoading=false and session to payload", () => {
      const store = makeStore()
      const mockSession = {
        user: { id: "1", email: "user@test.com", name: "Test" },
      } as unknown as Parameters<typeof fetchSession.fulfilled>[0]

      store.dispatch(fetchSession.fulfilled(mockSession, "req-1"))

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.session).toEqual(mockSession)
    })

    it("rejected should set isLoading=false and error to message", () => {
      const store = makeStore()

      store.dispatch(
        fetchSession.rejected(new Error("Session expired"), "req-1"),
      )

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe("Session expired")
    })

    it("should handle full lifecycle via store.dispatch", async () => {
      const store = makeStore()
      const mockSession = {
        user: { id: "2", email: "lifecycle@test.com" },
      } as unknown as Parameters<typeof fetchSession.fulfilled>[0]
      vi.mocked(getSession).mockResolvedValue(mockSession)

      await store.dispatch(fetchSession())

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.session).toEqual(mockSession)
      expect(state.error).toBeNull()
    })
  })

  describe("fetchUserProfile", () => {
    it("pending should set isLoading=true and error=null", () => {
      const store = makeStore()

      store.dispatch(fetchUserProfile.pending("req-1"))

      const state = store.getState().auth
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it("fulfilled should set isLoading=false and profile to payload", () => {
      const store = makeStore()
      const profile = {
        id: "1",
        email: "user@test.com",
        name: "Test User",
      }

      store.dispatch(
        fetchUserProfile.fulfilled(
          profile as unknown as Parameters<typeof fetchUserProfile.fulfilled>[0],
          "req-1",
        ),
      )

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.profile).toEqual(profile)
    })

    it("rejected should set isLoading=false and error to message", () => {
      const store = makeStore()

      store.dispatch(
        fetchUserProfile.rejected(new Error("Profile not found"), "req-1"),
      )

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe("Profile not found")
    })

    it("should handle full lifecycle with successful response", async () => {
      const store = makeStore()
      const mockProfile = {
        id: "1",
        email: "test@test.com",
        name: "Test User",
      }
      vi.mocked(getUser).mockResolvedValue({
        success: true,
        data: mockProfile,
      } as unknown as Awaited<ReturnType<typeof getUser>>)

      await store.dispatch(fetchUserProfile())

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.profile).toEqual(mockProfile)
      expect(state.error).toBeNull()
    })

    it("should handle full lifecycle with failed response", async () => {
      const store = makeStore()
      vi.mocked(getUser).mockResolvedValue({
        success: false,
        error: "Forbidden",
      })

      await store.dispatch(fetchUserProfile())

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe("Forbidden")
      expect(state.profile).toBeNull()
    })

    it("should handle null data payload", async () => {
      const store = makeStore()
      vi.mocked(getUser).mockResolvedValue({
        success: true,
        data: null,
      } as unknown as Awaited<ReturnType<typeof getUser>>)

      await store.dispatch(fetchUserProfile())

      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.profile).toBeNull()
      expect(state.error).toBeNull()
    })
  })
})
