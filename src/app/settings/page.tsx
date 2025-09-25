'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings, Database, Bell, Shield, Users, Plane, Save, X, Loader2 } from 'lucide-react'
import { useFleetSettings, FleetSettings } from '@/hooks/use-settings'

export default function SettingsPage() {
  // Use the settings hook
  const { settings, pilotCounts, isLoading, error, updateSettings, isUpdating, updateError } = useFleetSettings()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<keyof FleetSettings | null>(null)
  const [tempValue, setTempValue] = useState<string>('')

  // Handle opening edit dialog
  const handleEdit = (field: keyof FleetSettings) => {
    if (!settings) return
    setEditingField(field)
    setTempValue(String(settings[field]))
    setIsEditDialogOpen(true)
  }

  // Handle saving changes
  const handleSave = () => {
    if (editingField && tempValue && settings) {
      const numericValue = parseFloat(tempValue)
      if (!isNaN(numericValue) && numericValue > 0) {
        const updatedSettings = {
          ...settings,
          [editingField]: numericValue
        }
        updateSettings(updatedSettings)
        setIsEditDialogOpen(false)
        setEditingField(null)
        setTempValue('')
      }
    }
  }

  // Handle canceling edit
  const handleCancel = () => {
    setIsEditDialogOpen(false)
    setEditingField(null)
    setTempValue('')
  }

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state
  if (error || !settings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load settings</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate current status using real data
  const currentPilots = pilotCounts?.total_pilots || 0
  const currentCaptains = pilotCounts?.captains || 0
  const currentFirstOfficers = pilotCounts?.first_officers || 0
  const currentTrainingCaptains = pilotCounts?.training_captains || 0
  const currentExaminers = pilotCounts?.examiners || 0

  const requiredCaptains = Math.ceil(settings.aircraftCount * settings.captainsPerHull)
  const requiredFirstOfficers = Math.ceil(settings.aircraftCount * settings.firstOfficersPerHull)

  // Calculate requirements based on ratios (no separate minimum)
  const requiredTrainingCaptains = Math.ceil(currentPilots / settings.trainingCaptainRatio)
  const requiredExaminers = Math.ceil(currentPilots / settings.examinerRatio)

  // Get field labels for dialog
  const getFieldLabel = (field: keyof FleetSettings): string => {
    const labels: Record<keyof FleetSettings, string> = {
      aircraftCount: 'Number of Aircraft',
      retirementAge: 'Retirement Age (years)',
      captainsPerHull: 'Captains per Aircraft',
      firstOfficersPerHull: 'First Officers per Aircraft',
      trainingCaptainRatio: 'Pilots per Training Captain',
      examinerRatio: 'Pilots per Examiner',
      criticalAlertDays: 'Critical Alert Threshold (days)',
      urgentAlertDays: 'Urgent Alert Threshold (days)',
      warning30Days: '30-Day Warning Threshold (days)',
      warning60Days: '60-Day Warning Threshold (days)',
      earlyWarning90Days: '90-Day Early Warning Threshold (days)',
    }
    return labels[field]
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Settings</h1>
          <p className="text-muted-foreground">
            Configure B767 fleet management system preferences
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Admin Configuration
        </Badge>
      </div>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Supabase Connection</h4>
              <p className="text-sm text-muted-foreground">
                B767 Fleet Management Database (wgdmgvonqysflwdiiols)
              </p>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Sync</h4>
              <p className="text-sm text-muted-foreground">
                Real-time synchronization with database
              </p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Read-Only Mode</h4>
              <p className="text-sm text-muted-foreground">
                Application currently in read-only mode (no authentication)
              </p>
            </div>
            <Badge variant="outline">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Fleet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Aircraft Type</h4>
              <p className="text-sm text-muted-foreground">
                Primary aircraft model for fleet operations
              </p>
            </div>
            <Badge variant="secondary">Boeing 767</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Number of Aircraft</h4>
              <p className="text-sm text-muted-foreground">
                Total aircraft in B767 fleet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{settings.aircraftCount} aircraft</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('aircraftCount')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Retirement Age</h4>
              <p className="text-sm text-muted-foreground">
                Mandatory retirement age for pilots
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{settings.retirementAge} years</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('retirementAge')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Check Categories</h4>
              <p className="text-sm text-muted-foreground">
                Number of certification check categories
              </p>
            </div>
            <Badge variant="outline">7 categories</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pilot Requirements Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pilot Requirements Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Captain to First Officer Ratio */}
          <div className="space-y-4">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Captain to First Officer Ratios
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Captains per Hull</h5>
                  <p className="text-sm text-muted-foreground">
                    Required captains per aircraft
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{settings.captainsPerHull} captains</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit('captainsPerHull')}>Edit</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">First Officers per Hull</h5>
                  <p className="text-sm text-muted-foreground">
                    Required first officers per aircraft
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{settings.firstOfficersPerHull} first officers</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit('firstOfficersPerHull')}>Edit</Button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Status:</strong> {currentCaptains} Captains, {currentFirstOfficers} First Officers across {settings.aircraftCount} aircraft
                <br />
                <strong>Requirement:</strong> {requiredCaptains} Captains, {requiredFirstOfficers} First Officers needed for full coverage
              </p>
            </div>
          </div>

          {/* Training Captain Requirements */}
          <div className="space-y-4">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Training Captain Requirements
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Training Captains per Pilots</h5>
                  <p className="text-sm text-muted-foreground">
                    Ratio of training captains to total pilots
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">1:{settings.trainingCaptainRatio} ratio</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit('trainingCaptainRatio')}>Edit</Button>
                </div>
              </div>

            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Current Status:</strong> {currentTrainingCaptains} Training Captains for {currentPilots} total pilots
                <br />
                <strong>Requirement:</strong> {requiredTrainingCaptains} required (1:{settings.trainingCaptainRatio} ratio) {currentTrainingCaptains >= requiredTrainingCaptains ? '✓' : '⚠️'}
              </p>
            </div>
          </div>

          {/* Examiner Requirements */}
          <div className="space-y-4">
            <h4 className="font-medium text-orange-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              Examiner Requirements
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium">Examiners per Pilots</h5>
                  <p className="text-sm text-muted-foreground">
                    Ratio of examiners to total pilots
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">1:{settings.examinerRatio} ratio</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit('examinerRatio')}>Edit</Button>
                </div>
              </div>

            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Current Status:</strong> {currentExaminers} Examiners for {currentPilots} total pilots
                <br />
                <strong>Requirement:</strong> {requiredExaminers} required (1:{settings.examinerRatio} ratio) {currentExaminers >= requiredExaminers ? '✓' : `(need ${requiredExaminers - currentExaminers} more)`}
              </p>
            </div>
          </div>

          {/* Fleet Staffing Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              Fleet Staffing Summary
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800">Current Fleet</h5>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-blue-700">{settings.aircraftCount} Boeing 767 Aircraft</p>
                  <p className="text-sm text-blue-700">{currentPilots} Total Pilots</p>
                  <p className="text-sm text-blue-700">531 Active Certifications</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-800">Current Staffing</h5>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700">{currentCaptains} Captains ({(currentCaptains / settings.aircraftCount).toFixed(1)} per hull)</p>
                  <p className="text-sm text-green-700">{currentFirstOfficers} First Officers ({(currentFirstOfficers / settings.aircraftCount).toFixed(1)} per hull)</p>
                  <p className="text-sm text-green-700">{currentTrainingCaptains} Training Captains {currentTrainingCaptains >= requiredTrainingCaptains ? '✓' : '⚠️'}</p>
                  <p className="text-sm text-green-700">{currentExaminers} Examiners {currentExaminers >= requiredExaminers ? '✓' : '⚠️'}</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                <h5 className="font-medium text-red-800">Staffing Gaps</h5>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-red-700">Need: {Math.max(0, requiredFirstOfficers - currentFirstOfficers)} more First Officers</p>
                  <p className="text-sm text-red-700">Need: {Math.max(0, requiredExaminers - currentExaminers)} more Examiners</p>
                  <p className="text-sm text-red-700">Total shortage: {Math.max(0, requiredFirstOfficers - currentFirstOfficers) + Math.max(0, requiredExaminers - currentExaminers)} personnel</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Critical Alert Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Days before expiration for critical alerts (7 days)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{settings.criticalAlertDays} days</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('criticalAlertDays')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Urgent Alert Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Days before expiration for urgent alerts (14 days)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{settings.urgentAlertDays} days</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('urgentAlertDays')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">30-Day Warning Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Days before expiration for 30-day warnings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{settings.warning30Days} days</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('warning30Days')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">60-Day Warning Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Days before expiration for 60-day warnings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{settings.warning60Days} days</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('warning60Days')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">90-Day Early Warning Threshold</h4>
              <p className="text-sm text-muted-foreground">
                Days before expiration for early warnings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{settings.earlyWarning90Days} days</Badge>
              <Button variant="outline" size="sm" onClick={() => handleEdit('earlyWarning90Days')}>Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Send daily email summaries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Enabled</Badge>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Authentication</h4>
              <p className="text-sm text-muted-foreground">
                User authentication system status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not Configured</Badge>
              <Button variant="outline" size="sm">Setup</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Role-Based Access</h4>
              <p className="text-sm text-muted-foreground">
                Configure user roles and permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Pending</Badge>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Encryption</h4>
              <p className="text-sm text-muted-foreground">
                Database encryption and security
              </p>
            </div>
            <Badge variant="secondary">Enabled</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Audit Logging</h4>
              <p className="text-sm text-muted-foreground">
                Track all system changes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Pending</Badge>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Access Control</h4>
              <p className="text-sm text-muted-foreground">
                Row Level Security (RLS) policies
              </p>
            </div>
            <Badge variant="secondary">Configured</Badge>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingField ? getFieldLabel(editingField) : 'Setting'}
            </DialogTitle>
            <DialogDescription>
              Enter the new value for {editingField ? getFieldLabel(editingField).toLowerCase() : 'this setting'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="setting-value">Value</Label>
              <Input
                id="setting-value"
                type="number"
                step={editingField === 'captainsPerHull' || editingField === 'firstOfficersPerHull' ? '0.1' : '1'}
                min="0"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave()
                  }
                  if (e.key === 'Escape') {
                    handleCancel()
                  }
                }}
                autoFocus
              />
              {updateError && (
                <p className="text-sm text-red-600 mt-2">
                  Error saving: {updateError.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}