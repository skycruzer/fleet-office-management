"use client"

import { useAuth } from '@/components/providers/auth-provider'
import { LoginForm } from './login-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Quick stats skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main content skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UnauthorizedAccess({ requiredRole }: { requiredRole: string }) {
  const { signOut, userRole } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="bg-yellow-100 p-3 rounded-full inline-block">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">
            You need <span className="font-semibold">{requiredRole}</span> access to view this page.
            {userRole && (
              <>
                <br />
                Current role: <span className="font-semibold">{userRole}</span>
              </>
            )}
          </p>
          <button
            onClick={signOut}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sign out and try a different account
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, userRole } = useAuth()

  // Show loading skeleton while checking authentication
  if (loading) {
    return <LoadingSkeleton />
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Check role-based access if required
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <UnauthorizedAccess requiredRole={requiredRole} />
  }

  // User is authenticated and authorized
  return <>{children}</>
}