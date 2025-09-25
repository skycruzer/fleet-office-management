"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ResponsiveContainer
} from 'recharts';
import { BaseChart, AviationTooltip, aviationColors, formatAviationNumber } from './base-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePilotReportSummary } from '@/hooks/use-dashboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pilot Performance Distribution Chart
 * Shows pilot performance metrics and distributions across different dimensions
 */
export function PilotPerformanceChart() {
  const { data: pilots, isLoading } = usePilotReportSummary();

  if (!pilots && !isLoading) {
    return (
      <BaseChart error title="Pilot Performance" />
    );
  }

  // Prepare age distribution data
  const ageDistribution = pilots ? (() => {
    const ageGroups = {
      '25-30': 0,
      '31-35': 0,
      '36-40': 0,
      '41-45': 0,
      '46-50': 0,
      '51-55': 0,
      '56-60': 0,
      '60+': 0,
    };

    pilots.forEach(pilot => {
      const age = pilot.age;
      if (age <= 30) ageGroups['25-30']++;
      else if (age <= 35) ageGroups['31-35']++;
      else if (age <= 40) ageGroups['36-40']++;
      else if (age <= 45) ageGroups['41-45']++;
      else if (age <= 50) ageGroups['46-50']++;
      else if (age <= 55) ageGroups['51-55']++;
      else if (age <= 60) ageGroups['56-60']++;
      else ageGroups['60+']++;
    });

    return Object.entries(ageGroups).map(([range, count]) => ({
      ageRange: range,
      count,
      color: aviationColors.primary,
    }));
  })() : [];

  // Prepare role distribution data
  const roleDistribution = pilots ? (() => {
    const roleGroups: Record<string, number> = {};

    pilots.forEach(pilot => {
      const role = pilot.role || 'Unknown';
      roleGroups[role] = (roleGroups[role] || 0) + 1;
    });

    return Object.entries(roleGroups).map(([role, count]) => ({
      role,
      count,
      color: role === 'Captain' ? aviationColors.primary :
             role === 'First Officer' ? aviationColors.chart2 : aviationColors.secondary,
    }));
  })() : [];

  // Prepare years of service vs current checks scatter plot
  const serviceScatterData = pilots ? pilots.map(pilot => ({
    yearsOfService: pilot.years_of_service || 0,
    currentChecks: pilot.current_checks || 0,
    totalChecks: pilot.total_checks || 0,
    name: pilot.pilot_name,
    role: pilot.role,
    complianceRate: pilot.total_checks > 0 ? ((pilot.current_checks || 0) / pilot.total_checks) * 100 : 0,
  })) : [];

  // Calculate fleet averages
  const fleetAverages = pilots ? {
    averageAge: pilots.reduce((sum, pilot) => sum + pilot.age, 0) / pilots.length,
    averageService: pilots.reduce((sum, pilot) => sum + (pilot.years_of_service || 0), 0) / pilots.length,
    averageChecks: pilots.reduce((sum, pilot) => sum + (pilot.current_checks || 0), 0) / pilots.length,
  } : { averageAge: 0, averageService: 0, averageChecks: 0 };

  return (
    <Card className="aviation-card-hover">
      <CardHeader>
        <CardTitle className="aviation-section-header flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pilot Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <BaseChart
                title="Age Distribution"
                description="Pilot age demographics across the fleet"
                height={280}
                loading={isLoading}
              >
                <AreaChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                  <XAxis
                    dataKey="ageRange"
                    tick={{ fontSize: 12, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                  />
                  <AviationTooltip
                    formatter={(value) => [`${value} pilots`, 'Count']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={aviationColors.primary}
                    fill={aviationColors.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </BaseChart>

              {/* Role Distribution */}
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="aviation-card-header">Role Distribution</h4>
                  <p className="text-aviation-subtitle">Fleet composition by pilot role</p>
                </div>

                <div className="space-y-3">
                  {roleDistribution.map((item, index) => {
                    const total = roleDistribution.reduce((sum, role) => sum + role.count, 0);
                    const percentage = (item.count / total) * 100;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border",
                          "aviation-card-hover aviation-interactive-fast bg-muted/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <div className="font-medium text-aviation-base">{item.role}</div>
                            <div className="text-aviation-sm text-muted-foreground">
                              {percentage.toFixed(1)}% of fleet
                            </div>
                          </div>
                        </div>
                        <div className="text-aviation-xl font-aviation-bold" style={{ color: item.color }}>
                          {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fleet Averages */}
                <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-aviation-sm text-muted-foreground mb-2">Fleet Averages</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded border bg-muted/20">
                      <div className="text-aviation-lg font-aviation-bold text-primary">
                        {fleetAverages.averageAge.toFixed(1)}
                      </div>
                      <div className="text-aviation-xs text-muted-foreground">Avg Age</div>
                    </div>
                    <div className="text-center p-2 rounded border bg-muted/20">
                      <div className="text-aviation-lg font-aviation-bold text-primary">
                        {fleetAverages.averageService.toFixed(1)}
                      </div>
                      <div className="text-aviation-xs text-muted-foreground">Avg Service</div>
                    </div>
                    <div className="text-center p-2 rounded border bg-muted/20">
                      <div className="text-aviation-lg font-aviation-bold text-primary">
                        {fleetAverages.averageChecks.toFixed(1)}
                      </div>
                      <div className="text-aviation-xs text-muted-foreground">Avg Checks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <BaseChart
              title="Service vs Current Certifications"
              description="Relationship between years of service and current certification count"
              height={400}
              loading={isLoading}
            >
              <ScatterChart data={serviceScatterData}>
                <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="yearsOfService"
                  name="Years of Service"
                  tick={{ fontSize: 12, fill: aviationColors.secondary }}
                  axisLine={{ stroke: aviationColors.muted }}
                />
                <YAxis
                  type="number"
                  dataKey="currentChecks"
                  name="Current Checks"
                  tick={{ fontSize: 12, fill: aviationColors.secondary }}
                  axisLine={{ stroke: aviationColors.muted }}
                />
                <AviationTooltip
                  formatter={(value, name, entry) => [
                    name === 'yearsOfService' ? `${value} years` : `${value} checks`,
                    name === 'yearsOfService' ? 'Years of Service' : 'Current Certifications'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} (${data.role})`;
                    }
                    return label;
                  }}
                />
                <Scatter
                  name="Pilots"
                  fill={aviationColors.primary}
                  fillOpacity={0.7}
                  stroke={aviationColors.primary}
                  strokeWidth={1}
                />
              </ScatterChart>
            </BaseChart>

            {/* Performance Summary */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serviceScatterData
                .sort((a, b) => b.complianceRate - a.complianceRate)
                .slice(0, 4)
                .map((pilot, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border text-center space-y-2",
                      "aviation-card-hover aviation-interactive-fast",
                      pilot.complianceRate >= 90 ? "bg-green-50/50 border-green-200" :
                      pilot.complianceRate >= 75 ? "bg-yellow-50/50 border-yellow-200" :
                      "bg-red-50/50 border-red-200"
                    )}
                  >
                    <div className="font-medium text-aviation-sm">{pilot.name}</div>
                    <div className="text-aviation-xs text-muted-foreground">{pilot.role}</div>
                    <div
                      className={cn(
                        "text-aviation-xl font-aviation-bold",
                        pilot.complianceRate >= 90 ? "text-green-600" :
                        pilot.complianceRate >= 75 ? "text-orange-500" : "text-red-600"
                      )}
                    >
                      {pilot.complianceRate.toFixed(1)}%
                    </div>
                    <div className="text-aviation-xs text-muted-foreground">
                      {pilot.currentChecks}/{pilot.totalChecks} checks
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-aviation-base font-medium">Trend Analysis</div>
              <div className="text-aviation-sm text-muted-foreground mt-2">
                Historical trend analysis will be available when longitudinal data is collected.
              </div>
              <div className="text-aviation-xs text-muted-foreground mt-1">
                This feature will track changes in pilot performance metrics over time.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}