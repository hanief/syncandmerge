import { describe, it, expect } from 'vitest'
import { createSyncEvent } from '../../utils/syncEvent'
import type { Integration, SyncChange } from '../../types'

const integration: Integration = {
  id: 'int-1',
  application_id: 'salesforce',
  application_name: 'Salesforce',
  status: 'conflict',
  last_sync: null,
  version: 5,
  description: 'CRM',
  icon: '☁️',
}

const makeChange = (overrides: Partial<SyncChange> = {}): SyncChange => ({
  id: 'c1',
  field_name: 'email',
  change_type: 'UPDATE',
  current_value: 'old@example.com',
  new_value: 'new@example.com',
  ...overrides,
})

describe('createSyncEvent', () => {
  it('produces a valid event id with integration id embedded', () => {
    const event = createSyncEvent({ integration, changes: [] })
    expect(event.id).toMatch(/^sync-\d+-int-1$/)
  })

  it('sets changes_applied to total change count', () => {
    const changes = [makeChange({ id: 'c1' }), makeChange({ id: 'c2' })]
    const event = createSyncEvent({ integration, changes })
    expect(event.changes_applied).toBe(2)
  })

  it('counts only resolved changes for conflicts_resolved', () => {
    const changes = [
      makeChange({ id: 'c1', resolved: true, resolution: 'accept_new' }),
      makeChange({ id: 'c2' }), // unresolved
    ]
    const event = createSyncEvent({ integration, changes })
    expect(event.conflicts_resolved).toBe(1)
  })

  it('sets resolutions to undefined when no changes are resolved', () => {
    const changes = [makeChange({ id: 'c1' })]
    const event = createSyncEvent({ integration, changes })
    expect(event.resolutions).toBeUndefined()
  })

  it('captures field-level resolution details for resolved changes', () => {
    const changes = [
      makeChange({
        id: 'c1',
        field_name: 'email',
        change_type: 'UPDATE',
        current_value: 'old@example.com',
        new_value: 'new@example.com',
        resolved: true,
        resolution: 'accept_new',
      }),
    ]
    const event = createSyncEvent({ integration, changes })
    expect(event.resolutions).toHaveLength(1)
    const r = event.resolutions![0]
    expect(r.field_name).toBe('email')
    expect(r.change_type).toBe('UPDATE')
    expect(r.current_value).toBe('old@example.com')
    expect(r.new_value).toBe('new@example.com')
    expect(r.resolution).toBe('accept_new')
    expect(r.resolved_by).toBeTruthy()
  })

  it('captures custom_value when resolution is custom', () => {
    const changes = [
      makeChange({
        id: 'c1',
        resolved: true,
        resolution: 'custom',
        custom_value: 'custom@example.com',
      }),
    ]
    const event = createSyncEvent({ integration, changes })
    expect(event.resolutions![0].custom_value).toBe('custom@example.com')
  })

  it('does not include unresolved changes in resolutions array', () => {
    const changes = [
      makeChange({ id: 'c1', resolved: true, resolution: 'keep_current' }),
      makeChange({ id: 'c2' }), // not resolved
    ]
    const event = createSyncEvent({ integration, changes })
    expect(event.resolutions).toHaveLength(1)
    expect(event.resolutions![0].field_name).toBe('email')
  })

  it('preserves integration version in the event', () => {
    const event = createSyncEvent({ integration, changes: [] })
    expect(event.version).toBe(5)
  })
})
