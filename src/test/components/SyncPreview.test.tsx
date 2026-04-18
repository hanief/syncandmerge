import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncPreview } from '../../components/SyncPreview'
import type { SyncChange } from '../../types'

const makeChange = (overrides: Partial<SyncChange> = {}): SyncChange => ({
  id: 'c1',
  field_name: 'email',
  change_type: 'UPDATE',
  current_value: 'old@example.com',
  new_value: 'new@example.com',
  ...overrides,
})

describe('SyncPreview', () => {
  it('shows the total change count', () => {
    const changes = [makeChange({ id: 'c1' }), makeChange({ id: 'c2' })]
    render(<SyncPreview changes={changes} />)
    expect(screen.getByText(/2 changes detected/i)).toBeInTheDocument()
  })

  it('uses singular "change" for a single item', () => {
    render(<SyncPreview changes={[makeChange()]} />)
    expect(screen.getByText(/1 change detected/i)).toBeInTheDocument()
  })

  it('shows conflict count when UPDATE changes are present', () => {
    const changes = [
      makeChange({ id: 'c1', change_type: 'UPDATE' }),
      makeChange({ id: 'c2', change_type: 'ADD' }),
    ]
    render(<SyncPreview changes={changes} />)
    expect(screen.getByText(/1 conflict/i)).toBeInTheDocument()
  })

  it('renders field names for each change', () => {
    const changes = [
      makeChange({ id: 'c1', field_name: 'email' }),
      makeChange({ id: 'c2', field_name: 'name', change_type: 'ADD' }),
    ]
    render(<SyncPreview changes={changes} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders the new value for ADD changes', () => {
    const addChange = makeChange({ change_type: 'ADD', current_value: null, new_value: 'new_record' })
    render(<SyncPreview changes={[addChange]} />)
    expect(screen.getByText('new_record')).toBeInTheDocument()
  })

  it('renders current value with strikethrough for DELETE changes', () => {
    const deleteChange = makeChange({ change_type: 'DELETE', new_value: null, current_value: 'to_delete' })
    render(<SyncPreview changes={[deleteChange]} />)
    expect(screen.getByText('to_delete')).toBeInTheDocument()
  })
})
