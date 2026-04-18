import type { SyncEvent, SyncChange, Integration } from '../types'
import { SYSTEM_USER } from '../constants/app'

interface CreateSyncEventParams {
  integration: Integration
  changes: SyncChange[]
}

export function createSyncEvent({ integration, changes }: CreateSyncEventParams): SyncEvent {
  const now = new Date()
  return {
    id: `sync-${now.getTime()}-${integration.id}`,
    integration_id: integration.id,
    application_name: integration.application_name,
    timestamp: now.toISOString(),
    status: 'success',
    changes_applied: changes.length,
    conflicts_resolved: changes.filter((c) => c.resolved).length,
    version: integration.version,
    user: SYSTEM_USER,
  }
}
