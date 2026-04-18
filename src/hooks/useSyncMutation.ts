import { useMutation } from '@tanstack/react-query';
import { useSyncStore } from '../stores/syncStore';
import { useIntegrationStore } from '../stores/integrationStore';
import type { ApplicationId } from '../types';

interface SyncMutationParams {
  integrationId: string;
  applicationId: ApplicationId;
}

export function useSyncMutation() {
  const { fetchSyncData } = useSyncStore();
  const { integrations, updateIntegrationStatus, updateIntegration } = useIntegrationStore();

  const syncMutation = useMutation({
    mutationFn: ({ integrationId, applicationId }: SyncMutationParams) =>
      fetchSyncData(integrationId, applicationId),
    onMutate: ({ integrationId }) => {
      updateIntegrationStatus(integrationId, 'syncing');
    },
    onSuccess: ({ hasConflicts }, { integrationId }) => {
      const integration = integrations.find((i) => i.id === integrationId);
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
