// Entity Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: "active" | "suspended"
  created_at: string
  updated_at: string
}

export interface Door {
  id: string
  name: string
  location: string
  device_id: string
  status: "online" | "offline"
  battery_level: number
  last_seen: string
  created_at: string
}

export interface Key {
  id: string
  user_id: string
  door_id: string
  key_type: string
  access_start: string
  access_end: string
  status: "active" | "revoked"
  created_at: string
}

// Integration Types
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

// Sync Change Types
export type ChangeType = "ADD" | "UPDATE" | "DELETE"

export interface SyncChange {
  id: string
  field_name: string
  change_type: ChangeType
  current_value: any
  new_value: any
  entity_type?: string
  entity_id?: string
  resolved?: boolean
  resolution?: "keep_current" | "accept_new" | "custom"
  custom_value?: any
}

export interface SyncApproval {
  application_name: string
  changes: SyncChange[]
}

// API Response Types
export interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export interface SyncApiResponse {
  sync_approval: SyncApproval
  metadata: Record<string, any>
}

// Sync History Types
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
}

// Error Types
export interface ApiError {
  status: number
  message: string
  type: "client_error" | "server_error" | "gateway_error" | "network_error"
  details?: string
}

// UI State Types
export interface SyncState {
  isLoading: boolean
  error: ApiError | null
  changes: SyncChange[]
  hasConflicts: boolean
  canApply: boolean
}
