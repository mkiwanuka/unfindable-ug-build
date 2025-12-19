import { supabase } from '../src/integrations/supabase/client';

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

// Save subscription to database
export async function savePushSubscription(
  userId: string, 
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const subscriptionData = subscription.toJSON();
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys?.p256dh,
        auth: subscriptionData.keys?.auth,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,endpoint',
      });
    
    if (error) {
      console.error('Failed to save push subscription:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from database
      const subscriptionData = subscription.toJSON();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscriptionData.endpoint);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

// Get current push subscription status
export async function getPushSubscriptionStatus(): Promise<{
  supported: boolean;
  subscribed: boolean;
  permission: NotificationPermission | 'unsupported';
}> {
  if (!isPushSupported()) {
    return { supported: false, subscribed: false, permission: 'unsupported' };
  }
  
  const permission = Notification.permission;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return {
      supported: true,
      subscribed: !!subscription,
      permission,
    };
  } catch {
    return { supported: true, subscribed: false, permission };
  }
}

// Initialize push notifications (call after login)
export async function initPushNotifications(
  userId: string, 
  vapidPublicKey: string
): Promise<boolean> {
  if (!isPushSupported()) {
    console.log('Push notifications not supported');
    return false;
  }
  
  // Register service worker
  const registration = await registerServiceWorker();
  if (!registration) return false;
  
  // Request notification permission if not already granted
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied');
      return false;
    }
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Push notification permission not granted');
    return false;
  }
  
  // Subscribe to push
  const subscription = await subscribeToPush(vapidPublicKey);
  if (!subscription) return false;
  
  // Save subscription to database
  return await savePushSubscription(userId, subscription);
}
