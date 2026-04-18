import { useState, useCallback } from 'react';
import { ApiService } from '../services/api';
import type { ApplicationId, ApiError, SyncState } from '../types';

/**
 * Custom hook for managing sync operations
 */
export function useSync() {
  const [state, setState] = useState<SyncState>({
    isLoading: false,
    error: null,
    changes: [],
    hasConflicts: false,
    canApply: false,
  });

  /**
   * Fetch sync data from the API
   */
  const fetchSyncData = useCallback(async (applicationId: ApplicationId) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const data = await ApiService.fetchSyncData(applicationId);

      // Check if there are any conflicts (changes that require manual review)
      const hasConflicts = data.sync_approval.changes.some(
        (change) => change.change_type === 'UPDATE'
      );

      setState({
        isLoading: false,
        error: null,
        changes: data.sync_approval.changes,
        hasConflicts,
        canApply: !hasConflicts, // Can auto-apply if no conflicts
      });

      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        isLoading: false,
        error: apiError,
        changes: [],
        hasConflicts: false,
        canApply: false,
      });

      throw error;
    }
  }, []);

  /**
   * Resolve a specific change
   */
  const resolveChange = useCallback(
    (changeId: string, resolution: 'keep_current' | 'accept_new' | 'custom', customValue?: any) => {
      setState((prev) => {
        const updatedChanges = prev.changes.map((change) => {
          if (change.id === changeId) {
            return {
              ...change,
              resolved: true,
              resolution,
              custom_value: customValue,
            };
          }
          return change;
        });

        // Check if all conflicts are resolved
        const allResolved = updatedChanges.every((change) => change.resolved || change.change_type !== 'UPDATE');

        return {
          ...prev,
          changes: updatedChanges,
          canApply: allResolved,
        };
      });
    },
    []
  );

  /**
   * Reset sync state
   */
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      changes: [],
      hasConflicts: false,
      canApply: false,
    });
  }, []);

  return {
    ...state,
    fetchSyncData,
    resolveChange,
    resetState,
  };
}
