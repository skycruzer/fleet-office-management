/**
 * Lazy Loading Components with Code Splitting
 * Optimizes bundle size by splitting components into separate chunks
 */

import { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent } from './card';
import { Loader2 } from 'lucide-react';

// Loading fallbacks for different component types
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex space-x-4 mb-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="border rounded-lg">
      <div className="h-12 border-b bg-muted/50 flex items-center px-4">
        <div className="flex space-x-4 w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 border-b flex items-center px-4">
          <div className="flex space-x-4 w-full">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-64 w-full mb-4" />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardContent>
  </Card>
);

const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-16" />
    </div>
  </div>
);

const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-3">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  </div>
);

// HOC for wrapping lazy components with error boundaries and fallbacks
function withLazyLoading<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  fallback: React.ComponentType = LoadingSpinner,
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
): React.FC<P> {
  return (props: P) => (
    <Suspense fallback={<fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Lazy-loaded Dashboard Components
export const LazyFleetOverviewCards = withLazyLoading(
  lazy(() => import('../dashboard/fleet-overview-cards').then(module => ({
    default: module.FleetOverviewCards
  }))),
  DashboardSkeleton
);

export const LazyQuickStats = withLazyLoading(
  lazy(() => import('../dashboard/fleet-overview-cards').then(module => ({
    default: module.QuickStats
  }))),
  () => <Skeleton className="h-8 w-full" />
);

export const LazyExpiringChecksTable = withLazyLoading(
  lazy(() => import('../dashboard/expiring-checks-table')),
  TableSkeleton
);

export const LazyPerformanceWidget = withLazyLoading(
  lazy(() => import('../dashboard/performance-widget')),
  ChartSkeleton
);

// Lazy-loaded Chart Components
export const LazyComplianceChart = withLazyLoading(
  lazy(() => import('../dashboard/charts/compliance-overview-chart')),
  ChartSkeleton
);

export const LazyCertificationTimelineChart = withLazyLoading(
  lazy(() => import('../dashboard/charts/certification-timeline-chart')),
  ChartSkeleton
);

export const LazyPilotStatusChart = withLazyLoading(
  lazy(() => import('../dashboard/charts/pilot-status-chart')),
  ChartSkeleton
);

// Lazy-loaded Pilot Components
export const LazyPilotGrid = withLazyLoading(
  lazy(() => import('../dashboard/pilot-grid')),
  DashboardSkeleton
);

export const LazyPilotForm = withLazyLoading(
  lazy(() => import('../forms/pilot-form')),
  FormSkeleton
);

export const LazyPilotDetails = withLazyLoading(
  lazy(() => import('../dashboard/pilot-details')),
  () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
      <TableSkeleton />
    </div>
  )
);

// Lazy-loaded Settings Components
export const LazySettingsPanel = withLazyLoading(
  lazy(() => import('../settings/settings-panel')),
  () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
);

export const LazyNotificationSettings = withLazyLoading(
  lazy(() => import('../settings/notification-settings')),
  FormSkeleton
);

// Lazy-loaded Report Components
export const LazyReportGenerator = withLazyLoading(
  lazy(() => import('../reports/report-generator')),
  FormSkeleton
);

export const LazyReportViewer = withLazyLoading(
  lazy(() => import('../reports/report-viewer')),
  () => (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-full min-h-[400px] w-full" />
      </CardContent>
    </Card>
  )
);

// Lazy-loaded Modal Components
export const LazyPilotDetailsModal = withLazyLoading(
  lazy(() => import('../modals/pilot-details-modal')),
  LoadingSpinner
);

export const LazyCertificationModal = withLazyLoading(
  lazy(() => import('../modals/certification-modal')),
  LoadingSpinner
);

// Lazy-loaded Virtual Components
export const LazyVirtualTable = withLazyLoading(
  lazy(() => import('../ui/virtual-table')),
  TableSkeleton
);

// Lazy-loaded Interactive Demo Components
export const LazyInteractiveCharts = withLazyLoading(
  lazy(() => import('../interactive/interactive-charts')),
  ChartSkeleton
);

export const LazyDataVisualization = withLazyLoading(
  lazy(() => import('../interactive/data-visualization')),
  () => (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
);

// Route-level lazy components
export const LazyDashboardPage = lazy(() => import('../../app/page'));
export const LazyPilotsPage = lazy(() => import('../../app/pilots/page'));
export const LazyAlertsPage = lazy(() => import('../../app/alerts/page'));
export const LazySettingsPage = lazy(() => import('../../app/settings/page'));
export const LazyInteractiveDemoPage = lazy(() => import('../../app/interactive-demo/page'));

// Lazy component preloader utility
export class LazyComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static preloadComponent(componentImport: () => Promise<any>, componentName: string) {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    this.preloadedComponents.add(componentName);

    // Preload on idle or after a short delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        componentImport().catch(() => {
          this.preloadedComponents.delete(componentName);
        });
      });
    } else {
      setTimeout(() => {
        componentImport().catch(() => {
          this.preloadedComponents.delete(componentName);
        });
      }, 100);
    }
  }

  static preloadCriticalComponents() {
    // Preload components that are likely to be needed soon
    this.preloadComponent(
      () => import('../dashboard/fleet-overview-cards'),
      'FleetOverviewCards'
    );

    this.preloadComponent(
      () => import('../dashboard/expiring-checks-table'),
      'ExpiringChecksTable'
    );

    this.preloadComponent(
      () => import('../dashboard/pilot-grid'),
      'PilotGrid'
    );
  }

  static preloadRouteComponents(route: string) {
    switch (route) {
      case '/pilots':
        this.preloadComponent(() => import('../../app/pilots/page'), 'PilotsPage');
        this.preloadComponent(() => import('../dashboard/pilot-grid'), 'PilotGrid');
        break;
      case '/alerts':
        this.preloadComponent(() => import('../../app/alerts/page'), 'AlertsPage');
        this.preloadComponent(() => import('../dashboard/expiring-checks-table'), 'ExpiringChecksTable');
        break;
      case '/settings':
        this.preloadComponent(() => import('../../app/settings/page'), 'SettingsPage');
        this.preloadComponent(() => import('../settings/settings-panel'), 'SettingsPanel');
        break;
    }
  }
}

// Initialize preloading on component mount
export function useComponentPreloading() {
  React.useEffect(() => {
    LazyComponentPreloader.preloadCriticalComponents();
  }, []);

  return LazyComponentPreloader;
}