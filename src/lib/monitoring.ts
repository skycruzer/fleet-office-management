/**
 * Performance Monitoring & Analytics System
 *
 * This module provides comprehensive performance monitoring for the B767 Fleet Manager,
 * including React performance tracking, database query monitoring, and user analytics.
 */

import { supabase } from './supabase'

// Performance metrics types
export interface PerformanceMetric {
  metric_name: string
  metric_value: number
  metric_unit: string
  timestamp: Date
  context?: Record<string, any>
}

export interface DatabaseMetric {
  query_name: string
  duration_ms: number
  rows_returned?: number
  cache_hit?: boolean
  timestamp: Date
}

export interface UserMetric {
  user_id?: string
  session_id: string
  action: string
  component?: string
  duration_ms?: number
  timestamp: Date
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private dbMetrics: DatabaseMetric[] = []
  private userMetrics: UserMetric[] = []
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializePerformanceObserver()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize Web APIs for performance monitoring
  private initializePerformanceObserver() {
    if (typeof window === 'undefined') return

    // Core Web Vitals monitoring
    this.observeCoreWebVitals()

    // Navigation timing
    this.observeNavigationTiming()

    // Resource loading timing
    this.observeResourceTiming()
  }

  // Core Web Vitals monitoring (LCP, FID, CLS)
  private observeCoreWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as any

        this.recordMetric({
          metric_name: 'core_web_vital_lcp',
          metric_value: lastEntry.startTime,
          metric_unit: 'ms',
          timestamp: new Date(),
          context: { url: window.location.pathname }
        })
      })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric({
            metric_name: 'core_web_vital_fid',
            metric_value: entry.processingStart - entry.startTime,
            metric_unit: 'ms',
            timestamp: new Date(),
            context: { url: window.location.pathname }
          })
        })
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error)
      }
    }
  }

  // Navigation timing metrics
  private observeNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

          if (navigation) {
            // Time to First Byte
            this.recordMetric({
              metric_name: 'ttfb',
              metric_value: navigation.responseStart - navigation.requestStart,
              metric_unit: 'ms',
              timestamp: new Date(),
              context: { url: window.location.pathname }
            })

            // DOM Content Loaded
            this.recordMetric({
              metric_name: 'dom_content_loaded',
              metric_value: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              metric_unit: 'ms',
              timestamp: new Date(),
              context: { url: window.location.pathname }
            })

            // Page Load Complete
            this.recordMetric({
              metric_name: 'page_load_complete',
              metric_value: navigation.loadEventEnd - navigation.navigationStart,
              metric_unit: 'ms',
              timestamp: new Date(),
              context: { url: window.location.pathname }
            })
          }
        }, 0)
      })
    }
  }

  // Resource loading timing
  private observeResourceTiming() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()

        entries.forEach((entry: PerformanceResourceTiming) => {
          // Track slow resources (>1000ms)
          if (entry.duration > 1000) {
            this.recordMetric({
              metric_name: 'slow_resource_load',
              metric_value: entry.duration,
              metric_unit: 'ms',
              timestamp: new Date(),
              context: {
                resource_name: entry.name,
                resource_type: entry.initiatorType,
                url: window.location.pathname
              }
            })
          }
        })
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (error) {
        console.warn('Resource Performance Observer not supported:', error)
      }
    }
  }

  // Record performance metric
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', metric)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('performance', metric)
    }
  }

  // Database query monitoring
  recordDatabaseQuery(queryName: string, startTime: number, rowCount?: number, cacheHit?: boolean) {
    const duration = performance.now() - startTime

    const metric: DatabaseMetric = {
      query_name: queryName,
      duration_ms: Math.round(duration),
      rows_returned: rowCount,
      cache_hit: cacheHit,
      timestamp: new Date()
    }

    this.dbMetrics.push(metric)

    // Log slow queries (>500ms)
    if (duration > 500) {
      console.warn('🐌 Slow Database Query:', metric)

      this.recordMetric({
        metric_name: 'slow_database_query',
        metric_value: duration,
        metric_unit: 'ms',
        timestamp: new Date(),
        context: {
          query_name: queryName,
          rows_returned: rowCount,
          cache_hit: cacheHit
        }
      })
    }

    return metric
  }

  // User interaction tracking
  recordUserAction(action: string, component?: string, startTime?: number) {
    const duration = startTime ? performance.now() - startTime : undefined

    const metric: UserMetric = {
      session_id: this.sessionId,
      action,
      component,
      duration_ms: duration ? Math.round(duration) : undefined,
      timestamp: new Date()
    }

    this.userMetrics.push(metric)

    // Track user engagement
    this.recordMetric({
      metric_name: 'user_interaction',
      metric_value: duration || 1,
      metric_unit: duration ? 'ms' : 'count',
      timestamp: new Date(),
      context: {
        action,
        component,
        session_id: this.sessionId
      }
    })
  }

  // React component performance tracking
  measureComponentRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now()

    try {
      const result = renderFn()
      const duration = performance.now() - startTime

      // Track component render times
      this.recordMetric({
        metric_name: 'component_render_time',
        metric_value: Math.round(duration),
        metric_unit: 'ms',
        timestamp: new Date(),
        context: {
          component_name: componentName,
          url: typeof window !== 'undefined' ? window.location.pathname : undefined
        }
      })

      // Warn about slow components (>100ms)
      if (duration > 100) {
        console.warn(`⚠️ Slow Component Render: ${componentName} took ${Math.round(duration)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      this.recordMetric({
        metric_name: 'component_render_error',
        metric_value: Math.round(duration),
        metric_unit: 'ms',
        timestamp: new Date(),
        context: {
          component_name: componentName,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw error
    }
  }

  // Aviation-specific fleet metrics
  recordFleetMetric(metricType: 'compliance_check' | 'pilot_status_update' | 'certification_expiry', data: any) {
    this.recordMetric({
      metric_name: `fleet_${metricType}`,
      metric_value: 1,
      metric_unit: 'count',
      timestamp: new Date(),
      context: {
        fleet_data: data,
        aviation_context: true
      }
    })
  }

  // Memory usage monitoring
  recordMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && (performance as any).memory) {
      const memory = (performance as any).memory

      this.recordMetric({
        metric_name: 'memory_used_mb',
        metric_value: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        metric_unit: 'MB',
        timestamp: new Date(),
        context: {
          total_heap_mb: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          heap_limit_mb: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        }
      })
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalMetrics: number
    averagePageLoad: number
    slowQueries: number
    userInteractions: number
    memoryUsage?: number
  } {
    const pageLoadMetrics = this.metrics.filter(m => m.metric_name === 'page_load_complete')
    const averagePageLoad = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.metric_value, 0) / pageLoadMetrics.length
      : 0

    const slowQueries = this.dbMetrics.filter(m => m.duration_ms > 500).length
    const userInteractions = this.userMetrics.length

    const memoryMetrics = this.metrics.filter(m => m.metric_name === 'memory_used_mb')
    const memoryUsage = memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1].metric_value
      : undefined

    return {
      totalMetrics: this.metrics.length,
      averagePageLoad: Math.round(averagePageLoad),
      slowQueries,
      userInteractions,
      memoryUsage
    }
  }

  // Send metrics to analytics service
  private async sendToAnalytics(type: string, data: any) {
    try {
      // In a production environment, you would send to your analytics service
      // For now, we'll log to Supabase if available
      if (typeof window !== 'undefined') {
        // Store in localStorage for batching
        const stored = localStorage.getItem('performance_metrics') || '[]'
        const metrics = JSON.parse(stored)
        metrics.push({ type, data, timestamp: new Date().toISOString() })

        // Keep only last 100 metrics in storage
        if (metrics.length > 100) {
          metrics.splice(0, metrics.length - 100)
        }

        localStorage.setItem('performance_metrics', JSON.stringify(metrics))
      }
    } catch (error) {
      console.warn('Failed to send analytics:', error)
    }
  }

  // Batch send metrics to server
  async flushMetrics() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('performance_metrics')
      if (!stored) return

      const metrics = JSON.parse(stored)
      if (metrics.length === 0) return

      // Send to your analytics endpoint here
      // For now, we'll just clear the stored metrics
      localStorage.removeItem('performance_metrics')

      console.log(`📤 Flushed ${metrics.length} performance metrics`)

    } catch (error) {
      console.warn('Failed to flush metrics:', error)
    }
  }

  // Start periodic memory monitoring
  startMemoryMonitoring(intervalMs: number = 30000) {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.recordMemoryUsage()
      }, intervalMs)
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance tracking
export function usePerformanceMonitor() {
  return {
    recordUserAction: performanceMonitor.recordUserAction.bind(performanceMonitor),
    recordFleetMetric: performanceMonitor.recordFleetMetric.bind(performanceMonitor),
    measureRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    getPerformanceSummary: performanceMonitor.getPerformanceSummary.bind(performanceMonitor)
  }
}

// Database query wrapper with performance tracking
export async function withQueryTracking<T>(
  queryName: string,
  queryFn: () => Promise<{ data: T; count?: number }>
): Promise<{ data: T; count?: number; performanceMetric: DatabaseMetric }> {
  const startTime = performance.now()

  try {
    const result = await queryFn()
    const metric = performanceMonitor.recordDatabaseQuery(
      queryName,
      startTime,
      result.count,
      false // Cache hit detection would be implemented based on your caching strategy
    )

    return {
      ...result,
      performanceMetric: metric
    }
  } catch (error) {
    performanceMonitor.recordDatabaseQuery(queryName, startTime, 0, false)
    throw error
  }
}

// Initialize monitoring on app start
if (typeof window !== 'undefined') {
  // Start memory monitoring every 30 seconds
  performanceMonitor.startMemoryMonitoring(30000)

  // Flush metrics every 5 minutes
  setInterval(() => {
    performanceMonitor.flushMetrics()
  }, 5 * 60 * 1000)

  // Flush metrics before page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.flushMetrics()
  })

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    performanceMonitor.recordUserAction(
      document.visibilityState === 'visible' ? 'page_visible' : 'page_hidden'
    )
  })
}