"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return "Light theme active"
      case "dark": return "Dark theme active"
      case "system": return "System theme active"
      default: return "Theme selector"
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setIsOpen(false)

    // Announce theme change to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Theme changed to ${newTheme}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "aviation-interactive relative overflow-hidden",
            "hover:border-primary hover:bg-accent",
            "dark:hover:bg-accent dark:hover:border-primary",
            "min-h-[44px] min-w-[44px]", // Touch target size
            "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "focus-visible:ring-2 focus-visible:ring-primary",
            className
          )}
          aria-label={getThemeLabel()}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-describedby="theme-toggle-description"
        >
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
            role="img"
            focusable="false"
          />
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
            aria-hidden="true"
            role="img"
            focusable="false"
          />
          <span className="sr-only">{getThemeLabel()}. Click to change theme.</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="aviation-shadow-md dark:aviation-shadow-lg border-border/50"
        role="menu"
        aria-label="Theme selection menu"
        onCloseAutoFocus={(e) => {
          // Keep focus on trigger button
          e.preventDefault();
        }}
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={cn(
            "aviation-interactive cursor-pointer",
            "hover:bg-accent/50 dark:hover:bg-accent/50",
            "focus:bg-accent focus:text-accent-foreground",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
          role="menuitem"
          aria-checked={theme === "light"}
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" role="img" focusable="false" />
          <span className="text-aviation-base">Light</span>
          {theme === "light" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={cn(
            "aviation-interactive cursor-pointer",
            "hover:bg-accent/50 dark:hover:bg-accent/50",
            "focus:bg-accent focus:text-accent-foreground",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
          role="menuitem"
          aria-checked={theme === "dark"}
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" role="img" focusable="false" />
          <span className="text-aviation-base">Dark</span>
          {theme === "dark" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={cn(
            "aviation-interactive cursor-pointer",
            "hover:bg-accent/50 dark:hover:bg-accent/50",
            "focus:bg-accent focus:text-accent-foreground",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
          role="menuitem"
          aria-checked={theme === "system"}
        >
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" role="img" focusable="false" />
          <span className="text-aviation-base">System</span>
          {theme === "system" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <div
        id="theme-toggle-description"
        className="sr-only"
      >
        Select between light, dark, or system theme preferences
      </div>
    </DropdownMenu>
  )
}

export function ThemeToggleSimple({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode"
      case "dark":
        return "Switch to system theme"
      default:
        return "Switch to light mode"
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "aviation-interactive",
        "hover:bg-accent hover:text-accent-foreground",
        "dark:hover:bg-accent dark:hover:text-accent-foreground",
        className
      )}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  )
}