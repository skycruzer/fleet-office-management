"use client";

import { ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

// FAA-compliant color palette for aviation dashboards
export const aviationColors = {
  critical: '#dc2626', // Red - FAA critical status
  warning: '#f59e0b',  // Amber - FAA warning status
  urgent: '#ea580c',   // Orange - FAA urgent attention
  attention: '#3b82f6', // Blue - FAA attention required
  current: '#16a34a',  // Green - FAA current/compliant
  primary: '#1e40af',  // Aviation blue
  secondary: '#6b7280', // Gray
  muted: '#9ca3af',    // Light gray
  // Chart specific colors for multi-series data
  chart1: '#1e40af',   // Aviation blue
  chart2: '#059669',   // Green
  chart3: '#dc2626',   // Red
  chart4: '#f59e0b',   // Amber
  chart5: '#7c3aed',   // Purple
} as const;

export interface BaseChartProps extends ComponentPropsWithoutRef<'div'> {
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  error?: boolean;
  showLegend?: boolean;
  children: React.ReactNode;
}

/**
 * Base chart wrapper component with consistent styling and error handling
 */
export function BaseChart({
  title,
  description,
  height = 300,
  loading = false,
  error = false,
  showLegend = true,
  children,
  className,
  ...props
}: BaseChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border bg-card p-6",
          "animate-pulse bg-muted/20",
          className
        )}
        style={{ height }}
        {...props}
      >
        <div className="space-y-4">
          {title && (
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              {description && <div className="h-3 w-48 bg-muted rounded" />}
            </div>
          )}
          <div className="h-full w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border bg-card p-6",
          "border-red-200 bg-red-50/50",
          className
        )}
        style={{ height }}
        {...props}
      >
        <div className="flex h-full items-center justify-center text-center">
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-600">Chart Error</div>
            <div className="text-xs text-red-500">Unable to load chart data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-card p-6",
        "aviation-card-hover aviation-interactive",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h3 className="aviation-card-header text-aviation-title">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-aviation-subtitle text-aviation-sm">
              {description}
            </p>
          )}
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Custom tooltip component with aviation styling
 */
export interface AviationTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  labelFormatter?: (label: string) => string;
  formatter?: (value: any, name: string) => [React.ReactNode, string];
}

export function AviationTooltip({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
}: AviationTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
      {label && (
        <div className="mb-2 font-medium text-aviation-base">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-aviation-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-aviation-callsign">
              {formatter
                ? formatter(entry.value, entry.name)?.[0]
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Custom legend component with aviation styling
 */
export interface AviationLegendProps {
  payload?: any[];
  iconType?: 'line' | 'rect' | 'circle';
}

export function AviationLegend({ payload, iconType = 'circle' }: AviationLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className={cn(
              iconType === 'circle' && "h-2 w-2 rounded-full",
              iconType === 'rect' && "h-2 w-3 rounded-sm",
              iconType === 'line' && "h-0.5 w-4"
            )}
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-aviation-sm text-muted-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Utility function to get status color based on aviation standards
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('critical') || statusLower.includes('expired')) {
    return aviationColors.critical;
  }
  if (statusLower.includes('warning') || statusLower.includes('expiring')) {
    return aviationColors.warning;
  }
  if (statusLower.includes('urgent')) {
    return aviationColors.urgent;
  }
  if (statusLower.includes('attention')) {
    return aviationColors.attention;
  }
  if (statusLower.includes('current') || statusLower.includes('compliant')) {
    return aviationColors.current;
  }

  return aviationColors.primary;
}

/**
 * Utility function to format numbers for aviation display
 */
export function formatAviationNumber(value: number, type: 'count' | 'percentage' | 'days' = 'count'): string {
  if (isNaN(value)) return 'N/A';

  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'days':
      return `${Math.round(value)} days`;
    case 'count':
    default:
      return value.toString();
  }
}