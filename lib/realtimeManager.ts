import { supabase } from '../src/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'requests' | 'messages' | 'notifications' | 'offers';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
type Callback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

interface Subscription {
  table: TableName;
  event: EventType;
  callback: Callback;
}

class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private subscriptions: Set<Subscription> = new Set();
  private initialized = false;
  private isReady = false;
  private readyCallbacks: (() => void)[] = []; // One-shot callbacks for waitForReady()
  private readyListeners: Set<() => void> = new Set(); // Persistent listeners for onReady()
  private reconnectTimer: number | null = null;
  
  // Health check properties
  public lastEventTime = Date.now();
  private healthCheckInterval: number | null = null;

  get isInitialized(): boolean {
    return this.initialized;
  }

  init() {
    // If already initialized with an active channel, don't reinitialize
    if (this.initialized && this.channel) {
      console.log('[RealtimeManager] Already initialized, skipping');
      return;
    }
    
    this.initialized = true;
    this.isReady = false;

    console.log('[RealtimeManager] Initializing global channel');

    this.channel = supabase
      .channel('global-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          console.log('[RealtimeManager] RAW postgres_changes received for requests:', payload);
          this.lastEventTime = Date.now();
          this.emit('requests', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[RealtimeManager] RAW postgres_changes received for messages:', payload);
          this.lastEventTime = Date.now();
          this.emit('messages', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('[RealtimeManager] RAW postgres_changes received for notifications:', payload);
          this.lastEventTime = Date.now();
          this.emit('notifications', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        (payload) => {
          console.log('[RealtimeManager] RAW postgres_changes received for offers:', payload);
          this.lastEventTime = Date.now();
          this.emit('offers', payload);
        }
      )
      .subscribe((status, err) => {
        console.log('[RealtimeManager] Channel status:', status, err ? err : '');
        
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeManager] Channel is now ready');
          this.isReady = true;
          this.lastEventTime = Date.now();
          
          // Execute one-shot callbacks (for waitForReady() promises)
          this.readyCallbacks.forEach(cb => {
            try { 
              cb(); 
            } catch (e) { 
              console.error('[RealtimeManager] Ready callback error:', e); 
            }
          });
          this.readyCallbacks = [];
          
          // Execute persistent listeners (for badge hooks - fires on EVERY reconnect)
          console.log('[RealtimeManager] Executing', this.readyListeners.size, 'persistent ready listeners');
          this.readyListeners.forEach(cb => {
            try { 
              cb(); 
            } catch (e) { 
              console.error('[RealtimeManager] Ready listener error:', e); 
            }
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('[RealtimeManager] Channel error/timeout, will reconnect');
          this.isReady = false;
          this.forceReconnect();
        }
      });

    // Start health check
    this.startHealthCheck();

    // Reconnect on tab visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = window.setInterval(() => {
      const inactive = Date.now() - this.lastEventTime;

      if (inactive > 60000) {
        console.log('[RealtimeManager] Health check: stale channel detected (60s inactive) → reconnect');
        this.forceReconnect();
      }
    }, 15000);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const inactive = Date.now() - this.lastEventTime;
      console.log('[RealtimeManager] Tab became visible, inactive for:', Math.round(inactive / 1000), 'seconds');

      if (inactive > 30000) {
        console.log('[RealtimeManager] Tab active after 30s+ inactivity → forcing reconnect');
        this.forceReconnect();
      }
    }
  };

  private forceReconnect() {
    console.log('[RealtimeManager] Forcing channel reconnect');

    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = null;
    this.initialized = false;
    this.isReady = false;

    // Small delay before reinitializing
    setTimeout(() => this.init(), 300);
  }

  private emit(table: TableName, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    this.lastEventTime = Date.now();
    
    const eventType = payload.eventType as EventType;
    console.log(`[RealtimeManager] Emitting ${table}:${eventType}`, payload);
    
    this.subscriptions.forEach((sub) => {
      if (sub.table === table && (sub.event === '*' || sub.event === eventType)) {
        try {
          sub.callback(payload);
        } catch (error) {
          console.error('[RealtimeManager] Error in callback:', error);
        }
      }
    });
  }

  subscribe(table: TableName, event: EventType, callback: Callback): () => void {
    // Auto-initialize if not already done
    if (!this.initialized) {
      this.init();
    }

    const subscription: Subscription = { table, event, callback };
    this.subscriptions.add(subscription);

    console.log(`[RealtimeManager] Subscribed to ${table}:${event}, total: ${this.subscriptions.size}, ready: ${this.isReady}`);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscription);
      console.log(`[RealtimeManager] Unsubscribed from ${table}:${event}, total: ${this.subscriptions.size}`);
    };
  }

  // Wait for channel to be ready
  waitForReady(): Promise<void> {
    if (this.isReady) {
      console.log('[RealtimeManager] Already ready, resolving immediately');
      return Promise.resolve();
    }
    console.log('[RealtimeManager] Waiting for channel to be ready...');
    return new Promise(resolve => {
      this.readyCallbacks.push(resolve);
    });
  }

  // Register persistent callback for when channel becomes ready (fires on every reconnect)
  onReady(callback: () => void): () => void {
    // If already ready, execute immediately
    if (this.isReady) {
      console.log('[RealtimeManager] Already ready, executing callback immediately');
      callback();
    }
    
    // Always add to persistent listeners (for future reconnects)
    this.readyListeners.add(callback);
    console.log('[RealtimeManager] Registered persistent ready listener, total:', this.readyListeners.size);
    
    // Return unsubscribe function
    return () => {
      this.readyListeners.delete(callback);
      console.log('[RealtimeManager] Removed ready listener, total:', this.readyListeners.size);
    };
  }

  // Get current ready state
  getReadyState(): boolean {
    return this.isReady;
  }

  // Only cleanup if there are no active subscriptions (prevents StrictMode issues)
  cleanup() {
    if (this.subscriptions.size > 0) {
      console.log('[RealtimeManager] Skipping cleanup - active subscriptions:', this.subscriptions.size);
      return;
    }
    
    if (this.channel) {
      console.log('[RealtimeManager] Cleaning up global channel');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.initialized = false;
      this.isReady = false;
    }
  }

  // Force cleanup - only use when app is truly unmounting
  forceCleanup() {
    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Remove visibility change listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.channel) {
      console.log('[RealtimeManager] Force cleaning up global channel');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.initialized = false;
      this.isReady = false;
      this.subscriptions.clear();
      this.readyCallbacks = [];
      this.readyListeners.clear();
    }
  }

  // Get subscription count for debugging
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
