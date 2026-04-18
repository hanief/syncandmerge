export type IntegrationStatus =
  | "synced"
  | "syncing"
  | "conflict"
  | "error"
  | "not_synced"

export type ApplicationId =
  | "salesforce"
  | "hubspot"
  | "stripe"
  | "slack"
  | "zendesk"
  | "intercom"

export interface Integration {
  id: string
  application_id: ApplicationId
  application_name: string
  status: IntegrationStatus
  last_sync: string | null
  version: number
  description: string
  icon?: string
  conflict_count?: number
  pending_changes?: number
}

export type ChangeType = "ADD" | "UPDATE" | "DELETE"

export interface SyncValueObject {
  [key: string]: SyncValue
}
export type SyncValue =
  | string
  | number
  | boolean
  | null
  | SyncValueObject
  | SyncValue[]

export interface SyncChange {
  id: string
  field_name: string
  change_type: ChangeType
  current_value: SyncValue
  new_value: SyncValue
  entity_type?: string
  entity_id?: string
  resolved?: boolean
  resolution?: "keep_current" | "accept_new" | "custom"
  custom_value?: SyncValue
}

export interface SyncApproval {
  application_name: string
  changes: SyncChange[]
}

export interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export interface SyncApiResponse {
  sync_approval: SyncApproval
  metadata: Record<string, string | number | boolean>
}

export interface SyncChangeResolution {
  field_name: string
  change_type: ChangeType
  current_value: SyncValue
  new_value: SyncValue
  resolution: NonNullable<SyncChange["resolution"]>
  custom_value?: SyncValue
  resolved_by: string
}

export interface SyncEvent {
  id: string
  integration_id: string
  application_name: string
  timestamp: string
  status: "success" | "failed" | "partial"
  changes_applied: number
  conflicts_resolved: number
  version: number
  user?: string
  details?: string
  resolutions?: SyncChangeResolution[]
}

export interface ApiError {
  status: number
  message: string
  type: "client_error" | "server_error" | "gateway_error" | "network_error"
  details?: string
}
