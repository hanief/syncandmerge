import { useNavigate } from "react-router-dom"
import type { SyncEvent } from "../types"
import { StatusBadge } from "./StatusBadge"
import { formatTimestamp } from "../utils/format"

interface SyncHistoryProps {
  events: SyncEvent[]
}

export function SyncHistory({ events }: SyncHistoryProps) {
  const navigate = useNavigate()

  if (events.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
        <div className="mb-6">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
            Sync History
          </h3>
          <p className="font-body text-sm text-on-surface-variant">
            Recorded sync events
          </p>
        </div>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
            history
          </span>
          <p className="font-body text-on-surface-variant">
            No sync history available for this integration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
      <div className="mb-6">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
          Sync History
        </h3>
        <p className="font-body text-sm text-on-surface-variant">
          {events.length} sync event{events.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <div className="relative">
        {events.map((event, index) => (
          <div key={event.id} className="relative pb-8 last:pb-0">
            <div className="absolute left-0 top-0 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-on-tertiary-container border-2 border-surface-container-lowest z-10"></div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-full bg-outline-variant mt-1"></div>
              )}
            </div>

            <button
              onClick={() => navigate(`/logs/${event.id}`)}
              className="ml-8 w-full text-left bg-surface-container-low rounded-xl p-4 hover:bg-surface-container transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={event.status} />
                  <span className="font-label text-xs font-semibold text-on-surface-variant px-2.5 py-1 bg-surface-container-highest rounded-md">
                    Version {event.version}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-body text-xs text-on-surface-variant">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    chevron_right
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      change_circle
                    </span>
                    <span className="font-label text-xs text-on-surface-variant">
                      Changes Applied:
                    </span>
                    <span className="font-label text-sm font-bold text-on-surface">
                      {event.changes_applied}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      warning
                    </span>
                    <span className="font-label text-xs text-on-surface-variant">
                      Conflicts Resolved:
                    </span>
                    <span className="font-label text-sm font-bold text-on-surface">
                      {event.conflicts_resolved}
                    </span>
                  </div>
                </div>

                {event.details && (
                  <p className="font-body text-sm text-on-surface-variant bg-surface-container-highest p-3 rounded-lg">
                    {event.details}
                  </p>
                )}

                {event.user && (
                  <p className="font-body text-xs text-on-surface-variant">
                    Performed by:{" "}
                    <span className="font-semibold text-on-surface">
                      {event.user}
                    </span>
                  </p>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
