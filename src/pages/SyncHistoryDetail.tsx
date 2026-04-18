import { useParams, useNavigate } from "react-router-dom"
import { useSyncStore } from "../stores/syncStore"
import { useIntegrationStore } from "../stores/integrationStore"
import { StatusBadge } from "../components/StatusBadge"
import { ResolutionRow } from "../components/ResolutionRow"
import { formatTimestamp } from "../utils/format"


export function SyncHistoryDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const { getSyncEventById } = useSyncStore()
  const { integrations } = useIntegrationStore()

  const event = eventId ? getSyncEventById(eventId) : undefined
  const integration = event
    ? integrations.find((i) => i.id === event.integration_id)
    : undefined

  if (!event) {
    return (
      <div className="w-full">
        <button
          onClick={() => navigate("/logs")}
          className="flex items-center gap-2 text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors mb-8"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Logs
        </button>
        <div className="bg-surface-container-lowest rounded-2xl p-12 ambient-shadow text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-4">
            search_off
          </span>
          <p className="font-headline text-xl font-bold text-on-surface mb-2">Event not found</p>
          <p className="font-body text-sm text-on-surface-variant">
            This sync event may have been cleared from state.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-label text-on-surface-variant mb-6">
        <button
          onClick={() => navigate("/logs")}
          className="hover:text-on-surface transition-colors"
        >
          Logs
        </button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Sync Event Detail</span>
      </div>

      {/* Event header card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {integration?.icon && (
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-2xl shrink-0">
                {integration.icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                  {event.application_name}
                </h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="font-body text-sm text-on-surface-variant">
                {formatTimestamp(event.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm shrink-0">
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-0.5">Event ID</p>
              <p className="font-body text-xs text-on-surface font-mono">{event.id}</p>
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-0.5">Version</p>
              <p className="font-body text-sm font-bold text-on-surface">v{event.version}</p>
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-0.5">By</p>
              <p className="font-body text-sm text-on-surface">{event.user ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              change_circle
            </span>
            <span className="font-label text-xs text-on-surface-variant">Changes Applied</span>
            <span className="font-label text-sm font-bold text-on-surface">
              {event.changes_applied}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              warning
            </span>
            <span className="font-label text-xs text-on-surface-variant">Conflicts Resolved</span>
            <span className="font-label text-sm font-bold text-on-surface">
              {event.conflicts_resolved}
            </span>
          </div>
          {event.details && (
            <p className="font-body text-xs text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg w-full mt-2">
              {event.details}
            </p>
          )}
        </div>
      </div>

      {/* Resolution audit trail */}
      {event.resolutions && event.resolutions.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
          <div className="mb-5">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-1">
              Resolution Audit Trail
            </h2>
            <p className="font-body text-sm text-on-surface-variant">
              {event.resolutions.length} field{event.resolutions.length !== 1 ? "s" : ""} reviewed —
              decisions recorded at {formatTimestamp(event.timestamp)} by {event.user ?? "system"}
            </p>
          </div>

          <div className="space-y-3">
            {event.resolutions.map((resolution, index) => (
              <ResolutionRow key={index} resolution={resolution} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-8 ambient-shadow text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
            auto_mode
          </span>
          <p className="font-headline text-base font-bold text-on-surface mb-1">
            No manual resolutions
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            All changes in this sync were applied automatically — no conflicts required review.
          </p>
        </div>
      )}
    </div>
  )
}

