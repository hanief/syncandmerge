import { useState } from 'react';
import { useIntegrationStore } from '../stores/integrationStore';
import { useSyncStore } from '../stores/syncStore';

export function useSyncAll() {
  const { integrations, updateIntegrationStatus, updateIntegration } = useIntegrationStore();
  const { fetchSyncData } = useSyncStore();
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const syncAll = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);

    integrations.forEach((i) => updateIntegrationStatus(i.id, 'syncing'));

    await Promise.allSettled(
      integrations.map(async (integration) => {
        try {
          const { hasConflicts } = await fetchSyncData(integration.id, integration.application_id);
          updateIntegration(integration.id, {
            status: hasConflicts ? 'conflict' : 'synced',
            last_sync: new Date().toISOString(),
            version: integration.version + 1,
          });
        } catch {
          updateIntegrationStatus(integration.id, 'error');
        }
      }),
    );

    setIsSyncingAll(false);
  };

  return { syncAll, isSyncingAll };
}
