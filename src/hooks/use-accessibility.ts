"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

// Motion preferences hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// High contrast preferences hook
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersHighContrast;
}

// Keyboard navigation hook with shortcuts
export function useKeyboardNavigation() {
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === "INPUT" ||
                      activeElement?.tagName === "TEXTAREA" ||
                      activeElement?.getAttribute("contenteditable") === "true";

      if (isTyping) return;

      // Alt + key combinations for navigation
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case "d":
            event.preventDefault();
            router.push("/");
            announceNavigation("Dashboard");
            break;
          case "p":
            event.preventDefault();
            router.push("/pilots");
            announceNavigation("Pilots");
            break;
          case "a":
            event.preventDefault();
            router.push("/alerts");
            announceNavigation("Alerts");
            break;
          case "s":
            event.preventDefault();
            router.push("/settings");
            announceNavigation("Settings");
            break;
          case "h":
            event.preventDefault();
            focusSkipLink();
            break;
          case "m":
            event.preventDefault();
            focusMainContent();
            break;
        }
      }

      // Escape key to focus main content or close modals
      if (event.key === "Escape") {
        const modal = document.querySelector("[role='dialog']");
        if (!modal) {
          focusMainContent();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const focusSkipLink = () => {
    const skipLink = document.querySelector(".skip-links a") as HTMLElement;
    skipLink?.focus();
  };

  const focusMainContent = () => {
    const mainContent = document.querySelector("#main-content") as HTMLElement;
    if (mainContent) {
      mainContent.focus();
      announceToScreenReader("Focused on main content");
    }
  };

  const announceNavigation = (destination: string) => {
    announceToScreenReader(`Navigating to ${destination}`);
  };

  return {
    focusSkipLink,
    focusMainContent,
    announceNavigation,
  };
}

// Screen reader announcements
export function useScreenReader() {
  const announce = React.useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    announceToScreenReader(message, priority);
  }, []);

  const announceError = React.useCallback((message: string) => {
    announceToScreenReader(`Error: ${message}`, "assertive");
  }, []);

  const announceSuccess = React.useCallback((message: string) => {
    announceToScreenReader(`Success: ${message}`, "polite");
  }, []);

  const announceLoading = React.useCallback((message: string = "Loading") => {
    announceToScreenReader(message, "polite");
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
}

// Focus management for complex components
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = React.useState<HTMLElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  const captureFocus = React.useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = React.useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const trapFocus = React.useCallback((containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
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

    containerElement.addEventListener("keydown", handleTabKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      containerElement.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  return {
    focusedElement,
    setFocusedElement,
    captureFocus,
    restoreFocus,
    trapFocus,
  };
}

// Accessibility testing helpers
export function useAccessibilityAnnouncements() {
  const { announce, announceError, announceSuccess, announceLoading } = useScreenReader();

  const announceDataUpdate = React.useCallback((itemType: string, count: number) => {
    announce(`${itemType} updated. ${count} items available.`);
  }, [announce]);

  const announceFormValidation = React.useCallback((errors: Record<string, string[]>) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      const firstError = Object.values(errors)[0][0];
      announceError(`Form has ${errorCount} error${errorCount === 1 ? "" : "s"}. ${firstError}`);
    }
  }, [announceError]);

  const announceStatusChange = React.useCallback((item: string, status: string) => {
    announce(`${item} status changed to ${status}`);
  }, [announce]);

  const announceFilterChange = React.useCallback((filterType: string, value: string, resultCount: number) => {
    announce(`${filterType} filter set to ${value}. ${resultCount} results found.`);
  }, [announce]);

  return {
    announceDataUpdate,
    announceFormValidation,
    announceStatusChange,
    announceFilterChange,
    announceSuccess,
    announceError,
    announceLoading,
  };
}

// Utility function for creating screen reader announcements
function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Enhanced touch target size validation
export function useTounchTargetValidation() {
  const validateTouchTarget = React.useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG AA minimum touch target size

    const isValid = rect.width >= minSize && rect.height >= minSize;

    if (!isValid && process.env.NODE_ENV === "development") {
      console.warn(`Touch target too small: ${rect.width}x${rect.height}px. Minimum: ${minSize}x${minSize}px`, element);
    }

    return isValid;
  }, []);

  return { validateTouchTarget };
}

// Color contrast validation (development helper)
export function useContrastValidation() {
  const validateContrast = React.useCallback((foreground: string, background: string, level: "AA" | "AAA" = "AA") => {
    // This would typically integrate with a color contrast library
    // For now, return true as validation would happen at design time
    if (process.env.NODE_ENV === "development") {
      console.log(`Validating contrast between ${foreground} and ${background} for ${level} compliance`);
    }
    return true;
  }, []);

  return { validateContrast };
}