import { create } from "zustand"
import type { SyncChange, SyncEvent, ApiError, ApplicationId } from "../types"
import { ApiService } from "../services/api"

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "type" in value &&
    "message" in value
  )
}

function stripResolution(
  change: SyncChange,
): Omit<SyncChange, "resolved" | "resolution" | "custom_value"> {
  const copy = { ...change }
  delete copy.resolved
  delete copy.resolution
  delete copy.custom_value
  return copy
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record }
  delete copy[key]
  return copy
}

interface PerIntegrationSyncData {
  isLoading: boolean
  error: ApiError | null
  changes: SyncChange[]
  hasConflicts: boolean
  canApply: boolean
}

export const defaultSyncData: PerIntegrationSyncData = {
  isLoading: false,
  error: null,
  changes: [],
  hasConflicts: false,
  canApply: false,
}

const EMPTY_HISTORY: SyncEvent[] = []

interface SyncStoreState {
  syncData: Record<string, PerIntegrationSyncData>
  syncHistory: Record<string, SyncEvent[]>

  fetchSyncData: (
    integrationId: string,
    applicationId: ApplicationId,
  ) => Promise<{ hasConflicts: boolean }>
  resolveChange: (
    integrationId: string,
    changeId: string,
    resolution: SyncChange["resolution"],
    customValue?: SyncChange["custom_value"],
  ) => void
  bulkResolve: (
    integrationId: string,
    resolution: "keep_current" | "accept_new",
  ) => void
  bulkResolveAll: (resolution: "keep_current" | "accept_new") => void
  resetResolutions: (integrationId: string) => void
  resetResolutionsAll: () => void
  resetIntegration: (integrationId: string) => void
  appendHistoryEvent: (integrationId: string, event: SyncEvent) => void
  getSyncData: (integrationId: string) => PerIntegrationSyncData
  getSyncEventById: (eventId: string) => SyncEvent | undefined
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  syncData: {},
  syncHistory: {},

  fetchSyncData: async (integrationId, applicationId) => {
    set((state) => ({
      syncData: {
        ...state.syncData,
        [integrationId]: { ...defaultSyncData, isLoading: true, error: null },
      },
    }))

    try {
      const data = await ApiService.fetchSyncData(applicationId)
      const changes = data.sync_approval.changes

      const hasConflicts = changes.length > 0
      set((state) => ({
        syncData: {
          ...state.syncData,
          [integrationId]: {
            isLoading: false,
            error: null,
            changes,
            hasConflicts,
            canApply: !hasConflicts,
          },
        },
      }))
      return { hasConflicts }
    } catch (error) {
      const apiError: ApiError = isApiError(error)
        ? error
        : {
            type: "network_error",
            status: 0,
            message: "An unexpected error occurred",
          }
      set((state) => ({
        syncData: {
          ...state.syncData,
          [integrationId]: {
            isLoading: false,
            error: apiError,
            changes: [],
            hasConflicts: false,
            canApply: false,
          },
        },
      }))
      throw apiError
    }
  },

  resolveChange: (integrationId, changeId, resolution, customValue) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData
      const updatedChanges = current.changes.map((change) =>
        change.id === changeId
          ? { ...change, resolved: true, resolution, custom_value: customValue }
          : change,
      )
      const allResolved = updatedChanges.every((change) => change.resolved)

      return {
        syncData: {
          ...state.syncData,
          [integrationId]: {
            ...current,
            changes: updatedChanges,
            canApply: allResolved,
          },
        },
      }
    })
  },

  bulkResolve: (integrationId, resolution) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData
      const updatedChanges = current.changes.map((change) => ({
        ...change,
        resolved: true,
        resolution,
        custom_value: undefined,
      }))
      return {
        syncData: {
          ...state.syncData,
          [integrationId]: {
            ...current,
            changes: updatedChanges,
            canApply: true,
          },
        },
      }
    })
  },

  bulkResolveAll: (resolution) => {
    set((state) => {
      const updatedSyncData = Object.fromEntries(
        Object.entries(state.syncData).map(([id, data]) => [
          id,
          {
            ...data,
            changes: data.changes.map((change) => ({
              ...change,
              resolved: true,
              resolution,
              custom_value: undefined,
            })),
            canApply: true,
          },
        ]),
      )
      return { syncData: updatedSyncData }
    })
  },

  resetResolutions: (integrationId) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData
      const updatedChanges = current.changes.map(stripResolution)
      return {
        syncData: {
          ...state.syncData,
          [integrationId]: {
            ...current,
            changes: updatedChanges,
            canApply: false,
          },
        },
      }
    })
  },

  resetResolutionsAll: () => {
    set((state) => {
      const updatedSyncData = Object.fromEntries(
        Object.entries(state.syncData).map(([id, data]) => [
          id,
          {
            ...data,
            changes: data.changes.map(stripResolution),
            canApply: false,
          },
        ]),
      )
      return { syncData: updatedSyncData }
    })
  },

  resetIntegration: (integrationId) => {
    set((state) => ({ syncData: removeKey(state.syncData, integrationId) }))
  },

  appendHistoryEvent: (integrationId, event) => {
    set((state) => ({
      syncHistory: {
        ...state.syncHistory,
        [integrationId]: [event, ...(state.syncHistory[integrationId] ?? [])],
      },
    }))
  },

  getSyncData: (integrationId) => {
    return get().syncData[integrationId] ?? defaultSyncData
  },

  getSyncEventById: (eventId) => {
    return Object.values(get().syncHistory)
      .flat()
      .find((event) => event.id === eventId)
  },
}))

export function useSyncDataFor(
  integrationId: string | undefined,
): PerIntegrationSyncData {
  return useSyncStore((state) =>
    integrationId ? (state.syncData[integrationId] ?? defaultSyncData) : defaultSyncData,
  )
}

export function useHistoryFor(integrationId: string | undefined): SyncEvent[] {
  return useSyncStore((state) =>
    integrationId ? (state.syncHistory[integrationId] ?? EMPTY_HISTORY) : EMPTY_HISTORY,
  )
}
