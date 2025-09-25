"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Zap,
  TrendingUp,
  Plane,
  Calendar,
  Users,
  type LucideIcon,
} from "lucide-react";

const statusVariants = cva(
  "inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        // Aviation-specific status variants
        expired: "bg-red-50 text-red-800 border-red-200 ring-1 ring-red-100",
        critical: "bg-red-50 text-red-800 border-red-200 ring-1 ring-red-100 animate-pulse",
        urgent: "bg-orange-50 text-orange-800 border-orange-200 ring-1 ring-orange-100",
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200 ring-1 ring-yellow-100",
        attention: "bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-100",
        current: "bg-green-50 text-green-800 border-green-200 ring-1 ring-green-100",
        pending: "bg-gray-50 text-gray-800 border-gray-200 ring-1 ring-gray-100",
        inactive: "bg-gray-50 text-gray-500 border-gray-200 opacity-60",
      },
      size: {
        sm: "px-2 py-1 text-xs min-h-[28px]",
        default: "px-3 py-1.5 text-sm min-h-[32px]",
        lg: "px-4 py-2 text-base min-h-[40px]",
      },
      pattern: {
        none: "",
        dots: "relative before:absolute before:inset-0 before:bg-dots before:opacity-20 before:rounded-full",
        stripes: "relative before:absolute before:inset-0 before:bg-stripes before:opacity-20 before:rounded-full",
        grid: "relative before:absolute before:inset-0 before:bg-grid before:opacity-20 before:rounded-full",
      }
    },
    defaultVariants: {
      variant: "current",
      size: "default",
      pattern: "none",
    },
  }
);

interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  icon?: LucideIcon;
  label: string;
  value?: string | number;
  showIcon?: boolean;
  pulse?: boolean;
  tooltip?: string;
}

// Aviation status configurations
const statusConfigs = {
  expired: {
    icon: XCircle,
    pattern: "stripes",
    description: "EXPIRED: Immediate action required",
  },
  critical: {
    icon: AlertTriangle,
    pattern: "dots",
    description: "CRITICAL: Urgent attention needed",
  },
  urgent: {
    icon: AlertCircle,
    pattern: "dots",
    description: "URGENT: Action required soon",
  },
  warning: {
    icon: Clock,
    pattern: "none",
    description: "WARNING: Monitor closely",
  },
  attention: {
    icon: Calendar,
    pattern: "none",
    description: "ATTENTION: Plan action",
  },
  current: {
    icon: CheckCircle2,
    pattern: "none",
    description: "CURRENT: In compliance",
  },
  pending: {
    icon: Clock,
    pattern: "grid",
    description: "PENDING: Awaiting action",
  },
  inactive: {
    icon: Users,
    pattern: "none",
    description: "INACTIVE: Not applicable",
  },
};

function StatusIndicator({
  className,
  variant = "current",
  size = "default",
  pattern,
  icon: CustomIcon,
  label,
  value,
  showIcon = true,
  pulse = false,
  tooltip,
  ...props
}: StatusIndicatorProps) {
  const config = variant ? statusConfigs[variant] : null;
  const Icon = CustomIcon || (config?.icon) || CheckCircle2;
  const finalPattern = pattern || (config?.pattern) || "none";

  return (
    <div
      className={cn(
        statusVariants({ variant, size, pattern: finalPattern }),
        pulse && "animate-pulse-soft",
        className
      )}
      title={tooltip || config?.description}
      role="status"
      aria-label={`${label}: ${value || ""} - ${config?.description || ""}`}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(
            "shrink-0",
            size === "sm" ? "h-3 w-3" :
            size === "lg" ? "h-5 w-5" : "h-4 w-4"
          )}
          aria-hidden="true"
        />
      )}
      <span className="font-medium truncate">
        {label}
        {value && (
          <span className="ml-1 font-semibold tabular-nums">
            {value}
          </span>
        )}
      </span>
    </div>
  );
}

// Specialized aviation status components
interface ComplianceStatusProps {
  percentage: number;
  total?: number;
  compliant?: number;
  size?: "sm" | "default" | "lg";
  showDetails?: boolean;
}

function ComplianceStatus({
  percentage,
  total,
  compliant,
  size = "default",
  showDetails = false
}: ComplianceStatusProps) {
  const getVariant = (pct: number) => {
    if (pct >= 95) return "current";
    if (pct >= 85) return "warning";
    if (pct >= 70) return "urgent";
    return "critical";
  };

  return (
    <StatusIndicator
      variant={getVariant(percentage)}
      size={size}
      icon={Shield}
      label="Compliance"
      value={`${percentage.toFixed(1)}%`}
      tooltip={showDetails && total && compliant ?
        `${compliant} of ${total} pilots compliant (${percentage.toFixed(1)}%)` :
        `Fleet compliance at ${percentage.toFixed(1)}%`
      }
      pulse={percentage < 85}
    />
  );
}

interface ExpiryStatusProps {
  daysToExpiry: number;
  checkType?: string;
  size?: "sm" | "default" | "lg";
}

function ExpiryStatus({ daysToExpiry, checkType, size = "default" }: ExpiryStatusProps) {
  const getVariant = (days: number) => {
    if (days < 0) return "expired";
    if (days <= 7) return "critical";
    if (days <= 30) return "urgent";
    if (days <= 60) return "warning";
    if (days <= 90) return "attention";
    return "current";
  };

  const getLabel = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    return `${days}d remaining`;
  };

  return (
    <StatusIndicator
      variant={getVariant(daysToExpiry)}
      size={size}
      label={getLabel(daysToExpiry)}
      tooltip={checkType ? `${checkType}: ${getLabel(daysToExpiry)}` : undefined}
      pulse={daysToExpiry <= 7}
    />
  );
}

interface PilotStatusProps {
  role: "Captain" | "First Officer" | "Training Captain" | "Examiner";
  isActive: boolean;
  size?: "sm" | "default" | "lg";
}

function PilotStatus({ role, isActive, size = "default" }: PilotStatusProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Captain": return Plane;
      case "Training Captain": return Users;
      case "Examiner": return Shield;
      default: return Users;
    }
  };

  return (
    <StatusIndicator
      variant={isActive ? "current" : "inactive"}
      size={size}
      icon={getRoleIcon(role)}
      label={role}
      tooltip={`${role} - ${isActive ? "Active" : "Inactive"}`}
    />
  );
}

// Pattern backgrounds (to be used with CSS)
const patternStyles = `
  .bg-dots {
    background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0);
    background-size: 8px 8px;
  }

  .bg-stripes {
    background-image: repeating-linear-gradient(
      45deg,
      currentColor,
      currentColor 1px,
      transparent 1px,
      transparent 6px
    );
  }

  .bg-grid {
    background-image:
      linear-gradient(currentColor 1px, transparent 1px),
      linear-gradient(90deg, currentColor 1px, transparent 1px);
    background-size: 8px 8px;
  }
`;

export {
  StatusIndicator,
  ComplianceStatus,
  ExpiryStatus,
  PilotStatus,
  statusVariants,
  patternStyles,
  type StatusIndicatorProps
};