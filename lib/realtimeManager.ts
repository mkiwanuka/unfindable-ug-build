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
  private readyCallbacks: (() => void)[] = [];
  private reconnectTimer: number | null = null;

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
        (payload) => this.emit('requests', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => this.emit('messages', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => this.emit('notifications', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        (payload) => this.emit('offers', payload)
      )
      .subscribe((status, err) => {
        console.log('[RealtimeManager] Channel status:', status, err ? err : '');
        
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeManager] Channel is now ready');
          this.isReady = true;
          // Execute all pending ready callbacks
          this.readyCallbacks.forEach(cb => {
            try { 
              cb(); 
            } catch (e) { 
              console.error('[RealtimeManager] Ready callback error:', e); 
            }
          });
          this.readyCallbacks = [];
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('[RealtimeManager] Channel error/timeout, will reconnect');
          this.isReady = false;
          this.handleReconnect();
        }
      });
  }

  private handleReconnect() {
    if (this.reconnectTimer) {
      console.log('[RealtimeManager] Already reconnecting, skipping');
      return;
    }
    
    console.log('[RealtimeManager] Scheduling reconnection in 1s...');
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.channel) {
        console.log('[RealtimeManager] Reconnecting - removing old channel');
        supabase.removeChannel(this.channel);
        this.channel = null;
        this.initialized = false;
        this.init();
      }
    }, 1000);
  }

  private emit(table: TableName, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
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

  // Register callback for when channel becomes ready
  onReady(callback: () => void): void {
    if (this.isReady) {
      console.log('[RealtimeManager] Already ready, executing callback immediately');
      callback();
    } else {
      console.log('[RealtimeManager] Channel not ready, queuing callback');
      this.readyCallbacks.push(callback);
    }
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
    }
  }

  // Get subscription count for debugging
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
