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

  init() {
    if (this.initialized) return;
    this.initialized = true;

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
      .subscribe((status) => {
        console.log('[RealtimeManager] Channel status:', status);
      });
  }

  private emit(table: TableName, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    const eventType = payload.eventType as EventType;
    
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

    console.log(`[RealtimeManager] Subscribed to ${table}:${event}, total: ${this.subscriptions.size}`);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscription);
      console.log(`[RealtimeManager] Unsubscribed from ${table}:${event}, total: ${this.subscriptions.size}`);
    };
  }

  cleanup() {
    if (this.channel) {
      console.log('[RealtimeManager] Cleaning up global channel');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.initialized = false;
      this.subscriptions.clear();
    }
  }

  // Get subscription count for debugging
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
