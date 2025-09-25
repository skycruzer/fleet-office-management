"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Star,
  Plane,
} from "lucide-react";
import { useComplianceDashboard } from "@/hooks/use-dashboard-data";
import { useComponentPerformance } from "@/hooks/use-performance-tracking";
import type { ComplianceDashboard } from "@/lib/supabase";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "destructive";
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  trend,
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-green-200 bg-green-50/50",
    warning: "border-yellow-200 bg-yellow-50/50",
    destructive: "border-red-200 bg-red-50/50",
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface FleetOverviewCardsProps {
  className?: string;
}

export function FleetOverviewCards({ className }: FleetOverviewCardsProps) {
  const { trackInteraction } = useComponentPerformance('FleetOverviewCards')
  const { data: dashboard, isLoading, error } = useComplianceDashboard();

  if (isLoading) {
    return <FleetOverviewCardsSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Unable to load dashboard metrics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const compliancePercentage = dashboard.compliance_percentage || 0;
  const expiredPercentage = dashboard.expired_checks_percentage || 0;

  // Determine compliance status variants
  const getComplianceVariant = (percentage: number) => {
    if (percentage >= 95) return "success";
    if (percentage >= 85) return "warning";
    return "destructive";
  };

  const getExpirationVariant = (percentage: number) => {
    if (percentage <= 2) return "success";
    if (percentage <= 5) return "warning";
    return "destructive";
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {/* Active Pilots */}
      <MetricCard
        title="Active Pilots"
        value={dashboard.total_active_pilots || 0}
        description={`${dashboard.active_captains || 0} Captains, ${dashboard.active_first_officers || 0} F/Os`}
        icon={Users}
        variant="default"
      />

      {/* Fleet Compliance */}
      <MetricCard
        title="Fleet Compliance"
        value={`${compliancePercentage.toFixed(1)}%`}
        description={`${dashboard.compliant_pilots || 0} of ${dashboard.total_active_pilots || 0} pilots compliant`}
        icon={Shield}
        variant={getComplianceVariant(compliancePercentage)}
      />

      {/* Expiring Soon */}
      <MetricCard
        title="Expiring (30 days)"
        value={dashboard.expiring_next_30_days || 0}
        description={`${dashboard.expiring_next_7_days || 0} expire within 7 days`}
        icon={AlertTriangle}
        variant={dashboard.expiring_next_7_days && dashboard.expiring_next_7_days > 0 ? "warning" : "default"}
      />

      {/* Critical Alerts */}
      <MetricCard
        title="Critical Alerts"
        value={dashboard.critical_checks || 0}
        description={`${dashboard.expired_checks || 0} expired checks`}
        icon={AlertTriangle}
        variant={dashboard.critical_checks && dashboard.critical_checks > 0 ? "destructive" : "success"}
      />

      {/* Captain Qualifications */}
      <MetricCard
        title="Line Captains"
        value={dashboard.line_captains || 0}
        description={`${((dashboard.line_captains || 0) / (dashboard.active_captains || 1) * 100).toFixed(0)}% captain coverage`}
        icon={Star}
        variant="default"
      />

      {/* Training Infrastructure */}
      <MetricCard
        title="Training Captains"
        value={dashboard.training_captains || 0}
        description={`${dashboard.examiners || 0} qualified examiners`}
        icon={Users}
        variant="default"
      />

      {/* Check Types Coverage */}
      <MetricCard
        title="Check Types"
        value={dashboard.total_check_types || 0}
        description={`${dashboard.total_categories || 0} categories tracked`}
        icon={CheckCircle}
        variant="default"
      />

      {/* Average Compliance Score */}
      <MetricCard
        title="Avg Compliance"
        value={dashboard.avg_compliance_score ? `${dashboard.avg_compliance_score.toFixed(1)}%` : "N/A"}
        description={`${dashboard.avg_days_to_expiry || 0} avg days to expiry`}
        icon={TrendingUp}
        variant={dashboard.avg_compliance_score && dashboard.avg_compliance_score >= 90 ? "success" : "warning"}
      />
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