"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAccessibilityAnnouncements, useReducedMotion } from "@/hooks/use-accessibility";

// Live region for screen reader announcements
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: "polite" | "assertive" | "off";
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  priority = "polite",
  atomic = true,
  className
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}

// Enhanced skip links with more options
interface EnhancedSkipLinksProps {
  className?: string;
}

export function EnhancedSkipLinks({ className }: EnhancedSkipLinksProps) {
  return (
    <nav
      className={cn("skip-links", className)}
      aria-label="Skip navigation links"
    >
      <a
        href="#main-content"
        className="absolute left-[-10000px] top-auto overflow-hidden focus:left-6 focus:top-6 focus:w-auto focus:h-auto focus:overflow-visible z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute left-[-10000px] top-auto overflow-hidden focus:left-6 focus:top-16 focus:w-auto focus:h-auto focus:overflow-visible z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to navigation
      </a>
      <a
        href="#critical-alerts"
        className="absolute left-[-10000px] top-auto overflow-hidden focus:left-6 focus:top-24 focus:w-auto focus:h-auto focus:overflow-visible z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to critical alerts
      </a>
      <a
        href="#fleet-overview"
        className="absolute left-[-10000px] top-auto overflow-hidden focus:left-6 focus:top-32 focus:w-auto focus:h-auto focus:overflow-visible z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to fleet overview
      </a>
      <a
        href="#keyboard-shortcuts"
        className="absolute left-[-10000px] top-auto overflow-hidden focus:left-6 focus:top-40 focus:w-auto focus:h-auto focus:overflow-visible z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        View keyboard shortcuts
      </a>
    </nav>
  );
}

// Keyboard shortcuts help dialog trigger
interface KeyboardShortcutsHelpProps {
  className?: string;
}

export function KeyboardShortcutsHelp({ className }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const shortcuts = [
    { keys: ["Alt", "D"], description: "Navigate to Dashboard" },
    { keys: ["Alt", "P"], description: "Navigate to Pilots" },
    { keys: ["Alt", "A"], description: "Navigate to Alerts" },
    { keys: ["Alt", "S"], description: "Navigate to Settings" },
    { keys: ["Alt", "H"], description: "Focus skip links" },
    { keys: ["Alt", "M"], description: "Focus main content" },
    { keys: ["Escape"], description: "Close modal or focus main content" },
    { keys: ["Tab"], description: "Navigate forward" },
    { keys: ["Shift", "Tab"], description: "Navigate backward" },
    { keys: ["/"], description: "Focus search (when available)" },
  ];

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="shortcuts-title" className="text-xl font-semibold">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent"
              aria-label="Close keyboard shortcuts help"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these keyboard shortcuts to navigate the B767 Fleet Management system efficiently.
            </p>
            <div className="grid gap-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-accent/50"
                >
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded text-muted-foreground font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Ctrl</kbd> +
                <kbd className="px-1 py-0.5 bg-muted border rounded text-xs ml-1">?</kbd> to open this help dialog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Accessible loading indicator with screen reader support
interface AccessibleLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AccessibleLoading({
  message = "Loading",
  size = "md",
  className
}: AccessibleLoadingProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "border-2 border-primary border-t-transparent rounded-full",
          sizeClasses[size],
          !prefersReducedMotion && "animate-spin"
        )}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">
        {message}
      </span>
      <span className="sr-only">
        {message}. Please wait.
      </span>
    </div>
  );
}

// Error boundary with accessibility features
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class AccessibleErrorBoundary extends React.Component<
  AccessibleErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: AccessibleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Accessible Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Announce error to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "assertive");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `An error occurred: ${error.message}. Please try refreshing the page or contact support.`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={() => this.setState({ hasError: false, error: null })}
          />
        );
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 border border-destructive/50 rounded-lg bg-destructive/5"
        >
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            We encountered an unexpected error. This has been logged for our support team.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-describedby="error-retry-description"
          >
            Try again
          </button>
          <p id="error-retry-description" className="sr-only">
            Retry the failed operation
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Progress indicator with accessibility features
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "destructive";
  showPercentage?: boolean;
  className?: string;
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  description,
  size = "md",
  variant = "default",
  showPercentage = true,
  className,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-orange-500",
    destructive: "bg-red-500",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-muted-foreground" aria-label={`${percentage} percent complete`}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-secondary rounded-full overflow-hidden",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
        aria-describedby={description ? `progress-description-${Math.random().toString(36).substr(2, 9)}` : undefined}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p
          id={`progress-description-${Math.random().toString(36).substr(2, 9)}`}
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      )}
      <span className="sr-only">
        {label} progress: {value} of {max} ({percentage}% complete)
        {description && `. ${description}`}
      </span>
    </div>
  );
}

// Focus trap utility component
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}