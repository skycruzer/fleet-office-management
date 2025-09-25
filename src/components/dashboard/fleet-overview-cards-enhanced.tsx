"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, MetricSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useComplianceDashboard, useDetailedExpiringChecks } from "@/hooks/use-dashboard-data";
import { useComponentPerformance } from "@/hooks/use-performance-tracking";
import { ComplianceStatus, StatusIndicator } from "@/components/ui/status-indicator";
import type { ComplianceDashboard } from "@/lib/supabase";
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { aviationColors, AviationTooltip } from "./charts/base-chart";

interface EnhancedMetricCardProps {
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
  chartData?: any[];
  chartType?: "pie" | "area" | "bar" | "none";
  onCardClick?: () => void;
  isInteractive?: boolean;
}

function EnhancedMetricCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  priority = "secondary",
  trend,
  className,
  pulse = false,
  chartData = [],
  chartType = "none",
  onCardClick,
  isInteractive = false,
}: EnhancedMetricCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showChart, setShowChart] = React.useState(false);

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

  React.useEffect(() => {
    if (isHovered && chartData.length > 0 && chartType !== "none") {
      const timer = setTimeout(() => setShowChart(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowChart(false);
    }
  }, [isHovered, chartData, chartType]);

  const renderMiniChart = () => {
    if (!showChart || chartData.length === 0) return null;

    const chartHeight = priority === "critical" ? 100 : priority === "primary" ? 80 : 60;

    switch (chartType) {
      case "pie":
        return (
          <div className="mt-3" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={priority === "critical" ? 25 : 20}
                  outerRadius={priority === "critical" ? 45 : 35}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || aviationColors.primary} />
                  ))}
                </Pie>
                <AviationTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case "area":
        return (
          <div className="mt-3" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={aviationColors.primary}
                  fill={aviationColors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <AviationTooltip />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case "bar":
        return (
          <div className="mt-3" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar
                  dataKey="value"
                  fill={aviationColors.primary}
                  radius={[2, 2, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color || aviationColors.primary} />
                  ))}
                </Bar>
                <AviationTooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        variantStyles[variant],
        priorityStyles[priority],
        pulse && "animate-pulse",
        "transition-all duration-300 hover:shadow-lg",
        isInteractive && "cursor-pointer aviation-card-hover",
        isHovered && "scale-105 shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isInteractive ? onCardClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(titleSizes[priority], "flex items-center gap-2")}>
          {title}
          {isHovered && chartType !== "none" && chartData.length > 0 && (
            <div className="opacity-70">
              {chartType === "pie" && <PieChartIcon className="h-3 w-3" />}
              {chartType === "area" && <LineChartIcon className="h-3 w-3" />}
              {chartType === "bar" && <BarChart3 className="h-3 w-3" />}
            </div>
          )}
        </CardTitle>
        <Icon className={cn(
          iconSizes[priority],
          variant === "destructive" ? "text-red-500" :
          variant === "warning" ? "text-orange-500" :
          variant === "success" ? "text-green-500" :
          "text-muted-foreground",
          isHovered && "scale-110 aviation-icon-hover"
        )} />
      </CardHeader>
      <CardContent className={priority === "critical" ? "space-y-3" : ""}>
        <div className={cn(valueSizes[priority], "aviation-metric-animated")}>
          {value}
        </div>
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
        {renderMiniChart()}
      </CardContent>
    </Card>
  );
}

interface FleetOverviewCardsEnhancedProps {
  className?: string;
}

export function FleetOverviewCardsEnhanced({ className }: FleetOverviewCardsEnhancedProps) {
  const { trackInteraction } = useComponentPerformance('FleetOverviewCardsEnhanced')
  const { data: dashboard, isLoading, error } = useComplianceDashboard();
  const { data: expiringChecks } = useDetailedExpiringChecks(90);

  const [selectedView, setSelectedView] = React.useState<"overview" | "charts" | "analytics">("overview");

  if (isLoading) {
    return <FleetOverviewCardsSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
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
  const criticalAlerts = (dashboard.critical_checks || 0) + (dashboard.expired_checks || 0);
  const hasUrgentItems = (dashboard.expiring_next_7_days || 0) > 0 || criticalAlerts > 0;

  // Prepare chart data for cards
  const complianceChartData = [
    {
      name: 'Compliant',
      value: dashboard.compliant_pilots || 0,
      color: aviationColors.current,
    },
    {
      name: 'Warning',
      value: dashboard.warning_pilots || 0,
      color: aviationColors.warning,
    },
    {
      name: 'Critical',
      value: dashboard.critical_pilots || 0,
      color: aviationColors.critical,
    },
  ];

  const expiryTimelineData = expiringChecks?.slice(0, 7).map((check, index) => ({
    name: check.pilot_name?.split(' ')[0] || `Pilot ${index + 1}`,
    value: Math.max(0, check.days_until_expiry),
    color: check.days_until_expiry <= 0 ? aviationColors.critical :
           check.days_until_expiry <= 7 ? aviationColors.urgent :
           check.days_until_expiry <= 30 ? aviationColors.warning :
           aviationColors.attention,
  })) || [];

  const roleDistributionData = [
    {
      name: 'Captains',
      value: dashboard.active_captains || 0,
      color: aviationColors.primary,
    },
    {
      name: 'First Officers',
      value: dashboard.active_first_officers || 0,
      color: aviationColors.chart2,
    },
  ];

  return (
    <div className={cn("space-y-8 content-fade-in", className)}>
      {/* Enhanced Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="aviation-page-header">Fleet Operations Dashboard</h2>
          <p className="text-aviation-subtitle">Interactive fleet management overview with real-time insights</p>
        </div>
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={selectedView} className="w-full">
        <TabsContent value="overview">
          {/* CRITICAL TIER - Enhanced with Interactive Elements */}
          <section>
            <div className="mb-4">
              <h3 className="aviation-section-header">Critical Status</h3>
              <p className="text-aviation-subtitle">Immediate attention required - click for details</p>
            </div>

            <div className="grid gap-4 responsive-grid lg:grid-cols-2">
              <EnhancedMetricCard
                title="Critical Safety Alerts"
                value={criticalAlerts}
                description={criticalAlerts === 0 ?
                  "All certifications are current - excellent safety compliance!" :
                  "Immediate action required for flight safety compliance"
                }
                icon={AlertTriangle}
                variant={criticalAlerts > 0 ? "destructive" : "success"}
                priority="critical"
                pulse={criticalAlerts > 0}
                chartData={complianceChartData}
                chartType="pie"
                isInteractive={true}
                onCardClick={() => trackInteraction('critical_alert_card_click')}
              />
            </div>
          </section>

          {/* PRIMARY TIER - Enhanced with Charts */}
          <section className="mt-8">
            <div className="mb-4">
              <h3 className="aviation-section-header">Key Metrics</h3>
              <p className="text-aviation-subtitle">Essential operational indicators with trend visualization</p>
            </div>

            <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-3 metric-card-grid">
              <EnhancedMetricCard
                title="Fleet Compliance"
                value={`${compliancePercentage.toFixed(1)}%`}
                description={`${dashboard.compliant_pilots || 0} of ${dashboard.total_active_pilots || 0} pilots compliant`}
                icon={Shield}
                variant={compliancePercentage >= 95 ? "success" : compliancePercentage >= 85 ? "warning" : "destructive"}
                priority="primary"
                chartData={complianceChartData}
                chartType="pie"
                isInteractive={true}
                onCardClick={() => trackInteraction('compliance_card_click')}
              />

              <EnhancedMetricCard
                title="Urgent Actions"
                value={dashboard.expiring_next_7_days || 0}
                description={!hasUrgentItems ?
                  "No urgent actions required - all certifications current" :
                  "Certifications requiring attention within next 7-30 days"
                }
                icon={Clock}
                variant={hasUrgentItems ? "warning" : "success"}
                priority="primary"
                chartData={expiryTimelineData}
                chartType="bar"
                isInteractive={true}
                onCardClick={() => trackInteraction('urgent_actions_card_click')}
              />

              <EnhancedMetricCard
                title="Active Pilots"
                value={dashboard.total_active_pilots || 0}
                description="Total active pilots in B767 fleet operations"
                icon={Users}
                priority="primary"
                chartData={roleDistributionData}
                chartType="pie"
                isInteractive={true}
                onCardClick={() => trackInteraction('active_pilots_card_click')}
              />
            </div>
          </section>

          {/* SECONDARY TIER - Supporting Information */}
          <section className="mt-8">
            <div className="mb-4">
              <h3 className="aviation-section-header">Fleet Details</h3>
              <p className="text-aviation-subtitle">Supporting operational data with interactive insights</p>
            </div>

            <div className="grid gap-4 responsive-grid md:grid-cols-2 lg:grid-cols-4 metric-card-grid">
              <EnhancedMetricCard
                title="Line Captains"
                value={dashboard.line_captains || 0}
                description="Operational leadership coverage"
                icon={Star}
                priority="secondary"
                isInteractive={true}
                onCardClick={() => trackInteraction('line_captains_card_click')}
              />

              <EnhancedMetricCard
                title="Training Captains"
                value={dashboard.training_captains || 0}
                description="Training and examination infrastructure"
                icon={Users}
                priority="secondary"
                isInteractive={true}
                onCardClick={() => trackInteraction('training_captains_card_click')}
              />

              <EnhancedMetricCard
                title="Check Types"
                value={dashboard.total_check_types || 0}
                description="Certification type coverage"
                icon={CheckCircle}
                priority="secondary"
                isInteractive={true}
                onCardClick={() => trackInteraction('check_types_card_click')}
              />

              <EnhancedMetricCard
                title="Avg Performance"
                value={dashboard.avg_compliance_score ? `${dashboard.avg_compliance_score.toFixed(1)}%` : "N/A"}
                description="Fleet compliance performance average"
                icon={Activity}
                variant={dashboard.avg_compliance_score && dashboard.avg_compliance_score >= 90 ? "success" : "warning"}
                priority="secondary"
                isInteractive={true}
                onCardClick={() => trackInteraction('avg_performance_card_click')}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="charts">
          <div className="space-y-6">
            {/* Import and use our chart components */}
            {React.lazy(() => import('./charts/compliance-overview-chart').then(module => ({ default: module.ComplianceOverviewChart })))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Import and use our analytics components */}
            {React.lazy(() => import('./charts/pilot-performance-chart').then(module => ({ default: module.PilotPerformanceChart })))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
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