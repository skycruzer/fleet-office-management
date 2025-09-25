"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Star,
  GraduationCap,
  Shield,
  ChevronDown,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useCaptainQualifications } from "@/hooks/use-dashboard-data";
import type { Tables } from "@/lib/supabase";

type CaptainQualificationsSummary = Tables<"captain_qualifications_summary">;

interface QualificationBadgeProps {
  type: "line_captain" | "training_captain" | "examiner";
  active: boolean;
  className?: string;
}

function QualificationBadge({ type, active, className }: QualificationBadgeProps) {
  const config = {
    line_captain: {
      icon: Star,
      label: "Line Captain",
      activeColor: "bg-blue-100 text-blue-700 border-blue-200",
      inactiveColor: "bg-gray-100 text-gray-500 border-gray-200",
    },
    training_captain: {
      icon: GraduationCap,
      label: "Training Captain",
      activeColor: "bg-green-100 text-green-700 border-green-200",
      inactiveColor: "bg-gray-100 text-gray-500 border-gray-200",
    },
    examiner: {
      icon: Shield,
      label: "Examiner",
      activeColor: "bg-purple-100 text-purple-700 border-purple-200",
      inactiveColor: "bg-gray-100 text-gray-500 border-gray-200",
    },
  };

  const { icon: Icon, label, activeColor, inactiveColor } = config[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        active ? activeColor : inactiveColor,
        className
      )}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

interface CaptainCardProps {
  captain: CaptainQualificationsSummary;
  className?: string;
}

function CaptainCard({ captain, className }: CaptainCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const initials = captain.pilot_name
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase() || "??";

  const qualificationCount = [
    captain.is_line_captain,
    captain.is_training_captain,
    captain.is_examiner,
  ].filter(Boolean).length;

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium bg-blue-100 text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base leading-none">
                    {captain.pilot_name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ID: {captain.employee_id} • {captain.role}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={qualificationCount > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  <Award className="w-3 h-3 mr-1" />
                  {qualificationCount} quals
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "transform rotate-180"
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Qualification Badges */}
            <div className="flex flex-wrap gap-2">
              <QualificationBadge
                type="line_captain"
                active={captain.is_line_captain || false}
              />
              <QualificationBadge
                type="training_captain"
                active={captain.is_training_captain || false}
              />
              <QualificationBadge
                type="examiner"
                active={captain.is_examiner || false}
              />
            </div>

            {/* Qualification Details */}
            {captain.captain_qualifications && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Additional Qualifications
                </h4>
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(captain.captain_qualifications, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Qualification Notes */}
            {captain.qualification_notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3">
                  {captain.qualification_notes}
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function CaptainQualificationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Captain Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface CaptainQualificationsProps {
  className?: string;
}

export function CaptainQualifications({ className }: CaptainQualificationsProps) {
  const { data: captains, isLoading, error } = useCaptainQualifications();

  const qualificationStats = React.useMemo(() => {
    if (!captains) return null;

    const lineCaptains = captains.filter(c => c.is_line_captain).length;
    const trainingCaptains = captains.filter(c => c.is_training_captain).length;
    const examiners = captains.filter(c => c.is_examiner).length;
    const totalCaptains = captains.filter(c => c.role === "Captain").length;

    return {
      lineCaptains,
      trainingCaptains,
      examiners,
      totalCaptains,
      lineCaptainCoverage: totalCaptains > 0 ? (lineCaptains / totalCaptains) * 100 : 0,
    };
  }, [captains]);

  if (isLoading) {
    return <CaptainQualificationsSkeleton />;
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load captain qualifications
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualifiedCaptains = captains?.filter(c =>
    c.role === "Captain" && (c.is_line_captain || c.is_training_captain || c.is_examiner)
  ) || [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Statistics */}
      {qualificationStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Line Captains
              </CardTitle>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {qualificationStats.lineCaptains}
                </div>
                <div className="text-xs text-blue-600">
                  {qualificationStats.lineCaptainCoverage.toFixed(0)}% captain coverage
                </div>
                <Progress
                  value={qualificationStats.lineCaptainCoverage}
                  className="h-1"
                />
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-green-50/50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Training Captains
              </CardTitle>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {qualificationStats.trainingCaptains}
                </div>
                <div className="text-xs text-green-600">
                  Training capacity available
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50/50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Examiners
              </CardTitle>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {qualificationStats.examiners}
                </div>
                <div className="text-xs text-purple-600">
                  Check ride capability
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Captain List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Captain Qualifications
          </CardTitle>
          <CardDescription>
            Detailed view of captain qualifications and certifications
            {qualifiedCaptains.length > 0 && (
              <span className="ml-2">
                ({qualifiedCaptains.length} qualified of {qualificationStats?.totalCaptains || 0} total captains)
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {qualifiedCaptains.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {qualifiedCaptains.map((captain) => (
                <CaptainCard
                  key={captain.id}
                  captain={captain}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No qualified captains found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unqualified Captains Warning */}
      {qualificationStats && qualificationStats.totalCaptains > qualifiedCaptains.length && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
            <CardDescription className="text-yellow-600">
              {qualificationStats.totalCaptains - qualifiedCaptains.length} captains
              need additional qualifications for full operational capability
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Industry Compliance Notes */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700 text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            B767 Fleet Operations Standards
          </CardTitle>
          <CardDescription className="text-blue-600 space-y-1 text-sm">
            <div>• Line Captains: Qualified for regular passenger service operations</div>
            <div>• Training Captains: Certified to conduct pilot training and evaluations</div>
            <div>• Examiners: Authorized to perform check rides and competency assessments</div>
            <div>• Recommended: 70%+ line captain coverage for optimal scheduling flexibility</div>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}