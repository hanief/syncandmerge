import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConflictResolution } from '../../components/ConflictResolution'
import type { SyncChange } from '../../types'

const makeChange = (overrides: Partial<SyncChange> = {}): SyncChange => ({
  id: 'c1',
  field_name: 'email',
  change_type: 'UPDATE',
  current_value: 'old@example.com',
  new_value: 'new@example.com',
  ...overrides,
})

describe('ConflictResolution', () => {
  it('renders a card for each change', () => {
    const changes = [
      makeChange({ id: 'c1', field_name: 'email' }),
      makeChange({ id: 'c2', field_name: 'name', current_value: 'Alice', new_value: 'Bob' }),
    ]
    render(<ConflictResolution changes={changes} onResolve={() => {}} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('calls onResolve with keep_current when local value is clicked', async () => {
    const onResolve = vi.fn()
    render(<ConflictResolution changes={[makeChange()]} onResolve={onResolve} />)
    await userEvent.click(screen.getByText('Keep'))
    expect(onResolve).toHaveBeenCalledWith('c1', 'keep_current')
  })

  it('calls onResolve with accept_new when external value is clicked', async () => {
    const onResolve = vi.fn()
    render(<ConflictResolution changes={[makeChange()]} onResolve={onResolve} />)
    await userEvent.click(screen.getByText('Accept'))
    expect(onResolve).toHaveBeenCalledWith('c1', 'accept_new')
  })

  it('shows the "all reviewed" message when every change is resolved', () => {
    const resolved = makeChange({ id: 'c1', resolved: true, resolution: 'accept_new' })
    render(<ConflictResolution changes={[resolved]} onResolve={() => {}} />)
    expect(screen.getByText(/all changes reviewed/i)).toBeInTheDocument()
  })

  it('does not show the "all reviewed" message when changes are unresolved', () => {
    render(<ConflictResolution changes={[makeChange()]} onResolve={() => {}} />)
    expect(screen.queryByText(/all changes reviewed/i)).not.toBeInTheDocument()
  })

  it('renders ADD change with Accept/Reject actions', () => {
    const addChange = makeChange({ id: 'c1', change_type: 'ADD', current_value: null })
    render(<ConflictResolution changes={[addChange]} onResolve={() => {}} />)
    expect(screen.getByText('Accept')).toBeInTheDocument()
    expect(screen.getByText('Reject')).toBeInTheDocument()
  })

  it('renders DELETE change with Keep/Delete actions', () => {
    const deleteChange = makeChange({ id: 'c1', change_type: 'DELETE', new_value: null })
    render(<ConflictResolution changes={[deleteChange]} onResolve={() => {}} />)
    expect(screen.getByText('Keep')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})
