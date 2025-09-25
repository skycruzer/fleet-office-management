/**
 * Push Notification Service for Fleet Management System
 * Handles critical flight alerts and real-time notifications
 */

import { supabase } from './supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  category?: 'certification' | 'compliance' | 'maintenance' | 'scheduling' | 'emergency';
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationPreferences {
  enabled: boolean;
  certificationExpiry: boolean;
  complianceAlerts: boolean;
  maintenanceReminders: boolean;
  scheduleChanges: boolean;
  emergencyAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  sound: boolean;
  vibration: boolean;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private preferences: NotificationPreferences;
  private isSupported: boolean;

  constructor() {
    this.isSupported = this.checkSupport();
    this.preferences = this.loadPreferences();
    this.initialize();
  }

  /**
   * Check if notifications are supported
   */
  private checkSupport(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Initialize notification service
   */
  private async initialize() {
    if (!this.isSupported) {
      console.warn('Fleet Management: Push notifications not supported');
      return;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;

      // Get existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      // Set up message handling
      this.setupMessageHandling();

      console.log('Fleet Management: Notification service initialized');
    } catch (error) {
      console.error('Fleet Management: Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      await this.subscribe();
    }

    return permission;
  }

  /**
   * Get current notification permission
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<boolean> {
    if (!this.registration || this.getPermission() !== 'granted') {
      return false;
    }

    try {
      // VAPID key should be stored in environment variables
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('Fleet Management: VAPID public key not configured');
        return false;
      }

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer();

      console.log('Fleet Management: Push subscription created');
      return true;
    } catch (error) {
      console.error('Fleet Management: Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return true;

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer();
      this.subscription = null;

      console.log('Fleet Management: Push subscription removed');
      return true;
    } catch (error) {
      console.error('Fleet Management: Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Show local notification
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration || this.getPermission() !== 'granted') {
      console.warn('Fleet Management: Cannot show notification - permission denied');
      return;
    }

    // Check quiet hours
    if (!this.shouldShowNotification(payload)) {
      return;
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: payload.tag || `fleet-${Date.now()}`,
      data: {
        ...payload.data,
        timestamp: payload.timestamp || Date.now(),
        priority: payload.priority || 'normal'
      },
      requireInteraction: payload.requireInteraction || payload.priority === 'critical',
      silent: payload.silent || false,
      vibrate: this.preferences.vibration ? (payload.vibrate || [200, 100, 200]) : [],
      actions: payload.actions?.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon
      }))
    };

    await this.registration.showNotification(payload.title, options);
  }

  /**
   * Show certification expiry alert
   */
  async showCertificationAlert(pilotName: string, checkType: string, daysUntilExpiry: number): Promise<void> {
    if (!this.preferences.certificationExpiry) return;

    const priority = daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 30 ? 'high' : 'normal';
    const emoji = daysUntilExpiry <= 7 ? '🚨' : '⚠️';

    await this.showNotification({
      title: `${emoji} Certification Expiring`,
      body: `${pilotName}'s ${checkType} expires in ${daysUntilExpiry} days`,
      tag: `cert-${pilotName}-${checkType}`,
      priority,
      category: 'certification',
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'schedule', title: 'Schedule Renewal' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: priority === 'critical',
      data: {
        pilotName,
        checkType,
        daysUntilExpiry,
        url: '/alerts'
      }
    });
  }

  /**
   * Show compliance alert
   */
  async showComplianceAlert(message: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    if (!this.preferences.complianceAlerts) return;

    const icons = {
      low: '📋',
      medium: '⚠️',
      high: '🚨',
      critical: '🔴'
    };

    await this.showNotification({
      title: `${icons[severity]} Fleet Compliance Alert`,
      body: message,
      priority: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'normal',
      category: 'compliance',
      requireInteraction: severity === 'critical',
      actions: [
        { action: 'view', title: 'View Dashboard' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: {
        severity,
        url: '/alerts'
      }
    });
  }

  /**
   * Show emergency alert
   */
  async showEmergencyAlert(title: string, message: string, actionUrl?: string): Promise<void> {
    if (!this.preferences.emergencyAlerts) return;

    await this.showNotification({
      title: `🆘 EMERGENCY: ${title}`,
      body: message,
      priority: 'critical',
      category: 'emergency',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      actions: [
        { action: 'respond', title: 'Respond' },
        { action: 'acknowledge', title: 'Acknowledge' }
      ],
      data: {
        emergency: true,
        url: actionUrl || '/alerts'
      }
    });
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if subscription is active
   */
  isSubscribed(): boolean {
    return this.subscription !== null && this.getPermission() === 'granted';
  }

  /**
   * Private helper methods
   */
  private shouldShowNotification(payload: NotificationPayload): boolean {
    // Always show emergency notifications
    if (payload.priority === 'critical' || payload.category === 'emergency') {
      return true;
    }

    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return false;
    }

    // Check category-specific preferences
    const categoryEnabled = {
      certification: this.preferences.certificationExpiry,
      compliance: this.preferences.complianceAlerts,
      maintenance: this.preferences.maintenanceReminders,
      scheduling: this.preferences.scheduleChanges,
      emergency: this.preferences.emergencyAlerts
    };

    if (payload.category && !categoryEnabled[payload.category]) {
      return false;
    }

    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const isInQuietHours = this.isTimeInRange(
        currentTime,
        this.preferences.quietHours.start,
        this.preferences.quietHours.end
      );

      if (isInQuietHours && payload.priority !== 'critical') {
        return false;
      }
    }

    return true;
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    const [timeHour, timeMin] = time.split(':').map(Number);
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const timeMinutes = timeHour * 60 + timeMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
      return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    } else {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem('fleet-notification-preferences');
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Fleet Management: Failed to load notification preferences:', error);
    }

    return this.getDefaultPreferences();
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('fleet-notification-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Fleet Management: Failed to save notification preferences:', error);
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      certificationExpiry: true,
      complianceAlerts: true,
      maintenanceReminders: true,
      scheduleChanges: false,
      emergencyAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      },
      sound: true,
      vibration: true
    };
  }

  private setupMessageHandling(): void {
    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'NOTIFICATION_CLICKED':
          this.handleNotificationClick(data);
          break;
        case 'NOTIFICATION_CLOSED':
          this.handleNotificationClose(data);
          break;
      }
    });
  }

  private handleNotificationClick(data: any): void {
    console.log('Fleet Management: Notification clicked:', data);

    // Navigate to appropriate page based on notification data
    if (data.url) {
      window.open(data.url, '_blank');
    }
  }

  private handleNotificationClose(data: any): void {
    console.log('Fleet Management: Notification closed:', data);
  }

  private async sendSubscriptionToServer(): Promise<void> {
    if (!this.subscription) return;

    try {
      // In a real implementation, you would send this to your backend
      const subscriptionData = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')!)))
        },
        timestamp: Date.now()
      };

      // For now, store in localStorage as fallback
      localStorage.setItem('fleet-push-subscription', JSON.stringify(subscriptionData));

      console.log('Fleet Management: Subscription saved');
    } catch (error) {
      console.error('Fleet Management: Failed to save subscription:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      // In a real implementation, you would call your backend to remove the subscription
      localStorage.removeItem('fleet-push-subscription');
      console.log('Fleet Management: Subscription removed from server');
    } catch (error) {
      console.error('Fleet Management: Failed to remove subscription from server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// React hook for using notification service
export function useNotifications() {
  const [permission, setPermission] = React.useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [isSubscribed, setIsSubscribed] = React.useState(
    notificationService.isSubscribed()
  );

  const requestPermission = async (): Promise<NotificationPermission> => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    setIsSubscribed(notificationService.isSubscribed());
    return newPermission;
  };

  const subscribe = async (): Promise<boolean> => {
    const result = await notificationService.subscribe();
    setIsSubscribed(notificationService.isSubscribed());
    return result;
  };

  const unsubscribe = async (): Promise<boolean> => {
    const result = await notificationService.unsubscribe();
    setIsSubscribed(notificationService.isSubscribed());
    return result;
  };

  return {
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification: notificationService.showNotification.bind(notificationService),
    updatePreferences: notificationService.updatePreferences.bind(notificationService),
    getPreferences: notificationService.getPreferences.bind(notificationService),
    isSupported: notificationService['isSupported']
  };
}

export default notificationService;