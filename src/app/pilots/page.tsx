'use client'

import { Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PilotGrid } from '@/components/dashboard/pilot-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserCheck, Crown, GraduationCap, Plus } from 'lucide-react'

export default function PilotsPage() {
  const router = useRouter()

  const handleViewPilot = useCallback((pilotId: string) => {
    router.push(`/pilots/${pilotId}`)
  }, [router])

  const handleEditPilot = useCallback((pilotId: string) => {
    // Navigate to edit pilot page or modal
    router.push(`/pilots/${pilotId}/edit`)
  }, [router])

  const handleDeletePilot = useCallback(async (pilotId: string) => {
    // Show confirmation dialog before deletion
    const confirmed = window.confirm('Are you sure you want to delete this pilot? This action cannot be undone.')
    if (confirmed) {
      try {
        // TODO: Implement actual deletion logic with Supabase
        alert(`Pilot ${pilotId} would be deleted here. Database deletion not implemented yet.`)
        // After successful deletion, refresh the page or update state
        window.location.reload()
      } catch (error) {
        alert('Failed to delete pilot. Please try again.')
        console.error('Delete pilot error:', error)
      }
    }
  }, [])

  const handleAddPilot = useCallback(() => {
    // Navigate to add new pilot page or modal
    router.push('/pilots/new')
  }, [router])

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pilot Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all B767 fleet pilots
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          27 Active Pilots
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pilots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">All active pilots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Captains</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">74% of fleet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Officers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">26% of fleet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Line Captains</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">70% of captains</p>
          </CardContent>
        </Card>
      </div>

      {/* Pilot Grid */}
      <Suspense fallback={
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading pilots...</span>
            </div>
          </CardContent>
        </Card>
      }>
        <PilotGrid
          onView={handleViewPilot}
          onEdit={handleEditPilot}
          onDelete={handleDeletePilot}
          onAdd={handleAddPilot}
        />
      </Suspense>
      </div>
    </DashboardLayout>
  )
}