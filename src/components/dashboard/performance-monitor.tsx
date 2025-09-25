/**
 * Performance Monitor Component
 * Real-time performance tracking and Core Web Vitals display
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  usePerformanceMetrics,
  useNetworkStatus,
  useRenderTracker
} from '@/hooks/use-performance-optimization';
import { cn } from '@/lib/utils';
import {
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Clock,
  Eye,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PerformanceMonitorProps {
  className?: string;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function PerformanceMonitor({
  className,
  compact = false,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: PerformanceMonitorProps) {
  const { metrics, vitals, getPerformanceGrade, isLoading } = usePerformanceMetrics();
  const { isOnline, connectionInfo, isSlowConnection, isDataSaverEnabled } = useNetworkStatus();
  const { renderCount } = useRenderTracker('PerformanceMonitor');

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const performanceGrades = getPerformanceGrade();

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    return `${ms.toFixed(1)}ms`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good': return 'text-green-600 bg-green-100 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'good': return <CheckCircle2 className="w-4 h-4" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <TrendingDown className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  getGradeColor(performanceGrades.lcp)
                )}
              >
                LCP: {formatTime(vitals.lcp)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="w-5 h-5" />
            <span>Performance Monitor</span>
          </CardTitle>
          <CardDescription>Collecting performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 animate-pulse" />
              <span>Analyzing performance...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="w-5 h-5" />
              <span>Performance Monitor</span>
            </CardTitle>
            <CardDescription>
              Real-time performance metrics and Core Web Vitals
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="runtime">Runtime</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* First Contentful Paint */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">FCP</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getGradeColor(performanceGrades.fcp))}
                  >
                    {getGradeIcon(performanceGrades.fcp)}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatTime(vitals.fcp)}</div>
                <div className="text-xs text-muted-foreground">First Contentful Paint</div>
              </div>

              {/* Largest Contentful Paint */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">LCP</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getGradeColor(performanceGrades.lcp))}
                  >
                    {getGradeIcon(performanceGrades.lcp)}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatTime(vitals.lcp)}</div>
                <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
              </div>

              {/* First Input Delay */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">FID</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getGradeColor(performanceGrades.fid))}
                  >
                    {getGradeIcon(performanceGrades.fid)}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatTime(vitals.fid)}</div>
                <div className="text-xs text-muted-foreground">First Input Delay</div>
              </div>

              {/* Cumulative Layout Shift */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">CLS</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getGradeColor(performanceGrades.cls))}
                  >
                    {getGradeIcon(performanceGrades.cls)}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {vitals.cls ? vitals.cls.toFixed(3) : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3">Overall Performance Score</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span className="font-medium">
                    {Object.values(performanceGrades).filter(grade => grade === 'good').length * 25}%
                  </span>
                </div>
                <Progress
                  value={Object.values(performanceGrades).filter(grade => grade === 'good').length * 25}
                  className="h-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Connection Status</span>
                </div>
                <div className="text-2xl font-bold">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {connectionInfo.effectiveType.toUpperCase()}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Download Speed</span>
                </div>
                <div className="text-2xl font-bold">
                  {connectionInfo.downlink} Mbps
                </div>
                <div className="text-xs text-muted-foreground">
                  RTT: {connectionInfo.rtt}ms
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Connection Quality</span>
                </div>
                <div className="space-y-1">
                  <Badge variant={isSlowConnection ? "destructive" : "default"} className="text-xs">
                    {isSlowConnection ? "Slow Connection" : "Good Connection"}
                  </Badge>
                  {isDataSaverEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      Data Saver On
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3">Time to First Byte (TTFB)</h4>
              <div className="text-2xl font-bold mb-2">{formatTime(vitals.ttfb)}</div>
              <Progress
                value={vitals.ttfb ? Math.min((vitals.ttfb / 1000) * 100, 100) : 0}
                className="h-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {metrics.memoryUsage && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">Used JS Heap Size</div>
                  <div className="text-2xl font-bold">
                    {formatBytes(metrics.memoryUsage.usedJSHeapSize)}
                  </div>
                  <Progress
                    value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize) * 100}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">Total JS Heap Size</div>
                  <div className="text-2xl font-bold">
                    {formatBytes(metrics.memoryUsage.totalJSHeapSize)}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">JS Heap Size Limit</div>
                  <div className="text-2xl font-bold">
                    {formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3">Resource Loading</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Resources</span>
                  <span className="font-medium">{metrics.resourceTiming.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Load Time</span>
                  <span className="font-medium">
                    {metrics.resourceTiming.length > 0
                      ? formatTime(
                          metrics.resourceTiming.reduce((sum, resource) =>
                            sum + (resource.loadEnd - resource.loadStart), 0
                          ) / metrics.resourceTiming.length
                        )
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="runtime" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Component Renders</div>
                <div className="text-2xl font-bold">{renderCount}</div>
                <div className="text-xs text-muted-foreground">
                  This component rendered {renderCount} times
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Last Update</div>
                <div className="text-2xl font-bold">
                  {lastUpdate.toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3">Navigation Timing</h4>
              {metrics.navigationTiming && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">DOM Content Loaded:</span>
                    <div className="font-mono">
                      {formatTime(metrics.navigationTiming.domContentLoadedEventEnd - metrics.navigationTiming.navigationStart)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Load Complete:</span>
                    <div className="font-mono">
                      {formatTime(metrics.navigationTiming.loadEventEnd - metrics.navigationTiming.navigationStart)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}