"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Plane,
  Users,
  Settings,
  BarChart3,
  AlertTriangle,
  Menu,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Fleet overview and metrics",
  },
  {
    title: "Pilots",
    href: "/pilots",
    icon: Users,
    description: "Pilot management and profiles",
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
    description: "Expiring checks and notifications",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("space-y-2", className)}
      aria-label="Main navigation"
      role="navigation"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-describedby={`nav-desc-${item.href.slice(1) || 'home'}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.title}
            <span
              id={`nav-desc-${item.href.slice(1) || 'home'}`}
              className="sr-only"
            >
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("md:hidden", className)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80"
        id="mobile-navigation"
        aria-label="Mobile navigation menu"
      >
        <div className="flex items-center gap-2 px-6 py-4">
          <Plane className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-bold text-lg">B767 Fleet</span>
        </div>
        <div className="px-6">
          <Navigation />
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MainNavigationProps {
  className?: string;
}

export function MainNavigation({ className }: MainNavigationProps) {
  const { user, signOut, userRole } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("border-b", className)}>
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <MobileNavigation />
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">
              B767 Fleet Management
            </span>
            <span className="font-bold text-lg sm:hidden">B767 Fleet</span>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span>Flight Operations Center</span>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`User menu for ${user.email}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="" />
                    <AvatarFallback aria-label={`User ${user.email}`}>
                      {getUserInitials(user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
                aria-label="User account menu"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userRole ? `Role: ${userRole}` : 'Flight Operations'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}