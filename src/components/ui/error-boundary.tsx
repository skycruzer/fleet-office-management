"use client"

import React from 'react'
import { FleetManagerError, errorLogger, getUserFriendlyMessage } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log the error
    const fleetError = error instanceof FleetManagerError
      ? error
      : new FleetManagerError(error.message, 'REACT_ERROR', 500)

    errorLogger.log(fleetError, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isFleetError = error instanceof FleetManagerError
  const userMessage = isFleetError
    ? getUserFriendlyMessage(error)
    : 'An unexpected error occurred. Please try again.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-red-900">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-red-700">
            {userMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isFleetError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error Code: {error.code}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                Technical Details (Development)
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error fallback for authentication errors
export function AuthErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleSignOut = () => {
    // Clear any stored auth data
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/auth/signin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold">
            Authentication Required
          </CardTitle>
          <CardDescription>
            Your session has expired or you don't have permission to access this resource.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSignOut} className="w-full">
              Sign In Again
            </Button>

            <Button
              variant="outline"
              onClick={resetError}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return React.useCallback((error: unknown, context: Record<string, any> = {}) => {
    const fleetError = error instanceof FleetManagerError
      ? error
      : new FleetManagerError(
          error instanceof Error ? error.message : 'Unknown error',
          'COMPONENT_ERROR'
        )

    errorLogger.log(fleetError, {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    // Re-throw to be caught by Error Boundary
    throw fleetError
  }, [])
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}