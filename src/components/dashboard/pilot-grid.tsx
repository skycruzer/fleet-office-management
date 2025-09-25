"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Star,
  GraduationCap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePilotReportSummary } from "@/hooks/use-dashboard-data";
import type { PilotReportSummary } from "@/lib/supabase";

// Aviation compliance color coding (FAA standard)
const getComplianceStatus = (score: number | null) => {
  if (score === null) return { status: "unknown", color: "bg-gray-500" };
  if (score >= 95) return { status: "excellent", color: "bg-green-500" };
  if (score >= 85) return { status: "good", color: "bg-green-400" };
  if (score >= 70) return { status: "acceptable", color: "bg-yellow-500" };
  if (score >= 50) return { status: "attention", color: "bg-orange-500" };
  return { status: "critical", color: "bg-red-500" };
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case "Captain":
      return "default";
    case "First Officer":
      return "secondary";
    default:
      return "outline";
  }
};

interface PilotCardProps {
  pilot: PilotReportSummary;
  className?: string;
  onView?: (pilotId: string) => void;
  onEdit?: (pilotId: string) => void;
  onDelete?: (pilotId: string) => void;
}

function PilotCard({ pilot, className, onView, onEdit, onDelete }: PilotCardProps) {
  const complianceStatus = getComplianceStatus(pilot.compliance_score);
  const initials = `${pilot.first_name?.[0] || ""}${pilot.last_name?.[0] || ""}`;

  const getCriticalityVariant = () => {
    if ((pilot.critical_checks || 0) > 0) return "destructive";
    if ((pilot.expired_checks || 0) > 0) return "destructive";
    if ((pilot.urgent_checks || 0) > 0) return "secondary";
    return "outline";
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base leading-none">
                {pilot.full_name}
              </CardTitle>
              <CardDescription className="mt-1">
                ID: {pilot.employee_id}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Badge variant={getRoleVariant(pilot.role || "")}>
                {pilot.role}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open actions menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(pilot.pilot_id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(pilot.pilot_id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Pilot
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(pilot.pilot_id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Pilot
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                complianceStatus.color
              )}
              title={`Compliance: ${pilot.compliance_score?.toFixed(1)}%`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-2">
          {/* Captain Qualifications */}
          {pilot.role === "Captain" && (
            <div className="flex flex-wrap gap-1">
              {pilot.is_line_captain && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Line Captain
                </Badge>
              )}
              {pilot.is_training_captain && (
                <Badge variant="outline" className="text-xs">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  Training Captain
                </Badge>
              )}
              {pilot.is_examiner && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Examiner
                </Badge>
              )}
            </div>
          )}

          {/* Compliance Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{pilot.total_checks || 0} checks</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              <span>{pilot.days_to_next_expiry || 0}d to expiry</span>
            </div>
          </div>

          {/* Alert Summary */}
          {((pilot.critical_checks || 0) > 0 || (pilot.expired_checks || 0) > 0 || (pilot.urgent_checks || 0) > 0) && (
            <div className="flex gap-1">
              {(pilot.critical_checks || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {pilot.critical_checks} Critical
                </Badge>
              )}
              {(pilot.expired_checks || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pilot.expired_checks} Expired
                </Badge>
              )}
              {(pilot.urgent_checks || 0) > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pilot.urgent_checks} Urgent
                </Badge>
              )}
            </div>
          )}

          {/* Compliance Score */}
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-xs text-muted-foreground">Compliance</span>
            <span className={cn(
              "text-xs font-medium",
              complianceStatus.status === "excellent" && "text-green-600",
              complianceStatus.status === "good" && "text-green-500",
              complianceStatus.status === "acceptable" && "text-yellow-600",
              complianceStatus.status === "attention" && "text-orange-600",
              complianceStatus.status === "critical" && "text-red-600"
            )}>
              {pilot.compliance_score?.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PilotGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface PilotGridProps {
  className?: string;
  onView?: (pilotId: string) => void;
  onEdit?: (pilotId: string) => void;
  onDelete?: (pilotId: string) => void;
  onAdd?: () => void;
}

export function PilotGrid({ className, onView, onEdit, onDelete, onAdd }: PilotGridProps) {
  const { data: pilots, isLoading, error } = usePilotReportSummary();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredPilots = React.useMemo(() => {
    if (!pilots) return [];

    return pilots.filter((pilot) => {
      // Search filter
      const matchesSearch = !searchTerm ||
        pilot.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pilot.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || pilot.role === roleFilter;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "critical") {
        matchesStatus = (pilot.critical_checks || 0) > 0 || (pilot.expired_checks || 0) > 0;
      } else if (statusFilter === "attention") {
        matchesStatus = (pilot.urgent_checks || 0) > 0 || (pilot.attention_checks || 0) > 0;
      } else if (statusFilter === "compliant") {
        matchesStatus = (pilot.compliance_score || 0) >= 95;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [pilots, searchTerm, roleFilter, statusFilter]);

  if (isLoading) {
    return <PilotGridSkeleton />;
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load pilot data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pilots by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Captain">Captain</SelectItem>
            <SelectItem value="First Officer">First Officer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="attention">Needs Attention</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        </div>

        {onAdd && (
          <Button onClick={onAdd} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Pilot
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPilots.length} of {pilots?.length || 0} pilots
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">
            {pilots?.filter(p => p.role === "Captain").length || 0} Captains
          </Badge>
          <Badge variant="secondary">
            {pilots?.filter(p => p.role === "First Officer").length || 0} F/Os
          </Badge>
        </div>
      </div>

      {/* Pilot Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPilots.map((pilot) => (
          <PilotCard
            key={pilot.pilot_id}
            pilot={pilot}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filteredPilots.length === 0 && pilots && pilots.length > 0 && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pilots match your search criteria</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}