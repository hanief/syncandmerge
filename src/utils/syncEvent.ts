import type { SyncEvent, SyncChange, SyncChangeResolution, Integration } from '../types'
import { SYSTEM_USER } from '../constants/app'

interface CreateSyncEventParams {
  integration: Integration
  changes: SyncChange[]
}

export function createSyncEvent({ integration, changes }: CreateSyncEventParams): SyncEvent {
  const now = new Date()

  const resolutions: SyncChangeResolution[] = changes
    .filter((c): c is SyncChange & { resolution: NonNullable<SyncChange['resolution']> } =>
      c.resolved === true && c.resolution !== undefined,
    )
    .map((c) => ({
      field_name: c.field_name,
      change_type: c.change_type,
      current_value: c.current_value,
      new_value: c.new_value,
      resolution: c.resolution,
      custom_value: c.custom_value,
      resolved_by: SYSTEM_USER,
    }))

  return {
    id: `sync-${now.getTime()}-${integration.id}`,
    integration_id: integration.id,
    application_name: integration.application_name,
    timestamp: now.toISOString(),
    status: 'success',
    changes_applied: changes.length,
    conflicts_resolved: resolutions.length,
    version: integration.version,
    user: SYSTEM_USER,
    resolutions: resolutions.length > 0 ? resolutions : undefined,
  }
}
