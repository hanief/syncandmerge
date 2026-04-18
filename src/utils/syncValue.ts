import type { SyncValue } from "../types"

export function renderSyncValue(value: SyncValue): string {
  if (value === null || value === undefined) return "(empty)"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
