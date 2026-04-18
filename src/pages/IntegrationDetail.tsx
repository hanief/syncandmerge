import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useIntegrationStore } from "../stores/integrationStore"
import { useSyncStore } from "../stores/syncStore"
import { useSyncMutation } from "../hooks/useSyncMutation"
import { useToast } from "../hooks/useToast"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { ConflictResolution } from "../components/ConflictResolution"
import { SyncHistory } from "../components/SyncHistory"
import { StatusBadge } from "../components/StatusBadge"
import { Toast } from "../components/Toast"
import { formatDate } from "../utils/format"
import type { ApplicationId, SyncEvent } from "../types"

type ViewMode = "overview" | "resolve"

export function IntegrationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const { getIntegrationById, updateIntegrationStatus } = useIntegrationStore()
  const {
    getSyncData,
    resolveChange,
    bulkResolve,
    resetResolutions,
    resetIntegration,
    appendHistoryEvent,
    syncHistory,
  } = useSyncStore()
  const syncMutation = useSyncMutation()

  const integration = id ? getIntegrationById(id) : undefined
  const syncData = id ? getSyncData(id) : undefined
  const { isLoading, error, changes, hasConflicts, canApply } = syncData ?? {
    isLoading: false,
    error: null,
    changes: [],
    hasConflicts: false,
    canApply: false,
  }
  const history = id ? (syncHistory[id] ?? []) : []

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (!id) return "overview"
    const existing = useSyncStore.getState().getSyncData(id)
    return existing.changes.length > 0 ? "resolve" : "overview"
  })

  useEffect(() => {
    if (!integration) {
      navigate("/")
    }
  }, [integration, navigate])

  if (!integration) {
    return <LoadingSpinner message="Loading integration..." />
  }

  const handleSyncNow = async () => {
    if (!integration || !integration.application_id) {
      showToast("Invalid application ID", "error")
      return
    }

    if (syncMutation.isPending) {
      showToast("Sync already in progress", "warning")
      return
    }

    try {
      await syncMutation.mutateAsync({
        integrationId: integration.id,
        applicationId: integration.application_id as ApplicationId,
      })
      showToast("Sync data fetched successfully", "success")
      setViewMode("resolve")
    } catch (err) {
      showToast("Sync failed. Please try again.", "error")
      setViewMode("overview")
      console.error("Sync failed:", err)
    }
  }

  const handleApplyChanges = () => {
    if (changes.length === 0) {
      showToast("No changes to apply", "warning")
      return
    }

    if (hasConflicts && !canApply) {
      showToast("Please resolve all conflicts before applying", "warning")
      return
    }

    const now = new Date()
    const event: SyncEvent = {
      id: `sync-${now.getTime()}`,
      integration_id: integration.id,
      application_name: integration.application_name,
      timestamp: now.toISOString(),
      status: "success",
      changes_applied: changes.length,
      conflicts_resolved: changes.filter((c) => c.resolved).length,
      version: integration.version,
      user: "admin@company.com",
    }

    appendHistoryEvent(integration.id, event)
    updateIntegrationStatus(integration.id, "synced")
    showToast(
      `Successfully applied ${changes.length} change${changes.length !== 1 ? "s" : ""} to ${integration.application_name}`,
      "success",
    )
    resetIntegration(integration.id)
    setViewMode("overview")
  }

  const handleCancel = () => {
    updateIntegrationStatus(integration.id, "synced")
    resetIntegration(integration.id)
    setViewMode("overview")
  }

  const renderContent = () => {
    if (viewMode === "overview") {
      return (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >
          {error ? (
            <ErrorMessage
              error={error}
              onRetry={() =>
                syncMutation.mutate({
                  integrationId: integration.id,
                  applicationId: integration.application_id as ApplicationId,
                })
              }
            />
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow flex flex-col">
              <div className="flex items-center justify-center">
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
                    sync
                  </span>
                  <p className="font-body text-on-surface-variant">
                    Click "Sync Now" to fetch latest changes
                  </p>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && <SyncHistory events={history} />}
        </motion.div>
      )
    }

    if (viewMode === "resolve") {
      return (
        <motion.div
          key="resolve"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading && <LoadingSpinner message="Fetching sync data..." />}

          {!isLoading && (
            <ConflictResolution
              changes={changes}
              onResolve={(changeId, resolution, customValue) =>
                resolveChange(integration.id, changeId, resolution, customValue)
              }
            />
          )}
        </motion.div>
      )
    }
  }

  const showBottomBar = viewMode === "resolve" && !isLoading

  return (
    <div className="w-full pb-24">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Sticky integration header — sits below the TopBar (h-16 = top-16) */}
      <div className="sticky top-0 z-10 bg-surface -mx-8 px-8 pt-6 pb-4 mb-4">
        <div className="flex items-center text-sm font-label text-on-surface-variant gap-2 mb-4">
          <button
            onClick={() => navigate("/")}
            className="hover:text-on-surface transition-colors"
          >
            Integrations
          </button>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <span className="text-on-surface font-medium">
            {integration.application_name}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-surface-container-lowest p-3 ambient-shadow flex items-center justify-center">
              <span className="text-4xl">{integration.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                  {integration.application_name} Sync
                </h2>
                {integration.status === "error" && (
                  <StatusBadge status="error" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-body text-on-surface-variant">
                  <strong>ID:</strong> {integration.id}
                </span>
                <span className="text-sm font-body text-on-surface-variant">
                  |
                </span>
                <span className="text-sm font-body text-on-surface-variant">
                  <strong>Last Successful Sync:</strong>{" "}
                  {formatDate(integration.last_sync)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncNow}
              disabled={syncMutation.isPending}
              className="px-8 py-3.5 rounded-xl font-headline text-base font-bold shadow-lg shadow-on-tertiary-container/20 hover:shadow-on-tertiary-container/30 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0D85FF", color: "white" }}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${syncMutation.isPending ? "animate-spin" : ""}`}
              >
                sync
              </span>
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

      {/* Fixed bottom action bar — only visible in resolve mode */}
      {showBottomBar && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-50 bg-surface border-t border-outline-variant">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => bulkResolve(integration.id, "keep_current")}
                className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
              >
                Accept All Local
              </button>
              <button
                onClick={() => bulkResolve(integration.id, "accept_new")}
                className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
              >
                Accept All External
              </button>
              <button
                onClick={() => resetResolutions(integration.id)}
                className="px-4 py-2.5 rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant"
              >
                Reset
              </button>
            </div>
            <button
              onClick={handleApplyChanges}
              disabled={!canApply}
              className={`px-6 py-3 rounded-xl font-label font-bold text-sm transition-colors ${
                canApply
                  ? "bg-on-tertiary-container text-on-primary hover:opacity-90"
                  : "bg-surface-container text-on-surface-variant cursor-not-allowed"
              }`}
            >
              Apply All Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl font-label font-medium text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
