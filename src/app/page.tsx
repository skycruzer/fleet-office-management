import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout, PageHeader } from "@/components/layout/dashboard-layout";
import { FleetOverviewCards, QuickStats } from "@/components/dashboard/fleet-overview-cards";
import { ExpiringChecksTable } from "@/components/dashboard/expiring-checks-table";
import { PerformanceWidget } from "@/components/dashboard/performance-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SrOnly } from "@/components/ui/sr-only";
import { Download, RefreshCw } from "lucide-react";

function DashboardSkeleton() {
  return (
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
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHeader
          title="Flight Operations Dashboard"
          description="B767 Fleet Management and Pilot Certification Tracking"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Export fleet management report"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export Report
            </Button>
          </div>
        </PageHeader>

        {/* Quick Status Indicators */}
        <section aria-labelledby="quick-stats-heading" className="mb-6">
          <SrOnly>
            <h2 id="quick-stats-heading">Fleet Status Overview</h2>
          </SrOnly>
          <Suspense fallback={<Skeleton className="h-8 w-full" />}>
            <QuickStats className="mb-6" />
          </Suspense>
        </section>

        {/* Main Dashboard Content */}
        <div className="space-y-8">
          {/* Fleet Overview Cards */}
          <section aria-labelledby="fleet-overview-heading" id="fleet-overview">
            <SrOnly>
              <h2 id="fleet-overview-heading">Fleet Metrics and Statistics</h2>
            </SrOnly>
            <Suspense fallback={<DashboardSkeleton />}>
              <FleetOverviewCards />
            </Suspense>
          </section>

          {/* Performance Monitoring Widget */}
          <section aria-labelledby="performance-heading">
            <SrOnly>
              <h2 id="performance-heading">System Performance Monitoring</h2>
            </SrOnly>
            {/* Temporarily disabled to debug reload issue */}
            {/* <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <PerformanceWidget />
            </Suspense> */}
            <Skeleton className="h-64 w-full" />
          </section>

          {/* Critical Alerts Summary */}
          <section aria-labelledby="critical-alerts-heading" className="space-y-6">
            <SrOnly>
              <h2 id="critical-alerts-heading">Critical Alerts and Key Metrics</h2>
            </SrOnly>
            <div className="grid gap-6 lg:grid-cols-1" id="critical-alerts">
              <Suspense fallback={<DashboardSkeleton />}>
                <ExpiringChecksTable daysAhead={30} maxRows={8} title="Critical Expiring Certifications" />
              </Suspense>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
