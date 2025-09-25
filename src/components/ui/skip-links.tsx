"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Position off-screen by default
        "absolute left-[-10000px] top-auto overflow-hidden",
        // Focus styles - bring on screen when focused
        "focus:left-6 focus:top-6 focus:w-auto focus:h-auto focus:overflow-visible",
        // Styling
        "z-[9999] bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md text-sm font-medium",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.focus();
          }
        }
      }}
    >
      {children}
    </a>
  );
}

interface SkipLinksProps {
  className?: string;
}

export function SkipLinks({ className }: SkipLinksProps) {
  return (
    <nav
      className={cn("skip-links", className)}
      aria-label="Skip navigation links"
    >
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#main-navigation">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#critical-alerts">
        Skip to critical alerts
      </SkipLink>
      <SkipLink href="#fleet-overview">
        Skip to fleet overview
      </SkipLink>
    </nav>
  );
}

export { SkipLink };