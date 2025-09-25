"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, MetricSkeleton } from "@/components/ui/skeleton";
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Star,
  Plane,
  Clock,
  Activity,
  Calendar,
} from "lucide-react";
import { useComplianceDashboard } from "@/hooks/use-dashboard-data";
import { useComponentPerformance } from "@/hooks/use-performance-tracking";
import { useAccessibilityAnnouncements, useReducedMotion } from "@/hooks/use-accessibility";
import { ComplianceStatus, StatusIndicator } from "@/components/ui/status-indicator";
import type { ComplianceDashboard } from "@/lib/supabase";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "destructive";
  priority?: "critical" | "primary" | "secondary";
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  pulse?: boolean;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  priority = "secondary",
  trend,
  className,
  pulse = false,
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-green-200 bg-green-50/50",
    warning: "border-yellow-200 bg-yellow-50/50",
    destructive: "border-red-200 bg-red-50/50",
  };

  const priorityStyles = {
    critical: "lg:col-span-2 ring-2 ring-orange-200 shadow-lg scale-105 mobile-metric-card",
    primary: "lg:col-span-1 shadow-md border-2",
    secondary: "border",
  };

  const iconSizes = {
    critical: "h-8 w-8",
    primary: "h-6 w-6",
    secondary: "h-4 w-4",
  };

  const valueSizes = {
    critical: "text-4xl font-bold",
    primary: "text-3xl font-bold",
    secondary: "text-2xl font-bold",
  };

  const titleSizes = {
    critical: "text-lg font-semibold",
    primary: "text-base font-medium",
    secondary: "text-sm font-medium",
  };

  return (
    <Card className={cn(
      variantStyles[variant],
      priorityStyles[priority],
      pulse && "animate-pulse",
      "transition-all duration-300 hover:shadow-lg",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={titleSizes[priority]}>{title}</CardTitle>
        <Icon className={cn(
          iconSizes[priority],
          variant === "destructive" ? "text-red-500" :
          variant === "warning" ? "text-orange-500" :
          variant === "success" ? "text-green-500" :
          "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className={priority === "critical" ? "space-y-3" : ""}>
        <div className={valueSizes[priority]}>{value}</div>
        {description && (
          <p className={cn(
            "text-muted-foreground mt-1",
            priority === "critical" ? "text-sm" : "text-xs"
          )}>
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            {trend.value > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FleetOverviewCardsSkeleton() {
  return (
    <div className="space-y-8 content-fade-in">
      {/* Critical Status Section */}
      <section>
        <div className="mb-4 space-y-2">
          <Skeleton variant="shimmer" className="h-6 w-32 loading-stagger-1" />
          <Skeleton variant="shimmer" className="h-4 w-56 loading-stagger-2" />
        </div>
        <div className="grid gap-4 responsive-grid lg:grid-cols-2">
          <MetricSkeleton priority="critical" />
        </div>
      </section>

      {/* Key Metrics Section */}
      <section>
        <div className="mb-4 space-y-2">
          <Skeleton variant="shimmer" className="h-6 w-28 loading-stagger-1" />
          <Skeleton variant="shimmer" className="h-4 w-48 loading-stagger-2" />
        </div>
        <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-3 metric-card-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`primary-${i}`} className={`loading-stagger-${i + 1}`}>
              <MetricSkeleton priority="primary" />
            </div>
          ))}
        </div>
      </section>

      {/* Fleet Details Section */}
      <section>
        <div className="mb-4 space-y-2">
          <Skeleton variant="shimmer" className="h-5 w-24 loading-stagger-1" />
          <Skeleton variant="shimmer" className="h-4 w-44 loading-stagger-2" />
        </div>
        <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-4 metric-card-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`secondary-${i}`} className={`loading-stagger-${i + 1}`}>
              <MetricSkeleton priority="secondary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface FleetOverviewCardsProps {
  className?: string;
}

export function FleetOverviewCards({ className }: FleetOverviewCardsProps) {
  const { trackInteraction } = useComponentPerformance('FleetOverviewCards')
  const { data: dashboard, isLoading, error } = useComplianceDashboard();
  const { announceDataUpdate, announceError } = useAccessibilityAnnouncements();
  const prefersReducedMotion = useReducedMotion();

  // Announce when dashboard data loads
  React.useEffect(() => {
    if (dashboard && !isLoading) {
      announceDataUpdate("Dashboard metrics", 1);
    }
  }, [dashboard, isLoading, announceDataUpdate]);

  // Announce errors
  React.useEffect(() => {
    if (error) {
      announceError("Failed to load dashboard metrics. Please try refreshing the page.");
    }
  }, [error, announceError]);

  if (isLoading) {
    return <FleetOverviewCardsSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6" role="alert" aria-live="assertive">
        <Card className="col-span-full border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle
                className="h-8 w-8 text-destructive mx-auto mb-2"
                aria-hidden="true"
                role="img"
                focusable="false"
              />
              <p className="text-sm text-destructive font-medium">
                Unable to load dashboard metrics
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please check your connection and try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const compliancePercentage = dashboard.compliance_percentage || 0;
  const criticalAlerts = (dashboard.critical_checks || 0) + (dashboard.expired_checks || 0);
  const hasUrgentItems = (dashboard.expiring_next_7_days || 0) > 0 || criticalAlerts > 0;

  // Determine compliance status variants
  const getComplianceVariant = (percentage: number) => {
    if (percentage >= 95) return "success";
    if (percentage >= 85) return "warning";
    return "destructive";
  };

  return (
    <div
      className={cn("space-y-8 content-fade-in", className)}
      role="region"
      aria-label="Fleet overview dashboard"
    >
      {/* CRITICAL TIER - Most Important Alerts */}
      <section
        role="region"
        aria-labelledby="critical-status-heading"
        id="critical-alerts"
      >
        <div className="mb-4">
          <h2
            id="critical-status-heading"
            className="aviation-section-header text-xl font-semibold text-foreground"
            role="heading"
            aria-level={2}
          >
            Critical Status
          </h2>
          <p
            className="text-aviation-subtitle text-muted-foreground"
            role="doc-subtitle"
            aria-describedby="critical-status-heading"
          >
            Immediate attention required for flight safety compliance
          </p>
        </div>

        <div className="grid gap-4 responsive-grid lg:grid-cols-2">
          {/* Critical Safety Alerts - Highest Priority */}
          <Card
            className={cn(
              "lg:col-span-2 ring-2 ring-orange-200 shadow-lg scale-105 mobile-metric-card aviation-card-hover",
              criticalAlerts > 0 && !prefersReducedMotion && "aviation-critical-pulse"
            )}
            role="alert"
            aria-live={criticalAlerts > 0 ? "assertive" : "polite"}
            aria-labelledby="critical-alerts-title"
            aria-describedby="critical-alerts-description"
            tabIndex={0}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                id="critical-alerts-title"
                className="text-lg font-semibold flex items-center gap-2"
                role="heading"
                aria-level={3}
              >
                <AlertTriangle
                  className={cn(
                    "h-8 w-8 aviation-icon-hover flex-shrink-0",
                    criticalAlerts > 0 ? "text-red-500" : "text-green-500",
                    criticalAlerts > 0 && !prefersReducedMotion && "animate-pulse"
                  )}
                  aria-hidden="true"
                  role="img"
                  focusable="false"
                />
                <span>Critical Safety Alerts</span>
                {criticalAlerts > 0 && (
                  <span className="sr-only">
                    Warning: {criticalAlerts} critical safety alerts require immediate attention
                  </span>
                )}
              </CardTitle>
              <div className="flex flex-col gap-1">
                {dashboard.expired_checks && dashboard.expired_checks > 0 && (
                  <StatusIndicator
                    variant="expired"
                    size="sm"
                    label="Expired"
                    value={dashboard.expired_checks}
                    pattern="stripes"
                  />
                )}
                {dashboard.critical_checks && dashboard.critical_checks > 0 && (
                  <StatusIndicator
                    variant="critical"
                    size="sm"
                    label="Critical"
                    value={dashboard.critical_checks}
                    pulse={true}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-aviation-metric text-aviation-4xl aviation-metric-animated aviation-stagger-1">
                {criticalAlerts}
                {criticalAlerts === 0 && (
                  <span className="ml-2 text-green-600 aviation-success-check">
                    <CheckCircle className="inline h-8 w-8" />
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusIndicator
                  variant={dashboard.expired_checks && dashboard.expired_checks > 0 ? "expired" : "current"}
                  label="Expired"
                  value={dashboard.expired_checks || 0}
                  size="sm"
                />
                <StatusIndicator
                  variant={dashboard.critical_checks && dashboard.critical_checks > 0 ? "critical" : "current"}
                  label="Critical"
                  value={dashboard.critical_checks || 0}
                  size="sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {criticalAlerts === 0 ?
                  "All certifications are current - excellent safety compliance!" :
                  "Immediate action required for flight safety compliance"
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PRIMARY TIER - Key Operations Metrics */}
      <section>
        <div className="mb-4">
          <h3 className="aviation-section-header">Key Metrics</h3>
          <p className="text-aviation-subtitle">Essential operational indicators</p>
        </div>

        <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-3 metric-card-grid">
          {/* Fleet Compliance */}
          <Card className="shadow-md border-2 aviation-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Fleet Compliance</CardTitle>
              <Shield className={cn(
                "h-6 w-6",
                compliancePercentage >= 95 ? "text-green-500" :
                compliancePercentage >= 85 ? "text-orange-500" : "text-red-500"
              )} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-aviation-metric text-aviation-3xl aviation-percentage aviation-metric-animated aviation-stagger-2">
                {compliancePercentage.toFixed(1)}%
              </div>
              <ComplianceStatus
                percentage={compliancePercentage}
                total={dashboard.total_active_pilots || 0}
                compliant={dashboard.compliant_pilots || 0}
                size="default"
                showDetails={true}
              />
              <p className="text-sm text-muted-foreground">
                {dashboard.compliant_pilots || 0} of {dashboard.total_active_pilots || 0} pilots compliant
              </p>
            </CardContent>
          </Card>

          {/* Urgent Actions Needed */}
          <Card className="shadow-md border-2 aviation-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Urgent Actions</CardTitle>
              <Clock className={cn(
                "h-6 w-6",
                hasUrgentItems ? "text-orange-500" : "text-green-500"
              )} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-aviation-metric text-aviation-3xl aviation-metric-animated aviation-stagger-3">
                {dashboard.expiring_next_7_days || 0}
                {!hasUrgentItems && (
                  <span className="ml-2 text-green-600 aviation-success-check">
                    <CheckCircle className="inline h-6 w-6" />
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusIndicator
                  variant={(dashboard.expiring_next_7_days || 0) > 0 ? "urgent" : "current"}
                  label="Next 7 days"
                  value={dashboard.expiring_next_7_days || 0}
                  size="sm"
                  pulse={(dashboard.expiring_next_7_days || 0) > 0}
                />
                <StatusIndicator
                  variant={(dashboard.expiring_next_30_days || 0) > 0 ? "warning" : "current"}
                  label="Next 30 days"
                  value={dashboard.expiring_next_30_days || 0}
                  size="sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {!hasUrgentItems ?
                  "No urgent actions required - all certifications current" :
                  "Certifications requiring attention within next 7-30 days"
                }
              </p>
            </CardContent>
          </Card>

          {/* Active Pilots */}
          <Card className="shadow-md border-2 aviation-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Active Pilots</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-aviation-metric text-aviation-3xl aviation-metric-animated aviation-stagger-4">
                {dashboard.total_active_pilots || 0}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusIndicator
                  variant="current"
                  label="Captains"
                  value={dashboard.active_captains || 0}
                  size="sm"
                  icon={Plane}
                />
                <StatusIndicator
                  variant="current"
                  label="First Officers"
                  value={dashboard.active_first_officers || 0}
                  size="sm"
                  icon={Users}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Total active pilots in B767 fleet operations
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECONDARY TIER - Supporting Information */}
      <section>
        <div className="mb-4">
          <h3 className="aviation-section-header">Fleet Details</h3>
          <p className="text-aviation-subtitle">Supporting operational data</p>
        </div>

        <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-4 metric-card-grid">
          {/* Line Captains */}
          <Card className="border aviation-card-hover aviation-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Line Captains</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-aviation-metric text-aviation-2xl mb-2">
                {dashboard.line_captains || 0}
              </div>
              <StatusIndicator
                variant={((dashboard.line_captains || 0) / (dashboard.active_captains || 1) * 100) >= 75 ? "current" : "warning"}
                label="Coverage"
                value={`${((dashboard.line_captains || 0) / (dashboard.active_captains || 1) * 100).toFixed(0)}%`}
                size="sm"
                icon={Star}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Operational leadership coverage
              </p>
            </CardContent>
          </Card>

          {/* Training Infrastructure */}
          <Card className="border aviation-card-hover aviation-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Captains</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-aviation-metric text-aviation-2xl mb-2">
                {dashboard.training_captains || 0}
              </div>
              <StatusIndicator
                variant="current"
                label="Examiners"
                value={dashboard.examiners || 0}
                size="sm"
                icon={Shield}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Training and examination infrastructure
              </p>
            </CardContent>
          </Card>

          {/* Check Types Coverage */}
          <Card className="border aviation-card-hover aviation-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check Types</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-aviation-metric text-aviation-2xl mb-2">
                {dashboard.total_check_types || 0}
              </div>
              <StatusIndicator
                variant="current"
                label="Categories"
                value={dashboard.total_categories || 0}
                size="sm"
                icon={Activity}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Certification type coverage
              </p>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card className="border aviation-card-hover aviation-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Activity className={cn(
                "h-4 w-4",
                dashboard.avg_compliance_score && dashboard.avg_compliance_score >= 90 ? "text-green-500" : "text-orange-500"
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-aviation-metric text-aviation-2xl aviation-percentage mb-2">
                {dashboard.avg_compliance_score ? `${dashboard.avg_compliance_score.toFixed(1)}%` : "N/A"}
              </div>
              <StatusIndicator
                variant={dashboard.avg_compliance_score && dashboard.avg_compliance_score >= 90 ? "current" : "warning"}
                label="Avg days to expiry"
                value={`${dashboard.avg_days_to_expiry || 0} days`}
                size="sm"
                icon={Calendar}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Fleet compliance performance average
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

interface QuickStatsProps {
  className?: string;
}

export function QuickStats({ className }: QuickStatsProps) {
  const { data: dashboard, isLoading } = useComplianceDashboard();

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Badge key={i} variant="outline">
            <Skeleton className="h-3 w-16" />
          </Badge>
        ))}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge variant="outline" className="gap-1">
        <Plane className="h-3 w-3" />
        B767 Fleet
      </Badge>

      <Badge variant={dashboard.critical_pilots && dashboard.critical_pilots > 0 ? "destructive" : "secondary"}>
        {dashboard.critical_pilots || 0} Critical
      </Badge>

      <Badge variant={dashboard.warning_pilots && dashboard.warning_pilots > 0 ? "secondary" : "outline"}>
        {dashboard.warning_pilots || 0} Warning
      </Badge>

      <Badge variant="outline">
        {dashboard.total_checks || 0} Total Checks
      </Badge>

      <Badge variant="outline">
        Updated {dashboard.report_date ? new Date(dashboard.report_date).toLocaleDateString() : "Today"}
      </Badge>
    </div>
  );
}