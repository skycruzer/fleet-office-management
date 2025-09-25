import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-client'
import type { Pilot, CheckType, PilotCheck } from '@/lib/supabase'

/**
 * Hook to fetch all active pilots
 */
export function usePilots() {
  return useQuery({
    queryKey: queryKeys.allPilots(),
    queryFn: async (): Promise<Pilot[]> => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true })

      if (error) {
        console.error('Error fetching pilots:', error)
        throw error
      }

      return data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch a single pilot by ID
 */
export function usePilot(pilotId: string | null) {
  return useQuery({
    queryKey: queryKeys.pilot(pilotId || ''),
    queryFn: async (): Promise<Pilot | null> => {
      if (!pilotId) return null

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .single()

      if (error) {
        console.error('Error fetching pilot:', error)
        throw error
      }

      return data
    },
    enabled: !!pilotId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Hook to fetch pilot checks for a specific pilot
 */
export function usePilotChecks(pilotId: string | null) {
  return useQuery({
    queryKey: queryKeys.pilotChecks(pilotId || ''),
    queryFn: async () => {
      if (!pilotId) return []

      const { data, error } = await supabase
        .from('pilot_checks')
        .select(`
          *,
          check_types:check_type_id (
            id,
            check_code,
            check_description,
            category
          )
        `)
        .eq('pilot_id', pilotId)
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error fetching pilot checks:', error)
        throw error
      }

      return data || []
    },
    enabled: !!pilotId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch all check types
 */
export function useCheckTypes() {
  return useQuery({
    queryKey: queryKeys.allCheckTypes(),
    queryFn: async (): Promise<CheckType[]> => {
      const { data, error } = await supabase
        .from('check_types')
        .select('*')
        .order('check_code', { ascending: true })

      if (error) {
        console.error('Error fetching check types:', error)
        throw error
      }

      return data || []
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - check types rarely change
  })
}

/**
 * Hook to get pilots by role
 */
export function usePilotsByRole(role?: 'Captain' | 'First Officer') {
  return useQuery({
    queryKey: [...queryKeys.pilots, 'by-role', role || 'all'],
    queryFn: async (): Promise<Pilot[]> => {
      let query = supabase
        .from('pilots')
        .select('*')
        .eq('is_active', true)

      if (role) {
        query = query.eq('role', role)
      }

      const { data, error } = await query.order('last_name', { ascending: true })

      if (error) {
        console.error('Error fetching pilots by role:', error)
        throw error
      }

      return data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to search pilots by name
 */
export function useSearchPilots(searchTerm: string) {
  return useQuery({
    queryKey: [...queryKeys.pilots, 'search', searchTerm],
    queryFn: async (): Promise<Pilot[]> => {
      if (!searchTerm.trim()) return []

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_active', true)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true })

      if (error) {
        console.error('Error searching pilots:', error)
        throw error
      }

      return data || []
    },
    enabled: searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}