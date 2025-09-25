/**
 * Performance Optimization Hooks for Fleet Management System
 * Provides comprehensive performance tracking and optimization utilities
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Performance monitoring types
interface PerformanceMetrics {
  navigationTiming: PerformanceNavigationTiming | null;
  paintTiming: PerformanceEntry[];
  resourceTiming: PerformanceResourceTiming[];
  memoryUsage: MemoryInfo | null;
  connectionType: string;
  effectiveType: string;
}

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Core Web Vitals and Performance Monitoring Hook
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    navigationTiming: null,
    paintTiming: [],
    resourceTiming: [],
    memoryUsage: null,
    connectionType: 'unknown',
    effectiveType: '4g'
  });

  const [vitals, setVitals] = useState({
    fcp: null as number | null,
    lcp: null as number | null,
    fid: null as number | null,
    cls: null as number | null,
    ttfb: null as number | null
  });

  useEffect(() => {
    // Collect performance metrics
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      // Memory info (Chrome only)
      const memory = (performance as any).memory || null;

      // Connection info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      setMetrics({
        navigationTiming: navigation,
        paintTiming: paint,
        resourceTiming: resources,
        memoryUsage: memory,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || '4g'
      });

      // Calculate Core Web Vitals
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || null;
      const ttfb = navigation?.responseStart - navigation?.requestStart || null;

      setVitals(prev => ({
        ...prev,
        fcp,
        ttfb
      }));
    };

    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;
          setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as PerformanceEventTiming;
          setVitals(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }));
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setVitals(prev => ({ ...prev, cls: clsValue }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }

    // Initial collection
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  const getPerformanceGrade = useCallback(() => {
    const { fcp, lcp, fid, cls } = vitals;

    const grades = {
      fcp: fcp ? (fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor') : 'unknown',
      lcp: lcp ? (lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor') : 'unknown',
      fid: fid ? (fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor') : 'unknown',
      cls: cls ? (cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor') : 'unknown'
    };

    return grades;
  }, [vitals]);

  return {
    metrics,
    vitals,
    getPerformanceGrade,
    isLoading: !metrics.navigationTiming
  };
}

/**
 * Virtual Scrolling Hook for Large Data Sets
 */
export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleHeight = containerHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + visibleHeight) / itemHeight) + overscan
    );

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
}

/**
 * Intersection Observer Hook for Lazy Loading
 */
export function useIntersectionObserver(
  options: LazyLoadOptions = {}
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  const ref = useCallback((node: Element | null) => {
    setNode(node);
  }, []);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const { isIntersecting } = entry;
        setIsIntersecting(isIntersecting);

        if (isIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, threshold, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
}

/**
 * Debounced Value Hook for Performance Optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memory-Efficient State Hook
 */
export function useOptimizedState<T>(
  initialValue: T,
  shouldUpdate?: (prev: T, next: T) => boolean
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(initialValue);

  const optimizedSetState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;

      // Use custom comparison if provided, otherwise use Object.is
      const shouldUpdateValue = shouldUpdate ? shouldUpdate(prev, nextValue) : !Object.is(prev, nextValue);

      return shouldUpdateValue ? nextValue : prev;
    });
  }, [shouldUpdate]);

  return [state, optimizedSetState];
}

/**
 * Component Render Performance Tracker
 */
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();

    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;

      // Log slow renders (>16ms for 60fps)
      if (timeSinceLastRender > 16) {
        console.warn(`Fleet Management Performance: ${componentName} slow render: ${timeSinceLastRender.toFixed(2)}ms`);
      }
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    getStats: () => ({
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: lastRenderTime.current
    })
  };
}

/**
 * Resource Preloading Hook
 */
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    const preloadedResources: HTMLLinkElement[] = [];

    resources.forEach(resource => {
      if (resource.endsWith('.js')) {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = resource;
        document.head.appendChild(link);
        preloadedResources.push(link);
      } else if (resource.endsWith('.css')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
        preloadedResources.push(link);
      } else if (resource.match(/\.(png|jpg|jpeg|webp|avif)$/)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = resource;
        document.head.appendChild(link);
        preloadedResources.push(link);
      }
    });

    return () => {
      preloadedResources.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [resources]);
}

/**
 * Network Status Hook
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [connectionInfo, setConnectionInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  }>({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection ||
                        (navigator as any).mozConnection ||
                        (navigator as any).webkitConnection;

      if (connection) {
        setConnectionInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return {
    isOnline,
    connectionInfo,
    isSlowConnection: connectionInfo.effectiveType === '2g' || connectionInfo.effectiveType === 'slow-2g',
    isDataSaverEnabled: connectionInfo.saveData
  };
}