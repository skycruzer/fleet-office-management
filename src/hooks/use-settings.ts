import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types for settings
export interface PilotRequirements {
  number_of_aircraft: number
  pilot_retirement_age: number
  captains_per_hull: number
  first_officers_per_hull: number
  training_captains_per_pilots: number
  examiners_per_pilots: number
  minimum_captains_per_hull: number
  minimum_first_officers_per_hull: number
}

export interface AlertThresholds {
  critical_days: number
  urgent_days: number
  warning_30_days: number
  warning_60_days: number
  early_warning_90_days: number
}

export interface FleetSettings {
  aircraftCount: number
  retirementAge: number
  captainsPerHull: number
  firstOfficersPerHull: number
  trainingCaptainRatio: number
  examinerRatio: number
  criticalAlertDays: number
  urgentAlertDays: number
  warning30Days: number
  warning60Days: number
  earlyWarning90Days: number
}

// Transform database format to component format
const transformToComponentFormat = (
  pilotReqs: PilotRequirements,
  alertThresholds: AlertThresholds
): FleetSettings => ({
  aircraftCount: pilotReqs.number_of_aircraft,
  retirementAge: pilotReqs.pilot_retirement_age,
  captainsPerHull: pilotReqs.captains_per_hull,
  firstOfficersPerHull: pilotReqs.first_officers_per_hull,
  trainingCaptainRatio: pilotReqs.training_captains_per_pilots,
  examinerRatio: pilotReqs.examiners_per_pilots,
  criticalAlertDays: alertThresholds.critical_days,
  urgentAlertDays: alertThresholds.urgent_days,
  warning30Days: alertThresholds.warning_30_days,
  warning60Days: alertThresholds.warning_60_days,
  earlyWarning90Days: alertThresholds.early_warning_90_days,
})

// Transform component format to database format
const transformToDbFormat = (settings: FleetSettings) => ({
  pilot_requirements: {
    number_of_aircraft: settings.aircraftCount,
    pilot_retirement_age: settings.retirementAge,
    captains_per_hull: settings.captainsPerHull,
    first_officers_per_hull: settings.firstOfficersPerHull,
    training_captains_per_pilots: settings.trainingCaptainRatio,
    examiners_per_pilots: settings.examinerRatio,
    minimum_captains_per_hull: Math.ceil(settings.aircraftCount * Math.min(settings.captainsPerHull, 5)),
    minimum_first_officers_per_hull: Math.ceil(settings.aircraftCount * Math.min(settings.firstOfficersPerHull, 5)),
  },
  alert_thresholds: {
    critical_days: settings.criticalAlertDays,
    urgent_days: settings.urgentAlertDays,
    warning_30_days: settings.warning30Days,
    warning_60_days: settings.warning60Days,
    early_warning_90_days: settings.earlyWarning90Days,
  }
})

// Hook to get real pilot counts
export function usePilotCounts() {
  return useQuery({
    queryKey: ['pilot-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_pilot_counts')

      if (error) {
        // Fallback to manual query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('pilots')
          .select(`
            id,
            role,
            captain_qualifications,
            is_active
          `)
          .eq('is_active', true)

        if (fallbackError) {
          throw new Error(`Failed to fetch pilot counts: ${fallbackError.message}`)
        }

        // Calculate counts manually
        const totalPilots = fallbackData.length
        const captains = fallbackData.filter(p => p.role === 'Captain').length
        const firstOfficers = fallbackData.filter(p => p.role === 'First Officer').length
        const trainingCaptains = fallbackData.filter(p =>
          Array.isArray(p.captain_qualifications) &&
          p.captain_qualifications.includes('training_captain')
        ).length
        const examiners = fallbackData.filter(p =>
          Array.isArray(p.captain_qualifications) &&
          p.captain_qualifications.includes('examiner')
        ).length

        return {
          total_pilots: totalPilots,
          captains,
          first_officers: firstOfficers,
          training_captains: trainingCaptains,
          examiners
        }
      }

      return data
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  })
}

export function useFleetSettings() {
  const queryClient = useQueryClient()

  // Query to fetch settings
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ['fleet-settings'],
    queryFn: async (): Promise<FleetSettings> => {
      const [pilotReqsResult, alertThresholdsResult] = await Promise.all([
        supabase
          .from('settings')
          .select('value')
          .eq('key', 'pilot_requirements')
          .single(),
        supabase
          .from('settings')
          .select('value')
          .eq('key', 'alert_thresholds')
          .single(),
      ])

      if (pilotReqsResult.error) {
        throw new Error(`Failed to fetch pilot requirements: ${pilotReqsResult.error.message}`)
      }

      if (alertThresholdsResult.error) {
        throw new Error(`Failed to fetch alert thresholds: ${alertThresholdsResult.error.message}`)
      }

      return transformToComponentFormat(
        pilotReqsResult.data.value as PilotRequirements,
        alertThresholdsResult.data.value as AlertThresholds
      )
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  // Query to fetch pilot counts
  const {
    data: pilotCounts,
    isLoading: countsLoading,
    error: countsError,
  } = usePilotCounts()

  const isLoading = settingsLoading || countsLoading
  const error = settingsError || countsError

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: FleetSettings) => {
      const dbData = transformToDbFormat(newSettings)

      const [pilotReqsResult, alertThresholdsResult] = await Promise.all([
        supabase
          .from('settings')
          .update({
            value: dbData.pilot_requirements,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'pilot_requirements'),
        supabase
          .from('settings')
          .update({
            value: dbData.alert_thresholds,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'alert_thresholds'),
      ])

      if (pilotReqsResult.error) {
        throw new Error(`Failed to update pilot requirements: ${pilotReqsResult.error.message}`)
      }

      if (alertThresholdsResult.error) {
        throw new Error(`Failed to update alert thresholds: ${alertThresholdsResult.error.message}`)
      }

      return newSettings
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with the new settings
      queryClient.setQueryData(['fleet-settings'], updatedSettings)

      // Invalidate related queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['compliance-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['expiring-checks'] })
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
    },
  })

  return {
    settings,
    pilotCounts,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    updateError: updateSettingsMutation.error,
  }
}