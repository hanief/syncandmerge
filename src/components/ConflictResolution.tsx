import type { SyncChange } from "../types"
import { formatFieldName } from "../utils/format"

interface ConflictResolutionProps {
  changes: SyncChange[]
  onResolve: (
    changeId: string,
    resolution: "keep_current" | "accept_new" | "custom",
    customValue?: any,
  ) => void
}

export function ConflictResolution({
  changes,
  onResolve,
}: ConflictResolutionProps) {
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return "(empty)"
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  const renderCardHeader = (change: SyncChange) => (
    <div className="flex items-center gap-2 mb-3">
      <span
        className={`material-symbols-outlined text-[18px] ${change.resolved ? "text-[#22c55e]" : changeTypeColor(change.change_type)}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {change.resolved ? "check_circle" : changeTypeIcon(change.change_type)}
      </span>
      <span className="font-label text-sm font-bold text-on-surface flex-1">
        {formatFieldName(change.field_name)}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full font-label text-xs font-semibold ${changeBadgeStyle(change.change_type)}`}
      >
        {change.change_type}
      </span>
      {change.resolved && (
        <span className="px-2 py-0.5 rounded-full bg-[#eef8f3] text-[#1e6041] font-label text-xs font-semibold">
          ✓ Resolved
        </span>
      )}
    </div>
  )

  const renderUpdateCard = (change: SyncChange) => (
    <div className="grid grid-cols-2 gap-2">
      <div
        className={`rounded-lg p-3 border-2 transition-colors cursor-pointer ${
          change.resolution === "keep_current"
            ? "border-on-tertiary-container bg-surface-container-highest"
            : "border-transparent bg-surface-container-highest hover:border-on-tertiary-container/30"
        }`}
        onClick={() => onResolve(change.id, "keep_current")}
      >
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-label text-xs font-semibold text-on-surface-variant">
            Local
          </h4>
          <span
            className={`font-label text-xs font-semibold ${change.resolution === "keep_current" ? "text-on-tertiary-container" : "text-on-surface-variant"}`}
          >
            {change.resolution === "keep_current" ? "✓ Selected" : "Keep"}
          </span>
        </div>
        <div className="font-body text-xs text-on-surface p-2 bg-surface rounded break-words">
          {renderValue(change.current_value)}
        </div>
      </div>

      <div
        className={`rounded-lg p-3 border-2 transition-colors cursor-pointer ${
          change.resolution === "accept_new"
            ? "border-on-tertiary-container bg-surface-container-highest"
            : "border-transparent bg-surface-container-highest hover:border-on-tertiary-container/30"
        }`}
        onClick={() => onResolve(change.id, "accept_new")}
      >
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-label text-xs font-semibold text-on-surface-variant">
            External
          </h4>
          <span
            className={`font-label text-xs font-semibold ${change.resolution === "accept_new" ? "text-on-tertiary-container" : "text-on-surface-variant"}`}
          >
            {change.resolution === "accept_new" ? "✓ Selected" : "Accept"}
          </span>
        </div>
        <div className="font-body text-xs text-on-surface p-2 bg-surface rounded break-words">
          {renderValue(change.new_value)}
        </div>
      </div>
    </div>
  )

  const renderAddCard = (change: SyncChange) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container-highest rounded-lg p-2.5">
        <span className="font-label text-xs text-on-surface-variant mr-2">
          New:
        </span>
        <span className="font-body text-xs text-on-surface break-words">
          {renderValue(change.new_value)}
        </span>
      </div>
      <button
        onClick={() => onResolve(change.id, "keep_current")}
        className={`px-3 py-2 rounded-lg font-label text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
          change.resolution === "keep_current"
            ? "bg-error-container text-on-error-container"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">block</span>
        {change.resolution === "keep_current" ? "✓ Rejected" : "Reject"}
      </button>
      <button
        onClick={() => onResolve(change.id, "accept_new")}
        className={`px-3 py-2 rounded-lg font-label text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
          change.resolution === "accept_new"
            ? "bg-on-tertiary-container text-on-primary"
            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">
          add_circle
        </span>
        {change.resolution === "accept_new" ? "✓ Accepted" : "Accept"}
      </button>
    </div>
  )

  const renderDeleteCard = (change: SyncChange) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container-highest rounded-lg p-2.5">
        <span className="font-label text-xs text-on-surface-variant mr-2">
          Current:
        </span>
        <span
          className={`font-body text-xs break-words ${change.resolution === "accept_new" ? "line-through text-on-surface-variant" : "text-on-surface"}`}
        >
          {renderValue(change.current_value)}
        </span>
      </div>
      <button
        onClick={() => onResolve(change.id, "keep_current")}
        className={`px-3 py-2 rounded-lg font-label text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
          change.resolution === "keep_current"
            ? "bg-on-tertiary-container text-on-primary"
            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">keep</span>
        {change.resolution === "keep_current" ? "✓ Keeping" : "Keep"}
      </button>
      <button
        onClick={() => onResolve(change.id, "accept_new")}
        className={`px-3 py-2 rounded-lg font-label text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
          change.resolution === "accept_new"
            ? "bg-error-container text-on-error-container"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">delete</span>
        {change.resolution === "accept_new" ? "✓ Deleting" : "Delete"}
      </button>
    </div>
  )

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow">
      <div className="mb-4">
        <h3 className="font-headline text-base font-bold text-on-surface mb-0.5">
          Review Changes
        </h3>
        <p className="font-body text-xs text-on-surface-variant">
          {changes.length} change{changes.length !== 1 ? "s" : ""} from the
          external system require{changes.length === 1 ? "s" : ""} your review.
        </p>
      </div>

      <div className="space-y-2">
        {changes.map((change) => (
          <div
            key={change.id}
            className={`bg-surface-container-low rounded-xl p-3 transition-all ${
              change.resolved
                ? "border-2 border-[#22c55e]"
                : "border border-error-container/30"
            }`}
          >
            {renderCardHeader(change)}
            {change.change_type === "UPDATE" && renderUpdateCard(change)}
            {change.change_type === "ADD" && renderAddCard(change)}
            {change.change_type === "DELETE" && renderDeleteCard(change)}
          </div>
        ))}
      </div>

      {changes.every((c) => c.resolved) && (
        <div className="mt-3 bg-[#eef8f3] border-l-4 border-[#22c55e] rounded-lg p-3 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#1e6041] text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="font-body text-xs text-[#113a27] font-medium">
            All changes reviewed — you can now apply them.
          </span>
        </div>
      )}
    </div>
  )
}

function changeTypeIcon(type: string): string {
  switch (type) {
    case "ADD":
      return "add_circle"
    case "DELETE":
      return "delete"
    default:
      return "warning"
  }
}

function changeTypeColor(type: string): string {
  switch (type) {
    case "ADD":
      return "text-[#22c55e]"
    case "DELETE":
      return "text-error"
    default:
      return "text-on-error-container"
  }
}

function changeBadgeStyle(type: string): string {
  switch (type) {
    case "ADD":
      return "bg-[#eef8f3] text-[#1e6041]"
    case "DELETE":
      return "bg-error-container text-on-error-container"
    default:
      return "bg-surface-container-highest text-on-surface-variant"
  }
}
