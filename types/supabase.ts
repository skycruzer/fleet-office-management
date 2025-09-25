export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      check_types: {
        Row: {
          category: string | null
          check_code: string
          check_description: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          check_code: string
          check_description: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          check_code?: string
          check_description?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pilot_checks: {
        Row: {
          check_type_id: string
          created_at: string
          expiry_date: string | null
          id: string
          pilot_id: string
          updated_at: string
        }
        Insert: {
          check_type_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          pilot_id: string
          updated_at?: string
        }
        Update: {
          check_type_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          pilot_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilot_checks_check_type_id_fkey"
            columns: ["check_type_id"]
            isOneToOne: false
            referencedRelation: "check_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_checks_check_type_id_fkey"
            columns: ["check_type_id"]
            isOneToOne: false
            referencedRelation: "detailed_expiring_checks"
            referencedColumns: ["check_type_id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "captain_qualifications_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "detailed_expiring_checks"
            referencedColumns: ["pilot_id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "expiring_checks"
            referencedColumns: ["pilot_id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilot_checks_overview"
            referencedColumns: ["pilot_id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilot_report_summary"
            referencedColumns: ["pilot_id"]
          },
          {
            foreignKeyName: "pilot_checks_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
        ]
      }
      pilots: {
        Row: {
          captain_qualifications: Json | null
          commencement_date: string | null
          contract_type: string | null
          created_at: string
          date_of_birth: string | null
          employee_id: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          middle_name: string | null
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          qualification_notes: string | null
          rhs_captain_expiry: string | null
          role: Database["public"]["Enums"]["pilot_role"]
          updated_at: string
        }
        Insert: {
          captain_qualifications?: Json | null
          commencement_date?: string | null
          contract_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          employee_id: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          middle_name?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          qualification_notes?: string | null
          rhs_captain_expiry?: string | null
          role: Database["public"]["Enums"]["pilot_role"]
          updated_at?: string
        }
        Update: {
          captain_qualifications?: Json | null
          commencement_date?: string | null
          contract_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          employee_id?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          middle_name?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          qualification_notes?: string | null
          rhs_captain_expiry?: string | null
          role?: Database["public"]["Enums"]["pilot_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pilots_contract_type"
            columns: ["contract_type"]
            isOneToOne: false
            referencedRelation: "contract_types"
            referencedColumns: ["name"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      captain_qualifications_summary: {
        Row: {
          captain_qualifications: Json | null
          employee_id: string | null
          id: string | null
          is_active: boolean | null
          is_examiner: boolean | null
          is_line_captain: boolean | null
          is_training_captain: boolean | null
          pilot_name: string | null
          qualification_notes: string | null
          role: Database["public"]["Enums"]["pilot_role"] | null
        }
        Insert: {
          captain_qualifications?: Json | null
          employee_id?: string | null
          id?: string | null
          is_active?: boolean | null
          is_examiner?: never
          is_line_captain?: never
          is_training_captain?: never
          pilot_name?: never
          qualification_notes?: string | null
          role?: Database["public"]["Enums"]["pilot_role"] | null
        }
        Update: {
          captain_qualifications?: Json | null
          employee_id?: string | null
          id?: string | null
          is_active?: boolean | null
          is_examiner?: never
          is_line_captain?: never
          is_training_captain?: never
          pilot_name?: never
          qualification_notes?: string | null
          role?: Database["public"]["Enums"]["pilot_role"] | null
        }
        Relationships: []
      }
      compliance_dashboard: {
        Row: {
          active_captains: number | null
          active_first_officers: number | null
          attention_checks: number | null
          attention_pilots: number | null
          avg_compliance_score: number | null
          avg_days_to_expiry: number | null
          check_types_expiring_soon: number | null
          check_types_with_expired: number | null
          checks_with_dates: number | null
          compliance_percentage: number | null
          compliant_pilots: number | null
          critical_checks: number | null
          critical_pilots: number | null
          examiner_ratio: number | null
          examiners: number | null
          expired_checks: number | null
          expired_checks_percentage: number | null
          expiring_next_14_days: number | null
          expiring_next_30_days: number | null
          expiring_next_60_days: number | null
          expiring_next_7_days: number | null
          expiring_next_90_days: number | null
          fo_to_captain_ratio: number | null
          generated_at: string | null
          line_captain_coverage_percentage: number | null
          line_captains: number | null
          max_compliance_score: number | null
          min_compliance_score: number | null
          non_compliant_pilots: number | null
          pilots_with_checks: number | null
          report_date: string | null
          total_active_pilots: number | null
          total_categories: number | null
          total_check_types: number | null
          total_checks: number | null
          training_captain_ratio: number | null
          training_captains: number | null
          urgent_checks: number | null
          urgent_pilots: number | null
          warning_checks: number | null
          warning_pilots: number | null
        }
        Relationships: []
      }
      detailed_expiring_checks: {
        Row: {
          captain_qualifications: Json | null
          check_category: string | null
          check_code: string | null
          check_created_at: string | null
          check_description: string | null
          check_type_id: string | null
          check_updated_at: string | null
          days_until_expiry: number | null
          employee_id: string | null
          expiry_date: string | null
          first_name: string | null
          is_active: boolean | null
          is_examiner: boolean | null
          is_line_captain: boolean | null
          is_training_captain: boolean | null
          last_name: string | null
          middle_name: string | null
          nationality: string | null
          pilot_check_id: string | null
          pilot_id: string | null
          pilot_name: string | null
          priority_score: number | null
          role: Database["public"]["Enums"]["pilot_role"] | null
          status: string | null
        }
        Relationships: []
      }
      expiring_checks: {
        Row: {
          check_code: string | null
          check_description: string | null
          days_until_expiry: number | null
          employee_id: string | null
          expiry_date: string | null
          pilot_id: string | null
          pilot_name: string | null
          role: Database["public"]["Enums"]["pilot_role"] | null
        }
        Relationships: []
      }
      pilot_checks_overview: {
        Row: {
          check_code: string | null
          check_description: string | null
          commencement_date: string | null
          date_of_birth: string | null
          employee_id: string | null
          expiry_date: string | null
          first_name: string | null
          full_name: string | null
          is_active: boolean | null
          last_name: string | null
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          pilot_id: string | null
          role: Database["public"]["Enums"]["pilot_role"] | null
          status: string | null
        }
        Relationships: []
      }
      pilot_qualification_summary: {
        Row: {
          active_captains: number | null
          active_first_officers: number | null
          examiners: number | null
          line_captains: number | null
          total_pilots: number | null
          training_captains: number | null
        }
        Relationships: []
      }
      pilot_report_summary: {
        Row: {
          all_categories: string[] | null
          attention_checks: number | null
          captain_qualifications: Json | null
          checks_with_dates: number | null
          commencement_date: string | null
          compliance_score: number | null
          compliance_status: string | null
          created_at: string | null
          critical_checks: number | null
          current_categories: number | null
          date_of_birth: string | null
          days_to_next_expiry: number | null
          earliest_expiry: string | null
          employee_id: string | null
          expired_checks: number | null
          first_name: string | null
          full_name: string | null
          is_active: boolean | null
          is_examiner: boolean | null
          is_line_captain: boolean | null
          is_training_captain: boolean | null
          last_first_name: string | null
          last_name: string | null
          latest_expiry: string | null
          middle_name: string | null
          nationality: string | null
          next_expiry_date: string | null
          passport_expiry: string | null
          passport_number: string | null
          pilot_id: string | null
          qualification_notes: string | null
          role: Database["public"]["Enums"]["pilot_role"] | null
          total_categories: number | null
          total_checks: number | null
          updated_at: string | null
          urgent_checks: number | null
          warning_checks: number | null
        }
        Relationships: []
      }
      pilot_requirements_compliance: {
        Row: {
          active_captains: number | null
          active_first_officers: number | null
          captain_compliance_status: string | null
          examiner_compliance_status: string | null
          examiners: number | null
          first_officer_compliance_status: string | null
          required_captains: number | null
          required_examiners: number | null
          required_first_officers: number | null
          required_training_captains: number | null
          training_captain_compliance_status: string | null
          training_captains: number | null
        }
        Relationships: []
      }
      table_performance_stats: {
        Row: {
          analyze_count: number | null
          autoanalyze_count: number | null
          autovacuum_count: number | null
          last_analyze: string | null
          last_autoanalyze: string | null
          last_autovacuum: string | null
          last_vacuum: string | null
          n_dead_tup: number | null
          n_live_tup: number | null
          n_tup_del: number | null
          n_tup_hot_upd: number | null
          n_tup_ins: number | null
          n_tup_upd: number | null
          schemaname: unknown | null
          table_name: unknown | null
          vacuum_count: number | null
        }
        Relationships: []
      }
      v_index_performance_monitor: {
        Row: {
          index_name: unknown | null
          index_type: string | null
          schemaname: unknown | null
          table_name: unknown | null
          total_index_rows_fetched: number | null
          total_index_rows_read: number | null
          total_index_scans: number | null
          usage_level: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assignment_type:
        | "FLIGHT"
        | "STANDBY"
        | "TRAINING"
        | "OFFICE"
        | "LEAVE"
        | "SICK"
        | "REST"
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "VIEW"
        | "APPROVE"
        | "REJECT"
        | "LOGIN"
        | "LOGOUT"
        | "EXPORT"
      certification_category:
        | "LICENCE"
        | "MEDICAL"
        | "IDENTITY"
        | "PASSPORT"
        | "AIRCRAFT_TYPE"
        | "TRAINING"
        | "OPERATIONAL"
        | "SIMULATOR"
      certification_status:
        | "VALID"
        | "EXPIRING"
        | "EXPIRED"
        | "PENDING_RENEWAL"
        | "NOT_APPLICABLE"
      check_category:
        | "MEDICAL"
        | "LICENSE"
        | "TRAINING"
        | "QUALIFICATION"
        | "SECURITY"
        | "RECENCY"
        | "LANGUAGE"
      check_status:
        | "EXPIRED"
        | "EXPIRING_7_DAYS"
        | "EXPIRING_30_DAYS"
        | "EXPIRING_60_DAYS"
        | "EXPIRING_90_DAYS"
        | "CURRENT"
      crew_role:
        | "CAPTAIN"
        | "FIRST_OFFICER"
        | "SECOND_OFFICER"
        | "TRAINING_CAPTAIN"
        | "CHECK_CAPTAIN"
      leave_type:
        | "RDO"
        | "SDO"
        | "ANN"
        | "SCK"
        | "LSL"
        | "COMP"
        | "MAT"
        | "PAT"
        | "UNPAID"
      notification_level:
        | "90_DAYS"
        | "60_DAYS"
        | "30_DAYS"
        | "14_DAYS"
        | "7_DAYS"
        | "EXPIRED"
        | "CRITICAL"
      notification_status:
        | "PENDING"
        | "SENT"
        | "ACKNOWLEDGED"
        | "FAILED"
        | "CANCELLED"
      pilot_position: "captain" | "first_officer" | "second_officer" | "cadet"
      pilot_role: "Captain" | "First Officer"
      request_status:
        | "DRAFT"
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED"
        | "EXPIRED"
      visa_type: "Australia" | "China" | "New Zealand" | "Japan" | "Canada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assignment_type: [
        "FLIGHT",
        "STANDBY",
        "TRAINING",
        "OFFICE",
        "LEAVE",
        "SICK",
        "REST",
      ],
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "APPROVE",
        "REJECT",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
      ],
      certification_category: [
        "LICENCE",
        "MEDICAL",
        "IDENTITY",
        "PASSPORT",
        "AIRCRAFT_TYPE",
        "TRAINING",
        "OPERATIONAL",
        "SIMULATOR",
      ],
      certification_status: [
        "VALID",
        "EXPIRING",
        "EXPIRED",
        "PENDING_RENEWAL",
        "NOT_APPLICABLE",
      ],
      check_category: [
        "MEDICAL",
        "LICENSE",
        "TRAINING",
        "QUALIFICATION",
        "SECURITY",
        "RECENCY",
        "LANGUAGE",
      ],
      check_status: [
        "EXPIRED",
        "EXPIRING_7_DAYS",
        "EXPIRING_30_DAYS",
        "EXPIRING_60_DAYS",
        "EXPIRING_90_DAYS",
        "CURRENT",
      ],
      crew_role: [
        "CAPTAIN",
        "FIRST_OFFICER",
        "SECOND_OFFICER",
        "TRAINING_CAPTAIN",
        "CHECK_CAPTAIN",
      ],
      leave_type: [
        "RDO",
        "SDO",
        "ANN",
        "SCK",
        "LSL",
        "COMP",
        "MAT",
        "PAT",
        "UNPAID",
      ],
      notification_level: [
        "90_DAYS",
        "60_DAYS",
        "30_DAYS",
        "14_DAYS",
        "7_DAYS",
        "EXPIRED",
        "CRITICAL",
      ],
      notification_status: [
        "PENDING",
        "SENT",
        "ACKNOWLEDGED",
        "FAILED",
        "CANCELLED",
      ],
      pilot_position: ["captain", "first_officer", "second_officer", "cadet"],
      pilot_role: ["Captain", "First Officer"],
      request_status: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED",
      ],
      visa_type: ["Australia", "China", "New Zealand", "Japan", "Canada"],
    },
  },
} as const