/**
 * Input Validation Schemas for B767 Fleet Manager
 *
 * This module provides comprehensive Zod validation schemas for all
 * data types used in the aviation fleet management system.
 */

import { z } from 'zod'

// Base validation schemas
export const baseSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email address too long'),

  // Password validation (for authentication)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),

  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Date validation
  date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .transform((date) => new Date(date)),

  // Aviation-specific validations
  employeeId: z.string()
    .regex(/^[A-Za-z0-9]{3,7}$/, 'Employee ID must be 3-7 alphanumeric characters')
    .transform((id) => id.toUpperCase()),

  // Passport number validation (international standard - more flexible)
  passportNumber: z.string()
    .regex(/^[A-Z0-9]{8,11}$/, 'Invalid passport number format')
    .optional(),

  // ICAO license number validation
  licenseNumber: z.string()
    .regex(/^[A-Z0-9]{6,12}$/, 'Invalid license number format')
    .optional(),
}

// Pilot validation schemas
export const pilotSchemas = {
  // Pilot role validation
  role: z.enum(['Captain', 'First Officer'], {
    errorMap: () => ({ message: 'Role must be either Captain or First Officer' })
  }),

  // Contract type validation
  contractType: z.enum(['Full-time', 'Part-time', 'Contract'], {
    errorMap: () => ({ message: 'Invalid contract type' })
  }),

  // Captain qualifications validation
  captainQualifications: z.array(
    z.enum(['line_captain', 'training_captain', 'examiner'])
  ).optional(),

  // Create pilot validation
  createPilot: z.object({
    employee_id: baseSchemas.employeeId,
    first_name: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name too long')
      .regex(/^[A-Za-z\s'-]+$/, 'Invalid characters in first name'),
    last_name: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name too long')
      .regex(/^[A-Za-z\s'-]+$/, 'Invalid characters in last name'),
    email: baseSchemas.email.optional(),
    role: z.enum(['Captain', 'First Officer']),
    date_of_birth: baseSchemas.date.optional(),
    hire_date: baseSchemas.date.optional(),
    contract_type_id: baseSchemas.uuid.optional(),
    passport_number: baseSchemas.passportNumber,
    passport_expiry: baseSchemas.date.optional(),
    license_number: baseSchemas.licenseNumber,
    license_expiry: baseSchemas.date.optional(),
    captain_qualifications: z.array(z.string()).optional(),
    is_active: z.boolean().default(true),
  }),

  // Update pilot validation (partial)
  updatePilot: z.object({
    first_name: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name too long')
      .regex(/^[A-Za-z\s'-]+$/, 'Invalid characters in first name')
      .optional(),
    last_name: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name too long')
      .regex(/^[A-Za-z\s'-]+$/, 'Invalid characters in last name')
      .optional(),
    email: baseSchemas.email.optional(),
    role: z.enum(['Captain', 'First Officer']).optional(),
    date_of_birth: baseSchemas.date.optional(),
    hire_date: baseSchemas.date.optional(),
    contract_type_id: baseSchemas.uuid.optional(),
    passport_number: baseSchemas.passportNumber,
    passport_expiry: baseSchemas.date.optional(),
    license_number: baseSchemas.licenseNumber,
    license_expiry: baseSchemas.date.optional(),
    captain_qualifications: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
  }).partial(),
}

// Certification validation schemas
export const certificationSchemas = {
  // Check status validation
  checkStatus: z.enum(['CURRENT', 'EXPIRED', 'CRITICAL', 'URGENT', 'WARNING', 'ATTENTION'], {
    errorMap: () => ({ message: 'Invalid check status' })
  }),

  // Create pilot check validation
  createPilotCheck: z.object({
    pilot_id: baseSchemas.uuid,
    check_type_id: baseSchemas.uuid,
    completion_date: baseSchemas.date.optional(),
    expiry_date: baseSchemas.date.optional(),
    instructor_id: baseSchemas.uuid.optional(),
    notes: z.string().max(1000, 'Notes too long').optional(),
    is_current: z.boolean().default(true),
  }).refine(
    (data) => {
      // If completion_date is provided, expiry_date should be after it
      if (data.completion_date && data.expiry_date) {
        return data.expiry_date > data.completion_date
      }
      return true
    },
    {
      message: 'Expiry date must be after completion date',
      path: ['expiry_date']
    }
  ),

  // Update pilot check validation
  updatePilotCheck: z.object({
    completion_date: baseSchemas.date.optional(),
    expiry_date: baseSchemas.date.optional(),
    instructor_id: baseSchemas.uuid.optional(),
    notes: z.string().max(1000, 'Notes too long').optional(),
    is_current: z.boolean().optional(),
  }).partial(),

  // Check type validation
  createCheckType: z.object({
    name: z.string()
      .min(1, 'Check type name is required')
      .max(100, 'Check type name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    category: z.string()
      .min(1, 'Category is required')
      .max(50, 'Category name too long'),
    validity_period_days: z.number()
      .int('Validity period must be a whole number')
      .min(1, 'Validity period must be at least 1 day')
      .max(3650, 'Validity period cannot exceed 10 years'), // 10 years max
    is_required: z.boolean().default(true),
    is_recurrent: z.boolean().default(true),
  }),
}

// Search and filter validation schemas
export const searchSchemas = {
  // Pilot search/filter
  pilotSearch: z.object({
    search: z.string().max(100, 'Search term too long').optional(),
    role: z.enum(['all', 'Captain', 'First Officer']).default('all'),
    status: z.enum(['all', 'compliant', 'attention', 'critical']).default('all'),
    contractType: z.string().optional(),
    sortBy: z.enum(['name', 'employee_id', 'compliance_score', 'hire_date']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  // Certification search/filter
  certificationSearch: z.object({
    search: z.string().max(100, 'Search term too long').optional(),
    status: z.enum(['all', 'current', 'expired', 'expiring']).default('all'),
    checkType: z.string().optional(),
    pilotId: baseSchemas.uuid.optional(),
    daysAhead: z.number().int().min(1).max(365).default(90),
    sortBy: z.enum(['expiry_date', 'pilot_name', 'check_type']).default('expiry_date'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(50),
  }),
}

// Authentication validation schemas
export const authSchemas = {
  // Sign in validation
  signIn: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  // Sign up validation
  signUp: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: z.string(),
    role: z.enum(['user', 'admin']).default('user'),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  ),

  // Password reset validation
  passwordReset: z.object({
    email: baseSchemas.email,
  }),
}

// Settings validation schemas
export const settingsSchemas = {
  // Application settings
  updateSettings: z.object({
    pilot_requirements: z.object({
      retirement_age: z.number().int().min(55).max(70).optional(),
      medical_validity_days: z.number().int().min(30).max(365).optional(),
      line_check_validity_days: z.number().int().min(90).max(365).optional(),
    }).optional(),

    fleet_configuration: z.object({
      alert_thresholds: z.object({
        critical: z.number().int().min(1).max(30).optional(),
        urgent: z.number().int().min(1).max(60).optional(),
        warning: z.number().int().min(1).max(90).optional(),
      }).optional(),
      notification_settings: z.object({
        email_alerts: z.boolean().optional(),
        dashboard_alerts: z.boolean().optional(),
        system_notifications: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }),
}

// Export all validation functions
export const validate = {
  // Pilot validations
  createPilot: (data: unknown) => pilotSchemas.createPilot.parse(data),
  updatePilot: (data: unknown) => pilotSchemas.updatePilot.parse(data),

  // Certification validations
  createPilotCheck: (data: unknown) => certificationSchemas.createPilotCheck.parse(data),
  updatePilotCheck: (data: unknown) => certificationSchemas.updatePilotCheck.parse(data),
  createCheckType: (data: unknown) => certificationSchemas.createCheckType.parse(data),

  // Search validations
  pilotSearch: (data: unknown) => searchSchemas.pilotSearch.parse(data),
  certificationSearch: (data: unknown) => searchSchemas.certificationSearch.parse(data),

  // Auth validations
  signIn: (data: unknown) => authSchemas.signIn.parse(data),
  signUp: (data: unknown) => authSchemas.signUp.parse(data),
  passwordReset: (data: unknown) => authSchemas.passwordReset.parse(data),

  // Settings validations
  updateSettings: (data: unknown) => settingsSchemas.updateSettings.parse(data),
}

// Helper function for safe validation
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues?.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ) || ['Validation failed']
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}