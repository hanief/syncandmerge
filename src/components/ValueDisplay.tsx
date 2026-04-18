import { renderSyncValue } from "../utils/syncValue"
import type { SyncChangeResolution } from "../types"

export interface ValueDisplayProps {
  changeType: SyncChangeResolution["change_type"]
  resolution: SyncChangeResolution["resolution"]
  currentValue: SyncChangeResolution["current_value"]
  newValue: SyncChangeResolution["new_value"]
  customValue?: SyncChangeResolution["custom_value"]
}

export function ValueDisplay({ changeType, resolution, currentValue, newValue, customValue }: ValueDisplayProps) {
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
