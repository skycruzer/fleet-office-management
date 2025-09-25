import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { EnhancedSkipLinks, KeyboardShortcutsHelp } from "@/components/ui/accessibility";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B767 Fleet Management",
  description: "Professional aviation fleet management system for B767 aircraft operations",
  keywords: "aviation, fleet management, pilot certification, compliance, B767, aircraft operations",
  authors: [{ name: "Fleet Operations Center" }],
  creator: "Fleet Management System",
  publisher: "Aviation Operations",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA Configuration
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fleet Management",
    startupImage: [
      {
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-640x1136.png"
      },
      {
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-750x1334.png"
      },
      {
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-828x1792.png"
      }
    ]
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Fleet Management',
    'msapplication-TileColor': '#0f172a',
    'msapplication-config': '/browserconfig.xml'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#3b82f6" />

        {/* Performance and Security */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('Fleet Management SW: Service worker registered successfully');

                      // Handle updates
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Fleet Management SW: New version available, reload to update');
                            // Show update notification
                            if (window.dispatchEvent) {
                              window.dispatchEvent(new CustomEvent('swUpdate'));
                            }
                          }
                        });
                      });

                      // Register for background sync
                      if ('sync' in window.ServiceWorkerRegistration.prototype) {
                        return registration.sync.register('fleet-data-sync');
                      }
                    })
                    .catch(function(error) {
                      console.warn('Fleet Management SW: Service worker registration failed:', error);
                    });
                });

                // Handle service worker messages
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data.type === 'SYNC_COMPLETE') {
                    console.log('Fleet Management SW: Background sync completed');
                    // Optionally refresh data
                  }
                });
              }

              // Handle online/offline events
              window.addEventListener('online', function() {
                console.log('Fleet Management: Connection restored');
                document.body.classList.remove('offline');
              });

              window.addEventListener('offline', function() {
                console.log('Fleet Management: Connection lost, switching to offline mode');
                document.body.classList.add('offline');
              });
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <EnhancedSkipLinks />
        <KeyboardShortcutsHelp />
        <AccessibilityProvider>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </AccessibilityProvider>
        <div id="keyboard-shortcuts" className="sr-only" tabIndex={-1}>
          Keyboard shortcuts available. Press Ctrl+? for help.
        </div>
      </body>
    </html>
  );
}
