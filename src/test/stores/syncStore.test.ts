import { describe, it, expect, beforeEach } from 'vitest'
import { useSyncStore } from '../../stores/syncStore'
import type { SyncChange } from '../../types'

const makeChange = (overrides: Partial<SyncChange> = {}): SyncChange => ({
  id: 'c1',
  field_name: 'email',
  change_type: 'UPDATE',
  current_value: 'old@example.com',
  new_value: 'new@example.com',
  ...overrides,
})

describe('syncStore', () => {
  beforeEach(() => {
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  describe('getSyncData', () => {
    it('returns default sync data for unknown integration', () => {
      const data = useSyncStore.getState().getSyncData('nonexistent')
      expect(data.isLoading).toBe(false)
      expect(data.error).toBeNull()
      expect(data.changes).toHaveLength(0)
      expect(data.hasConflicts).toBe(false)
      expect(data.canApply).toBe(false)
    })
  })

  describe('resolveChange', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c1' }), makeChange({ id: 'c2' })],
            hasConflicts: true,
            canApply: false,
          },
        },
        syncHistory: {},
      })
    })

    it('marks the targeted change as resolved with keep_current', () => {
      useSyncStore.getState().resolveChange('int-1', 'c1', 'keep_current')
      const changes = useSyncStore.getState().getSyncData('int-1').changes
      expect(changes[0].resolved).toBe(true)
      expect(changes[0].resolution).toBe('keep_current')
      expect(changes[1].resolved).toBeUndefined()
    })

    it('sets canApply to true when all changes are resolved', () => {
      useSyncStore.getState().resolveChange('int-1', 'c1', 'accept_new')
      expect(useSyncStore.getState().getSyncData('int-1').canApply).toBe(false)
      useSyncStore.getState().resolveChange('int-1', 'c2', 'accept_new')
      expect(useSyncStore.getState().getSyncData('int-1').canApply).toBe(true)
    })

    it('stores custom_value when resolution is custom', () => {
      useSyncStore.getState().resolveChange('int-1', 'c1', 'custom', 'custom@example.com')
      const change = useSyncStore.getState().getSyncData('int-1').changes[0]
      expect(change.resolution).toBe('custom')
      expect(change.custom_value).toBe('custom@example.com')
    })
  })

  describe('bulkResolve', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c1' }), makeChange({ id: 'c2' })],
            hasConflicts: true,
            canApply: false,
          },
        },
        syncHistory: {},
      })
    })

    it('resolves all changes with accept_new', () => {
      useSyncStore.getState().bulkResolve('int-1', 'accept_new')
      const { changes, canApply } = useSyncStore.getState().getSyncData('int-1')
      expect(changes.every((c) => c.resolved && c.resolution === 'accept_new')).toBe(true)
      expect(canApply).toBe(true)
    })

    it('resolves all changes with keep_current', () => {
      useSyncStore.getState().bulkResolve('int-1', 'keep_current')
      const changes = useSyncStore.getState().getSyncData('int-1').changes
      expect(changes.every((c) => c.resolution === 'keep_current')).toBe(true)
    })
  })

  describe('bulkResolveAll', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c1' })],
            hasConflicts: true,
            canApply: false,
          },
          'int-2': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c2' })],
            hasConflicts: true,
            canApply: false,
          },
        },
        syncHistory: {},
      })
    })

    it('resolves changes across all integrations', () => {
      useSyncStore.getState().bulkResolveAll('keep_current')
      const d1 = useSyncStore.getState().getSyncData('int-1')
      const d2 = useSyncStore.getState().getSyncData('int-2')
      expect(d1.canApply).toBe(true)
      expect(d2.canApply).toBe(true)
      expect(d1.changes[0].resolution).toBe('keep_current')
      expect(d2.changes[0].resolution).toBe('keep_current')
    })
  })

  describe('resetResolutions', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [
              makeChange({ id: 'c1', resolved: true, resolution: 'accept_new' }),
            ],
            hasConflicts: true,
            canApply: true,
          },
        },
        syncHistory: {},
      })
    })

    it('strips resolved/resolution/custom_value from changes', () => {
      useSyncStore.getState().resetResolutions('int-1')
      const change = useSyncStore.getState().getSyncData('int-1').changes[0]
      expect(change.resolved).toBeUndefined()
      expect(change.resolution).toBeUndefined()
    })

    it('sets canApply back to false', () => {
      useSyncStore.getState().resetResolutions('int-1')
      expect(useSyncStore.getState().getSyncData('int-1').canApply).toBe(false)
    })
  })

  describe('resetResolutionsAll', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c1', resolved: true, resolution: 'accept_new' })],
            hasConflicts: true,
            canApply: true,
          },
          'int-2': {
            isLoading: false,
            error: null,
            changes: [makeChange({ id: 'c2', resolved: true, resolution: 'keep_current' })],
            hasConflicts: true,
            canApply: true,
          },
        },
        syncHistory: {},
      })
    })

    it('clears resolutions across all integrations and sets canApply to false', () => {
      useSyncStore.getState().resetResolutionsAll()
      expect(useSyncStore.getState().getSyncData('int-1').canApply).toBe(false)
      expect(useSyncStore.getState().getSyncData('int-2').canApply).toBe(false)
      expect(useSyncStore.getState().getSyncData('int-1').changes[0].resolution).toBeUndefined()
    })
  })

  describe('resetIntegration', () => {
    beforeEach(() => {
      useSyncStore.setState({
        syncData: {
          'int-1': {
            isLoading: false,
            error: null,
            changes: [makeChange()],
            hasConflicts: true,
            canApply: false,
          },
        },
        syncHistory: {},
      })
    })

    it('removes syncData for the given integration', () => {
      useSyncStore.getState().resetIntegration('int-1')
      const data = useSyncStore.getState().getSyncData('int-1')
      expect(data.changes).toHaveLength(0)
    })
  })

  describe('appendHistoryEvent', () => {
    it('prepends events to the integration history', () => {
      const event1 = {
        id: 'e1',
        integration_id: 'int-1',
        application_name: 'Salesforce',
        timestamp: '2024-01-01T00:00:00Z',
        status: 'success' as const,
        changes_applied: 3,
        conflicts_resolved: 1,
        version: 1,
      }
      const event2 = { ...event1, id: 'e2', timestamp: '2024-01-02T00:00:00Z' }

      useSyncStore.getState().appendHistoryEvent('int-1', event1)
      useSyncStore.getState().appendHistoryEvent('int-1', event2)

      const history = useSyncStore.getState().syncHistory['int-1']
      expect(history).toHaveLength(2)
      expect(history[0].id).toBe('e2') // newest first
    })
  })
})
