import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Error reporting can be wired up here (e.g. Sentry)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

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
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-error text-on-error font-label text-sm font-semibold hover:bg-error/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
