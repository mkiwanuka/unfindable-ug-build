// Unfindable Service Worker for Push Notifications

const APP_NAME = 'Unfindable';
const ICON_URL = '/favicon.ico';

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: APP_NAME,
    body: 'You have a new message',
    icon: ICON_URL,
    badge: ICON_URL,
    data: {},
  };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        data: payload.data || {},
      };
    }
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [200, 100, 200],
<<<<<<< HEAD
=======
    sound: '/notification-sound.wav',
>>>>>>> master-local/master
    requireInteraction: false,
    tag: 'message-notification',
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  const conversationId = event.notification.data?.conversationId;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            // Navigate to conversation if provided
            if (conversationId) {
              client.navigate(`/#/messages?chat=${conversationId}`);
            }
            return;
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          const url = conversationId 
            ? `/#/messages?chat=${conversationId}` 
            : urlToOpen;
          return clients.openWindow(url);
        }
      })
  );
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(clients.claim());
});
