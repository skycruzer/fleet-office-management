"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Navigation, MainNavigation } from "@/components/ui/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside
          className="hidden md:flex md:w-64 md:flex-col"
          aria-label="Main navigation"
          id="main-navigation"
        >
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="px-3">
              <Navigation />
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main
            className={cn("flex-1 p-4 md:p-6 lg:p-8", className)}
            id="main-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
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
  return (
    <header className={cn("flex flex-col gap-4 pb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground" id="page-description">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2" role="toolbar" aria-label="Page actions">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}