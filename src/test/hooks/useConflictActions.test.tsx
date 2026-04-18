import { describe, it, expect, beforeEach, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import {
  useConflictStats,
  useApplyConflicts,
} from "../../hooks/useConflictActions"
import { useIntegrationStore } from "../../stores/integrationStore"
import { useSyncStore } from "../../stores/syncStore"
import type { Integration, SyncChange } from "../../types"

const integrations: Integration[] = [
  {
    id: "int-1",
    application_id: "salesforce",
    application_name: "Salesforce",
    status: "conflict",
    last_sync: null,
    version: 1,
    description: "",
  },
  {
    id: "int-2",
    application_id: "hubspot",
    application_name: "HubSpot",
    status: "conflict",
    last_sync: null,
    version: 2,
    description: "",
  },
]

const makeChange = (overrides: Partial<SyncChange> = {}): SyncChange => ({
  id: "c1",
  field_name: "email",
  change_type: "UPDATE",
  current_value: "old",
  new_value: "new",
  ...overrides,
})

describe("useConflictStats", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ integrations: [...integrations] })
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  it("returns empty stats when no syncData exists", () => {
    const { result } = renderHook(() => useConflictStats())
    expect(result.current.conflictGroups).toEqual([])
    expect(result.current.totalChanges).toBe(0)
    expect(result.current.totalResolved).toBe(0)
    expect(result.current.allResolved).toBe(false)
  })

  it("skips integrations with empty changes", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [],
          hasConflicts: false,
          canApply: false,
        },
        "int-2": {
          isLoading: false,
          error: null,
          changes: [makeChange({ id: "c1" })],
          hasConflicts: true,
          canApply: false,
        },
      },
      syncHistory: {},
    })

    const { result } = renderHook(() => useConflictStats())
    expect(result.current.conflictGroups).toHaveLength(1)
    expect(result.current.conflictGroups[0].integration.id).toBe("int-2")
    expect(result.current.totalChanges).toBe(1)
  })

  it("reports allResolved=true only when every change is resolved", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [
            makeChange({ id: "c1", resolved: true, resolution: "accept_new" }),
            makeChange({ id: "c2" }),
          ],
          hasConflicts: true,
          canApply: false,
        },
      },
      syncHistory: {},
    })

    const { result, rerender } = renderHook(() => useConflictStats())
    expect(result.current.totalChanges).toBe(2)
    expect(result.current.totalResolved).toBe(1)
    expect(result.current.allResolved).toBe(false)

    act(() => {
      useSyncStore.getState().resolveChange("int-1", "c2", "keep_current")
    })
    rerender()
    expect(result.current.totalResolved).toBe(2)
    expect(result.current.allResolved).toBe(true)
  })
})

describe("useApplyConflicts", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ integrations: [...integrations] })
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  it("warns when applying an integration with unresolved conflicts", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [makeChange({ id: "c1" })],
          hasConflicts: true,
          canApply: false,
        },
      },
      syncHistory: {},
    })

    const onSuccess = vi.fn()
    const onWarning = vi.fn()
    const { result } = renderHook(() =>
      useApplyConflicts({ onSuccess, onWarning }),
    )

    act(() => {
      result.current.applyIntegration("int-1")
    })

    expect(onWarning).toHaveBeenCalledWith(
      "Resolve all conflicts in this integration first",
    )
    expect(onSuccess).not.toHaveBeenCalled()
    expect(useSyncStore.getState().syncHistory["int-1"]).toBeUndefined()
  })

  it("applies a resolved integration: appends history, sets status, clears syncData", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [
            makeChange({ id: "c1", resolved: true, resolution: "accept_new" }),
          ],
          hasConflicts: true,
          canApply: true,
        },
      },
      syncHistory: {},
    })

    const onSuccess = vi.fn()
    const onWarning = vi.fn()
    const { result } = renderHook(() =>
      useApplyConflicts({ onSuccess, onWarning }),
    )

    act(() => {
      result.current.applyIntegration("int-1")
    })

    const state = useSyncStore.getState()
    expect(state.syncHistory["int-1"]).toHaveLength(1)
    expect(state.syncData["int-1"]).toBeUndefined()
    expect(useIntegrationStore.getState().integrations[0].status).toBe("synced")
    expect(onSuccess).toHaveBeenCalledWith(
      "Applied 1 changes for Salesforce",
    )
    expect(onWarning).not.toHaveBeenCalled()
  })

  it("does nothing for an unknown integration id", () => {
    const onSuccess = vi.fn()
    const onWarning = vi.fn()
    const { result } = renderHook(() =>
      useApplyConflicts({ onSuccess, onWarning }),
    )

    act(() => {
      result.current.applyIntegration("missing")
    })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onWarning).not.toHaveBeenCalled()
  })

  it("applyAll warns when not every conflict is resolved", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [
            makeChange({ id: "c1", resolved: true, resolution: "accept_new" }),
          ],
          hasConflicts: true,
          canApply: true,
        },
        "int-2": {
          isLoading: false,
          error: null,
          changes: [makeChange({ id: "c2" })],
          hasConflicts: true,
          canApply: false,
        },
      },
      syncHistory: {},
    })

    const onSuccess = vi.fn()
    const onWarning = vi.fn()
    const { result } = renderHook(() =>
      useApplyConflicts({ onSuccess, onWarning }),
    )

    act(() => {
      result.current.applyAll()
    })

    expect(onWarning).toHaveBeenCalledWith(
      "Resolve all conflicts before applying",
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("applyAll applies every fully-resolved integration", () => {
    useSyncStore.setState({
      syncData: {
        "int-1": {
          isLoading: false,
          error: null,
          changes: [
            makeChange({ id: "c1", resolved: true, resolution: "accept_new" }),
          ],
          hasConflicts: true,
          canApply: true,
        },
        "int-2": {
          isLoading: false,
          error: null,
          changes: [
            makeChange({ id: "c2", resolved: true, resolution: "keep_current" }),
          ],
          hasConflicts: true,
          canApply: true,
        },
      },
      syncHistory: {},
    })

    const onSuccess = vi.fn()
    const onWarning = vi.fn()
    const { result } = renderHook(() =>
      useApplyConflicts({ onSuccess, onWarning }),
    )

    act(() => {
      result.current.applyAll()
    })

    const syncState = useSyncStore.getState()
    expect(syncState.syncHistory["int-1"]).toHaveLength(1)
    expect(syncState.syncHistory["int-2"]).toHaveLength(1)
    expect(syncState.syncData["int-1"]).toBeUndefined()
    expect(syncState.syncData["int-2"]).toBeUndefined()
    expect(
      useIntegrationStore
        .getState()
        .integrations.every((i) => i.status === "synced"),
    ).toBe(true)
    expect(onSuccess).toHaveBeenCalledWith(
      "Applied all changes across 2 integrations",
    )
  })
})
