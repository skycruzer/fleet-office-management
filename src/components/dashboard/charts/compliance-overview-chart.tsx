"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BaseChart, AviationTooltip, AviationLegend, aviationColors, formatAviationNumber } from './base-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplianceDashboard, useDetailedExpiringChecks } from '@/hooks/use-dashboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Compliance Overview Chart Component
 * Displays fleet compliance metrics in multiple interactive visualizations
 */
export function ComplianceOverviewChart() {
  const { data: dashboard, isLoading: dashboardLoading } = useComplianceDashboard();
  const { data: expiringChecks, isLoading: checksLoading } = useDetailedExpiringChecks(90);

  const isLoading = dashboardLoading || checksLoading;

  if (!dashboard && !isLoading) {
    return (
      <BaseChart error title="Compliance Overview" />
    );
  }

  // Prepare compliance pie chart data
  const complianceData = dashboard ? [
    {
      name: 'Compliant',
      value: dashboard.compliant_pilots || 0,
      color: aviationColors.current,
      icon: CheckCircle,
    },
    {
      name: 'Warning',
      value: dashboard.warning_pilots || 0,
      color: aviationColors.warning,
      icon: AlertTriangle,
    },
    {
      name: 'Critical',
      value: dashboard.critical_pilots || 0,
      color: aviationColors.critical,
      icon: Shield,
    },
  ] : [];

  // Prepare expiring checks timeline data
  const timelineData = expiringChecks ? [
    {
      period: 'Expired',
      count: expiringChecks.filter(check => check.days_until_expiry <= 0).length,
      color: aviationColors.critical,
    },
    {
      period: 'Next 7 days',
      count: expiringChecks.filter(check => check.days_until_expiry > 0 && check.days_until_expiry <= 7).length,
      color: aviationColors.urgent,
    },
    {
      period: '8-30 days',
      count: expiringChecks.filter(check => check.days_until_expiry > 7 && check.days_until_expiry <= 30).length,
      color: aviationColors.warning,
    },
    {
      period: '31-60 days',
      count: expiringChecks.filter(check => check.days_until_expiry > 30 && check.days_until_expiry <= 60).length,
      color: aviationColors.attention,
    },
    {
      period: '61-90 days',
      count: expiringChecks.filter(check => check.days_until_expiry > 60 && check.days_until_expiry <= 90).length,
      color: aviationColors.chart2,
    },
  ] : [];

  return (
    <Card className="aviation-card-hover">
      <CardHeader>
        <CardTitle className="aviation-section-header flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Fleet Compliance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Compliance Status
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiry Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compliance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Pie Chart */}
              <BaseChart
                title="Pilot Compliance Status"
                description="Distribution of pilot compliance levels"
                height={280}
                loading={isLoading}
                showLegend={false}
              >
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <AviationTooltip
                    formatter={(value, name) => [
                      `${value} pilots (${((value / (dashboard?.total_active_pilots || 1)) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </BaseChart>

              {/* Compliance Metrics */}
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-aviation-4xl font-aviation-bold aviation-percentage text-primary">
                    {dashboard?.compliance_percentage?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-aviation-subtitle">Overall Fleet Compliance</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {complianceData.map((item, index) => {
                    const Icon = item.icon;
                    const percentage = ((item.value / (dashboard?.total_active_pilots || 1)) * 100);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          "aviation-card-hover aviation-interactive-fast",
                          item.value > 0 && item.name !== 'Compliant' && "bg-red-50/30 border-red-200",
                          item.value > 0 && item.name === 'Compliant' && "bg-green-50/30 border-green-200",
                          item.value === 0 && "bg-muted/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              item.name === 'Compliant' && "text-green-600",
                              item.name === 'Warning' && "text-orange-500",
                              item.name === 'Critical' && "text-red-600"
                            )}
                          />
                          <div>
                            <div className="font-medium text-aviation-base">{item.name}</div>
                            <div className="text-aviation-sm text-muted-foreground">
                              {percentage.toFixed(1)}% of fleet
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "text-aviation-xl font-aviation-bold",
                            item.name === 'Compliant' && "text-green-600",
                            item.name === 'Warning' && "text-orange-500",
                            item.name === 'Critical' && "text-red-600"
                          )}
                        >
                          {item.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <BaseChart
              title="Certification Expiry Timeline"
              description="Distribution of expiring certifications by time period"
              height={320}
              loading={isLoading}
              showLegend={false}
            >
              <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                <XAxis
                  dataKey="period"
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
                    'Expiring'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  fill={aviationColors.primary}
                >
                  {timelineData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </BaseChart>

            {/* Timeline Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {timelineData.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border text-center space-y-1",
                    "aviation-card-hover aviation-interactive-fast",
                    item.count > 0 && item.period.includes('Expired') && "bg-red-50/50 border-red-200",
                    item.count > 0 && item.period.includes('7 days') && "bg-orange-50/50 border-orange-200",
                    item.count > 0 && !item.period.includes('Expired') && !item.period.includes('7 days') && "bg-yellow-50/50 border-yellow-200",
                    item.count === 0 && "bg-muted/20"
                  )}
                >
                  <div
                    className="text-aviation-2xl font-aviation-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </div>
                  <div className="text-aviation-xs text-muted-foreground">
                    {item.period}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}