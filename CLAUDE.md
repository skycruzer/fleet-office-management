# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fleet Office Management** - A modern B767 fleet management web application built with Next.js 15, React 19, and Supabase. This system manages pilot certifications, fleet compliance, and operational oversight for B767 aircraft operations.

**⚠️ IMPORTANT: This is the primary B767 fleet management project. Focus development efforts here.**

## Project Details

- **Project Name**: Fleet Office Management
- **Location**: `/Users/skycruzer/Desktop/Fleet Office Management/fleet-office-management/`
- **Database**: Supabase (Project ID: wgdmgvonqysflwdiiols) - B767 Fleet Management
- **Data Scale**: 27 active pilots, 531 certifications, 38 check types, 3 contract types

## Key Commands

```bash
# Navigate to project
cd "/Users/skycruzer/Desktop/Fleet Office Management/fleet-office-management"

# Development
npm run dev          # Start development server on http://localhost:3000 (with Turbopack)
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js TypeScript flat config

# Testing
npm run test         # Run Vitest unit tests
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Generate test coverage reports
npm run test:watch   # Watch mode for tests

# Dependencies
npm install          # Install all dependencies

# Component Development
npx shadcn@latest add [component]  # Add new shadcn/ui components
npx shadcn@latest add button card dialog tabs  # Add multiple components
```

## Technology Stack

### Core Framework
- **Framework**: Next.js 15.5.4 with React 19.1.0 (latest stable)
- **Build System**: Turbopack for development and production builds (fast refresh enabled)
- **TypeScript**: v5 with strict configuration and path aliases (@/*)
- **Architecture**: App Router (`src/app/` directory structure)

### Database & Backend
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with session management (configured but currently read-only)
- **Real-time**: Supabase real-time subscriptions configured
- **Type Generation**: Auto-generated types from live database schema

### State Management & Data Fetching
- **Client State**: React Context API with AuthProvider and QueryProvider
- **Server State**: TanStack Query 5.90.2 with React Query DevTools
- **Caching Strategy**: Multi-level caching with stale-time policies (2-30 minutes)
- **Error Handling**: Centralized error handling with `handleSupabaseError()`

### UI Framework & Styling
- **Components**: Radix UI primitives + custom shadcn/ui components
- **Styling**: TailwindCSS v4 with @tailwindcss/postcss
- **Icons**: Lucide React 0.544.0
- **Animations**: CSS-based transitions with tw-animate-css
- **Form Handling**: React Hook Form integration with Zod validation

### Development & Testing
- **Linting**: ESLint 9 with Next.js TypeScript configuration
- **Testing**: Vitest with jsdom environment, React Testing Library
- **Environment**: Zod-validated environment variables with client/server separation

## Architecture

### Directory Structure
```
fleet-office-management/
├── src/
│   ├── app/                     # Next.js 15 App Router pages
│   │   ├── page.tsx            # Dashboard (main page)
│   │   ├── pilots/             # Pilot management
│   │   │   └── page.tsx        # Pilot directory
│   │   ├── alerts/             # Fleet alerts & expiring checks
│   │   │   └── page.tsx        # Compliance alerts
│   │   ├── schedule/           # Schedule management (placeholder)
│   │   │   └── page.tsx        # Scheduling interface
│   │   ├── settings/           # System settings
│   │   │   └── page.tsx        # Configuration panel
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── globals.css         # Global TailwindCSS styles
│   ├── components/
│   │   ├── ui/                 # Radix-based shadcn/ui components
│   │   │   ├── button.tsx      # Button variants with CVA
│   │   │   ├── card.tsx        # Card components
│   │   │   ├── dialog.tsx      # Modal/dialog primitives
│   │   │   ├── navigation.tsx  # Navigation components
│   │   │   ├── tabs.tsx        # Tab interface
│   │   │   └── [other-ui]...   # Additional UI components
│   │   ├── layout/             # Layout wrapper components
│   │   │   └── dashboard-layout.tsx # Main layout with navigation
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── fleet-overview-cards.tsx    # Overview metrics
│   │   │   ├── pilot-grid.tsx              # Pilot display grid
│   │   │   ├── expiring-checks-table.tsx   # Certification table
│   │   │   ├── certification-status.tsx    # Status indicators
│   │   │   ├── captain-qualifications.tsx  # Captain-specific data
│   │   │   └── performance-widget.tsx      # Performance monitoring
│   │   ├── auth/               # Authentication components
│   │   │   └── protected-route.tsx # Route protection wrapper
│   │   └── providers/          # React context providers
│   │       ├── auth-provider.tsx    # Authentication context
│   │       └── query-provider.tsx   # TanStack Query setup
│   ├── hooks/                  # Custom React hooks for data fetching
│   │   ├── use-dashboard-data.ts    # Dashboard-specific queries
│   │   ├── use-pilots.ts            # Pilot-related queries
│   │   ├── use-settings.ts          # Settings management
│   │   └── use-performance-tracking.ts # Performance monitoring
│   ├── lib/                    # Utilities and configuration
│   │   ├── supabase.ts         # Supabase client & type exports
│   │   ├── query-client.ts     # TanStack Query configuration
│   │   ├── env.ts              # Environment validation with Zod
│   │   ├── monitoring.ts       # Performance monitoring system
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── supabase.ts         # Generated database types
├── supabase/                   # Supabase configuration
│   ├── config.toml            # Local Supabase configuration
│   └── [migrations]...        # Database migrations
├── .env.local                 # Environment variables (Supabase config)
├── next.config.ts             # Next.js configuration with Turbopack
├── eslint.config.mjs          # ESLint flat config
├── vitest.config.ts           # Vitest testing configuration
└── tsconfig.json              # TypeScript configuration
```

## Data Architecture

### Database-First Approach
The application follows a **database-first architecture** with Supabase PostgreSQL as the single source of truth. All data flows through optimized database views and custom hooks.

### Key Tables
- **pilots** (27 records) - Core pilot information, roles, qualifications
- **pilot_checks** (531 records) - Individual certification records
- **check_types** (38 records) - Certification categories and requirements
- **contract_types** (3 records) - Employment contract classifications

### Optimized Database Views
- **compliance_dashboard** - Fleet-wide compliance metrics and statistics
- **pilot_report_summary** - Comprehensive pilot status with check summaries
- **detailed_expiring_checks** - Expiring certifications with pilot details
- **expiring_checks** - Simplified expiring checks for alerts
- **captain_qualifications_summary** - Captain-specific qualifications and certifications

### Data Flow Patterns

#### 1. Custom Hooks Pattern
All data fetching is abstracted into domain-specific custom hooks:
```typescript
// Dashboard data hooks (use-dashboard-data.ts)
export function useComplianceDashboard()      // Fleet metrics
export function useDetailedExpiringChecks()  // Expiring certifications
export function usePilotReportSummary()      // Pilot summaries
export function useCaptainQualifications()   // Captain qualifications

// Pilot data hooks (use-pilots.ts)
export function usePilots()                  // All active pilots
export function usePilot(id)                 // Single pilot details
export function usePilotChecks(id)           // Pilot certifications
export function usePilotsByRole(role)        // Role-filtered pilots
export function useSearchPilots(term)        // Pilot search
```

#### 2. Query Key Strategy
Centralized query key factory in `lib/query-client.ts`:
```typescript
export const queryKeys = {
  dashboard: ['dashboard'],
  complianceDashboard: () => [...queryKeys.dashboard, 'compliance'],
  pilots: ['pilots'],
  allPilots: () => [...queryKeys.pilots, 'all'],
  pilot: (id: string) => [...queryKeys.pilots, 'detail', id],
  checks: ['checks'],
  expiringChecks: (days?: number) => [...queryKeys.checks, 'expiring', days || 90],
  // ... additional query keys
}
```

#### 3. Caching & Performance Strategy
- **Stale Times**: Configured per data type in `lib/query-client.ts`
  - Default: 5 minutes stale time, 10 minutes cache time
  - Dashboard data: 2 minutes (high frequency updates)
  - Pilot data: 10-15 minutes (moderate updates)
  - Check types: 30 minutes (rarely changes)
- **Error Handling**: Global error boundaries with graceful degradation
- **Query Configuration**: 1 retry with exponential backoff, window focus refetch enabled
- **Performance Tracking**: Comprehensive monitoring with `withQueryTracking()`

## Component Architecture

### Component Hierarchy
1. **Layout Components** (`components/layout/`)
   - `DashboardLayout`: Main application shell with navigation
   - `PageHeader`: Consistent page headers with actions

2. **UI Components** (`components/ui/`)
   - Radix UI primitives with shadcn/ui styling
   - Class Variance Authority (CVA) for component variants
   - Fully accessible with ARIA labels and keyboard navigation

3. **Feature Components** (`components/dashboard/`)
   - Domain-specific dashboard widgets
   - Data-driven components using custom hooks
   - Suspense boundaries with skeleton loading states

### Component Patterns

#### 1. Suspense + Error Boundaries
```tsx
<Suspense fallback={<DashboardSkeleton />}>
  <FleetOverviewCards />
</Suspense>
```

#### 2. Performance Monitoring Integration
```tsx
// Components include performance tracking
const DashboardComponent = () => {
  const { recordUserAction } = usePerformanceMonitor()

  const handleAction = () => {
    recordUserAction('button_click', 'dashboard')
    // ... action logic
  }
}
```

#### 3. Accessibility-First Design
- Semantic HTML with proper ARIA labels
- Skip links for keyboard navigation
- Screen reader announcements
- Color contrast compliance (aviation industry standards)

## Current Features

### 1. Flight Operations Dashboard (`/`)
- **Fleet Overview**: Real-time compliance metrics and statistics
- **Quick Stats**: At-a-glance status indicators
- **Tabbed Interface**: Overview, Pilots, Certifications, Qualifications
- **Performance Widget**: System performance monitoring (currently disabled)

### 2. Pilot Management (`/pilots`)
- **Pilot Directory**: Complete listing of 27 active pilots
- **Search & Filter**: Role-based filtering and name search
- **Individual Profiles**: Detailed pilot information and certifications

### 3. Compliance Alerts (`/alerts`)
- **Expiring Certifications**: Configurable timeframe monitoring (30-90 days)
- **Compliance Status**: Color-coded FAA standard indicators (red/yellow/green)
- **Detailed Views**: Comprehensive expiring checks with pilot details

### 4. System Settings (`/settings`)
- **Configuration Panel**: System settings and preferences
- **Database Status**: Connection and performance monitoring

### 5. Navigation Structure
- **Responsive Design**: Mobile-first with desktop enhancement
- **Sidebar Navigation**: Hidden on mobile, persistent on desktop
- **Breadcrumb Support**: Consistent navigation patterns

## Development Patterns

### 1. Environment Configuration
Robust environment validation with Zod:
```typescript
// lib/env.ts - Client/server environment separation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Server-only variables
  SUPABASE_PROJECT_ID: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
})
```

### 2. Database Integration Pattern
Type-safe database operations with error handling:
```typescript
// lib/supabase.ts - Centralized client configuration
export const supabase = createClient<Database>(url, key, {
  auth: { autoRefreshToken: true, persistSession: true },
  realtime: { params: { eventsPerSecond: 10 } },
  global: { headers: { 'x-client-info': 'b767-fleet-manager@1.0.0' } }
})

// Helper types for common operations
export type Pilot = Database['public']['Tables']['pilots']['Row']
export type ComplianceDashboard = Database['public']['Views']['compliance_dashboard']['Row']
```

### 3. Performance Monitoring
Comprehensive performance tracking system:
```typescript
// lib/monitoring.ts - Built-in performance monitoring
export const performanceMonitor = new PerformanceMonitor()
export function withQueryTracking<T>(queryName: string, queryFn: () => Promise<T>)
export function usePerformanceMonitor() // React hook for components
```

### 4. Testing Strategy
- **Unit Tests**: Vitest with React Testing Library (jsdom environment)
- **Component Tests**: Coverage reporting with `npm run test:coverage`
- **Integration Tests**: Database operations and hook testing
- **Performance Tests**: Core Web Vitals and query performance
- **Test Configuration**: Setup in `vitest.config.ts` with 10-second timeout

## Aviation Industry Compliance

### FAA Standards Integration
- **Color-coded Status**: Red (expired), Yellow (expiring), Green (current)
- **Certification Tracking**: Complete lifecycle management
- **Compliance Reporting**: Automated alert generation
- **Audit Trail**: Performance monitoring for regulatory compliance

### Fleet Management Features
- **Pilot Qualifications**: Role-based certification requirements
- **Captain Qualifications**: Enhanced tracking for line captains, training captains, examiners
- **Contract Management**: Support for different employment contract types
- **Retirement Planning**: Age calculations with configurable retirement thresholds

## Important Configuration Files

### Next.js Configuration (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  turbopack: { root: __dirname }, // Turbopack enabled for dev and build
}
```

### ESLint Configuration (`eslint.config.mjs`)
```javascript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: ["node_modules/**", ".next/**", "out/**"] }
]
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  }
}
```

## Development Notes

### Current Status
- **Read-only Mode**: Authentication configured but currently bypassed for development
- **Live Database**: Connected to production Supabase database with real fleet data
- **Performance**: Optimized with Turbopack builds and TanStack Query caching
- **Accessibility**: WCAG compliant with aviation industry color standards
- **Mobile Ready**: Responsive design works across all device types

### Future Enhancement Areas
1. **Authentication**: Enable Supabase Auth for role-based access control
2. **Real-time Updates**: Implement real-time subscriptions for live data
3. **PDF Reports**: Add report generation for compliance documentation
4. **Advanced Analytics**: Expand performance monitoring and fleet analytics
5. **Offline Support**: Progressive Web App features for field operations

### Key Architectural Decisions
1. **Database Views**: Complex queries pre-computed in PostgreSQL for performance
2. **Custom Hooks**: Domain-driven data fetching abstraction
3. **Component Composition**: Radix UI + shadcn/ui for consistent design system
4. **Performance First**: Built-in monitoring and optimization from day one
5. **Type Safety**: End-to-end TypeScript with generated database types

## Important Reminders

- **Single Source of Truth**: All data flows through the Supabase database
- **Performance Monitoring**: Built-in tracking for queries, components, and user interactions
- **Aviation Standards**: Follow FAA color coding and compliance requirements
- **Type Safety**: Maintain strict TypeScript usage with generated database types
- **Accessibility**: Ensure WCAG compliance for all new features
- **Real Data**: Work with actual fleet data (27 pilots, 531 certifications, 38 check types)
- **Testing**: Write tests for all new features using the established Vitest setup

## Troubleshooting Common Issues

### Database Connection Issues
- Check `.env.local` for correct Supabase URL and anon key
- Verify project ID matches `wgdmgvonqysflwdiiols`
- Look for network errors in browser console

### Performance Issues
- Use React Query DevTools to inspect query performance
- Check `lib/monitoring.ts` for performance tracking
- Slow queries are logged with 🐌 emoji in console

### Component Development
- All UI components use shadcn/ui with Radix primitives
- Follow CVA patterns for component variants
- Ensure ARIA labels for accessibility
- Use proper TypeScript interfaces for props

### Common Data Patterns
- Use custom hooks from `hooks/` directory for data fetching
- Follow query key factory pattern from `lib/query-client.ts`
- Handle loading states with Suspense boundaries
- Implement error boundaries for graceful degradation