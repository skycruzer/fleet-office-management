/**
 * Performance Tracking Hooks
 *
 * React hooks for tracking component performance, user interactions,
 * and aviation-specific metrics in the B767 Fleet Manager.
 */

import { useEffect, useCallback, useRef } from 'react'
import { usePerformanceMonitor } from '@/lib/monitoring'

// Hook for tracking component mount and render performance
export function useComponentPerformance(componentName: string) {
  const mountTimeRef = useRef<number>()
  const renderCountRef = useRef(0)
  const { measureRender, recordUserAction } = usePerformanceMonitor()

  // Track component mount
  useEffect(() => {
    mountTimeRef.current = performance.now()
    renderCountRef.current = 0

    return () => {
      if (mountTimeRef.current) {
        const mountDuration = performance.now() - mountTimeRef.current
        recordUserAction('component_unmount', componentName, mountTimeRef.current)

        // Log components that stay mounted for a long time (potential memory leaks)
        if (mountDuration > 30000) { // 30 seconds
          console.warn(`🔄 Long-running component: ${componentName} was mounted for ${Math.round(mountDuration)}ms`)
        }
      }
    }
  }, [componentName, recordUserAction])

  // Track renders
  useEffect(() => {
    renderCountRef.current++

    // Measure render performance
    measureRender(`${componentName}_render_${renderCountRef.current}`, () => {
      // This function runs during render measurement
      return true
    })

    // Warn about excessive re-renders
    if (renderCountRef.current > 10) {
      console.warn(`🔄 Excessive renders: ${componentName} has rendered ${renderCountRef.current} times`)
    }
  })

  return {
    renderCount: renderCountRef.current,
    trackInteraction: useCallback((action: string) => {
      recordUserAction(action, componentName)
    }, [componentName, recordUserAction])
  }
}

// Hook for tracking user interactions with timing
export function useInteractionTracking() {
  const { recordUserAction } = usePerformanceMonitor()
  const interactionStartRef = useRef<{ [key: string]: number }>({})

  const startInteraction = useCallback((actionName: string) => {
    interactionStartRef.current[actionName] = performance.now()
  }, [])

  const endInteraction = useCallback((actionName: string, component?: string) => {
    const startTime = interactionStartRef.current[actionName]
    if (startTime) {
      recordUserAction(actionName, component, startTime)
      delete interactionStartRef.current[actionName]
    }
  }, [recordUserAction])

  const trackClick = useCallback((elementName: string, component?: string) => {
    recordUserAction('click', component || elementName)
  }, [recordUserAction])

  const trackFormSubmit = useCallback((formName: string, component?: string) => {
    recordUserAction('form_submit', component || formName)
  }, [recordUserAction])

  const trackNavigation = useCallback((route: string) => {
    recordUserAction('navigation', route)
  }, [recordUserAction])

  return {
    startInteraction,
    endInteraction,
    trackClick,
    trackFormSubmit,
    trackNavigation
  }
}

// Hook for tracking data loading performance
export function useDataLoadingPerformance() {
  const loadingStatesRef = useRef<{ [key: string]: number }>({})
  const { recordUserAction } = usePerformanceMonitor()

  const startLoading = useCallback((loadingKey: string) => {
    loadingStatesRef.current[loadingKey] = performance.now()
  }, [])

  const endLoading = useCallback((loadingKey: string, recordCount?: number, cacheHit?: boolean) => {
    const startTime = loadingStatesRef.current[loadingKey]
    if (startTime) {
      const duration = performance.now() - startTime

      recordUserAction('data_loaded', loadingKey, startTime)

      // Track slow data loading (>2 seconds)
      if (duration > 2000) {
        console.warn(`🐌 Slow data loading: ${loadingKey} took ${Math.round(duration)}ms`)
      }

      // Log cache performance
      if (cacheHit !== undefined) {
        console.log(`💾 Cache ${cacheHit ? 'HIT' : 'MISS'} for ${loadingKey} (${Math.round(duration)}ms)`)
      }

      delete loadingStatesRef.current[loadingKey]

      return {
        duration: Math.round(duration),
        recordCount,
        cacheHit
      }
    }

    return null
  }, [recordUserAction])

  return {
    startLoading,
    endLoading
  }
}

// Hook for tracking aviation-specific fleet operations
export function useFleetPerformanceTracking() {
  const { recordFleetMetric } = usePerformanceMonitor()

  const trackPilotStatusUpdate = useCallback((pilotId: string, status: string) => {
    recordFleetMetric('pilot_status_update', {
      pilot_id: pilotId,
      new_status: status,
      timestamp: new Date().toISOString()
    })
  }, [recordFleetMetric])

  const trackComplianceCheck = useCallback((pilotId: string, checkType: string, status: string) => {
    recordFleetMetric('compliance_check', {
      pilot_id: pilotId,
      check_type: checkType,
      compliance_status: status,
      timestamp: new Date().toISOString()
    })
  }, [recordFleetMetric])

  const trackCertificationExpiry = useCallback((pilotId: string, certificationType: string, daysUntilExpiry: number) => {
    recordFleetMetric('certification_expiry', {
      pilot_id: pilotId,
      certification_type: certificationType,
      days_until_expiry: daysUntilExpiry,
      alert_level: daysUntilExpiry <= 7 ? 'CRITICAL' : daysUntilExpiry <= 30 ? 'WARNING' : 'INFO',
      timestamp: new Date().toISOString()
    })
  }, [recordFleetMetric])

  const trackDashboardView = useCallback((dashboardSection: string) => {
    recordFleetMetric('compliance_check', {
      dashboard_section: dashboardSection,
      view_timestamp: new Date().toISOString()
    })
  }, [recordFleetMetric])

  return {
    trackPilotStatusUpdate,
    trackComplianceCheck,
    trackCertificationExpiry,
    trackDashboardView
  }
}

// Hook for real-time performance monitoring
export function useRealTimePerformance() {
  const { getPerformanceSummary } = usePerformanceMonitor()
  const performanceRef = useRef<ReturnType<typeof getPerformanceSummary>>()

  useEffect(() => {
    const updatePerformance = () => {
      performanceRef.current = getPerformanceSummary()
    }

    // Update performance metrics every 10 seconds
    const interval = setInterval(updatePerformance, 10000)
    updatePerformance() // Initial update

    return () => clearInterval(interval)
  }, [getPerformanceSummary])

  // Check for performance issues
  const checkPerformanceHealth = useCallback(() => {
    if (!performanceRef.current) return { healthy: true }

    const { averagePageLoad, slowQueries, memoryUsage } = performanceRef.current

    const issues: string[] = []

    if (averagePageLoad > 3000) {
      issues.push(`Slow page load: ${averagePageLoad}ms average`)
    }

    if (slowQueries > 5) {
      issues.push(`${slowQueries} slow database queries detected`)
    }

    if (memoryUsage && memoryUsage > 100) {
      issues.push(`High memory usage: ${memoryUsage}MB`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      metrics: performanceRef.current
    }
  }, [])

  return {
    performanceMetrics: performanceRef.current,
    checkPerformanceHealth
  }
}

// Hook for tracking form performance
export function useFormPerformance(formName: string) {
  const { trackFormSubmit } = useInteractionTracking()
  const validationTimeRef = useRef<{ [field: string]: number }>({})

  const trackFieldValidation = useCallback((fieldName: string, isValid: boolean) => {
    const startTime = validationTimeRef.current[fieldName]
    if (startTime) {
      const duration = performance.now() - startTime

      // Track slow validation (>100ms)
      if (duration > 100) {
        console.warn(`🐌 Slow field validation: ${fieldName} took ${Math.round(duration)}ms`)
      }

      delete validationTimeRef.current[fieldName]
    }
  }, [])

  const startFieldValidation = useCallback((fieldName: string) => {
    validationTimeRef.current[fieldName] = performance.now()
  }, [])

  const trackSubmit = useCallback(() => {
    trackFormSubmit(formName)
  }, [formName, trackFormSubmit])

  return {
    startFieldValidation,
    trackFieldValidation,
    trackSubmit
  }
}

// Hook for tracking search and filter performance
export function useSearchPerformance() {
  const { recordUserAction } = usePerformanceMonitor()
  const searchTimeRef = useRef<number>()

  const startSearch = useCallback((query: string) => {
    searchTimeRef.current = performance.now()
    recordUserAction('search_started', `query: ${query.substring(0, 20)}`)
  }, [recordUserAction])

  const endSearch = useCallback((resultCount: number, query?: string) => {
    if (searchTimeRef.current) {
      const duration = performance.now() - searchTimeRef.current

      recordUserAction('search_completed', `results: ${resultCount}`, searchTimeRef.current)

      // Track slow searches (>1 second)
      if (duration > 1000) {
        console.warn(`🐌 Slow search: "${query}" took ${Math.round(duration)}ms with ${resultCount} results`)
      }

      searchTimeRef.current = undefined

      return {
        duration: Math.round(duration),
        resultCount
      }
    }

    return null
  }, [recordUserAction])

  const trackFilter = useCallback((filterType: string, filterValue: string) => {
    recordUserAction('filter_applied', `${filterType}: ${filterValue}`)
  }, [recordUserAction])

  return {
    startSearch,
    endSearch,
    trackFilter
  }
}