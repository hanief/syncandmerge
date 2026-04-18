import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="bg-error-container rounded-2xl p-8 max-w-md w-full border-l-4 border-error">
        <span className="material-symbols-outlined text-on-error-container text-4xl block mb-4">
          error
        </span>
        <h2 className="font-headline text-xl font-bold text-on-error-container mb-2">
          Something went wrong
        </h2>
        <p className="font-body text-sm text-on-error-container mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-lg bg-error text-on-error font-label text-sm font-semibold hover:bg-error/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: Props) {
  if (fallback) {
    return (
      <ReactErrorBoundary fallback={fallback}>
        {children}
      </ReactErrorBoundary>
    )
  }

  return (
    <ReactErrorBoundary FallbackComponent={DefaultFallback}>
      {children}
    </ReactErrorBoundary>
  )
}
