import { Suspense } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpiringChecksTable } from '@/components/dashboard/expiring-checks-table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Alerts</h1>
          <p className="text-muted-foreground">
            Monitor certification expirations and compliance alerts
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          Active Monitoring
        </Badge>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">Expired or ≤7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-muted-foreground">≤30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">28</div>
            <p className="text-xs text-muted-foreground">≤60 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">491</div>
            <p className="text-xs text-muted-foreground">Over 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Expiring Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            All certifications expiring within the next 90 days, sorted by priority.
          </p>
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading alerts...</span>
            </div>
          }>
            <ExpiringChecksTable />
          </Suspense>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Send daily email alerts for expiring certifications
              </p>
            </div>
            <Badge variant="secondary">Enabled</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Critical Alert Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Alert when certifications expire within 7 days
              </p>
            </div>
            <Badge variant="outline">7 days</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Warning Alert Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Warning when certifications expire within 60 days
              </p>
            </div>
            <Badge variant="outline">60 days</Badge>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}