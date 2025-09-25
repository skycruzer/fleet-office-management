# Supabase Configuration for B767 Fleet Management

This document outlines the Supabase setup for the B767 Fleet Management project, configured for read-only access without authentication.

## 📋 Overview

- **Project ID**: `wgdmgvonqysflwdiiols`
- **Project URL**: `https://wgdmgvonqysflwdiiols.supabase.co`
- **Access Mode**: Read-only, no authentication required initially
- **Database**: PostgreSQL with comprehensive views for dashboard data

## 🏗️ Project Structure

### Files Created
```
├── .env.local                           # Environment variables
├── types/supabase.ts                    # Generated TypeScript types
├── lib/
│   ├── supabase.ts                      # Supabase client configuration
│   └── query-client.ts                  # TanStack Query setup
├── components/
│   ├── providers/query-provider.tsx     # React Query provider
│   └── dashboard/fleet-overview.tsx     # Demo dashboard component
└── hooks/
    ├── use-dashboard-data.ts            # Dashboard data hooks
    └── use-pilots.ts                    # Pilot data hooks
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://wgdmgvonqysflwdiiols.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=wgdmgvonqysflwdiiols
```

### Client Configuration
The Supabase client is configured for read-only operations with:
- Auto-refresh disabled (no auth)
- Session persistence disabled
- Realtime enabled for live updates
- Global error handling

## 📊 Database Schema

### Core Tables
- **pilots**: Pilot information and qualifications
- **check_types**: Types of certifications/checks
- **pilot_checks**: Individual pilot certifications
- **contract_types**: Employment contract types
- **settings**: Application configuration

### Dashboard Views
- **compliance_dashboard**: High-level fleet compliance metrics
- **detailed_expiring_checks**: Comprehensive expiring check details
- **pilot_report_summary**: Complete pilot information with check summaries
- **expiring_checks**: Simple view of upcoming expirations
- **captain_qualifications_summary**: Captain-specific qualifications

## 🎯 Key Features

### TanStack Query Integration
- Optimized caching strategies
- Automatic error handling
- Real-time data synchronization
- Development tools included

### Type Safety
- Full TypeScript support
- Auto-generated types from database schema
- Type-safe query hooks
- IntelliSense support

### Dashboard Components
- Real-time compliance metrics
- Expiring certification alerts
- Pilot qualification tracking
- Captain and examiner ratios

## 📈 Usage Examples

### Basic Dashboard Data
```tsx
import { useComplianceDashboard } from '@/hooks/use-dashboard-data'

export function Dashboard() {
  const { data, isLoading, error } = useComplianceDashboard()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Fleet Compliance: {data?.compliance_percentage}%</h1>
      <p>Total Pilots: {data?.total_active_pilots}</p>
    </div>
  )
}
```

### Pilot Information
```tsx
import { usePilots } from '@/hooks/use-pilots'

export function PilotList() {
  const { data: pilots } = usePilots()

  return (
    <ul>
      {pilots?.map(pilot => (
        <li key={pilot.id}>
          {pilot.first_name} {pilot.last_name} - {pilot.role}
        </li>
      ))}
    </ul>
  )
}
```

### Expiring Checks
```tsx
import { useDetailedExpiringChecks } from '@/hooks/use-dashboard-data'

export function ExpiringChecks() {
  const { data: checks } = useDetailedExpiringChecks(30) // Next 30 days

  return (
    <div>
      {checks?.map(check => (
        <div key={check.pilot_check_id}>
          {check.pilot_name}: {check.check_description}
          expires in {check.days_until_expiry} days
        </div>
      ))}
    </div>
  )
}
```

## 🔍 Available Query Hooks

### Dashboard Data
- `useComplianceDashboard()` - Fleet-wide compliance metrics
- `useDetailedExpiringChecks(days)` - Detailed expiring check information
- `usePilotReportSummary()` - Complete pilot summaries
- `useExpiringChecks(days)` - Simple expiring check list
- `useCaptainQualifications()` - Captain qualification details

### Pilot Data
- `usePilots()` - All active pilots
- `usePilot(id)` - Single pilot details
- `usePilotChecks(pilotId)` - Pilot's certifications
- `usePilotsByRole(role)` - Pilots filtered by role
- `useSearchPilots(term)` - Search pilots by name/ID

### Reference Data
- `useCheckTypes()` - All certification types

## 🚀 Getting Started

1. **Ensure environment variables are set** (already done)
2. **Wrap your app with QueryProvider**:
```tsx
import { QueryProvider } from '@/components/providers/query-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

3. **Use the hooks in your components**:
```tsx
import { FleetOverview } from '@/components/dashboard/fleet-overview'

export default function DashboardPage() {
  return <FleetOverview />
}
```

## 🎨 UI Components

The setup includes a demo `FleetOverview` component that demonstrates:
- Loading states with skeleton animations
- Error handling with alerts
- Real-time data display
- Status indicators with color coding
- Responsive grid layout

## 🔄 Data Updates

The database views are automatically updated and queries are cached with appropriate stale times:
- Compliance data: 2 minutes (frequently changing)
- Pilot data: 10-15 minutes (relatively stable)
- Check types: 30 minutes (rarely change)

## 🛠️ Next Steps

1. **Add Authentication**: Configure Supabase Auth when user management is needed
2. **Real-time Subscriptions**: Enable live updates for critical data
3. **Mutations**: Add data modification capabilities with proper validation
4. **Caching Strategy**: Optimize cache invalidation based on usage patterns
5. **Error Boundaries**: Implement comprehensive error handling throughout the app

## 🔐 Security Notes

- Currently configured for read-only access using anonymous key
- Row Level Security (RLS) policies are in place on the database
- No sensitive data is exposed through the anonymous connection
- When authentication is added, implement proper user permissions

This setup provides a solid foundation for building a comprehensive fleet management dashboard with real-time data and excellent developer experience.