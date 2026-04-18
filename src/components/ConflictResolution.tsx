import type { SyncChange } from "../types"
import { pluralize } from "../utils/format"
import { ChangeCard } from "./ChangeCard"
import { MaterialIcon } from "./MaterialIcon"

interface ConflictResolutionProps {
  changes: SyncChange[]
  onResolve: (
    changeId: string,
    resolution: NonNullable<SyncChange["resolution"]>,
    customValue?: SyncChange["custom_value"],
  ) => void
}

export function ConflictResolution({
  changes,
  onResolve,
}: ConflictResolutionProps) {
  const allResolved = changes.length > 0 && changes.every((c) => c.resolved)

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow">
      <div className="mb-4">
        <h3 className="font-headline text-base font-bold text-on-surface mb-0.5">
          Review Changes
        </h3>
        <p className="font-body text-xs text-on-surface-variant">
          {changes.length} {pluralize(changes.length, "change")} from the external
          system {pluralize(changes.length, "requires", "require")} your review.
        </p>
      </div>

      <div className="space-y-2">
        {changes.map((change) => (
          <ChangeCard key={change.id} change={change} onResolve={onResolve} />
        ))}
      </div>

      {allResolved && (
        <div className="mt-3 bg-success-container border-l-4 border-success rounded-lg p-3 flex items-center gap-2">
          <MaterialIcon name="check_circle" filled className="text-on-success-container text-lg" />
          <span className="font-body text-xs text-on-success-container-dark font-medium">
            All changes reviewed — you can now apply them.
          </span>
        </div>
      )}
    </div>
  )
}
