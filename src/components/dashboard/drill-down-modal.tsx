"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  X,
  Search,
  Filter,
  Download,
  Maximize2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDetailedExpiringChecks, usePilotReportSummary } from "@/hooks/use-dashboard-data";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { aviationColors, AviationTooltip } from "./charts/base-chart";

interface DrillDownModalProps {
  title: string;
  description?: string;
  dataType: "compliance" | "urgent_actions" | "pilot_performance" | "certifications";
  triggerElement: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Drill-down modal component for detailed data exploration
 * Provides interactive data tables, charts, and filtering capabilities
 */
export function DrillDownModal({
  title,
  description,
  dataType,
  triggerElement,
  isOpen,
  onOpenChange,
}: DrillDownModalProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterBy, setFilterBy] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("default");

  // Data hooks based on type
  const { data: expiringChecks, isLoading: checksLoading } = useDetailedExpiringChecks(365);
  const { data: pilots, isLoading: pilotsLoading } = usePilotReportSummary();

  const isLoading = checksLoading || pilotsLoading;

  // Filter and sort data based on type
  const processedData = React.useMemo(() => {
    let data: any[] = [];

    switch (dataType) {
      case "compliance":
      case "urgent_actions":
      case "certifications":
        data = expiringChecks || [];
        break;
      case "pilot_performance":
        data = pilots || [];
        break;
      default:
        data = [];
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => {
        const searchString = Object.values(item).join(" ").toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
    }

    // Apply category filter
    if (filterBy !== "all") {
      switch (dataType) {
        case "urgent_actions":
          data = data.filter(check => {
            if (filterBy === "expired") return check.days_until_expiry <= 0;
            if (filterBy === "critical") return check.days_until_expiry > 0 && check.days_until_expiry <= 7;
            if (filterBy === "warning") return check.days_until_expiry > 7 && check.days_until_expiry <= 30;
            return true;
          });
          break;
        case "pilot_performance":
          data = data.filter(pilot => {
            if (filterBy === "captain") return pilot.role?.toLowerCase().includes("captain");
            if (filterBy === "first_officer") return pilot.role?.toLowerCase().includes("first officer");
            return true;
          });
          break;
      }
    }

    // Apply sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.pilot_name || a.name || "").localeCompare(b.pilot_name || b.name || "");
        case "expiry":
          return (a.days_until_expiry || 0) - (b.days_until_expiry || 0);
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        case "compliance":
          return (b.compliance_score || 0) - (a.compliance_score || 0);
        default:
          return 0;
      }
    });

    return data;
  }, [dataType, expiringChecks, pilots, searchTerm, filterBy, sortBy]);

  const renderDataTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-aviation-base font-medium">No Data Found</div>
          <div className="text-aviation-sm text-muted-foreground">
            {searchTerm ? "Try adjusting your search or filters" : "No data available for this view"}
          </div>
        </div>
      );
    }

    switch (dataType) {
      case "urgent_actions":
      case "certifications":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pilot</TableHead>
                <TableHead>Check Type</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.slice(0, 20).map((check, index) => (
                <TableRow key={index} className="aviation-table-row">
                  <TableCell>
                    <div>
                      <div className="font-medium text-aviation-base">{check.pilot_name}</div>
                      <div className="text-aviation-sm text-muted-foreground">{check.employee_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="aviation-certification-code">
                      {check.check_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="aviation-date-time">
                    {new Date(check.expiry_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "aviation-number-display text-aviation-sm",
                        check.days_until_expiry <= 0 ? "text-red-600" :
                        check.days_until_expiry <= 7 ? "text-orange-600" :
                        check.days_until_expiry <= 30 ? "text-yellow-600" :
                        "text-blue-600"
                      )}>
                        {check.days_until_expiry}
                      </span>
                      <span className="text-aviation-xs text-muted-foreground">days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      variant={
                        check.days_until_expiry <= 0 ? "expired" :
                        check.days_until_expiry <= 7 ? "critical" :
                        check.days_until_expiry <= 30 ? "urgent" :
                        "current"
                      }
                      size="sm"
                      value=""
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-aviation-xs">
                        Schedule
                      </Button>
                      <Button size="sm" variant="ghost" className="text-aviation-xs">
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "pilot_performance":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pilot</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Service Years</TableHead>
                <TableHead>Current Checks</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.slice(0, 20).map((pilot, index) => {
                const complianceRate = pilot.total_checks > 0 ?
                  ((pilot.current_checks || 0) / pilot.total_checks) * 100 : 0;

                return (
                  <TableRow key={index} className="aviation-table-row">
                    <TableCell>
                      <div>
                        <div className="font-medium text-aviation-base">{pilot.pilot_name}</div>
                        <div className="text-aviation-sm text-muted-foreground">{pilot.employee_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pilot.role?.includes("Captain") ? "default" : "secondary"}>
                        {pilot.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="aviation-number-display">
                      {pilot.age}
                    </TableCell>
                    <TableCell className="aviation-number-display">
                      {pilot.years_of_service || 0}
                    </TableCell>
                    <TableCell>
                      <div className="text-aviation-sm">
                        <span className="font-medium">{pilot.current_checks || 0}</span>
                        <span className="text-muted-foreground">/{pilot.total_checks || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-16 rounded-full",
                            complianceRate >= 90 ? "bg-green-500" :
                            complianceRate >= 75 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{
                            background: `linear-gradient(to right, ${
                              complianceRate >= 90 ? aviationColors.current :
                              complianceRate >= 75 ? aviationColors.warning : aviationColors.critical
                            } ${complianceRate}%, #e5e7eb ${complianceRate}%)`
                          }}
                        />
                        <span className="text-aviation-xs font-medium">
                          {complianceRate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-aviation-xs">
                          View Profile
                        </Button>
                        <Button size="sm" variant="ghost" className="text-aviation-xs">
                          Schedule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );

      default:
        return null;
    }
  };

  const renderSummaryCharts = () => {
    if (isLoading || processedData.length === 0) return null;

    // Create summary data for charts
    const summaryData = (() => {
      switch (dataType) {
        case "urgent_actions":
          const urgencyGroups = processedData.reduce((acc, check) => {
            const key = check.days_until_expiry <= 0 ? "Expired" :
                       check.days_until_expiry <= 7 ? "Critical" :
                       check.days_until_expiry <= 30 ? "Warning" : "Future";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return Object.entries(urgencyGroups).map(([status, count]) => ({
            name: status,
            value: count,
            color: status === "Expired" ? aviationColors.critical :
                   status === "Critical" ? aviationColors.urgent :
                   status === "Warning" ? aviationColors.warning : aviationColors.attention,
          }));

        case "pilot_performance":
          const roleGroups = processedData.reduce((acc, pilot) => {
            const role = pilot.role?.includes("Captain") ? "Captains" : "First Officers";
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return Object.entries(roleGroups).map(([role, count]) => ({
            name: role,
            value: count,
            color: role === "Captains" ? aviationColors.primary : aviationColors.chart2,
          }));

        default:
          return [];
      }
    })();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-aviation-base">Distribution Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={aviationColors.muted} opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: aviationColors.secondary }}
                    axisLine={{ stroke: aviationColors.muted }}
                  />
                  <AviationTooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {summaryData.map((entry, index) => (
                      <Bar key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-aviation-base">Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {summaryData.map((item, index) => (
                <div key={index} className="text-center p-3 rounded border">
                  <div
                    className="text-aviation-2xl font-aviation-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </div>
                  <div className="text-aviation-xs text-muted-foreground">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getFilterOptions = () => {
    switch (dataType) {
      case "urgent_actions":
        return [
          { value: "all", label: "All Items" },
          { value: "expired", label: "Expired" },
          { value: "critical", label: "Critical (≤7 days)" },
          { value: "warning", label: "Warning (8-30 days)" },
        ];
      case "pilot_performance":
        return [
          { value: "all", label: "All Pilots" },
          { value: "captain", label: "Captains" },
          { value: "first_officer", label: "First Officers" },
        ];
      default:
        return [{ value: "all", label: "All" }];
    }
  };

  const getSortOptions = () => {
    switch (dataType) {
      case "urgent_actions":
      case "certifications":
        return [
          { value: "default", label: "Default" },
          { value: "name", label: "Pilot Name" },
          { value: "expiry", label: "Days Until Expiry" },
        ];
      case "pilot_performance":
        return [
          { value: "default", label: "Default" },
          { value: "name", label: "Name" },
          { value: "role", label: "Role" },
          { value: "compliance", label: "Compliance Score" },
        ];
      default:
        return [{ value: "default", label: "Default" }];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden aviation-modal-content">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="aviation-section-header">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-aviation-subtitle mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 aviation-input"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getFilterOptions().map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilterBy(option.value)}
                      className={filterBy === option.value ? "bg-muted" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getSortOptions().map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? "bg-muted" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Badge variant="outline" className="aviation-status-badge">
              {processedData.length} items
            </Badge>
          </div>

          {/* Content */}
          <div className="overflow-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
            {renderSummaryCharts()}
            {renderDataTable()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}