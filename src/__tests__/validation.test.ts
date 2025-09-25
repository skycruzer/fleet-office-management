import { describe, it, expect } from 'vitest'
import { validate, safeValidate } from '@/lib/validations'
import { z } from 'zod'

describe('Aviation Input Validation', () => {
  describe('Pilot Validation', () => {
    describe('createPilot', () => {
      it('should validate a complete pilot record', () => {
        const validPilot = {
          employee_id: 'B767001',
          first_name: 'John',
          last_name: 'Smith',
          email: 'j.smith@airline.com',
          role: 'Captain',
          date_of_birth: '1985-05-15',
          hire_date: '2010-03-20',
          passport_number: 'US123456789',
          passport_expiry: '2030-05-15',
          license_number: 'ATP987654321',
          license_expiry: '2025-03-20',
          captain_qualifications: ['line_captain', 'training_captain'],
          is_active: true,
        }

        expect(() => validate.createPilot(validPilot)).not.toThrow()
      })

      it('should require mandatory fields', () => {
        const incompletePilot = {
          first_name: 'John',
          // Missing employee_id, last_name, role
        }

        expect(() => validate.createPilot(incompletePilot)).toThrow()
      })

      it('should validate employee ID format (aviation standard)', () => {
        const testCases = [
          { employee_id: 'B767001', valid: true },
          { employee_id: 'ABC123', valid: true },
          { employee_id: 'PILOT001', valid: false }, // Too long
          { employee_id: 'A1', valid: false }, // Too short
          { employee_id: 'abc123', valid: true }, // Should be converted to uppercase
          { employee_id: '123-456', valid: false }, // Invalid characters
        ]

        testCases.forEach(({ employee_id, valid }) => {
          const pilot = {
            employee_id,
            first_name: 'John',
            last_name: 'Smith',
            role: 'Captain' as const,
          }

          if (valid) {
            expect(() => validate.createPilot(pilot)).not.toThrow()
          } else {
            expect(() => validate.createPilot(pilot)).toThrow()
          }
        })
      })

      it('should validate pilot role (FAA standard)', () => {
        const validRoles = ['Captain', 'First Officer']
        const invalidRoles = ['Pilot', 'Co-Pilot', 'captain', 'CAPTAIN']

        validRoles.forEach(role => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role,
          }
          expect(() => validate.createPilot(pilot)).not.toThrow()
        })

        invalidRoles.forEach(role => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role,
          }
          expect(() => validate.createPilot(pilot)).toThrow()
        })
      })

      it('should validate name format (no special characters)', () => {
        const validNames = ['John', 'Mary-Jane', "O'Connor", 'Jean Pierre']
        const invalidNames = ['John123', 'Mary@Jane', 'John.Smith', 'J0hn']

        validNames.forEach(name => {
          const pilot = {
            employee_id: 'B767001',
            first_name: name,
            last_name: 'Smith',
            role: 'Captain' as const,
          }
          expect(() => validate.createPilot(pilot)).not.toThrow()
        })

        invalidNames.forEach(name => {
          const pilot = {
            employee_id: 'B767001',
            first_name: name,
            last_name: 'Smith',
            role: 'Captain' as const,
          }
          expect(() => validate.createPilot(pilot)).toThrow()
        })
      })

      it('should validate passport number format', () => {
        const validPassports = ['US123456789', 'GB987654321', undefined]
        const invalidPassports = ['US12345', 'us123456789', '123-456-789', 'TOOLONGPASSPORT']

        validPassports.forEach(passport_number => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role: 'Captain' as const,
            passport_number,
          }
          expect(() => validate.createPilot(pilot)).not.toThrow()
        })

        invalidPassports.forEach(passport_number => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role: 'Captain' as const,
            passport_number,
          }
          expect(() => validate.createPilot(pilot)).toThrow()
        })
      })

      it('should validate license number format (ICAO standard)', () => {
        const validLicenses = ['ATP987654321', 'CPL123456', 'PPL987654', undefined]
        const invalidLicenses = ['ATP12', 'atp987654321', '987-654-321', 'TOOLONGLICENSE']

        validLicenses.forEach(license_number => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role: 'Captain' as const,
            license_number,
          }
          expect(() => validate.createPilot(pilot)).not.toThrow()
        })

        invalidLicenses.forEach(license_number => {
          const pilot = {
            employee_id: 'B767001',
            first_name: 'John',
            last_name: 'Smith',
            role: 'Captain' as const,
            license_number,
          }
          expect(() => validate.createPilot(pilot)).toThrow()
        })
      })
    })
  })

  describe('Certification Validation', () => {
    describe('createPilotCheck', () => {
      it('should validate a complete pilot check record', () => {
        const validCheck = {
          pilot_id: '550e8400-e29b-41d4-a716-446655440000',
          check_type_id: '550e8400-e29b-41d4-a716-446655440001',
          completion_date: '2024-01-15',
          expiry_date: '2025-01-15',
          instructor_id: '550e8400-e29b-41d4-a716-446655440002',
          notes: 'Completed successfully with no discrepancies',
          is_current: true,
        }

        expect(() => validate.createPilotCheck(validCheck)).not.toThrow()
      })

      it('should require pilot_id and check_type_id', () => {
        const incompleteCheck = {
          completion_date: '2024-01-15',
          expiry_date: '2025-01-15',
        }

        expect(() => validate.createPilotCheck(incompleteCheck)).toThrow()
      })

      it('should validate UUID format for IDs', () => {
        const invalidUUIDs = ['not-a-uuid', '123', 'abc-def-ghi']
        const validUUID = '550e8400-e29b-41d4-a716-446655440000'

        invalidUUIDs.forEach(id => {
          const check = {
            pilot_id: id,
            check_type_id: validUUID,
          }
          expect(() => validate.createPilotCheck(check)).toThrow()
        })
      })

      it('should validate date logic (expiry after completion)', () => {
        const validDateOrder = {
          pilot_id: '550e8400-e29b-41d4-a716-446655440000',
          check_type_id: '550e8400-e29b-41d4-a716-446655440001',
          completion_date: '2024-01-15',
          expiry_date: '2025-01-15', // After completion
        }

        const invalidDateOrder = {
          pilot_id: '550e8400-e29b-41d4-a716-446655440000',
          check_type_id: '550e8400-e29b-41d4-a716-446655440001',
          completion_date: '2024-01-15',
          expiry_date: '2023-01-15', // Before completion
        }

        expect(() => validate.createPilotCheck(validDateOrder)).not.toThrow()
        expect(() => validate.createPilotCheck(invalidDateOrder)).toThrow()
      })

      it('should limit notes length for database efficiency', () => {
        const shortNotes = 'Standard training completed'
        const longNotes = 'A'.repeat(1001) // Exceeds 1000 character limit

        const checkWithShortNotes = {
          pilot_id: '550e8400-e29b-41d4-a716-446655440000',
          check_type_id: '550e8400-e29b-41d4-a716-446655440001',
          notes: shortNotes,
        }

        const checkWithLongNotes = {
          pilot_id: '550e8400-e29b-41d4-a716-446655440000',
          check_type_id: '550e8400-e29b-41d4-a716-446655440001',
          notes: longNotes,
        }

        expect(() => validate.createPilotCheck(checkWithShortNotes)).not.toThrow()
        expect(() => validate.createPilotCheck(checkWithLongNotes)).toThrow()
      })
    })

    describe('createCheckType', () => {
      it('should validate check type creation', () => {
        const validCheckType = {
          name: 'Line Check',
          description: 'Operational proficiency evaluation',
          category: 'Training',
          validity_period_days: 365,
          is_required: true,
          is_recurrent: true,
        }

        expect(() => validate.createCheckType(validCheckType)).not.toThrow()
      })

      it('should validate validity period limits', () => {
        const validPeriods = [1, 30, 365, 730, 3650] // 1 day to 10 years
        const invalidPeriods = [0, -1, 3651] // Outside allowed range

        validPeriods.forEach(days => {
          const checkType = {
            name: 'Test Check',
            category: 'Training',
            validity_period_days: days,
          }
          expect(() => validate.createCheckType(checkType)).not.toThrow()
        })

        invalidPeriods.forEach(days => {
          const checkType = {
            name: 'Test Check',
            category: 'Training',
            validity_period_days: days,
          }
          expect(() => validate.createCheckType(checkType)).toThrow()
        })
      })
    })
  })

  describe('Search Validation', () => {
    describe('pilotSearch', () => {
      it('should validate pilot search parameters', () => {
        const validSearch = {
          search: 'John Smith',
          role: 'Captain' as const,
          status: 'compliant' as const,
          sortBy: 'name' as const,
          sortOrder: 'asc' as const,
          page: 1,
          limit: 20,
        }

        expect(() => validate.pilotSearch(validSearch)).not.toThrow()
      })

      it('should apply default values', () => {
        const minimalSearch = {}
        const result = validate.pilotSearch(minimalSearch)

        expect(result.role).toBe('all')
        expect(result.status).toBe('all')
        expect(result.sortBy).toBe('name')
        expect(result.sortOrder).toBe('asc')
        expect(result.page).toBe(1)
        expect(result.limit).toBe(20)
      })

      it('should limit search term length', () => {
        const longSearchTerm = 'A'.repeat(101)
        const search = { search: longSearchTerm }

        expect(() => validate.pilotSearch(search)).toThrow()
      })

      it('should validate pagination limits', () => {
        const validPagination = [
          { page: 1, limit: 1 },
          { page: 10, limit: 50 },
          { page: 1, limit: 100 },
        ]

        const invalidPagination = [
          { page: 0, limit: 20 }, // Page must be >= 1
          { page: 1, limit: 0 }, // Limit must be >= 1
          { page: 1, limit: 101 }, // Limit must be <= 100
        ]

        validPagination.forEach(params => {
          expect(() => validate.pilotSearch(params)).not.toThrow()
        })

        invalidPagination.forEach(params => {
          expect(() => validate.pilotSearch(params)).toThrow()
        })
      })
    })

    describe('certificationSearch', () => {
      it('should validate certification search with days ahead limit', () => {
        const validSearch = {
          daysAhead: 90,
          status: 'expiring' as const,
        }

        const result = validate.certificationSearch(validSearch)
        expect(result.daysAhead).toBe(90)
      })

      it('should limit days ahead parameter (max 1 year)', () => {
        const validDaysAhead = [1, 30, 90, 365]
        const invalidDaysAhead = [0, 366, 1000]

        validDaysAhead.forEach(days => {
          const search = { daysAhead: days }
          expect(() => validate.certificationSearch(search)).not.toThrow()
        })

        invalidDaysAhead.forEach(days => {
          const search = { daysAhead: days }
          expect(() => validate.certificationSearch(search)).toThrow()
        })
      })
    })
  })

  describe('Authentication Validation', () => {
    describe('signIn', () => {
      it('should validate email and password', () => {
        const validSignIn = {
          email: 'pilot@airline.com',
          password: 'SecurePass123',
        }

        expect(() => validate.signIn(validSignIn)).not.toThrow()
      })

      it('should require both email and password', () => {
        const missingEmail = { password: 'password' }
        const missingPassword = { email: 'test@example.com' }

        expect(() => validate.signIn(missingEmail)).toThrow()
        expect(() => validate.signIn(missingPassword)).toThrow()
      })

      it('should validate email format', () => {
        const invalidEmails = ['invalid-email', 'test@', '@domain.com', 'test.domain']

        invalidEmails.forEach(email => {
          const signIn = { email, password: 'password' }
          expect(() => validate.signIn(signIn)).toThrow()
        })
      })
    })

    describe('signUp', () => {
      it('should validate complete sign up data', () => {
        const validSignUp = {
          email: 'newpilot@airline.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          role: 'user' as const,
        }

        expect(() => validate.signUp(validSignUp)).not.toThrow()
      })

      it('should require password confirmation', () => {
        const mismatchedPasswords = {
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: 'DifferentPass456',
        }

        expect(() => validate.signUp(mismatchedPasswords)).toThrow()
      })

      it('should validate password strength', () => {
        const weakPasswords = [
          'short', // Too short
          'lowercaseonly', // No uppercase or numbers
          'UPPERCASEONLY', // No lowercase or numbers
          '12345678', // No letters
          'NoNumbers!', // No numbers
        ]

        weakPasswords.forEach(password => {
          const signUp = {
            email: 'test@example.com',
            password,
            confirmPassword: password,
          }
          expect(() => validate.signUp(signUp)).toThrow()
        })
      })
    })
  })

  describe('Safe Validation Helper', () => {
    it('should return success for valid data', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      })

      const validData = { name: 'John', age: 30 }
      const result = safeValidate(schema, validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should return formatted errors for invalid data', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      })

      const invalidData = { name: '', age: -1 }
      const result = safeValidate(schema, invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('name: Too small: expected string to have >=1 characters')
        expect(result.errors).toContain('age: Too small: expected number to be >=0')
      }
    })

    it('should handle validation errors gracefully', () => {
      const schema = z.string()
      const result = safeValidate(schema, 123) // Wrong type

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Aviation Compliance Validation', () => {
    it('should enforce FAA naming standards', () => {
      // Test pilot names must follow professional standards
      const professionalNames = ['John Smith', 'Mary-Jane O\'Connor', 'Jean Pierre']
      const unprofessionalNames = ['John123', 'Mary@Jane', 'J0hn$mith']

      professionalNames.forEach(name => {
        const [first, ...lastParts] = name.split(' ')
        const last = lastParts.join(' ')
        const pilot = {
          employee_id: 'B767001',
          first_name: first,
          last_name: last,
          role: 'Captain' as const,
        }
        expect(() => validate.createPilot(pilot)).not.toThrow()
      })

      unprofessionalNames.forEach(name => {
        const [first, ...lastParts] = name.split(' ')
        const last = lastParts.join(' ') || 'Smith'
        const pilot = {
          employee_id: 'B767001',
          first_name: first,
          last_name: last,
          role: 'Captain' as const,
        }
        expect(() => validate.createPilot(pilot)).toThrow()
      })
    })

    it('should validate aviation document formats', () => {
      // Test international aviation document standards
      const validDocuments = [
        { passport: 'US123456789', license: 'ATP987654321' },
        { passport: 'GB987654321', license: 'CPL123456' },
        { passport: 'DE456789123', license: 'PPL987654' },
      ]

      validDocuments.forEach(({ passport, license }) => {
        const pilot = {
          employee_id: 'B767001',
          first_name: 'John',
          last_name: 'Smith',
          role: 'Captain' as const,
          passport_number: passport,
          license_number: license,
        }
        expect(() => validate.createPilot(pilot)).not.toThrow()
      })
    })
  })
})