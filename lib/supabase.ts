import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Since we're not using authentication initially, disable auth
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // Enable realtime for live updates if needed
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'fleet-office-management@1.0.0',
    },
  },
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)

  if (error?.code === 'PGRST116') {
    return 'No data found'
  }

  if (error?.code === 'PGRST301') {
    return 'Database connection error'
  }

  if (error?.message) {
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