import type { SyncChange } from "../types"
import { formatFieldName } from "../utils/format"
import { renderSyncValue } from "../utils/syncValue"
import { CHANGE_STYLES, CHANGE_ICON } from "../constants/changeStyles"

interface SyncPreviewProps {
  changes: SyncChange[]
}

export function SyncPreview({ changes }: SyncPreviewProps) {
  const updateCount = changes.filter((c) => c.change_type === "UPDATE").length

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
      <div className="mb-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
          Sync Preview
        </h3>
        <p className="font-body text-sm text-on-surface-variant">
          {changes.length} change{changes.length !== 1 ? "s" : ""} detected
          {updateCount > 0 && (
            <span className="text-on-error-container font-semibold ml-1">
              • {updateCount} conflict
              {updateCount !== 1 ? "s" : ""} require review
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        {changes.map((change) => {
          const styles = CHANGE_STYLES[change.change_type]
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
                  {CHANGE_ICON[change.change_type]}
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
                      {renderSyncValue(change.new_value)}
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
                        {renderSyncValue(change.current_value)}
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
                        {renderSyncValue(change.new_value)}
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
                      {renderSyncValue(change.current_value)}
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
