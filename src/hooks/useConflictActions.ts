import { useCallback } from "react"
import { useIntegrationStore } from "../stores/integrationStore"
import { useSyncStore } from "../stores/syncStore"
import { createSyncEvent } from "../utils/syncEvent"
import type { Integration, SyncChange } from "../types"

interface ConflictGroup {
  integration: Integration
  data: {
    changes: SyncChange[]
    canApply: boolean
  }
}

export function useConflictStats() {
  const integrations = useIntegrationStore((state) => state.integrations)
  const syncData = useSyncStore((state) => state.syncData)

  const conflictGroups: ConflictGroup[] = integrations.flatMap((integration) => {
    const data = syncData[integration.id]
    if (!data || data.changes.length === 0) return []
    return [{ integration, data: { changes: data.changes, canApply: data.canApply } }]
  })

  const totalChanges = conflictGroups.reduce(
    (sum, { data }) => sum + data.changes.length,
    0,
  )
  const totalResolved = conflictGroups.reduce(
    (sum, { data }) => sum + data.changes.filter((c) => c.resolved).length,
    0,
  )
  const allResolved = totalChanges > 0 && totalResolved === totalChanges

  return { conflictGroups, totalChanges, totalResolved, allResolved }
}

interface ApplyConflictsCallbacks {
  onSuccess: (message: string) => void
  onWarning: (message: string) => void
}

export function useApplyConflicts({
  onSuccess,
  onWarning,
}: ApplyConflictsCallbacks) {
  const { conflictGroups, allResolved } = useConflictStats()
  const updateIntegrationStatus = useIntegrationStore(
    (state) => state.updateIntegrationStatus,
  )
  const updateIntegration = useIntegrationStore(
    (state) => state.updateIntegration,
  )
  const appendHistoryEvent = useSyncStore((state) => state.appendHistoryEvent)
  const resetIntegration = useSyncStore((state) => state.resetIntegration)

  const applyIntegration = useCallback(
    (integrationId: string) => {
      const group = conflictGroups.find(
        ({ integration }) => integration.id === integrationId,
      )
      if (!group) return

      if (!group.data.canApply) {
        onWarning("Resolve all conflicts in this integration first")
        return
      }

      appendHistoryEvent(
        group.integration.id,
        createSyncEvent({
          integration: group.integration,
          changes: group.data.changes,
        }),
      )
      updateIntegrationStatus(group.integration.id, "synced")
      resetIntegration(group.integration.id)
      onSuccess(
        `Applied ${group.data.changes.length} changes for ${group.integration.application_name}`,
      )
    },
    [
      conflictGroups,
      appendHistoryEvent,
      updateIntegrationStatus,
      resetIntegration,
      onSuccess,
      onWarning,
    ],
  )

  const applyAll = useCallback(() => {
    if (!allResolved) {
      onWarning("Resolve all conflicts before applying")
      return
    }

    conflictGroups.forEach(({ integration, data }) => {
      appendHistoryEvent(integration.id, createSyncEvent({ integration, changes: data.changes }))
      updateIntegration(integration.id, { status: "synced" })
      resetIntegration(integration.id)
    })

    onSuccess(`Applied all changes across ${conflictGroups.length} integrations`)
  }, [
    allResolved,
    conflictGroups,
    appendHistoryEvent,
    updateIntegration,
    resetIntegration,
    onSuccess,
    onWarning,
  ])

  return { applyIntegration, applyAll }
}
