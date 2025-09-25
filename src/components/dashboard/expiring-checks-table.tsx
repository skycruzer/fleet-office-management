"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SrOnly, StatusAnnouncement } from "@/components/ui/sr-only";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Filter,
  Download,
  Mail,
  User,
  Shield,
} from "lucide-react";
import { useExpiringChecks, useDetailedExpiringChecks } from "@/hooks/use-dashboard-data";
import type { DetailedExpiringCheck } from "@/lib/supabase";

// FAA-standard aviation compliance color coding with accessibility enhancements
const getStatusInfo = (daysUntilExpiry: number | null) => {
  if (daysUntilExpiry === null) return {
    label: "No Date",
    variant: "outline" as const,
    priority: 0,
    className: "bg-gray-50",
    ariaLabel: "No expiry date set",
    screenReaderText: "No expiry date set - requires immediate attention",
    severity: "medium" as const
  };

  if (daysUntilExpiry < 0) return {
    label: "EXPIRED",
    variant: "destructive" as const,
    priority: 5,
    className: "bg-red-50 border-red-200",
    ariaLabel: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
    screenReaderText: `EXPIRED CERTIFICATION - ${Math.abs(daysUntilExpiry)} days overdue - IMMEDIATE ACTION REQUIRED`,
    severity: "high" as const
  };

  if (daysUntilExpiry <= 7) return {
    label: "CRITICAL",
    variant: "destructive" as const,
    priority: 4,
    className: "bg-red-50 border-red-200",
    ariaLabel: `Critical - expires in ${daysUntilExpiry} days`,
    screenReaderText: `CRITICAL - Expires in ${daysUntilExpiry} days - URGENT ACTION REQUIRED`,
    severity: "high" as const
  };

  if (daysUntilExpiry <= 30) return {
    label: "URGENT",
    variant: "secondary" as const,
    priority: 3,
    className: "bg-orange-50 border-orange-200",
    ariaLabel: `Urgent - expires in ${daysUntilExpiry} days`,
    screenReaderText: `URGENT - Expires in ${daysUntilExpiry} days - Action required soon`,
    severity: "medium" as const
  };

  if (daysUntilExpiry <= 60) return {
    label: "WARNING",
    variant: "secondary" as const,
    priority: 2,
    className: "bg-yellow-50 border-yellow-200",
    ariaLabel: `Warning - expires in ${daysUntilExpiry} days`,
    screenReaderText: `WARNING - Expires in ${daysUntilExpiry} days - Schedule renewal`,
    severity: "medium" as const
  };

  if (daysUntilExpiry <= 90) return {
    label: "ATTENTION",
    variant: "outline" as const,
    priority: 1,
    className: "bg-blue-50 border-blue-200",
    ariaLabel: `Attention required - expires in ${daysUntilExpiry} days`,
    screenReaderText: `ATTENTION - Expires in ${daysUntilExpiry} days`,
    severity: "low" as const
  };

  return {
    label: "CURRENT",
    variant: "outline" as const,
    priority: 0,
    className: "",
    ariaLabel: `Current - expires in ${daysUntilExpiry} days`,
    screenReaderText: `CURRENT - Expires in ${daysUntilExpiry} days`,
    severity: "low" as const
  };
};

interface ExpiringChecksTableProps {
  className?: string;
  daysAhead?: number;
  maxRows?: number;
}

function ExpiringChecksTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpiringChecksTable({
  className,
  daysAhead = 60,
  maxRows = 20
}: ExpiringChecksTableProps) {
  const { data: checks, isLoading, error } = useDetailedExpiringChecks(daysAhead);
  const [sortBy, setSortBy] = React.useState<"expiry" | "pilot" | "priority">("expiry");
  const [filterBy, setFilterBy] = React.useState<"all" | "critical" | "urgent" | "warning">("all");
  const [announceText, setAnnounceText] = React.useState("");
  const [displayLimit, setDisplayLimit] = React.useState(maxRows);

  const sortedAndFilteredChecks = React.useMemo(() => {
    if (!checks) return [];

    let filtered = checks;

    // Apply filters
    if (filterBy !== "all") {
      filtered = checks.filter((check) => {
        const status = getStatusInfo(check.days_until_expiry);
        switch (filterBy) {
          case "critical":
            return status.priority >= 4;
          case "urgent":
            return status.priority === 3;
          case "warning":
            return status.priority === 2;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "expiry":
          return (a.days_until_expiry || 999) - (b.days_until_expiry || 999);
        case "pilot":
          return (a.pilot_name || "").localeCompare(b.pilot_name || "");
        case "priority":
          const aPriority = getStatusInfo(a.days_until_expiry).priority;
          const bPriority = getStatusInfo(b.days_until_expiry).priority;
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

    return sorted.slice(0, displayLimit);
  }, [checks, sortBy, filterBy, displayLimit]);

  // Announce sort and filter changes to screen readers
  const handleSortChange = (newSortBy: "expiry" | "pilot" | "priority") => {
    setSortBy(newSortBy);
    const sortLabels = {
      expiry: "expiry date",
      pilot: "pilot name",
      priority: "priority level"
    };
    setAnnounceText(`Table sorted by ${sortLabels[newSortBy]}`);
  };

  const handleFilterChange = (newFilter: "all" | "critical" | "urgent" | "warning") => {
    setFilterBy(newFilter);
    const filterLabels = {
      all: "all checks",
      critical: "critical checks only",
      urgent: "urgent checks only",
      warning: "warning checks only"
    };
    setAnnounceText(`Filtering to show ${filterLabels[newFilter]}`);
  };

  const handleViewAll = () => {
    if (checks) {
      setDisplayLimit(checks.length);
      setAnnounceText(`Now showing all ${checks.length} expiring checks`);
    }
  };

  // Count critical items for screen reader announcement
  const criticalCount = sortedAndFilteredChecks.filter(
    check => getStatusInfo(check.days_until_expiry).priority >= 4
  ).length;

  const urgentCount = sortedAndFilteredChecks.filter(
    check => getStatusInfo(check.days_until_expiry).priority === 3
  ).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysText = (days: number | null) => {
    if (days === null) return "No date";
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  if (isLoading) {
    return <ExpiringChecksTableSkeleton />;
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load expiring checks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <StatusAnnouncement
        message={announceText}
        priority="medium"
      />
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle
                className="h-5 w-5 text-orange-500"
                aria-hidden="true"
              />
              Expiring Checks Alert
              <SrOnly>
                {criticalCount > 0 && ` - ${criticalCount} critical alerts`}
                {urgentCount > 0 && ` - ${urgentCount} urgent alerts`}
              </SrOnly>
            </CardTitle>
            <CardDescription id="table-description">
              Certifications expiring within {daysAhead} days (showing {displayLimit === checks?.length ? 'all' : `top ${displayLimit}`})
              {criticalCount > 0 && (
                <SrOnly>
                  . Warning: {criticalCount} critical certifications require immediate attention.
                </SrOnly>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filterBy}
              onValueChange={handleFilterChange}
              aria-label="Filter certifications by status"
            >
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="urgent">Urgent Only</SelectItem>
                <SelectItem value="warning">Warning Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              aria-label="Export certification report to CSV"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table
            aria-describedby="table-description"
            aria-label="Expiring pilot certifications"
          >
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => handleSortChange("priority")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortChange("priority");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sort by status priority ${sortBy === 'priority' ? '(currently active)' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => handleSortChange("pilot")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortChange("pilot");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sort by pilot name ${sortBy === 'pilot' ? '(currently active)' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    Pilot
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </div>
                </TableHead>
                <TableHead>Check Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => handleSortChange("expiry")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortChange("expiry");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sort by expiry date ${sortBy === 'expiry' ? '(currently active)' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    Days Remaining
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </div>
                </TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredChecks.map((check) => {
                const statusInfo = getStatusInfo(check.days_until_expiry);
                return (
                  <TableRow
                    key={check.pilot_check_id}
                    className={cn("hover:bg-muted/30", statusInfo.className)}
                  >
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant}
                        className="font-medium"
                        aria-label={statusInfo.ariaLabel}
                      >
                        {statusInfo.label}
                        <SrOnly>{statusInfo.screenReaderText}</SrOnly>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {check.role === "Captain" && (
                            <Shield
                              className="h-3 w-3 text-blue-600"
                              aria-label="Captain"
                              title="Captain qualified pilot"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {check.pilot_name}
                            <SrOnly>
                              {check.role === "Captain" ? ", Captain" : ", First Officer"}
                            </SrOnly>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span aria-label={`Employee ID ${check.employee_id}`}>
                              ID: {check.employee_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {check.check_code}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {check.check_description}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {check.check_category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className={cn(
                        "font-medium text-sm",
                        check.days_until_expiry !== null && check.days_until_expiry < 0 && "text-red-600",
                        check.days_until_expiry !== null && check.days_until_expiry <= 7 && check.days_until_expiry >= 0 && "text-red-600",
                        check.days_until_expiry !== null && check.days_until_expiry <= 30 && check.days_until_expiry > 7 && "text-orange-600"
                      )}>
                        {getDaysText(check.days_until_expiry)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {formatDate(check.expiry_date)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1" role="group" aria-label="Pilot actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label={`View ${check.pilot_name} profile`}
                        >
                          <User className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label={`Send email to ${check.pilot_name} about expiring certification`}
                        >
                          <Mail className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {sortedAndFilteredChecks.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {filterBy === "all"
                ? "No checks expiring within the selected timeframe"
                : `No ${filterBy} checks found`
              }
            </p>
          </div>
        )}

        {checks && sortedAndFilteredChecks.length > 0 && sortedAndFilteredChecks.length === displayLimit && displayLimit < checks.length && (
          <div className="border-t p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Showing first {displayLimit} results. {checks.length - displayLimit} more checks available.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              aria-label={`View all ${checks.length} expiring checks`}
            >
              View All Expiring Checks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}