/**
 * Database Optimization and Advanced Caching Strategies
 * Provides efficient query patterns and caching for Fleet Management System
 */

import { supabase } from './supabase';
import { QueryClient } from '@tanstack/react-query';

// Cache configuration
export const CACHE_CONFIG = {
  // Short-term cache for frequently changing data
  SHORT: 2 * 60 * 1000,       // 2 minutes
  // Medium-term cache for moderately changing data
  MEDIUM: 10 * 60 * 1000,     // 10 minutes
  // Long-term cache for rarely changing data
  LONG: 30 * 60 * 1000,       // 30 minutes
  // Very long cache for static data
  STATIC: 60 * 60 * 1000,     // 1 hour
} as const;

// Query batching for efficient database operations
export class QueryBatcher {
  private batches: Map<string, Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    params: any;
  }>> = new Map();

  private timers: Map<string, NodeJS.Timeout> = new Map();
  private readonly batchDelay = 10; // 10ms batching window

  async batch<T>(
    batchKey: string,
    params: any,
    executor: (batchedParams: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Initialize batch if it doesn't exist
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      // Add to batch
      this.batches.get(batchKey)!.push({ resolve, reject, params });

      // Clear existing timer
      if (this.timers.has(batchKey)) {
        clearTimeout(this.timers.get(batchKey)!);
      }

      // Set new timer to execute batch
      const timer = setTimeout(async () => {
        const batch = this.batches.get(batchKey)!;
        this.batches.delete(batchKey);
        this.timers.delete(batchKey);

        try {
          const batchedParams = batch.map(item => item.params);
          const results = await executor(batchedParams);

          // Resolve each promise with its corresponding result
          batch.forEach((item, index) => {
            item.resolve(results[index]);
          });
        } catch (error) {
          // Reject all promises in the batch
          batch.forEach(item => {
            item.reject(error);
          });
        }
      }, this.batchDelay);

      this.timers.set(batchKey, timer);
    });
  }
}

// Singleton query batcher
export const queryBatcher = new QueryBatcher();

// Optimized query builders with proper indexing and filtering
export class OptimizedQueries {
  /**
   * Get pilots with efficient pagination and filtering
   */
  static async getPilotsPaginated(
    page: number = 1,
    limit: number = 50,
    filters: {
      search?: string;
      role?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    let query = supabase
      .from('pilots')
      .select(`
        id,
        employee_id,
        first_name,
        last_name,
        role,
        hire_date,
        status,
        retirement_date,
        captain_qualifications,
        contract_type_id
      `, { count: 'exact' });

    // Apply search filter with proper indexing
    if (filters.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        employee_id.ilike.%${filters.search}%
      `);
    }

    // Apply role filter
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply sorting with index-optimized columns
    const validSortColumns = ['last_name', 'hire_date', 'role', 'status'];
    const sortBy = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'last_name';
    const sortOrder = filters.sortOrder === 'desc' ? false : true;

    query = query.order(sortBy!, { ascending: sortOrder });

    // Apply pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    return query;
  }

  /**
   * Get pilot checks with efficient joins
   */
  static async getPilotChecks(pilotId: string, checkTypeIds?: string[]) {
    let query = supabase
      .from('pilot_checks')
      .select(`
        id,
        pilot_id,
        check_type_id,
        completion_date,
        expiration_date,
        status,
        check_types (
          id,
          name,
          category,
          frequency_months,
          grace_period_days
        )
      `)
      .eq('pilot_id', pilotId);

    // Filter by check types if provided
    if (checkTypeIds && checkTypeIds.length > 0) {
      query = query.in('check_type_id', checkTypeIds);
    }

    // Order by expiration date for prioritization
    query = query.order('expiration_date', { ascending: true });

    return query;
  }

  /**
   * Get expiring checks with optimized view
   */
  static async getExpiringChecks(daysAhead: number = 90, limit?: number) {
    let query = supabase
      .from('detailed_expiring_checks')
      .select('*')
      .lte('days_until_expiry', daysAhead)
      .order('days_until_expiry', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    return query;
  }

  /**
   * Get compliance dashboard with materialized view
   */
  static async getComplianceDashboard() {
    return supabase
      .from('compliance_dashboard')
      .select('*')
      .single();
  }

  /**
   * Batch load pilots by IDs
   */
  static async batchLoadPilots(pilotIds: string[]) {
    return queryBatcher.batch(
      'pilot-batch',
      pilotIds,
      async (batchedIds: string[][]) => {
        // Flatten all IDs and remove duplicates
        const allIds = Array.from(new Set(batchedIds.flat()));

        const { data, error } = await supabase
          .from('pilots')
          .select('*')
          .in('id', allIds);

        if (error) throw error;

        // Return results in the same order as requested batches
        return batchedIds.map(ids =>
          ids.map(id => data?.find(pilot => pilot.id === id)).filter(Boolean)
        );
      }
    );
  }

  /**
   * Batch load check types
   */
  static async batchLoadCheckTypes(checkTypeIds: string[]) {
    return queryBatcher.batch(
      'check-type-batch',
      checkTypeIds,
      async (batchedIds: string[][]) => {
        const allIds = Array.from(new Set(batchedIds.flat()));

        const { data, error } = await supabase
          .from('check_types')
          .select('*')
          .in('id', allIds);

        if (error) throw error;

        return batchedIds.map(ids =>
          ids.map(id => data?.find(checkType => checkType.id === id)).filter(Boolean)
        );
      }
    );
  }
}

// Advanced caching utilities
export class CacheManager {
  private static instance: CacheManager;
  private queryClient: QueryClient;
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  static getInstance(queryClient: QueryClient): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(queryClient);
    }
    return CacheManager.instance;
  }

  /**
   * Intelligent cache prefetching based on user behavior
   */
  async prefetchRelatedData(pilotId: string) {
    const prefetchPromises = [
      // Prefetch pilot checks
      this.queryClient.prefetchQuery({
        queryKey: ['pilot-checks', pilotId],
        queryFn: () => OptimizedQueries.getPilotChecks(pilotId),
        staleTime: CACHE_CONFIG.MEDIUM,
      }),

      // Prefetch expiring checks for context
      this.queryClient.prefetchQuery({
        queryKey: ['expiring-checks', 30],
        queryFn: () => OptimizedQueries.getExpiringChecks(30, 10),
        staleTime: CACHE_CONFIG.SHORT,
      }),
    ];

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Background cache refresh for critical data
   */
  startBackgroundRefresh() {
    const refreshCriticalData = async () => {
      try {
        // Refresh compliance dashboard
        await this.queryClient.invalidateQueries({
          queryKey: ['compliance-dashboard'],
        });

        // Refresh expiring checks
        await this.queryClient.invalidateQueries({
          queryKey: ['expiring-checks'],
        });

        console.log('Fleet Management: Background cache refresh completed');
      } catch (error) {
        console.warn('Fleet Management: Background refresh failed:', error);
      }
    };

    // Refresh every 5 minutes
    const interval = setInterval(refreshCriticalData, 5 * 60 * 1000);

    // Initial refresh
    refreshCriticalData();

    return () => clearInterval(interval);
  }

  /**
   * Memory cache for frequently accessed small data
   */
  setMemoryCache(key: string, data: any, ttl: number = CACHE_CONFIG.MEDIUM) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup expired entries
    this.cleanupExpiredCache();
  }

  getMemoryCache(key: string) {
    const cached = this.memoryCache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Smart cache invalidation based on data relationships
   */
  invalidateRelatedCache(type: 'pilot' | 'check' | 'compliance', id?: string) {
    switch (type) {
      case 'pilot':
        this.queryClient.invalidateQueries({ queryKey: ['pilots'] });
        this.queryClient.invalidateQueries({ queryKey: ['compliance-dashboard'] });
        if (id) {
          this.queryClient.invalidateQueries({ queryKey: ['pilot', id] });
          this.queryClient.invalidateQueries({ queryKey: ['pilot-checks', id] });
        }
        break;

      case 'check':
        this.queryClient.invalidateQueries({ queryKey: ['checks'] });
        this.queryClient.invalidateQueries({ queryKey: ['expiring-checks'] });
        this.queryClient.invalidateQueries({ queryKey: ['compliance-dashboard'] });
        if (id) {
          this.queryClient.invalidateQueries({ queryKey: ['pilot-checks', id] });
        }
        break;

      case 'compliance':
        this.queryClient.invalidateQueries({ queryKey: ['compliance-dashboard'] });
        this.queryClient.invalidateQueries({ queryKey: ['expiring-checks'] });
        break;
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    const queryCache = this.queryClient.getQueryCache();
    const queries = queryCache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(query => query.state.status === 'success').length,
      loadingQueries: queries.filter(query => query.state.status === 'loading').length,
      errorQueries: queries.filter(query => query.state.status === 'error').length,
      memoryCache: {
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys()),
      },
      cacheHitRatio: this.calculateCacheHitRatio(queries),
    };
  }

  private calculateCacheHitRatio(queries: any[]): number {
    const totalFetches = queries.reduce((sum, query) => sum + query.state.dataUpdatedAt > 0 ? 1 : 0, 0);
    const cacheMisses = queries.reduce((sum, query) => sum + (query.state.fetchFailureCount || 0), 0);

    return totalFetches > 0 ? ((totalFetches - cacheMisses) / totalFetches) * 100 : 0;
  }
}

// Connection pooling and request optimization
export class ConnectionManager {
  private static maxConcurrentRequests = 6;
  private static requestQueue: Array<() => Promise<any>> = [];
  private static activeRequests = 0;

  /**
   * Execute request with connection pooling
   */
  static async executeWithPooling<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        if (this.activeRequests >= this.maxConcurrentRequests) {
          this.requestQueue.push(executeRequest);
          return;
        }

        this.activeRequests++;

        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;

          // Execute next request in queue
          const nextRequest = this.requestQueue.shift();
          if (nextRequest) {
            nextRequest();
          }
        }
      };

      executeRequest();
    });
  }

  /**
   * Batch multiple requests for efficiency
   */
  static async batchExecute<T>(requests: (() => Promise<T>)[]): Promise<(T | Error)[]> {
    const results = await Promise.allSettled(
      requests.map(request => this.executeWithPooling(request))
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    );
  }
}

// Database performance monitoring
export class DatabasePerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();
  private static slowQueryThreshold = 1000; // 1 second

  static startQuery(queryKey: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Record query time
      if (!this.queryTimes.has(queryKey)) {
        this.queryTimes.set(queryKey, []);
      }

      const times = this.queryTimes.get(queryKey)!;
      times.push(duration);

      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(`🐌 Slow query detected: ${queryKey} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  static getQueryStats() {
    const stats = new Map<string, {
      count: number;
      averageTime: number;
      minTime: number;
      maxTime: number;
      slowQueries: number;
    }>();

    for (const [queryKey, times] of this.queryTimes.entries()) {
      const count = times.length;
      const averageTime = times.reduce((sum, time) => sum + time, 0) / count;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const slowQueries = times.filter(time => time > this.slowQueryThreshold).length;

      stats.set(queryKey, {
        count,
        averageTime,
        minTime,
        maxTime,
        slowQueries,
      });
    }

    return stats;
  }
}

// Query performance wrapper
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  queryName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const endTracking = DatabasePerformanceMonitor.startQuery(queryName);

    try {
      const result = await ConnectionManager.executeWithPooling(() => fn(...args));
      return result;
    } finally {
      endTracking();
    }
  };
}

// Export optimized query functions with performance tracking
export const optimizedQueries = {
  getPilotsPaginated: withPerformanceTracking(
    OptimizedQueries.getPilotsPaginated,
    'pilots-paginated'
  ),
  getPilotChecks: withPerformanceTracking(
    OptimizedQueries.getPilotChecks,
    'pilot-checks'
  ),
  getExpiringChecks: withPerformanceTracking(
    OptimizedQueries.getExpiringChecks,
    'expiring-checks'
  ),
  getComplianceDashboard: withPerformanceTracking(
    OptimizedQueries.getComplianceDashboard,
    'compliance-dashboard'
  ),
  batchLoadPilots: withPerformanceTracking(
    OptimizedQueries.batchLoadPilots,
    'batch-pilots'
  ),
  batchLoadCheckTypes: withPerformanceTracking(
    OptimizedQueries.batchLoadCheckTypes,
    'batch-check-types'
  ),
};