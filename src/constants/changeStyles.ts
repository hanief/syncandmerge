import type { ChangeType } from '../types'

interface ChangeStyleEntry {
  badge: string
  icon: string
  iconName: string
  color: string
}

export const CHANGE_STYLES: Record<ChangeType, ChangeStyleEntry> = {
  ADD: {
    badge: 'bg-[#eef8f3] text-[#1e6041]',
    icon: 'text-[#22c55e]',
    iconName: 'add_circle',
    color: 'text-[#22c55e]',
  },
  UPDATE: {
    badge: 'bg-tertiary-fixed text-on-tertiary-container',
    icon: 'text-on-tertiary-container',
    iconName: 'warning',
    color: 'text-on-error-container',
  },
  DELETE: {
    badge: 'bg-error-container text-on-error-container',
    icon: 'text-error',
    iconName: 'delete',
    color: 'text-error',
  },
}

export const CHANGE_ICON: Record<ChangeType, string> = {
  ADD: 'add_circle',
  UPDATE: 'sync',
  DELETE: 'remove_circle',
}
