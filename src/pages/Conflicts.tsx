import { useNavigate } from "react-router-dom"
import { useSyncStore } from "../stores/syncStore"
import { useToast } from "../hooks/useToast"
import { useConflictActions } from "../hooks/useConflictActions"
import { Toast } from "../components/Toast"
import { ConflictResolution } from "../components/ConflictResolution"
import { BulkResolutionActions } from "../components/BulkResolutionActions"

export function Conflicts() {
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()
  const { resolveChange, bulkResolve, bulkResolveAll, resetResolutions, resetResolutionsAll } = useSyncStore()

  const { conflictGroups, totalChanges, totalResolved, allResolved, applyIntegration, applyAll } =
    useConflictActions({
      onSuccess: (msg) => showToast(msg, "success"),
      onWarning: (msg) => showToast(msg, "warning"),
    })

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
          <p className="font-headline text-xl font-bold text-on-surface mb-2">
            No conflicts
          </p>
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
      <div className="sticky top-0 z-10 bg-surface -mx-8 px-8 pt-6 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-1">
              Conflicts
            </h1>
            <p className="font-body text-sm text-on-surface-variant">
              {totalChanges} change{totalChanges !== 1 ? "s" : ""} across{" "}
              {conflictGroups.length} integration
              {conflictGroups.length !== 1 ? "s" : ""} — {totalResolved} of{" "}
              {totalChanges} resolved
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
                  <span className="text-2xl leading-none">
                    {integration.icon}
                  </span>
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
                  <BulkResolutionActions
                    compact
                    localLabel="All Local"
                    externalLabel="All External"
                    onKeepLocal={() => bulkResolve(integration.id, "keep_current")}
                    onAcceptExternal={() => bulkResolve(integration.id, "accept_new")}
                    onReset={() => resetResolutions(integration.id)}
                  />
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
                    resolveChange(
                      integration.id,
                      changeId,
                      resolution,
                      customValue,
                    )
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
            <BulkResolutionActions
              resetLabel="Reset All"
              onKeepLocal={() => bulkResolveAll("keep_current")}
              onAcceptExternal={() => bulkResolveAll("accept_new")}
              onReset={resetResolutionsAll}
            />
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
