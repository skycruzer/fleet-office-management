import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { env } from '@/lib/env'

// Use validated environment variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable authentication for secure access
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    // Enable realtime for live updates
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'b767-fleet-manager@1.0.0',
    },
  },
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  console.error('Supabase error:', error)

  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
    return 'No data found'
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST301') {
    return 'Database connection error'
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return 'An unexpected error occurred'
}

// Type exports for convenience
export type {
  Database,
  Tables,
  Enums
} from '@/types/supabase'

// Helper types for common database operations
export type Pilot = Database['public']['Tables']['pilots']['Row']
export type PilotInsert = Database['public']['Tables']['pilots']['Insert']
export type PilotUpdate = Database['public']['Tables']['pilots']['Update']

export type CheckType = Database['public']['Tables']['check_types']['Row']
export type PilotCheck = Database['public']['Tables']['pilot_checks']['Row']

// View types for dashboard components
export type ComplianceDashboard = Database['public']['Views']['compliance_dashboard']['Row']
export type DetailedExpiringCheck = Database['public']['Views']['detailed_expiring_checks']['Row']
export type PilotReportSummary = Database['public']['Views']['pilot_report_summary']['Row']
export type ExpiringCheck = Database['public']['Views']['expiring_checks']['Row']

// Enum types
export type PilotRole = Database['public']['Enums']['pilot_role']
export type CheckStatus = Database['public']['Enums']['check_status']