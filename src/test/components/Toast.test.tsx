import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from '../../components/Toast'

describe('Toast', () => {
  it('renders the message when visible', () => {
    render(<Toast message="Sync complete" type="success" isVisible onClose={() => {}} />)
    expect(screen.getByText('Sync complete')).toBeInTheDocument()
  })

  it('does not render when isVisible is false', () => {
    render(<Toast message="Hidden toast" type="info" isVisible={false} onClose={() => {}} />)
    expect(screen.queryByText('Hidden toast')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<Toast message="msg" type="info" isVisible onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close notification/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has role="alert" for accessibility', () => {
    render(<Toast message="Alert!" type="error" isVisible onClose={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
