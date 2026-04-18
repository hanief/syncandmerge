import { create } from 'zustand';
import type { SyncChange, SyncEvent, ApiError, ApplicationId } from '../types';
import { ApiService } from '../services/api';

interface PerIntegrationSyncData {
  isLoading: boolean;
  error: ApiError | null;
  changes: SyncChange[];
  hasConflicts: boolean;
  canApply: boolean;
}

const defaultSyncData: PerIntegrationSyncData = {
  isLoading: false,
  error: null,
  changes: [],
  hasConflicts: false,
  canApply: false,
};

interface SyncStoreState {
  syncData: Record<string, PerIntegrationSyncData>;
  syncHistory: Record<string, SyncEvent[]>;

  // Actions
  fetchSyncData: (integrationId: string, applicationId: ApplicationId) => Promise<void>;
  resolveChange: (integrationId: string, changeId: string, resolution: 'keep_current' | 'accept_new' | 'custom', customValue?: any) => void;
  bulkResolve: (integrationId: string, resolution: 'keep_current' | 'accept_new') => void;
  bulkResolveAll: (resolution: 'keep_current' | 'accept_new') => void;
  resetResolutions: (integrationId: string) => void;
  resetResolutionsAll: () => void;
  resetIntegration: (integrationId: string) => void;
  appendHistoryEvent: (integrationId: string, event: SyncEvent) => void;
  getSyncData: (integrationId: string) => PerIntegrationSyncData;
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
    }));

    try {
      const data = await ApiService.fetchSyncData(applicationId);
      const changes = data.sync_approval.changes;

      set((state) => ({
        syncData: {
          ...state.syncData,
          [integrationId]: {
            isLoading: false,
            error: null,
            changes,
            hasConflicts: changes.length > 0,
            canApply: changes.length === 0,
          },
        },
      }));
    } catch (error) {
      const apiError = error as ApiError;
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
      }));
      throw error;
    }
  },

  resolveChange: (integrationId, changeId, resolution, customValue) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData;
      const updatedChanges = current.changes.map((change) =>
        change.id === changeId
          ? { ...change, resolved: true, resolution, custom_value: customValue }
          : change,
      );
      const allResolved = updatedChanges.every((change) => change.resolved);

      return {
        syncData: {
          ...state.syncData,
          [integrationId]: { ...current, changes: updatedChanges, canApply: allResolved },
        },
      };
    });
  },

  bulkResolve: (integrationId, resolution) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData;
      const updatedChanges = current.changes.map((change) => ({
        ...change,
        resolved: true,
        resolution,
        custom_value: undefined,
      }));
      return {
        syncData: {
          ...state.syncData,
          [integrationId]: { ...current, changes: updatedChanges, canApply: true },
        },
      };
    });
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
      );
      return { syncData: updatedSyncData };
    });
  },

  resetResolutions: (integrationId) => {
    set((state) => {
      const current = state.syncData[integrationId] ?? defaultSyncData;
      const updatedChanges = current.changes.map(({ resolved: _, resolution: __, custom_value: ___, ...rest }) => rest);
      return {
        syncData: {
          ...state.syncData,
          [integrationId]: { ...current, changes: updatedChanges, canApply: false },
        },
      };
    });
  },

  resetResolutionsAll: () => {
    set((state) => {
      const updatedSyncData = Object.fromEntries(
        Object.entries(state.syncData).map(([id, data]) => [
          id,
          {
            ...data,
            changes: data.changes.map(({ resolved: _, resolution: __, custom_value: ___, ...rest }) => rest),
            canApply: false,
          },
        ]),
      );
      return { syncData: updatedSyncData };
    });
  },

  resetIntegration: (integrationId) => {
    set((state) => {
      const { [integrationId]: _, ...rest } = state.syncData;
      return { syncData: rest };
    });
  },

  appendHistoryEvent: (integrationId, event) => {
    set((state) => ({
      syncHistory: {
        ...state.syncHistory,
        [integrationId]: [event, ...(state.syncHistory[integrationId] ?? [])],
      },
    }));
  },

  getSyncData: (integrationId) => {
    return get().syncData[integrationId] ?? defaultSyncData;
  },
}));
