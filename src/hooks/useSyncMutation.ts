import { useMutation } from '@tanstack/react-query';
import { useSyncStore } from '../stores/syncStore';
import { useIntegrationStore } from '../stores/integrationStore';
import type { ApplicationId } from '../types';

interface SyncMutationParams {
  integrationId: string;
  applicationId: ApplicationId;
}

/**
 * React Query mutation hook for sync operations
 * Integrates with Zustand stores for state management
 */
export function useSyncMutation() {
  const { fetchSyncData } = useSyncStore();
  const { updateIntegrationStatus, updateIntegration } = useIntegrationStore();

  const syncMutation = useMutation({
    mutationFn: async ({ integrationId, applicationId }: SyncMutationParams) => {
      return await fetchSyncData(integrationId, applicationId);
    },
    onMutate: ({ integrationId }) => {
      updateIntegrationStatus(integrationId, 'syncing');
    },
    onSuccess: (_, { integrationId }) => {
      const { hasConflicts } = useSyncStore.getState().getSyncData(integrationId);
      const integration = useIntegrationStore.getState().integrations.find(
        (i) => i.id === integrationId,
      );

      if (integration) {
        updateIntegration(integration.id, {
          status: hasConflicts ? 'conflict' : 'synced',
          last_sync: new Date().toISOString(),
          version: integration.version + 1,
        });
      }
    },
    onError: (_, { integrationId }) => {
      updateIntegrationStatus(integrationId, 'error');
    },
  });

  return syncMutation;
}
