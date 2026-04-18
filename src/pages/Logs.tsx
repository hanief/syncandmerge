import { useNavigate } from "react-router-dom"
import { useSyncStore } from "../stores/syncStore"
import { useIntegrationStore } from "../stores/integrationStore"
import { StatusBadge } from "../components/StatusBadge"
import { formatTimestamp } from "../utils/format"
import type { SyncEvent } from "../types"

export function Logs() {
  const navigate = useNavigate()
  const { syncHistory } = useSyncStore()
  const { integrations } = useIntegrationStore()

  // Merge all events across integrations, sort newest first
  const allEvents: SyncEvent[] = Object.values(syncHistory)
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getIntegration = (integrationId: string) =>
    integrations.find((i) => i.id === integrationId)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
          Sync Logs
        </h1>
        <p className="font-body text-base text-on-surface-variant">
          History of all sync events across your integrations.
        </p>
      </div>

      {allEvents.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 ambient-shadow text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-4">
            history
          </span>
          <p className="font-body text-on-surface-variant">
            No sync events yet. Run a sync to see logs here.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
          <p className="font-body text-sm text-on-surface-variant mb-6">
            {allEvents.length} sync event{allEvents.length !== 1 ? "s" : ""} recorded
          </p>

          <div className="relative">
            {allEvents.map((event, index) => {
              const integration = getIntegration(event.integration_id)

              return (
                <div key={event.id} className="relative pb-6 last:pb-0">
                  {/* Timeline line */}
                  <div className="absolute left-0 top-0 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-on-tertiary-container border-2 border-surface-container-lowest z-10" />
                    {index < allEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-outline-variant mt-1" />
                    )}
                  </div>

                  {/* Event card */}
                  <div
                    className="ml-8 bg-surface-container-low rounded-xl p-4 hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => navigate(`/logs/${event.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Integration label */}
                        <div className="flex items-center gap-1.5">
                          {integration?.icon && (
                            <span className="text-base leading-none">{integration.icon}</span>
                          )}
                          <span className="font-label text-sm font-bold text-on-surface">
                            {event.application_name}
                          </span>
                        </div>
                        <span className="text-on-surface-variant/40">·</span>
                        <StatusBadge status={event.status} />
                        <span className="font-label text-xs font-semibold text-on-surface-variant px-2 py-0.5 bg-surface-container-highest rounded-md">
                          v{event.version}
                        </span>
                      </div>
                      <span className="font-body text-xs text-on-surface-variant shrink-0">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                          change_circle
                        </span>
                        <span className="font-label text-xs text-on-surface-variant">Changes:</span>
                        <span className="font-label text-sm font-bold text-on-surface">
                          {event.changes_applied}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                          warning
                        </span>
                        <span className="font-label text-xs text-on-surface-variant">Conflicts:</span>
                        <span className="font-label text-sm font-bold text-on-surface">
                          {event.conflicts_resolved}
                        </span>
                      </div>
                      {event.user && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                            person
                          </span>
                          <span className="font-label text-xs text-on-surface-variant">{event.user}</span>
                        </div>
                      )}
                    </div>

                    {event.details && (
                      <p className="font-body text-xs text-on-surface-variant bg-surface-container-highest px-3 py-2 rounded-lg mt-3">
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
