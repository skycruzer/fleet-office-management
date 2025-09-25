"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { BaseChart, AviationTooltip, aviationColors, formatAviationNumber } from './base-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDetailedExpiringChecks } from '@/hooks/use-dashboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Certification Timeline Chart
 * Shows certification expiry patterns and trends with interactive drill-down
 */
export function CertificationTimelineChart() {
  const { data: expiringChecks, isLoading } = useDetailedExpiringChecks(365); // Get full year view

  if (!expiringChecks && !isLoading) {
    return (
      <BaseChart error title="Certification Timeline" />
    );
  }

  // Group by months for timeline view
  const monthlyData = expiringChecks ? (() => {
    const months = new Map<string, { expired: number; critical: number; warning: number; normal: number }>();
    const currentDate = new Date();

    // Initialize next 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.set(monthKey, { expired: 0, critical: 0, warning: 0, normal: 0 });
    }

    expiringChecks.forEach(check => {
      const expiryDate = new Date(check.expiry_date);
      const monthKey = expiryDate.toISOString().slice(0, 7);

      if (months.has(monthKey)) {
        const monthData = months.get(monthKey)!;

        if (check.days_until_expiry <= 0) {
          monthData.expired++;
        } else if (check.days_until_expiry <= 30) {
          monthData.critical++;
        } else if (check.days_until_expiry <= 90) {
          monthData.warning++;
        } else {
          monthData.normal++;
        }
      }
    });

    return Array.from(months.entries()).map(([month, data]) => ({
      month,
      monthLabel: new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ...data,
      total: data.expired + data.critical + data.warning + data.normal,
    }));
  })() : [];

  // Prepare check type distribution data
  const checkTypeData = expiringChecks ? (() => {
    const typeGroups = new Map<string, number>();

    expiringChecks.forEach(check => {
      const checkType = check.check_type || 'Unknown';
      typeGroups.set(checkType, (typeGroups.get(checkType) || 0) + 1);
    });

    return Array.from(typeGroups.entries())
      .map(([type, count]) => ({
        checkType: type,
        count,
        color: aviationColors.primary,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 check types
  })() : [];

  // Calculate critical metrics
  const criticalMetrics = expiringChecks ? {
    totalExpiring: expiringChecks.length,
    expiredCount: expiringChecks.filter(check => check.days_until_expiry <= 0).length,
    criticalCount: expiringChecks.filter(check => check.days_until_expiry > 0 && check.days_until_expiry <= 7).length,
    warningCount: expiringChecks.filter(check => check.days_until_expiry > 7 && check.days_until_expiry <= 30).length,
    upcomingCount: expiringChecks.filter(check => check.days_until_expiry > 30).length,
  } : { totalExpiring: 0, expiredCount: 0, criticalCount: 0, warningCount: 0, upcomingCount: 0 };

  return (
    <Card className="aviation-card-hover">
      <CardHeader>
        <CardTitle className="aviation-section-header flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Certification Timeline Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Check Types
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alert Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <BaseChart
              title="Monthly Expiry Projection"
              description="Certification expirations projected over the next 12 months"
              height={380}
              loading={isLoading}
            >
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={aviationColors.critical} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={aviationColors.critical} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={aviationColors.urgent} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={aviationColors.urgent} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={aviationColors.warning} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={aviationColors.warning} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 12, fill: aviationColors.secondary }}
                  axisLine={{ stroke: aviationColors.muted }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: aviationColors.secondary }}
                  axisLine={{ stroke: aviationColors.muted }}
                />
                <AviationTooltip
                  formatter={(value, name) => [
                    `${value} certifications`,
                    name === 'expired' ? 'Expired' :
                    name === 'critical' ? 'Critical (≤7 days)' :
                    name === 'warning' ? 'Warning (8-30 days)' : 'Normal'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="expired"
                  stackId="1"
                  stroke={aviationColors.critical}
                  fill="url(#expiredGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke={aviationColors.urgent}
                  fill="url(#criticalGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="warning"
                  stackId="1"
                  stroke={aviationColors.warning}
                  fill="url(#warningGradient)"
                />
                <ReferenceLine x={new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} stroke={aviationColors.primary} strokeDasharray="2 2" />
              </AreaChart>
            </BaseChart>

            {/* Monthly Summary Cards */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border bg-red-50/50 border-red-200 text-center">
                <div className="text-aviation-2xl font-aviation-bold text-red-600">
                  {criticalMetrics.expiredCount}
                </div>
                <div className="text-aviation-xs text-muted-foreground">Expired</div>
              </div>
              <div className="p-3 rounded-lg border bg-orange-50/50 border-orange-200 text-center">
                <div className="text-aviation-2xl font-aviation-bold text-orange-600">
                  {criticalMetrics.criticalCount}
                </div>
                <div className="text-aviation-xs text-muted-foreground">Critical (≤7 days)</div>
              </div>
              <div className="p-3 rounded-lg border bg-yellow-50/50 border-yellow-200 text-center">
                <div className="text-aviation-2xl font-aviation-bold text-yellow-600">
                  {criticalMetrics.warningCount}
                </div>
                <div className="text-aviation-xs text-muted-foreground">Warning (8-30 days)</div>
              </div>
              <div className="p-3 rounded-lg border bg-blue-50/50 border-blue-200 text-center">
                <div className="text-aviation-2xl font-aviation-bold text-blue-600">
                  {criticalMetrics.upcomingCount}
                </div>
                <div className="text-aviation-xs text-muted-foreground">Upcoming (30+ days)</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="types" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BaseChart
                title="Check Type Distribution"
                description="Most common certification types requiring attention"
                height={300}
                loading={isLoading}
              >
                <AreaChart data={checkTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                  <XAxis
                    dataKey="checkType"
                    tick={{ fontSize: 10, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                  />
                  <AviationTooltip
                    formatter={(value) => [`${value} certifications`, 'Count']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={aviationColors.primary}
                    fill={aviationColors.primary}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </BaseChart>

              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="aviation-card-header">Top Check Types</h4>
                  <p className="text-aviation-subtitle">Most frequently expiring certifications</p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {checkTypeData.map((item, index) => {
                    const total = checkTypeData.reduce((sum, type) => sum + type.count, 0);
                    const percentage = (item.count / total) * 100;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          "aviation-card-hover aviation-interactive-fast bg-muted/20"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-aviation-sm truncate">{item.checkType}</div>
                          <div className="text-aviation-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of expiring
                          </div>
                        </div>
                        <div className="text-aviation-lg font-aviation-bold text-primary ml-3">
                          {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-6">
              {/* Alert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Immediate Action',
                    count: criticalMetrics.expiredCount + criticalMetrics.criticalCount,
                    description: 'Expired + Critical (≤7 days)',
                    color: aviationColors.critical,
                    bgColor: 'bg-red-50/50',
                    borderColor: 'border-red-200',
                  },
                  {
                    title: 'Requires Planning',
                    count: criticalMetrics.warningCount,
                    description: 'Warning (8-30 days)',
                    color: aviationColors.warning,
                    bgColor: 'bg-yellow-50/50',
                    borderColor: 'border-yellow-200',
                  },
                  {
                    title: 'Monitor',
                    count: criticalMetrics.upcomingCount,
                    description: 'Upcoming (30+ days)',
                    color: aviationColors.attention,
                    bgColor: 'bg-blue-50/50',
                    borderColor: 'border-blue-200',
                  },
                  {
                    title: 'Total Tracking',
                    count: criticalMetrics.totalExpiring,
                    description: 'All expiring (365 days)',
                    color: aviationColors.primary,
                    bgColor: 'bg-muted/20',
                    borderColor: 'border-border',
                  },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border text-center space-y-2",
                      "aviation-card-hover aviation-interactive-fast",
                      metric.bgColor,
                      metric.borderColor
                    )}
                  >
                    <div className="text-aviation-3xl font-aviation-bold" style={{ color: metric.color }}>
                      {metric.count}
                    </div>
                    <div className="text-aviation-base font-medium">{metric.title}</div>
                    <div className="text-aviation-xs text-muted-foreground">{metric.description}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="p-4 rounded-lg border bg-muted/10">
                <h4 className="aviation-card-header mb-4">Recommended Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-aviation-sm font-medium text-red-600">Immediate Priority</div>
                    <ul className="text-aviation-xs text-muted-foreground space-y-1">
                      <li>• Review {criticalMetrics.expiredCount} expired certifications</li>
                      <li>• Schedule renewal for {criticalMetrics.criticalCount} critical items</li>
                      <li>• Contact training department for urgent slots</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="text-aviation-sm font-medium text-yellow-600">Near-term Planning</div>
                    <ul className="text-aviation-xs text-muted-foreground space-y-1">
                      <li>• Plan renewals for {criticalMetrics.warningCount} warning items</li>
                      <li>• Prepare documentation for upcoming renewals</li>
                      <li>• Monitor {criticalMetrics.upcomingCount} future expirations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}