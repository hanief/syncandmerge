import { formatFieldName } from "../utils/format"
import { CHANGE_STYLES } from "../constants/changeStyles"
import { ValueDisplay } from "./ValueDisplay"
import type { SyncChangeResolution } from "../types"

interface ResolutionRowProps {
  resolution: SyncChangeResolution
}

export function ResolutionRow({ resolution }: ResolutionRowProps) {
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
