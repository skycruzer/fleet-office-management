/**
 * Centralized Error Handling System
 *
 * This module provides comprehensive error handling for the B767 Fleet Manager,
 * including custom error types, error boundaries, and logging capabilities.
 */

import { ZodError } from 'zod'
import { AuthError } from '@supabase/supabase-js'
import { isProduction } from './env'

// Custom error types for aviation-specific errors
export class FleetManagerError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'FLEET_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'FleetManagerError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FleetManagerError)
    }
  }
}

// Authentication-specific errors
export class AuthenticationError extends FleetManagerError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message, code, 401)
    this.name = 'AuthenticationError'
  }
}

// Authorization-specific errors
export class AuthorizationError extends FleetManagerError {
  constructor(message: string = 'Insufficient permissions', code: string = 'AUTH_FORBIDDEN') {
    super(message, code, 403)
    this.name = 'AuthorizationError'
  }
}

// Validation-specific errors
export class ValidationError extends FleetManagerError {
  public readonly fields: Record<string, string[]>

  constructor(
    message: string = 'Validation failed',
    fields: Record<string, string[]> = {},
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, code, 400)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

// Aviation compliance errors
export class ComplianceError extends FleetManagerError {
  constructor(
    message: string,
    code: string = 'COMPLIANCE_ERROR',
    statusCode: number = 422
  ) {
    super(message, code, statusCode)
    this.name = 'ComplianceError'
  }
}

// Database operation errors
export class DatabaseError extends FleetManagerError {
  constructor(
    message: string = 'Database operation failed',
    code: string = 'DATABASE_ERROR',
    statusCode: number = 500
  ) {
    super(message, code, statusCode)
    this.name = 'DatabaseError'
  }
}

// Rate limiting errors
export class RateLimitError extends FleetManagerError {
  constructor(message: string = 'Rate limit exceeded', code: string = 'RATE_LIMIT') {
    super(message, code, 429)
    this.name = 'RateLimitError'
  }
}

// Error type mapping for external errors
export const mapExternalError = (error: unknown): FleetManagerError => {
  // Handle Supabase Auth errors
  if (error instanceof AuthError) {
    switch (error.message.toLowerCase()) {
      case 'invalid login credentials':
      case 'email not confirmed':
      case 'invalid_credentials':
        return new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS')
      case 'user not found':
        return new AuthenticationError('User not found', 'USER_NOT_FOUND')
      case 'signup_disabled':
        return new AuthenticationError('User registration is disabled', 'SIGNUP_DISABLED')
      default:
        return new AuthenticationError(error.message, 'AUTH_ERROR')
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {}

    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!fields[path]) {
        fields[path] = []
      }
      fields[path].push(err.message)
    })

    return new ValidationError('Validation failed', fields, 'VALIDATION_ERROR')
  }

  // Handle PostgreSQL errors (via Supabase)
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as { code: string; message: string; details?: string }

    switch (pgError.code) {
      case '23505': // Unique violation
        return new DatabaseError('A record with this data already exists', 'DUPLICATE_RECORD', 409)
      case '23503': // Foreign key violation
        return new DatabaseError('Referenced record does not exist', 'INVALID_REFERENCE', 409)
      case '23502': // Not null violation
        return new DatabaseError('Required field is missing', 'MISSING_FIELD', 400)
      case '42703': // Undefined column
        return new DatabaseError('Invalid field specified', 'INVALID_FIELD', 400)
      case 'PGRST116': // No data found
        return new DatabaseError('No data found', 'NOT_FOUND', 404)
      case 'PGRST301': // Connection error
        return new DatabaseError('Database connection failed', 'CONNECTION_ERROR', 503)
      default:
        return new DatabaseError(pgError.message || 'Database error', 'DATABASE_ERROR')
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new FleetManagerError('Network connection failed', 'NETWORK_ERROR', 503)
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new FleetManagerError(error.message, 'UNKNOWN_ERROR', 500)
  }

  // Fallback for unknown error types
  return new FleetManagerError('An unexpected error occurred', 'UNKNOWN_ERROR', 500)
}

// Error logging interface
export interface ErrorLog {
  timestamp: Date
  error: FleetManagerError
  context: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
}

// Error logger class
export class ErrorLogger {
  private logs: ErrorLog[] = []

  log(
    error: FleetManagerError,
    context: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      error,
      context: this.sanitizeContext(context),
      userId,
      sessionId,
      requestId,
    }

    this.logs.push(errorLog)

    // In production, send to monitoring service
    if (isProduction) {
      this.sendToMonitoringService(errorLog)
    } else {
      // In development, log to console with formatting
      this.logToConsole(errorLog)
    }
  }

  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context }

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential']

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***REDACTED***'
      }
    }

    return sanitized
  }

  private logToConsole(errorLog: ErrorLog): void {
    console.group(`🚨 ${errorLog.error.name} [${errorLog.error.code}]`)
    console.error('Message:', errorLog.error.message)
    console.error('Status Code:', errorLog.error.statusCode)
    console.error('Timestamp:', errorLog.timestamp.toISOString())

    if (errorLog.userId) {
      console.error('User ID:', errorLog.userId)
    }

    if (Object.keys(errorLog.context).length > 0) {
      console.error('Context:', errorLog.context)
    }

    if (!isProduction) {
      console.error('Stack:', errorLog.error.stack)
    }

    console.groupEnd()
  }

  private sendToMonitoringService(errorLog: ErrorLog): void {
    // TODO: Implement monitoring service integration
    // Examples: Sentry, DataDog, CloudWatch, etc.
    console.error('TODO: Send to monitoring service', {
      name: errorLog.error.name,
      code: errorLog.error.code,
      message: errorLog.error.message,
      statusCode: errorLog.error.statusCode,
      timestamp: errorLog.timestamp,
      userId: errorLog.userId,
    })
  }

  getRecentLogs(limit: number = 50): ErrorLog[] {
    return this.logs.slice(-limit)
  }

  clearLogs(): void {
    this.logs = []
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger()

// Error handling utilities
export const handleError = (
  error: unknown,
  context: Record<string, any> = {},
  userId?: string,
  sessionId?: string,
  requestId?: string
): FleetManagerError => {
  const mappedError = mapExternalError(error)
  errorLogger.log(mappedError, context, userId, sessionId, requestId)
  return mappedError
}

// Type guard for operational errors
export const isOperationalError = (error: unknown): error is FleetManagerError => {
  return error instanceof FleetManagerError && error.isOperational
}

// User-friendly error messages
export const getUserFriendlyMessage = (error: FleetManagerError): string => {
  // Aviation-specific error messages
  switch (error.code) {
    case 'COMPLIANCE_ERROR':
      return 'This operation would violate aviation compliance requirements. Please check certification dates and requirements.'

    case 'EXPIRED_CERTIFICATION':
      return 'One or more certifications have expired. Please renew before proceeding.'

    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please check your credentials and try again.'

    case 'USER_NOT_FOUND':
      return 'Account not found. Please contact your administrator for access.'

    case 'AUTH_FORBIDDEN':
      return 'You don\'t have permission to perform this action. Contact your administrator if you believe this is an error.'

    case 'VALIDATION_ERROR':
      return 'Please check the form for errors and try again.'

    case 'DUPLICATE_RECORD':
      return 'This record already exists. Please check for duplicates.'

    case 'CONNECTION_ERROR':
    case 'NETWORK_ERROR':
      return 'Connection failed. Please check your internet connection and try again.'

    case 'RATE_LIMIT':
      return 'Too many requests. Please wait a moment and try again.'

    default:
      return 'An unexpected error occurred. Please try again or contact support.'
  }
}

// Helper for async error handling
export const asyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw handleError(error, { function: fn.name, args })
    }
  }
}