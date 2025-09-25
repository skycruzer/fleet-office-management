"use client";

import * as React from "react";
import {
  useKeyboardNavigation,
  useReducedMotion,
  useHighContrast,
  useAccessibilityAnnouncements,
} from "@/hooks/use-accessibility";

interface AccessibilityContextType {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  announceSuccess: (message: string) => void;
  announceError: (message: string) => void;
  announceLoading: (message?: string) => void;
  announceDataUpdate: (itemType: string, count: number) => void;
  announceStatusChange: (item: string, status: string) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();
  const {
    announceSuccess,
    announceError,
    announceLoading,
    announceDataUpdate,
    announceStatusChange,
  } = useAccessibilityAnnouncements();

  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Add accessibility classes to body
  React.useEffect(() => {
    const body = document.body;

    if (prefersReducedMotion) {
      body.classList.add("reduce-motion");
    } else {
      body.classList.remove("reduce-motion");
    }

    if (prefersHighContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }

    // Add focus-visible polyfill class
    body.classList.add("js-focus-visible");

    return () => {
      body.classList.remove("reduce-motion", "high-contrast", "js-focus-visible");
    };
  }, [prefersReducedMotion, prefersHighContrast]);

  // Handle focus visible detection
  React.useEffect(() => {
    let hadKeyboardEvent = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }

      hadKeyboardEvent = true;
      document.body.classList.add("keyboard-nav-visible");
    };

    const handlePointerDown = () => {
      hadKeyboardEvent = false;
      document.body.classList.remove("keyboard-nav-visible");
    };

    const handleFocus = (e: FocusEvent) => {
      if (hadKeyboardEvent || (e.target as Element)?.matches?.(':focus-visible')) {
        document.body.classList.add("keyboard-nav-visible");
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("focus", handleFocus, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("focus", handleFocus, true);
    };
  }, []);

  // Add landmark regions and page structure announcements
  React.useEffect(() => {
    // Announce page structure on first load
    const announcePageStructure = () => {
      const regions = [
        'banner',
        'navigation',
        'main',
        'complementary',
        'contentinfo'
      ];

      const foundRegions = regions.filter(role =>
        document.querySelector(`[role="${role}"]`)
      );

      if (foundRegions.length > 0) {
        const announcement = `Page structure: ${foundRegions.join(', ')} regions available.`;
        setTimeout(() => announceLoading(announcement), 500);
      }
    };

    // Only announce on initial page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', announcePageStructure);
    } else {
      announcePageStructure();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', announcePageStructure);
    };
  }, [announceLoading]);

  const value: AccessibilityContextType = {
    prefersReducedMotion,
    prefersHighContrast,
    announceSuccess,
    announceError,
    announceLoading,
    announceDataUpdate,
    announceStatusChange,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Hook for announcing route changes
export function useRouteAnnouncements() {
  const { announceLoading } = useAccessibilityAnnouncements();

  return React.useCallback((routeName: string) => {
    announceLoading(`Navigated to ${routeName}`);
  }, [announceLoading]);
}

// Hook for form validation announcements
export function useFormAccessibility() {
  const { announceError, announceSuccess } = useAccessibilityAnnouncements();

  const announceValidationError = React.useCallback((fieldName: string, error: string) => {
    announceError(`${fieldName}: ${error}`);
  }, [announceError]);

  const announceValidationSuccess = React.useCallback(() => {
    announceSuccess("Form submitted successfully");
  }, [announceSuccess]);

  const announceFieldChange = React.useCallback((fieldName: string, value: string) => {
    // Only announce important field changes to avoid spam
    if (value && value.length > 0) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `${fieldName} updated`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, []);

  return {
    announceValidationError,
    announceValidationSuccess,
    announceFieldChange,
  };
}

// Hook for data table announcements
export function useDataTableAccessibility() {
  const { announceDataUpdate } = useAccessibilityAnnouncements();

  const announceSortChange = React.useCallback((column: string, direction: 'asc' | 'desc') => {
    const announcement = `Table sorted by ${column} in ${direction === 'asc' ? 'ascending' : 'descending'} order`;
    announceDataUpdate("Table data", 1);

    setTimeout(() => {
      const element = document.createElement("div");
      element.setAttribute("aria-live", "polite");
      element.className = "sr-only";
      element.textContent = announcement;
      document.body.appendChild(element);
      setTimeout(() => document.body.removeChild(element), 1000);
    }, 100);
  }, [announceDataUpdate]);

  const announceFilterChange = React.useCallback((filterType: string, value: string, resultCount: number) => {
    const announcement = `${filterType} filter applied. ${resultCount} result${resultCount === 1 ? '' : 's'} shown`;
    announceDataUpdate("Filtered data", resultCount);

    setTimeout(() => {
      const element = document.createElement("div");
      element.setAttribute("aria-live", "polite");
      element.className = "sr-only";
      element.textContent = announcement;
      document.body.appendChild(element);
      setTimeout(() => document.body.removeChild(element), 1000);
    }, 100);
  }, [announceDataUpdate]);

  const announcePageChange = React.useCallback((currentPage: number, totalPages: number) => {
    const announcement = `Showing page ${currentPage} of ${totalPages}`;
    const element = document.createElement("div");
    element.setAttribute("aria-live", "polite");
    element.className = "sr-only";
    element.textContent = announcement;
    document.body.appendChild(element);
    setTimeout(() => document.body.removeChild(element), 1000);
  }, []);

  return {
    announceSortChange,
    announceFilterChange,
    announcePageChange,
  };
}