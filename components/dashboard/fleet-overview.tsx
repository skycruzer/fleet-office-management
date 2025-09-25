'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  Plane
} from 'lucide-react'
import {
  useComplianceDashboard,
  useDetailedExpiringChecks,
  usePilotReportSummary
} from '@/hooks/use-dashboard-data'

export function FleetOverview() {
  const {
    data: complianceData,
    isLoading: isLoadingCompliance,
    error: complianceError
  } = useComplianceDashboard()

  const {
    data: expiringChecks,
    isLoading: isLoadingExpiring
  } = useDetailedExpiringChecks(30) // Next 30 days

  const {
    data: pilotSummary,
    isLoading: isLoadingPilots
  } = usePilotReportSummary()

  if (complianceError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard</AlertTitle>
        <AlertDescription>
          Failed to load compliance dashboard data. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoadingCompliance || isLoadingExpiring || isLoadingPilots) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getStatusColor = (value: number, total: number, isReverse = false) => {
    const percentage = (value / total) * 100
    if (isReverse) {
      // For warnings/errors, lower is better
      if (percentage < 5) return 'text-green-600'
      if (percentage < 15) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // For compliance, higher is better
      if (percentage > 90) return 'text-green-600'
      if (percentage > 75) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* High-level metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Pilots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceData?.total_active_pilots || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.active_captains || 0} Captains, {complianceData?.active_first_officers || 0} First Officers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(
              complianceData?.compliance_percentage || 0,
              100
            )}`}>
              {complianceData?.compliance_percentage?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.compliant_pilots || 0} fully compliant pilots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(
              complianceData?.critical_checks || 0,
              complianceData?.total_checks || 1,
              true
            )}`}>
              {complianceData?.critical_checks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.critical_pilots || 0} pilots affected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {complianceData?.expiring_next_30_days || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent expiring checks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Expirations</CardTitle>
          <CardDescription>
            Checks expiring in the next 30 days (showing first 10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiringChecks && expiringChecks.length > 0 ? (
            <div className="space-y-3">
              {expiringChecks.slice(0, 10).map((check, index) => (
                <div
                  key={`${check.pilot_id}-${check.check_type_id}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{check.pilot_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {check.check_description} ({check.check_code})
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {check.expiry_date ? new Date(check.expiry_date).toLocaleDateString() : 'No date'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {check.days_until_expiry !== null
                          ? `${check.days_until_expiry} days`
                          : 'Unknown'}
                      </div>
                    </div>
                    <Badge
                      variant={
                        (check.days_until_expiry ?? 0) < 0
                          ? 'destructive'
                          : (check.days_until_expiry ?? 0) < 7
                            ? 'destructive'
                            : (check.days_until_expiry ?? 0) < 30
                              ? 'secondary'
                              : 'default'
                      }
                    >
                      {check.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No critical expirations in the next 30 days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional metrics row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Training Captains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.training_captains || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.training_captain_ratio?.toFixed(1) || '0'}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Examiners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.examiners || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.examiner_ratio?.toFixed(1) || '0'}% ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Line Captains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.line_captains || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complianceData?.line_captain_coverage_percentage?.toFixed(1) || '0'}% coverage
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}