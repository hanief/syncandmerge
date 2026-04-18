import { describe, it, expect, beforeEach } from 'vitest'
import { useSyncStore } from '../../stores/syncStore'
import type { SyncEvent } from '../../types'

const makeEvent = (overrides: Partial<SyncEvent> = {}): SyncEvent => ({
  id: 'e1',
  integration_id: 'int-1',
  application_name: 'Salesforce',
  timestamp: '2024-01-01T00:00:00Z',
  status: 'success',
  changes_applied: 2,
  conflicts_resolved: 1,
  version: 1,
  ...overrides,
})

describe('syncStore.getSyncEventById', () => {
  beforeEach(() => {
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  it('returns undefined when no history exists', () => {
    expect(useSyncStore.getState().getSyncEventById('e1')).toBeUndefined()
  })

  it('finds an event by id across all integrations', () => {
    useSyncStore.setState({
      syncData: {},
      syncHistory: {
        'int-1': [makeEvent({ id: 'e1', integration_id: 'int-1' })],
        'int-2': [makeEvent({ id: 'e2', integration_id: 'int-2' })],
      },
    })
    expect(useSyncStore.getState().getSyncEventById('e2')?.integration_id).toBe('int-2')
  })

  it('returns undefined for an unknown event id', () => {
    useSyncStore.setState({
      syncData: {},
      syncHistory: { 'int-1': [makeEvent({ id: 'e1' })] },
    })
    expect(useSyncStore.getState().getSyncEventById('nonexistent')).toBeUndefined()
  })

  it('returns the event with resolutions when present', () => {
    const event = makeEvent({
      id: 'e1',
      resolutions: [
        {
          field_name: 'email',
          change_type: 'UPDATE',
          current_value: 'old@example.com',
          new_value: 'new@example.com',
          resolution: 'accept_new',
          resolved_by: 'admin@company.com',
        },
      ],
    })
    useSyncStore.setState({ syncData: {}, syncHistory: { 'int-1': [event] } })
    const found = useSyncStore.getState().getSyncEventById('e1')
    expect(found?.resolutions).toHaveLength(1)
    expect(found?.resolutions![0].resolution).toBe('accept_new')
  })
})
