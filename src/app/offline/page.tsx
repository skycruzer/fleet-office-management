import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2, Plane } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline - B767 Fleet Management',
  description: 'Fleet management system operating in offline mode',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <Plane className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Fleet Operations</h1>
          <p className="text-slate-300">B767 Flight Management System</p>
        </div>

        {/* Offline Status Card */}
        <Card className="border-orange-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
              <WifiOff className="w-6 h-6 text-orange-400" />
            </div>
            <CardTitle className="text-white">Currently Offline</CardTitle>
            <CardDescription className="text-slate-300">
              Limited functionality available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Offline Mode Active
              </Badge>
              <p className="text-sm text-slate-300">
                Critical flight operations data is cached locally. Reconnect to access live data and full functionality.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Available Features:</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Cached pilot directory
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Last compliance status
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Certification alerts
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Limited to cached data
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Connection
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Continue Offline
          </Button>
        </div>

        {/* Connection Tips */}
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-white mb-2">Connection Tips:</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify aircraft WiFi is connected</li>
              <li>• Try switching between cellular and WiFi</li>
              <li>• Contact IT support if issues persist</li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          Fleet Management System v1.0.0<br />
          Aviation Operations Center
        </div>
      </div>

      {/* Network status detection */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Monitor network status
          window.addEventListener('online', function() {
            const badge = document.querySelector('[data-status-badge]');
            if (badge) {
              badge.textContent = 'Connection Restored';
              badge.className = badge.className.replace('bg-orange-500/20 text-orange-300', 'bg-green-500/20 text-green-300');
            }
            setTimeout(() => window.location.href = '/', 1000);
          });

          window.addEventListener('offline', function() {
            console.log('Network connection lost');
          });

          // Check connection status
          if (navigator.onLine) {
            setTimeout(() => window.location.href = '/', 500);
          }
        `
      }} />
    </div>
  );
}