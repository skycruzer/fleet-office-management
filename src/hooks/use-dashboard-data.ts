import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-client'
import { withQueryTracking } from '@/lib/monitoring'
import type {
  ComplianceDashboard,
  DetailedExpiringCheck,
  PilotReportSummary,
} from '@/lib/supabase'

/**
 * Hook to fetch compliance dashboard data
 * This provides high-level fleet compliance metrics
 */
export function useComplianceDashboard() {
  return useQuery({
    queryKey: queryKeys.complianceDashboard(),
    queryFn: async (): Promise<ComplianceDashboard | null> => {
      const result = await withQueryTracking('compliance_dashboard', async () => {
        const { data, error } = await supabase
          .from('compliance_dashboard')
          .select('*')
          .single()

        if (error) {
          console.error('Error fetching compliance dashboard:', error)
          throw error
        }

        return { data, count: data ? 1 : 0 }
      })

      return result.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data changes frequently
  })
}

/**
 * Hook to fetch detailed expiring checks
 * Shows specific checks that are expiring with pilot details
 */
export function useDetailedExpiringChecks(daysAhead = 90) {
  return useQuery({
    queryKey: queryKeys.detailedExpiringChecks(daysAhead),
    queryFn: async (): Promise<DetailedExpiringCheck[]> => {
      const result = await withQueryTracking('detailed_expiring_checks', async () => {
        const { data, error } = await supabase
          .from('detailed_expiring_checks')
          .select('*')
          .lte('days_until_expiry', daysAhead)
          .order('days_until_expiry', { ascending: true })

        if (error) {
          console.error('Error fetching detailed expiring checks:', error)
          throw error
        }

        return { data: data || [], count: data?.length || 0 }
      })

      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch pilot report summary
 * Provides comprehensive pilot data with check summaries
 */
export function usePilotReportSummary() {
  return useQuery({
    queryKey: [...queryKeys.pilots, 'report-summary'],
    queryFn: async (): Promise<PilotReportSummary[]> => {
      const result = await withQueryTracking('pilot_report_summary', async () => {
        const { data, error } = await supabase
          .from('pilot_report_summary')
          .select('*')
          .eq('is_active', true)
          .order('last_first_name', { ascending: true })

        if (error) {
          console.error('Error fetching pilot report summary:', error)
          throw error
        }

        return { data: data || [], count: data?.length || 0 }
      })

      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - pilot data doesn't change as frequently
  })
}

/**
 * Hook to fetch expiring checks (simplified view)
 * Good for quick alerts and notifications
 */
export function useExpiringChecks(daysAhead = 30) {
  return useQuery({
    queryKey: queryKeys.expiringChecks(daysAhead),
    queryFn: async () => {
      const result = await withQueryTracking('expiring_checks_optimized', async () => {
        const { data, error } = await supabase
          .from('expiring_checks')
          .select('*')
          .lte('days_until_expiry', daysAhead)
          .order('days_until_expiry', { ascending: true })

        if (error) {
          console.error('Error fetching expiring checks:', error)
          throw error
        }

        return { data: data || [], count: data?.length || 0 }
      })

      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch captain qualifications summary
 * Shows captain-specific qualifications and certifications
 */
export function useCaptainQualifications() {
  return useQuery({
    queryKey: [...queryKeys.pilots, 'captain-qualifications'],
    queryFn: async () => {
      const result = await withQueryTracking('captain_qualifications_summary', async () => {
        const { data, error } = await supabase
          .from('captain_qualifications_summary')
          .select('*')
          .eq('is_active', true)
          .order('pilot_name', { ascending: true })

        if (error) {
          console.error('Error fetching captain qualifications:', error)
          throw error
        }

        return { data: data || [], count: data?.length || 0 }
      })

      return result.data
    },
    staleTime: 1000 * 60 * 15, // 15 minutes - qualifications change infrequently
  })
}