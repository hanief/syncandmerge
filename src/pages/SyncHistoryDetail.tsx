import { useParams, useNavigate } from "react-router-dom"
import { useSyncStore } from "../stores/syncStore"
import { useIntegrationStore } from "../stores/integrationStore"
import { StatusBadge } from "../components/StatusBadge"
import { formatTimestamp, formatFieldName } from "../utils/format"
import { renderSyncValue } from "../utils/syncValue"
import { CHANGE_STYLES } from "../constants/changeStyles"
import type { SyncChangeResolution } from "../types"


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

interface ResolutionRowProps {
  resolution: SyncChangeResolution
}

function ResolutionRow({ resolution }: ResolutionRowProps) {
  const changeStyle = CHANGE_STYLES[resolution.change_type]

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/15">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`material-symbols-outlined text-[16px] ${changeStyle.icon}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {changeStyle.iconName}
        </span>
        <span className="font-label text-sm font-bold text-on-surface flex-1">
          {formatFieldName(resolution.field_name)}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-label text-[10px] font-semibold uppercase tracking-wide ${changeStyle.badge}`}
        >
          {resolution.change_type}
        </span>
      </div>

      <div className="ml-0 sm:ml-6">
        <ValueDisplay
          changeType={resolution.change_type}
          resolution={resolution.resolution}
          currentValue={resolution.current_value}
          newValue={resolution.new_value}
          customValue={resolution.custom_value}
        />
      </div>

      <p className="font-body text-[10px] text-on-surface-variant mt-2.5 ml-0 sm:ml-6">
        Resolved by{" "}
        <span className="font-semibold text-on-surface">{resolution.resolved_by}</span>
      </p>
    </div>
  )
}

interface ValueDisplayProps {
  changeType: SyncChangeResolution["change_type"]
  resolution: SyncChangeResolution["resolution"]
  currentValue: SyncChangeResolution["current_value"]
  newValue: SyncChangeResolution["new_value"]
  customValue?: SyncChangeResolution["custom_value"]
}

function ValueDisplay({ changeType, resolution, currentValue, newValue, customValue }: ValueDisplayProps) {
  if (changeType === "ADD") {
    if (resolution === "accept_new") {
      return (
        <div className="bg-[#eef8f3] border border-[#22c55e]/30 rounded-lg p-2.5">
          <p className="font-label text-[10px] font-semibold text-[#1e6041] uppercase tracking-wide mb-1">
            New value added
          </p>
          <p className="font-body text-xs text-[#1e6041] font-medium wrap-break-word">
            {renderSyncValue(newValue)}
          </p>
        </div>
      )
    }
    return (
      <div className="bg-surface-container-highest rounded-lg p-2.5">
        <p className="font-body text-xs text-on-surface-variant italic">
          No changes — new value was not applied
        </p>
      </div>
    )
  }

  if (changeType === "DELETE") {
    if (resolution === "accept_new") {
      return (
        <div className="bg-error-container/40 border border-error/20 rounded-lg p-2.5">
          <p className="font-label text-[10px] font-semibold text-on-error-container uppercase tracking-wide mb-1">
            Value removed
          </p>
          <p className="font-body text-xs text-error wrap-break-word line-through">
            {renderSyncValue(currentValue)}
          </p>
        </div>
      )
    }
    return (
      <div className="bg-surface-container-highest rounded-lg p-2.5">
        <p className="font-body text-xs text-on-surface-variant italic">
          No changes — deletion was not applied
        </p>
      </div>
    )
  }

  // UPDATE
  if (resolution === "custom" && customValue !== undefined) {
    return (
      <div className="bg-tertiary-fixed rounded-lg p-2.5">
        <p className="font-label text-[10px] font-semibold text-on-tertiary-container uppercase tracking-wide mb-1">
          Custom value applied
        </p>
        <p className="font-body text-xs text-on-tertiary-container wrap-break-word">
          {renderSyncValue(customValue)}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        className={`rounded-lg p-2.5 ${
          resolution === "keep_current"
            ? "bg-tertiary-fixed border border-on-tertiary-container/20"
            : "bg-surface-container-highest"
        }`}
      >
        <p
          className={`font-label text-[10px] font-semibold uppercase tracking-wide mb-1 ${
            resolution === "keep_current" ? "text-on-tertiary-container" : "text-on-surface-variant"
          }`}
        >
          Local value{resolution === "keep_current" ? " — kept" : ""}
        </p>
        <p
          className={`font-body text-xs wrap-break-word ${
            resolution === "keep_current"
              ? "text-on-tertiary-container font-medium"
              : "text-on-surface"
          }`}
        >
          {renderSyncValue(currentValue)}
        </p>
      </div>
      <div
        className={`rounded-lg p-2.5 ${
          resolution === "accept_new"
            ? "bg-[#eef8f3] border border-[#22c55e]/30"
            : "bg-surface-container-highest"
        }`}
      >
        <p
          className={`font-label text-[10px] font-semibold uppercase tracking-wide mb-1 ${
            resolution === "accept_new" ? "text-[#1e6041]" : "text-on-surface-variant"
          }`}
        >
          External value{resolution === "accept_new" ? " — accepted" : ""}
        </p>
        <p
          className={`font-body text-xs wrap-break-word ${
            resolution === "accept_new" ? "text-[#1e6041] font-medium" : "text-on-surface"
          }`}
        >
          {renderSyncValue(newValue)}
        </p>
      </div>
    </div>
  )
}
