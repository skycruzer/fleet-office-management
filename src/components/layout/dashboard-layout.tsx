"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Navigation, MainNavigation } from "@/components/ui/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Add keyboard shortcut support
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+N to toggle sidebar navigation
      if (event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);

        // Announce sidebar state change
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.className = "sr-only";
        announcement.textContent = `Sidebar ${sidebarOpen ? 'closed' : 'opened'}`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div
      className="min-h-screen bg-background"
      role="application"
      aria-label="B767 Fleet Management System"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-[9999] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <MainNavigation />

      <div className="flex" role="main">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside
          className="hidden md:flex md:w-64 md:flex-col border-r border-border"
          aria-label="Main navigation sidebar"
          id="main-navigation"
          role="complementary"
        >
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="px-3" role="navigation" aria-label="Primary navigation">
              <Navigation />
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0" role="main">
          <main
            className={cn(
              "flex-1 px-4 py-6 md:p-6 lg:p-8",
              "touch-manipulation",
              "safe-area-inset-bottom",
              "focus:outline-none", // Remove focus outline when programmatically focused
              className
            )}
            id="main-content"
            tabIndex={-1}
            role="main"
            aria-label="Main content area"
          >
            <div
              className="max-w-7xl mx-auto w-full space-y-6"
              role="region"
              aria-label="Fleet management dashboard content"
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="status-announcements"
        role="status"
      >
        {/* Dynamic announcements will be inserted here */}
      </div>

      {/* Live region for urgent/error announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="alert-announcements"
        role="alert"
      >
        {/* Urgent announcements will be inserted here */}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  const headingId = React.useId();
  const descriptionId = React.useId();

  return (
    <header
      className={cn("flex flex-col gap-4 pb-6", className)}
      role="banner"
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1
            id={headingId}
            className="aviation-page-header text-2xl md:text-3xl font-bold text-foreground"
            role="heading"
            aria-level={1}
          >
            {title}
          </h1>
          {description && (
            <p
              id={descriptionId}
              className="text-aviation-subtitle text-muted-foreground text-sm md:text-base"
              role="doc-subtitle"
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div
            className="flex items-center space-x-2"
            role="toolbar"
            aria-label="Page actions and controls"
            aria-describedby="toolbar-help"
          >
            {children}
            <span id="toolbar-help" className="sr-only">
              Page action buttons. Use Tab to navigate between actions.
            </span>
          </div>
        )}
      </div>
    </header>
  );
}