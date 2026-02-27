import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack)
    }
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (error) {
      if (fallback) return fallback

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-8">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="mb-3 text-lg font-bold text-gray-900">
              문제가 발생했습니다
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              일시적인 오류가 발생했습니다. 새로고침하거나 다시 시도해 주세요.
            </p>
            {import.meta.env.DEV && (
              <details className="mb-4">
                <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                  오류 상세
                </summary>
                <pre className="mt-2 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs text-red-700">
                  {error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-lg bg-[#E69100] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#cc7a00]"
              >
                다시 시도
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}
