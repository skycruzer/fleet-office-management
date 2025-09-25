'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePilotDetail, usePilotChecks } from '@/hooks/use-pilots'
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Award,
  FileText
} from 'lucide-react'

interface PilotCertificationsPageProps {
  params: Promise<{ id: string }>
}

export default function PilotCertificationsPage({ params }: PilotCertificationsPageProps) {
  const router = useRouter()
  const [pilotId, setPilotId] = React.useState<string | null>(null)

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setPilotId(resolvedParams.id)
    })
  }, [params])

  const { data: pilot, isLoading: pilotLoading } = usePilotDetail(pilotId)
  const { data: certifications, isLoading: certificationsLoading } = usePilotChecks(pilotId)

  if (pilotLoading || certificationsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!pilot) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Pilot Not Found</h1>
              <p className="text-muted-foreground">
                The requested pilot could not be found
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Categorize certifications by status
  const today = new Date()
  const currentCertifications = certifications?.filter(cert => {
    const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null
    const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
    return daysToExpiry && daysToExpiry > 30
  }) || []

  const expiringSoon = certifications?.filter(cert => {
    const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null
    const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
    return daysToExpiry && daysToExpiry > 0 && daysToExpiry <= 30
  }) || []

  const expired = certifications?.filter(cert => {
    const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null
    const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
    return daysToExpiry && daysToExpiry <= 0
  }) || []

  const getStatusInfo = (cert: any) => {
    const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null
    const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null

    if (!expiryDate || daysToExpiry === null) {
      return {
        variant: 'secondary' as const,
        color: 'text-gray-600',
        icon: FileText,
        label: 'No Expiry',
        description: 'Permanent certification'
      }
    }

    if (daysToExpiry <= 0) {
      return {
        variant: 'destructive' as const,
        color: 'text-red-600',
        icon: AlertTriangle,
        label: 'Expired',
        description: `${Math.abs(daysToExpiry)} days overdue`
      }
    }

    if (daysToExpiry <= 7) {
      return {
        variant: 'destructive' as const,
        color: 'text-red-600',
        icon: AlertTriangle,
        label: 'Critical',
        description: `Expires in ${daysToExpiry} days`
      }
    }

    if (daysToExpiry <= 30) {
      return {
        variant: 'secondary' as const,
        color: 'text-orange-600',
        icon: Clock,
        label: 'Expiring Soon',
        description: `Expires in ${daysToExpiry} days`
      }
    }

    return {
      variant: 'outline' as const,
      color: 'text-green-600',
      icon: CheckCircle,
      label: 'Current',
      description: `Valid for ${daysToExpiry} more days`
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pilot Certifications</h1>
            <p className="text-muted-foreground">
              {pilot.fullName} - Complete certification history and status
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Total Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certifications?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Current
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentCertifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expired.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* All Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>All Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {certifications && certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications
                  .sort((a, b) => {
                    // Sort by expiry date, with expired/expiring soon first
                    const aDate = a.expiry_date ? new Date(a.expiry_date) : new Date('2099-12-31')
                    const bDate = b.expiry_date ? new Date(b.expiry_date) : new Date('2099-12-31')
                    const aDays = Math.ceil((aDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
                    const bDays = Math.ceil((bDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

                    // Expired items first, then by urgency
                    if (aDays <= 0 && bDays > 0) return -1
                    if (bDays <= 0 && aDays > 0) return 1
                    if (aDays <= 0 && bDays <= 0) return aDays - bDays

                    return aDays - bDays
                  })
                  .map((cert, index) => {
                    const status = getStatusInfo(cert)
                    const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null

                    return (
                      <div key={cert.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <status.icon className={`h-5 w-5 ${status.color}`} />
                            <div>
                              <h3 className="font-semibold">
                                {cert.check_types?.check_description || 'Unknown Check'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {cert.check_types?.category || 'Uncategorized'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {expiryDate
                                ? `Expires: ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                : 'No expiry date'
                              }
                            </div>
                            <span>{status.description}</span>
                          </div>
                        </div>

                        <Badge variant={status.variant} className={`${status.color} ml-4`}>
                          {status.label}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certifications found for this pilot</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}