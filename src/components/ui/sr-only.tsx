"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Screen reader only component - visually hidden but accessible to screen readers
 * Follows WCAG guidelines for visually hidden content
 */
export function SrOnly({ children, className, as: Component = "span" }: SrOnlyProps) {
  return (
    <Component
      className={cn(
        // Visually hidden but accessible to screen readers
        "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden",
        "clip-path-[inset(50%)] border-0 whitespace-nowrap",
        // Alternative method for better browser support
        "sr-only",
        className
      )}
    >
      {children}
    </Component>
  );
}

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  className?: string;
}

/**
 * Live region component for announcing dynamic content changes
 * Used for status updates and alerts that should be announced to screen readers
 */
export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  className
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
      role="status"
    >
      {children}
    </div>
  );
}

interface StatusAnnouncementProps {
  message: string;
  priority?: "low" | "medium" | "high";
  className?: string;
}

/**
 * Component for announcing status changes with appropriate priority
 * High priority uses assertive, others use polite
 */
export function StatusAnnouncement({
  message,
  priority = "medium",
  className
}: StatusAnnouncementProps) {
  const politeness = priority === "high" ? "assertive" : "polite";

  return (
    <LiveRegion politeness={politeness} className={className}>
      {message}
    </LiveRegion>
  );
}