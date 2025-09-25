'use client'

import { Suspense } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { usePilotDetail, usePilotChecks } from '@/hooks/use-pilots'
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  GraduationCap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface PilotDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PilotDetailPage({ params }: PilotDetailPageProps) {
  const router = useRouter()
  const [pilotId, setPilotId] = React.useState<string | null>(null)

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setPilotId(resolvedParams.id)
    })
  }, [params])

  const { data: pilot, isLoading: pilotLoading, error: pilotError } = usePilotDetail(pilotId)
  const { data: pilotChecks, isLoading: checksLoading } = usePilotChecks(pilotId)

  if (pilotLoading) {
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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (pilotError || !pilot) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pilot Details</h1>
            <p className="text-muted-foreground">
              {pilot.fullName} - Individual pilot information and certification status
            </p>
          </div>
        </div>

        {/* Pilot Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-bold">
                    {pilot.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{pilot.fullName}</CardTitle>
                  <p className="text-muted-foreground">Employee ID: {pilot.employee_id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={pilot.role === 'Captain' ? 'default' : 'secondary'}>
                      {pilot.role}
                    </Badge>
                    {pilot.hasLineCapatinQual && (
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Line Captain
                      </Badge>
                    )}
                    {pilot.hasTrainingCaptainQual && (
                      <Badge variant="outline">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Training Captain
                      </Badge>
                    )}
                    {pilot.hasExaminerQual && (
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        Examiner
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/pilots/${pilot.id}/edit`)}
                >
                  Edit Pilot
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/pilots/${pilot.id}/certifications`)}
                >
                  View Certifications
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Company Email</span>
                    <span>{pilot.employee_id ? `${pilot.employee_id.toLowerCase()}@airline.com` : 'Not available'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Private Email</span>
                    <span className="text-muted-foreground">Not available in database</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Phone Numbers</span>
                    <span className="text-muted-foreground">Not available in database</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Nationality</span>
                    <span>{pilot.nationality || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Birth Date</span>
                    <span>
                      {pilot.date_of_birth
                        ? `${new Date(pilot.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ${pilot.age ? `(${pilot.age} years old)` : ''}`
                        : 'Not available'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Time to Retirement</span>
                    <span className={`font-medium ${pilot.timeToRetirement?.isRetired ? 'text-red-600' : 'text-green-600'}`}>
                      {pilot.timeToRetirement
                        ? pilot.timeToRetirement.isRetired
                          ? 'Retired'
                          : `${pilot.timeToRetirement.years} years, ${pilot.timeToRetirement.months} months, ${pilot.timeToRetirement.days} days`
                        : 'Cannot calculate (birth date required)'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment & Seniority Details */}
        <Card>
          <CardHeader>
            <CardTitle>Employment & Seniority</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Employment History</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Commencement Date</span>
                    <span>
                      {pilot.commencement_date
                        ? new Date(pilot.commencement_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Not available'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Years of Service</span>
                    <span className="font-medium">
                      {pilot.yearsOfService
                        ? `${pilot.yearsOfService} years`
                        : 'Cannot calculate (commencement date required)'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Employment Status</span>
                    <span>{pilot.is_active ? 'Active' : 'Inactive'} - {pilot.contract_type || 'Contract type not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seniority Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fleet Seniority</h3>
              <div className="space-y-2">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {pilot.seniorityNumber ? `#${pilot.seniorityNumber}` : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Fleet Seniority Number</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pilot.yearsOfService
                      ? `Based on ${pilot.yearsOfService} years of service`
                      : 'Cannot calculate without service time'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Seniority Date</span>
                    <span>
                      {pilot.commencement_date
                        ? new Date(pilot.commencement_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Not available'
                      }
                    </span>
                  </div>
                </div>
                {pilot.role === 'Captain' && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Captain Status</span>
                      <span>Current Captain</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certification Status */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Current Certifications {checksLoading && '(Loading...)'}</CardTitle>
            </CardHeader>
            <CardContent>
              {checksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {pilotChecks && pilotChecks.length > 0 ? (
                    pilotChecks.slice(0, 6).map((check, index) => {
                      const expiryDate = check.expiry_date ? new Date(check.expiry_date) : null
                      const today = new Date()
                      const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null

                      let status = { variant: 'outline', color: 'text-green-600', icon: CheckCircle, label: 'Current' }
                      if (daysToExpiry === null || !expiryDate) {
                        status = { variant: 'secondary', color: 'text-gray-600', icon: AlertTriangle, label: 'No Expiry' }
                      } else if (daysToExpiry <= 0) {
                        status = { variant: 'destructive', color: 'text-red-600', icon: AlertTriangle, label: 'Expired' }
                      } else if (daysToExpiry <= 30) {
                        status = { variant: 'secondary', color: 'text-orange-600', icon: Clock, label: 'Expiring Soon' }
                      }

                      return (
                        <div key={check.id || index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">
                              {check.check_types?.check_description || 'Unknown Check'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {expiryDate
                                ? `Expires: ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                : 'No expiry date'
                              }
                            </p>
                          </div>
                          <Badge variant={status.variant as any} className={status.color}>
                            <status.icon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground">No certifications found</p>
                  )}
                  {pilotChecks && pilotChecks.length > 6 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{pilotChecks.length - 6} more certifications
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pilotChecks && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {pilotChecks.length > 0
                          ? Math.round((pilotChecks.filter(check => {
                              const expiryDate = check.expiry_date ? new Date(check.expiry_date) : null
                              const today = new Date()
                              const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
                              return daysToExpiry && daysToExpiry > 0
                            }).length / pilotChecks.length) * 100)
                          : 0
                        }%
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Compliance Score</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Certifications</span>
                        <span className="font-medium">{pilotChecks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current</span>
                        <span className="font-medium text-green-600">
                          {pilotChecks.filter(check => {
                            const expiryDate = check.expiry_date ? new Date(check.expiry_date) : null
                            const today = new Date()
                            const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
                            return daysToExpiry && daysToExpiry > 30
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiring Soon (30 days)</span>
                        <span className="font-medium text-orange-600">
                          {pilotChecks.filter(check => {
                            const expiryDate = check.expiry_date ? new Date(check.expiry_date) : null
                            const today = new Date()
                            const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
                            return daysToExpiry && daysToExpiry > 0 && daysToExpiry <= 30
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expired</span>
                        <span className="font-medium text-red-600">
                          {pilotChecks.filter(check => {
                            const expiryDate = check.expiry_date ? new Date(check.expiry_date) : null
                            const today = new Date()
                            const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null
                            return daysToExpiry && daysToExpiry <= 0
                          }).length}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}