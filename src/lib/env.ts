/**
 * Environment Variables Validation and Security
 *
 * This module ensures all required environment variables are present
 * and provides type-safe access to configuration values.
 */

import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Next.js Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Supabase Configuration (Public - can be exposed to client)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),

  // Supabase Configuration (Private - server-only)
  SUPABASE_PROJECT_ID: z.string().min(1, 'Supabase project ID is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Application Configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Security Configuration
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).optional(),
})

// Validate environment variables
const parseEnv = () => {
  try {
    // On client-side, only validate public variables
    if (typeof window !== 'undefined') {
      const clientEnvSchema = z.object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
      })

      const clientEnv = clientEnvSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })

      // Return with defaults for server-only vars
      return {
        ...clientEnv,
        SUPABASE_PROJECT_ID: 'client-side',
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        NEXTAUTH_URL: undefined,
        NEXTAUTH_SECRET: undefined,
        ALLOWED_ORIGINS: undefined,
        RATE_LIMIT_MAX: undefined,
      }
    }

    // Server-side: validate all variables
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues?.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ) || ['Environment validation failed']

      console.error('❌ Environment validation failed:')
      formattedErrors.forEach((err) => console.error(`  - ${err}`))

      throw new Error(
        `Environment validation failed: ${formattedErrors.join(', ')}`
      )
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Type-safe environment access
export type Env = typeof env

// Utility functions for environment checks
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Security helpers
export const getAllowedOrigins = (): string[] => {
  if (!env.ALLOWED_ORIGINS) {
    return isDevelopment ? ['http://localhost:3000'] : []
  }
  return env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
}

export const getRateLimitMax = (): number => {
  return env.RATE_LIMIT_MAX ?? (isDevelopment ? 1000 : 100)
}

// Validate critical security requirements
if (isProduction && (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32)) {
  console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters in production')
}

if (isProduction && !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is recommended for production')
}

// Redact sensitive values in logs
export const getRedactedEnv = () => {
  const redacted: Partial<Env> = { ...env }

  if (redacted.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redacted.NEXT_PUBLIC_SUPABASE_ANON_KEY = `${redacted.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 8)}...`
  }

  if (redacted.SUPABASE_SERVICE_ROLE_KEY) {
    redacted.SUPABASE_SERVICE_ROLE_KEY = '***REDACTED***'
  }

  if (redacted.NEXTAUTH_SECRET) {
    redacted.NEXTAUTH_SECRET = '***REDACTED***'
  }

  return redacted
}