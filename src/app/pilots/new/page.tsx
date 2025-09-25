'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Plus } from 'lucide-react'

export default function AddPilotPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual pilot creation with Supabase
    alert('Pilot creation functionality not yet implemented. This would create a new pilot in the database.')
    router.back()
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
            <h1 className="text-3xl font-bold">Add New Pilot</h1>
            <p className="text-muted-foreground">
              Create a new pilot record for the B767 fleet
            </p>
          </div>
        </div>

        {/* Add Pilot Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
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
                      <Input id="employee_id" placeholder="e.g., EMP001 or 1234" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input id="first_name" placeholder="First Name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input id="middle_name" placeholder="Middle Name (optional)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input id="last_name" placeholder="Last Name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" required>
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
                      <Input id="date_of_birth" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input id="nationality" placeholder="e.g., Papua New Guinea" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commencement_date">Commencement Date</Label>
                      <Input id="commencement_date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract_type">Contract Type</Label>
                      <Select name="contract_type">
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

              {/* Captain Qualifications (shown only for Captains) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Captain Qualifications (if applicable)</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="line_captain" />
                    <span>Line Captain</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="training_captain" />
                    <span>Training Captain</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="examiner" />
                    <span>Examiner</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Pilot
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