import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorMessage } from '../../components/ErrorMessage'
import type { ApiError } from '../../types'

describe('ErrorMessage', () => {
  it('renders a plain string error', () => {
    render(<ErrorMessage error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders an ApiError with the correct title and description for server_error', () => {
    const apiError: ApiError = {
      status: 500,
      message: 'Internal server error',
      type: 'server_error',
    }
    render(<ErrorMessage error={apiError} />)
    expect(screen.getByText('Server Error')).toBeInTheDocument()
    expect(screen.getByText('The server encountered an unexpected problem while processing your request.')).toBeInTheDocument()
  })

  it('renders details when provided in ApiError', () => {
    const apiError: ApiError = {
      status: 400,
      message: 'Bad request',
      type: 'client_error',
      details: 'Missing required field: application_id',
    }
    render(<ErrorMessage error={apiError} />)
    expect(screen.getByText('Configuration Required')).toBeInTheDocument()
    expect(screen.getByText('Missing required field: application_id')).toBeInTheDocument()
  })

  it('renders a generic Error object', () => {
    render(<ErrorMessage error={new Error('Unexpected failure')} />)
    expect(screen.getByText('Unexpected failure')).toBeInTheDocument()
  })

  it('renders the retry button when onRetry is provided', () => {
    render(<ErrorMessage error="error" onRetry={() => {}} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is absent', () => {
    render(<ErrorMessage error="error" />)
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('calls onRetry when the button is clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorMessage error="error" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
