import type { SyncChange } from "../types"
import { formatFieldName } from "../utils/format"

interface SyncPreviewProps {
  changes: SyncChange[]
}

export function SyncPreview({ changes }: SyncPreviewProps) {
  const changesByType = {
    ADD: changes.filter((c) => c.change_type === "ADD"),
    UPDATE: changes.filter((c) => c.change_type === "UPDATE"),
    DELETE: changes.filter((c) => c.change_type === "DELETE"),
  }

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "(empty)"
    }
    if (typeof value === "object") {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const getChangeIcon = (type: string) => {
    const icons = {
      ADD: "add_circle",
      UPDATE: "sync",
      DELETE: "remove_circle",
    }
    return icons[type as keyof typeof icons] || "circle"
  }

  const getChangeStyles = (type: string) => {
    const styles = {
      ADD: {
        badge: "bg-[#eef8f3] text-[#1e6041]",
        icon: "text-[#22c55e]",
      },
      UPDATE: {
        badge: "bg-tertiary-fixed text-on-tertiary-container",
        icon: "text-on-tertiary-container",
      },
      DELETE: {
        badge: "bg-error-container text-on-error-container",
        icon: "text-error",
      },
    }
    return (
      styles[type as keyof typeof styles] || {
        badge: "bg-surface-variant text-on-surface-variant",
        icon: "text-on-surface-variant",
      }
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
      <div className="mb-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
          Sync Preview
        </h3>
        <p className="font-body text-sm text-on-surface-variant">
          {changes.length} change{changes.length !== 1 ? "s" : ""} detected
          {changesByType.UPDATE.length > 0 && (
            <span className="text-on-error-container font-semibold ml-1">
              • {changesByType.UPDATE.length} conflict
              {changesByType.UPDATE.length !== 1 ? "s" : ""} require review
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        {changes.map((change) => {
          const styles = getChangeStyles(change.change_type)
          return (
            <div
              key={change.id}
              className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${styles.icon}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {getChangeIcon(change.change_type)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full ${styles.badge} font-label text-xs font-semibold uppercase tracking-wide`}
                >
                  {change.change_type}
                </span>
                <span className="font-label text-sm font-semibold text-on-surface flex-1">
                  {formatFieldName(change.field_name)}
                </span>
              </div>

              <div className="ml-8">
                {change.change_type === "ADD" && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-label text-xs font-medium text-on-surface-variant">
                      New value:
                    </span>
                    <span className="font-body text-sm text-on-surface">
                      {renderValue(change.new_value)}
                    </span>
                  </div>
                )}

                {change.change_type === "UPDATE" && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-surface-container-highest rounded-lg">
                      <span className="font-label text-xs font-medium text-on-surface-variant block mb-1">
                        Current:
                      </span>
                      <span className="font-body text-sm text-on-surface">
                        {renderValue(change.current_value)}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      arrow_forward
                    </span>
                    <div className="flex-1 p-3 bg-tertiary-container rounded-lg">
                      <span className="font-label text-xs font-medium text-on-tertiary-container block mb-1">
                        External:
                      </span>
                      <span className="font-body text-sm text-on-tertiary-container font-semibold">
                        {renderValue(change.new_value)}
                      </span>
                    </div>
                  </div>
                )}

                {change.change_type === "DELETE" && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-label text-xs font-medium text-on-surface-variant">
                      Will be deleted:
                    </span>
                    <span className="font-body text-sm text-on-error-container line-through">
                      {renderValue(change.current_value)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
