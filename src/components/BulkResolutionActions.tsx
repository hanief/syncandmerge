interface BulkResolutionActionsProps {
  onKeepLocal: () => void
  onAcceptExternal: () => void
  onReset: () => void
  localLabel?: string
  externalLabel?: string
  resetLabel?: string
  compact?: boolean
}

export function BulkResolutionActions({
  onKeepLocal,
  onAcceptExternal,
  onReset,
  localLabel = "Accept All Local",
  externalLabel = "Accept All External",
  resetLabel = "Reset",
  compact = false,
}: BulkResolutionActionsProps) {
  const cls = `rounded-lg font-label text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant ${
    compact ? "px-3 py-1.5" : "px-4 py-2.5"
  }`

  return (
    <>
      <button onClick={onKeepLocal} className={cls}>
        {localLabel}
      </button>
      <button onClick={onReset} className={cls}>
        {resetLabel}
      </button>
      <button onClick={onAcceptExternal} className={cls}>
        {externalLabel}
      </button>
    </>
  )
}
