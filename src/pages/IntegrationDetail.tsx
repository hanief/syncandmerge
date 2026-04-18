import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  useIntegrationById,
  useIntegrationStore,
} from "../stores/integrationStore"
import {
  useSyncStore,
  useSyncDataFor,
  useHistoryFor,
} from "../stores/syncStore"
import { useSyncMutation } from "../hooks/useSyncMutation"
import { useToast } from "../hooks/useToast"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { ConflictResolution } from "../components/ConflictResolution"
import { SyncHistory } from "../components/SyncHistory"
import { StatusBadge } from "../components/StatusBadge"
import { Toast } from "../components/Toast"
import { formatDate } from "../utils/format"
import { createSyncEvent } from "../utils/syncEvent"
import { pluralize } from "../utils/format"

export function IntegrationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const integration = useIntegrationById(id)
  const updateIntegrationStatus = useIntegrationStore(
    (state) => state.updateIntegrationStatus,
  )
  const resolveChange = useSyncStore((state) => state.resolveChange)
  const resetIntegration = useSyncStore((state) => state.resetIntegration)
  const appendHistoryEvent = useSyncStore((state) => state.appendHistoryEvent)

  const syncData = useSyncDataFor(id)
  const history = useHistoryFor(id)
  const syncMutation = useSyncMutation()

  const { isLoading, error, changes, hasConflicts, canApply } = syncData
  const viewMode: "overview" | "resolve" =
    isLoading || changes.length > 0 ? "resolve" : "overview"

  useEffect(() => {
    if (!integration) navigate("/")
  }, [integration, navigate])

  if (!integration) {
    return <LoadingSpinner message="Loading integration..." />
  }

  const handleSyncNow = async () => {
    if (!integration.application_id) {
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
        applicationId: integration.application_id,
      })
      showToast("Sync data fetched successfully", "success")
    } catch {
      showToast("Sync failed. Please try again.", "error")
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

    appendHistoryEvent(
      integration.id,
      createSyncEvent({ integration, changes }),
    )
    updateIntegrationStatus(integration.id, "synced")
    showToast(
      `Successfully applied ${changes.length} ${pluralize(changes.length, "change")} to ${integration.application_name}`,
      "success",
    )
    resetIntegration(integration.id)
  }

  const handleCancel = () => {
    updateIntegrationStatus(integration.id, "synced")
    resetIntegration(integration.id)
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

          <div className="flex items-center gap-3 mx-auto md:mx-0">
            <button
              onClick={handleSyncNow}
              disabled={syncMutation.isPending}
              className="px-8 py-3.5 rounded-xl font-headline text-base font-bold shadow-lg shadow-on-tertiary-container/20 hover:shadow-on-tertiary-container/30 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary"
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

      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <OverviewView
            key="overview"
            error={error}
            history={history}
            onRetry={() =>
              syncMutation.mutate({
                integrationId: integration.id,
                applicationId: integration.application_id,
              })
            }
          />
        ) : (
          <ResolveView
            key="resolve"
            integrationId={integration.id}
            isLoading={isLoading}
            changes={changes}
            onResolve={(changeId, resolution, customValue) =>
              resolveChange(integration.id, changeId, resolution, customValue)
            }
          />
        )}
      </AnimatePresence>

      {showBottomBar && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-50 bg-surface border-t border-outline-variant">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-end gap-3">
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

interface OverviewViewProps {
  error: ReturnType<typeof useSyncDataFor>["error"]
  history: ReturnType<typeof useHistoryFor>
  onRetry: () => void
}

function OverviewView({ error, history, onRetry }: OverviewViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
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

interface ResolveViewProps {
  integrationId: string
  isLoading: boolean
  changes: ReturnType<typeof useSyncDataFor>["changes"]
  onResolve: React.ComponentProps<typeof ConflictResolution>["onResolve"]
}

function ResolveView({
  integrationId,
  isLoading,
  changes,
  onResolve,
}: ResolveViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? (
        <LoadingSpinner message="Fetching sync data..." />
      ) : (
        <ConflictResolution
          integrationId={integrationId}
          changes={changes}
          onResolve={onResolve}
        />
      )}
    </motion.div>
  )
}
