import { useIntegrationStore } from '../stores/integrationStore';
import { useSyncStore } from '../stores/syncStore';
import { createSyncEvent } from '../utils/syncEvent';

interface ConflictActionsOptions {
  onSuccess: (message: string) => void;
  onWarning: (message: string) => void;
}

export function useConflictActions({ onSuccess, onWarning }: ConflictActionsOptions) {
  const { integrations, updateIntegrationStatus, updateIntegration } = useIntegrationStore();
  const { syncData, appendHistoryEvent, resetIntegration } = useSyncStore();

  const conflictGroups = integrations
    .map((integration) => ({ integration, data: syncData[integration.id] }))
    .filter(({ data }) => data && data.changes.length > 0);

  const totalChanges = conflictGroups.reduce((sum, { data }) => sum + data.changes.length, 0);
  const totalResolved = conflictGroups.reduce(
    (sum, { data }) => sum + data.changes.filter((c) => c.resolved).length,
    0,
  );
  const allResolved = totalChanges > 0 && totalResolved === totalChanges;

  const applyIntegration = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    const data = syncData[integrationId];
    if (!integration || !data) return;

    if (!data.canApply) {
      onWarning('Resolve all conflicts in this integration first');
      return;
    }

    appendHistoryEvent(integration.id, createSyncEvent({ integration, changes: data.changes }));
    updateIntegrationStatus(integration.id, 'synced');
    resetIntegration(integration.id);
    onSuccess(`Applied ${data.changes.length} changes for ${integration.application_name}`);
  };

  const applyAll = () => {
    if (!allResolved) {
      onWarning('Resolve all conflicts before applying');
      return;
    }

    conflictGroups.forEach(({ integration, data }) => {
      appendHistoryEvent(integration.id, createSyncEvent({ integration, changes: data.changes }));
      updateIntegration(integration.id, { status: 'synced' });
      resetIntegration(integration.id);
    });

    onSuccess(`Applied all changes across ${conflictGroups.length} integrations`);
  };

  return { conflictGroups, totalChanges, totalResolved, allResolved, applyIntegration, applyAll };
}
