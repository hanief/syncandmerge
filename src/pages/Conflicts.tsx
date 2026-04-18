import { useNavigate } from "react-router-dom"
import { useIntegrationStore } from "../stores/integrationStore"
import { useSyncStore } from "../stores/syncStore"
import { useToast } from "../hooks/useToast"
import { Toast } from "../components/Toast"
import { ConflictResolution } from "../components/ConflictResolution"
import type { SyncEvent } from "../types"

export function Conflicts() {
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()
  const { integrations, updateIntegrationStatus, updateIntegration } = useIntegrationStore()
  const {
    syncData,
    resolveChange,
    bulkResolve,
    bulkResolveAll,
    resetResolutions,
    resetResolutionsAll,
    resetIntegration,
    appendHistoryEvent,
  } = useSyncStore()

  // Only integrations with pending changes
  const conflictGroups = integrations
    .map((integration) => ({
      integration,
      data: syncData[integration.id],
    }))
    .filter(({ data }) => data && data.changes.length > 0)

  const totalChanges = conflictGroups.reduce((sum, { data }) => sum + data.changes.length, 0)
  const totalResolved = conflictGroups.reduce(
    (sum, { data }) => sum + data.changes.filter((c) => c.resolved).length,
    0,
  )
  const allResolved = totalChanges > 0 && totalResolved === totalChanges

  const applyIntegration = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId)
    const data = syncData[integrationId]
    if (!integration || !data) return

    if (!data.canApply) {
      showToast("Resolve all conflicts in this integration first", "warning")
      return
    }

    const now = new Date()
    const event: SyncEvent = {
      id: `sync-${now.getTime()}-${integrationId}`,
      integration_id: integration.id,
      application_name: integration.application_name,
      timestamp: now.toISOString(),
      status: "success",
      changes_applied: data.changes.length,
      conflicts_resolved: data.changes.filter((c) => c.resolved).length,
      version: integration.version,
      user: "admin@company.com",
    }

    appendHistoryEvent(integration.id, event)
    updateIntegrationStatus(integration.id, "synced")
    resetIntegration(integration.id)
    showToast(`Applied ${data.changes.length} changes for ${integration.application_name}`, "success")
  }

  const applyAll = () => {
    if (!allResolved) {
      showToast("Resolve all conflicts before applying", "warning")
      return
    }

    const now = new Date()
    conflictGroups.forEach(({ integration, data }) => {
      const event: SyncEvent = {
        id: `sync-${now.getTime()}-${integration.id}`,
        integration_id: integration.id,
        application_name: integration.application_name,
        timestamp: now.toISOString(),
        status: "success",
        changes_applied: data.changes.length,
        conflicts_resolved: data.changes.filter((c) => c.resolved).length,
        version: integration.version,
        user: "admin@company.com",
      }
      appendHistoryEvent(integration.id, event)
      updateIntegration(integration.id, { status: "synced" })
      resetIntegration(integration.id)
    })

    showToast(`Applied all changes across ${conflictGroups.length} integrations`, "success")
  }

  if (conflictGroups.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            Conflicts
          </h1>
          <p className="font-body text-base text-on-surface-variant">
            Field-level conflicts requiring manual resolution.
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-12 ambient-shadow text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-4">
            check_circle
          </span>
          <p className="font-headline text-xl font-bold text-on-surface mb-2">No conflicts</p>
          <p className="font-body text-sm text-on-surface-variant">
            All integrations are in sync. Run a sync to check for new changes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-24">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Header */}
      <div className="sticky top-4 z-10 bg-surface -mx-8 px-8 pt-6 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-1">
              Conflicts
            </h1>
            <p className="font-body text-sm text-on-surface-variant">
              {totalChanges} change{totalChanges !== 1 ? "s" : ""} across{" "}
              {conflictGroups.length} integration{conflictGroups.length !== 1 ? "s" : ""} —{" "}
              {totalResolved} of {totalChanges} resolved
            </p>
          </div>
        </div>
      </div>

      {/* Integration groups */}
      <div className="space-y-6">
        {conflictGroups.map(({ integration, data }) => {
          const groupResolved = data.changes.filter((c) => c.resolved).length
          const groupTotal = data.changes.length
          const groupCanApply = data.canApply

          return (
            <div
              key={integration.id}
              className="bg-surface-container-lowest rounded-2xl ambient-shadow overflow-hidden"
            >
              {/* Integration group header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-outline-variant/20">
                <button
                  onClick={() => navigate(`/integrations/${integration.id}`)}
                  className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left"
                >
                  <span className="text-2xl leading-none">{integration.icon}</span>
                  <div>
                    <span className="font-label text-base font-bold text-on-surface">
                      {integration.application_name}
                    </span>
                    <p className="font-body text-xs text-on-surface-variant">
                      {groupResolved}/{groupTotal} resolved
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => bulkResolve(integration.id, "keep_current")}
                    className="px-3 py-1.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
                  >
                    All Local
                  </button>
                  <button
                    onClick={() => bulkResolve(integration.id, "accept_new")}
                    className="px-3 py-1.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
                  >
                    All External
                  </button>
                  <button
                    onClick={() => resetResolutions(integration.id)}
                    className="px-3 py-1.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => applyIntegration(integration.id)}
                    disabled={!groupCanApply}
                    className={`px-4 py-1.5 rounded-lg font-label text-xs font-bold transition-colors ${
                      groupCanApply
                        ? "bg-on-tertiary-container text-on-primary hover:opacity-90"
                        : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Conflicts for this integration */}
              <div className="p-4">
                <ConflictResolution
                  changes={data.changes}
                  onResolve={(changeId, resolution, customValue) =>
                    resolveChange(integration.id, changeId, resolution, customValue)
                  }
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed bottom global action bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-50 bg-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <button
              onClick={() => bulkResolveAll("keep_current")}
              className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
            >
              Accept All Local
            </button>
            <button
              onClick={() => bulkResolveAll("accept_new")}
              className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
            >
              Accept All External
            </button>
            <button
              onClick={resetResolutionsAll}
              className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
            >
              Reset All
            </button>
          </div>
          <button
            onClick={applyAll}
            disabled={!allResolved}
            className={`px-6 py-3 rounded-xl font-label font-bold text-sm transition-colors ${
              allResolved
                ? "bg-on-tertiary-container text-on-primary hover:opacity-90"
                : "bg-surface-container text-on-surface-variant cursor-not-allowed"
            }`}
          >
            Apply All Changes
          </button>
        </div>
      </div>
    </div>
  )
}
