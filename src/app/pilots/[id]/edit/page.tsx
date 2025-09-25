'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePilotDetail } from '@/hooks/use-pilots'
import { ArrowLeft, Save, Edit } from 'lucide-react'

interface EditPilotPageProps {
  params: Promise<{ id: string }>
}

export default function EditPilotPage({ params }: EditPilotPageProps) {
  const router = useRouter()
  const [pilotId, setPilotId] = React.useState<string | null>(null)

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setPilotId(resolvedParams.id)
    })
  }, [params])

  const { data: pilot, isLoading, error } = usePilotDetail(pilotId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual pilot update with Supabase
    alert('Pilot editing functionality not yet implemented. This would update the pilot in the database.')
    router.back()
  }

  if (isLoading) {
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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !pilot) {
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
            <h1 className="text-3xl font-bold">Edit Pilot</h1>
            <p className="text-muted-foreground">
              {pilot.fullName} - Update pilot information and qualifications
            </p>
          </div>
        </div>

        {/* Edit Pilot Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Pilot Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        defaultValue={pilot.employee_id || ''}
                        placeholder="e.g., EMP001 or 1234"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        defaultValue={pilot.first_name || ''}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        defaultValue={pilot.middle_name || ''}
                        placeholder="Middle Name (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        defaultValue={pilot.last_name || ''}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" defaultValue={pilot.role || ''} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Captain">Captain</SelectItem>
                          <SelectItem value="First Officer">First Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        defaultValue={pilot.date_of_birth ? new Date(pilot.date_of_birth).toISOString().split('T')[0] : ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        defaultValue={pilot.nationality || ''}
                        placeholder="e.g., Papua New Guinea"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commencement_date">Commencement Date</Label>
                      <Input
                        id="commencement_date"
                        type="date"
                        defaultValue={pilot.commencement_date ? new Date(pilot.commencement_date).toISOString().split('T')[0] : ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract_type">Contract Type</Label>
                      <Select name="contract_type" defaultValue={pilot.contract_type || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">Permanent</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Captain Qualifications */}
              {pilot.role === 'Captain' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Captain Qualifications</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="line_captain"
                        defaultChecked={pilot.hasLineCapatinQual}
                      />
                      <span>Line Captain</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="training_captain"
                        defaultChecked={pilot.hasTrainingCaptainQual}
                      />
                      <span>Training Captain</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="examiner"
                        defaultChecked={pilot.hasExaminerQual}
                      />
                      <span>Examiner</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}