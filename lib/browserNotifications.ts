// Browser Notification API wrapper

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
}

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    conversationId?: string;
    url?: string;
  };
}

export function showBrowserNotification(options: BrowserNotificationOptions): Notification | null {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;
  
  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/favicon.ico',
    badge: options.badge,
    tag: options.tag || 'message-notification',
    data: options.data,
  });
  
  // Handle notification click - focus window and navigate to conversation
  notification.onclick = () => {
    window.focus();
    if (options.data?.conversationId) {
      window.location.hash = `/messages?chat=${options.data.conversationId}`;
    } else if (options.data?.url) {
      window.location.href = options.data.url;
    }
    notification.close();
  };
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
  
  return notification;
}

// Show notification only when tab is not focused
export function showBrowserNotificationIfBackgrounded(options: BrowserNotificationOptions): Notification | null {
  if (document.hasFocus()) return null;
  return showBrowserNotification(options);
}
