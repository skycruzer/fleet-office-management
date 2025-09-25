"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Stethoscope,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useDetailedExpiringChecks } from "@/hooks/use-dashboard-data";
import type { DetailedExpiringCheck } from "@/lib/supabase";

// FAA-standard aviation compliance color coding
const getCertificationStatus = (daysUntilExpiry: number | null) => {
  if (daysUntilExpiry === null) return {
    status: "unknown",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    variant: "outline" as const,
    label: "No Date"
  };

  if (daysUntilExpiry < 0) return {
    status: "expired",
    color: "bg-red-500",
    textColor: "text-red-700",
    variant: "destructive" as const,
    label: "EXPIRED"
  };

  if (daysUntilExpiry <= 7) return {
    status: "critical",
    color: "bg-red-500",
    textColor: "text-red-700",
    variant: "destructive" as const,
    label: "CRITICAL"
  };

  if (daysUntilExpiry <= 30) return {
    status: "urgent",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    variant: "secondary" as const,
    label: "URGENT"
  };

  if (daysUntilExpiry <= 60) return {
    status: "warning",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    variant: "secondary" as const,
    label: "WARNING"
  };

  if (daysUntilExpiry <= 90) return {
    status: "attention",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    variant: "outline" as const,
    label: "ATTENTION"
  };

  return {
    status: "current",
    color: "bg-green-500",
    textColor: "text-green-700",
    variant: "outline" as const,
    label: "CURRENT"
  };
};

const getCategoryIcon = (category: string | null) => {
  switch (category?.toUpperCase()) {
    case "MEDICAL":
      return Stethoscope;
    case "LICENSE":
    case "LICENCE":
      return FileText;
    case "TRAINING":
      return GraduationCap;
    case "QUALIFICATION":
      return Shield;
    case "SECURITY":
      return Shield;
    case "RECENCY":
      return Clock;
    case "LANGUAGE":
      return Briefcase;
    default:
      return CheckCircle;
  }
};

interface CertificationCardProps {
  check: DetailedExpiringCheck;
  className?: string;
}

function CertificationCard({ check, className }: CertificationCardProps) {
  const status = getCertificationStatus(check.days_until_expiry);
  const Icon = getCategoryIcon(check.check_category);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysText = (days: number | null) => {
    if (days === null) return "No expiry date";
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    return `Expires in ${days} days`;
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base leading-tight">
                {check.check_code}
              </CardTitle>
              <CardDescription className="text-sm">
                {check.check_description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status.variant} className="text-xs font-medium">
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Pilot Information */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{check.pilot_name}</span>
          <span className="text-muted-foreground">ID: {check.employee_id}</span>
        </div>

        {/* Status indicator with visual bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={status.textColor}>
              {getDaysText(check.days_until_expiry)}
            </span>
            <span className="text-muted-foreground">
              {formatDate(check.expiry_date)}
            </span>
          </div>

          {/* Visual progress bar for time remaining */}
          {check.days_until_expiry !== null && (
            <div className="space-y-1">
              <Progress
                value={Math.max(0, Math.min(100, ((90 - Math.max(0, check.days_until_expiry)) / 90) * 100))}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>90 days</span>
                <span>Expiry</span>
              </div>
            </div>
          )}
        </div>

        {/* Category and Priority */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {check.check_category}
          </Badge>
          {check.priority_score && (
            <span className="text-xs text-muted-foreground">
              Priority: {check.priority_score}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CertificationStatusSkeleton() {
  return (
    <div className="space-y-4">
      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Certification Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface CertificationStatusProps {
  className?: string;
  daysAhead?: number;
}

export function CertificationStatus({ className, daysAhead = 90 }: CertificationStatusProps) {
  const { data: checks, isLoading, error } = useDetailedExpiringChecks(daysAhead);

  // Group checks by status
  const checksByStatus = React.useMemo(() => {
    if (!checks) return {};

    return checks.reduce((acc, check) => {
      const status = getCertificationStatus(check.days_until_expiry).status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(check);
      return acc;
    }, {} as Record<string, DetailedExpiringCheck[]>);
  }, [checks]);

  if (isLoading) {
    return <CertificationStatusSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load certification data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = {
    expired: checksByStatus.expired?.length || 0,
    critical: checksByStatus.critical?.length || 0,
    urgent: checksByStatus.urgent?.length || 0,
    warning: checksByStatus.warning?.length || 0,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Expired
            </CardTitle>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.expired}
            </div>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Critical (≤7 days)
            </CardTitle>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.critical}
            </div>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Urgent (≤30 days)
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.urgent}
            </div>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              Warning (≤60 days)
            </CardTitle>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.warning}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Critical and Expired Checks */}
      {(statusCounts.expired > 0 || statusCounts.critical > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Immediate Action Required
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...(checksByStatus.expired || []), ...(checksByStatus.critical || [])]
              .sort((a, b) => (a.days_until_expiry || 0) - (b.days_until_expiry || 0))
              .slice(0, 6)
              .map((check) => (
                <CertificationCard key={check.pilot_check_id} check={check} />
              ))}
          </div>
        </div>
      )}

      {/* Upcoming Expirations */}
      {(statusCounts.urgent > 0 || statusCounts.warning > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Expirations
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...(checksByStatus.urgent || []), ...(checksByStatus.warning || [])]
              .sort((a, b) => (a.days_until_expiry || 0) - (b.days_until_expiry || 0))
              .slice(0, 6)
              .map((check) => (
                <CertificationCard key={check.pilot_check_id} check={check} />
              ))}
          </div>
        </div>
      )}

      {!checks || checks.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                All certifications are current within the next {daysAhead} days
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}