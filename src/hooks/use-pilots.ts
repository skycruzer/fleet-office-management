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
        .order('expiry_date', { ascending: true, nullsLast: true })

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

// Helper function to calculate age from birth date
function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Helper function to calculate years of service
function calculateYearsOfService(commencementDate: string | null): number | null {
  if (!commencementDate) return null
  const today = new Date()
  const start = new Date(commencementDate)
  const diffTime = Math.abs(today.getTime() - start.getTime())
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.round(diffYears * 10) / 10 // Round to 1 decimal place
}

// Helper function to calculate time to retirement
function calculateTimeToRetirement(birthDate: string | null, retirementAge: number = 65) {
  if (!birthDate) return null

  const birth = new Date(birthDate)
  const retirementDate = new Date(birth)
  retirementDate.setFullYear(birth.getFullYear() + retirementAge)

  const today = new Date()
  const timeDiff = retirementDate.getTime() - today.getTime()

  if (timeDiff <= 0) return { years: 0, months: 0, days: 0, isRetired: true }

  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))

  return { years, months, days, isRetired: false }
}

// Helper function to calculate seniority number based on years of service
function calculateSeniorityNumber(yearsOfService: number | null, allPilots: Pilot[]): number | null {
  if (yearsOfService === null) return null

  // Sort pilots by years of service (descending) and count those with more service
  const pilotsWithService = allPilots
    .map(pilot => ({
      id: pilot.id,
      yearsOfService: calculateYearsOfService(pilot.commencement_date)
    }))
    .filter(pilot => pilot.yearsOfService !== null)
    .sort((a, b) => (b.yearsOfService || 0) - (a.yearsOfService || 0))

  const seniorityRank = pilotsWithService.findIndex(pilot =>
    Math.abs((pilot.yearsOfService || 0) - yearsOfService) < 0.1
  ) + 1

  return seniorityRank || null
}

export interface PilotDetailData extends Pilot {
  age: number | null
  yearsOfService: number | null
  timeToRetirement: {
    years: number
    months: number
    days: number
    isRetired: boolean
  } | null
  seniorityNumber: number | null
  fullName: string
  initials: string
  hasLineCapatinQual: boolean
  hasTrainingCaptainQual: boolean
  hasExaminerQual: boolean
}

/**
 * Hook to fetch comprehensive pilot detail data with calculated fields
 */
export function usePilotDetail(pilotId: string | null) {
  const { data: allPilots } = usePilots() // Needed for seniority calculation

  return useQuery({
    queryKey: queryKeys.pilot(pilotId || ''),
    queryFn: async (): Promise<PilotDetailData | null> => {
      if (!pilotId) return null

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .single()

      if (error) {
        console.error('Error fetching pilot detail:', error)
        throw error
      }

      if (!data) return null

      // Calculate derived fields
      const age = calculateAge(data.date_of_birth)
      const yearsOfService = calculateYearsOfService(data.commencement_date)
      const timeToRetirement = calculateTimeToRetirement(data.date_of_birth)
      const seniorityNumber = allPilots ? calculateSeniorityNumber(yearsOfService, allPilots) : null

      const fullName = `${data.first_name || ''} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name || ''}`.trim()
      const initials = `${data.first_name?.[0] || ''}${data.last_name?.[0] || ''}`

      // Check qualifications
      const qualifications = data.captain_qualifications || []
      const hasLineCapatinQual = qualifications.includes('line_captain')
      const hasTrainingCaptainQual = qualifications.includes('training_captain')
      const hasExaminerQual = qualifications.includes('examiner')

      return {
        ...data,
        age,
        yearsOfService,
        timeToRetirement,
        seniorityNumber,
        fullName,
        initials,
        hasLineCapatinQual,
        hasTrainingCaptainQual,
        hasExaminerQual
      }
    },
    enabled: !!pilotId && !!allPilots, // Wait for allPilots data for seniority calculation
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}