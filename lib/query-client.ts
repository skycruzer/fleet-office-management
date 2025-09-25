import { QueryClient } from '@tanstack/react-query'
import { handleSupabaseError } from './supabase'

// Default options for all queries
const defaultOptions = {
  queries: {
    // 5 minutes default stale time
    staleTime: 1000 * 60 * 5,
    // 10 minutes cache time
    gcTime: 1000 * 60 * 10,
    // Don't retry on error for read-only operations
    retry: 1,
    // Retry delay
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
    // Handle Supabase errors globally
    throwOnError: (error: unknown) => {
      console.error('Query error:', handleSupabaseError(error))
      return false // Don't throw, handle gracefully
    },
  },
}

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions,
  })
}

// Query keys factory for consistent caching
export const queryKeys = {
  // Dashboard data
  dashboard: ['dashboard'] as const,
  complianceDashboard: () => [...queryKeys.dashboard, 'compliance'] as const,

  // Pilots
  pilots: ['pilots'] as const,
  allPilots: () => [...queryKeys.pilots, 'all'] as const,
  pilot: (id: string) => [...queryKeys.pilots, 'detail', id] as const,
  pilotSummary: (id: string) => [...queryKeys.pilots, 'summary', id] as const,

  // Checks
  checks: ['checks'] as const,
  expiringChecks: (days?: number) => [
    ...queryKeys.checks,
    'expiring',
    days || 90,
  ] as const,
  detailedExpiringChecks: (days?: number) => [
    ...queryKeys.checks,
    'detailed-expiring',
    days || 90,
  ] as const,
  pilotChecks: (pilotId: string) => [
    ...queryKeys.checks,
    'pilot',
    pilotId,
  ] as const,

  // Check types
  checkTypes: ['check-types'] as const,
  allCheckTypes: () => [...queryKeys.checkTypes, 'all'] as const,

  // Settings
  settings: ['settings'] as const,
  allSettings: () => [...queryKeys.settings, 'all'] as const,
} as const

// React Query error boundary fallback
export const queryErrorHandler = (error: Error, errorInfo: Record<string, unknown>) => {
  console.error('React Query Error:', error, errorInfo)
}