import type { SyncValue } from '../types'

/**
 * Converts a SyncValue to a human-readable string for display.
 */
export function renderSyncValue(value: SyncValue): string {
  if (value === null || value === undefined) return '(empty)'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
