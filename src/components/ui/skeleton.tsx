import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "rounded-md bg-muted relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "animate-pulse",
        shimmer: "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted",
        wave: "animate-wave",
        pulse: "animate-pulse-soft",
      },
      speed: {
        slow: "animation-duration-2000",
        normal: "animation-duration-1000",
        fast: "animation-duration-500",
      }
    },
    defaultVariants: {
      variant: "default",
      speed: "normal",
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  className,
  variant,
  speed,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, speed }), className)}
      aria-label="Loading content..."
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    />
  )
}

// Aviation-specific skeleton components
function MetricSkeleton({ priority = "secondary" }: { priority?: "critical" | "primary" | "secondary" }) {
  const sizes = {
    critical: "h-32",
    primary: "h-28",
    secondary: "h-24"
  }

  return (
    <div className={cn("border rounded-lg p-4 space-y-3", sizes[priority])}>
      <div className="flex items-center justify-between">
        <Skeleton variant="shimmer" className="h-4 w-24" />
        <Skeleton variant="shimmer" className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton variant="shimmer" className={cn(
        "w-16",
        priority === "critical" ? "h-10" :
        priority === "primary" ? "h-8" : "h-7"
      )} />
      <Skeleton variant="shimmer" className="h-3 w-32" />
      {priority === "critical" && (
        <Skeleton variant="shimmer" className="h-3 w-24" />
      )}
    </div>
  )
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="shimmer" className="h-4 w-20" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="shimmer"
                className="h-4"
                style={{
                  width: colIndex === 0 ? '80%' : colIndex === cols - 1 ? '60%' : '100%'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PilotCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton variant="shimmer" className="h-5 w-32" />
          <Skeleton variant="shimmer" className="h-4 w-20" />
        </div>
        <Skeleton variant="shimmer" className="h-8 w-8 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-4 w-24" />
        <Skeleton variant="shimmer" className="h-3 w-40" />
      </div>

      <div className="flex gap-2">
        <Skeleton variant="shimmer" className="h-6 w-16 rounded-full" />
        <Skeleton variant="shimmer" className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

export { Skeleton, MetricSkeleton, TableSkeleton, PilotCardSkeleton }