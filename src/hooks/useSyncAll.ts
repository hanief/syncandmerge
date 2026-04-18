import { useCallback, useRef } from "react"
import {
  useIntegrationStore,
  useIsAnySyncing,
} from "../stores/integrationStore"
import { useSyncStore } from "../stores/syncStore"

export function useSyncAll() {
  const integrations = useIntegrationStore((state) => state.integrations)
  const updateIntegrationStatus = useIntegrationStore(
    (state) => state.updateIntegrationStatus,
  )
  const updateIntegration = useIntegrationStore((state) => state.updateIntegration)
  const fetchSyncData = useSyncStore((state) => state.fetchSyncData)
  const isSyncingAll = useIsAnySyncing()
  const inFlightRef = useRef(false)

  const syncAll = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    integrations.forEach((i) => updateIntegrationStatus(i.id, "syncing"))

    const results = await Promise.allSettled(
      integrations.map((integration) =>
        fetchSyncData(integration.id, integration.application_id),
      ),
    )

    try {
      results.forEach((result, index) => {
        const integration = integrations[index]
        if (result.status === "fulfilled") {
          updateIntegration(integration.id, {
            status: result.value.hasConflicts ? "conflict" : "synced",
            last_sync: new Date().toISOString(),
            version: integration.version + 1,
          })
        } else {
          console.error(
            `Sync failed for ${integration.application_name}:`,
            result.reason,
          )
          updateIntegrationStatus(integration.id, "error")
        }
      })
    } finally {
      inFlightRef.current = false
    }
  }, [integrations, fetchSyncData, updateIntegration, updateIntegrationStatus])

  return { syncAll, isSyncingAll }
}
