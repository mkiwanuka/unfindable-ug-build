import { supabase } from '../src/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Global subscription types (for notifications, requests, offers)
type GlobalTableName = 'requests' | 'notifications' | 'offers' | 'messages';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
type GlobalCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

interface GlobalSubscription {
  table: GlobalTableName;
  event: EventType;
  callback: GlobalCallback;
}

// Conversation-specific types (for messages)
type MessageHandler = (msg: any) => void;
type ReceiptHandler = (msg: any) => void;
type TypingHandler = (payload: { userId: string; name: string; typing: boolean }) => void;

interface ConversationHandlers {
  onMessage?: MessageHandler;
  onReceipt?: ReceiptHandler;
  onTyping?: TypingHandler;
}

interface ConversationChannelEntry {
  channel: RealtimeChannel;
  refCount: number;
  handlers: ConversationHandlers;
}

/**
 * Hybrid RealtimeManager
 * 
 * Supports two patterns:
 * 1. Global subscriptions for app-wide tables (notifications, requests, offers)
 * 2. Conversation-specific subscriptions for messages (filtered at server level)
 */
class RealtimeManager {
  // Global channel (for notifications, requests, offers)
  private globalChannel: RealtimeChannel | null = null;
  private globalSubscriptions: Set<GlobalSubscription> = new Set();
  private globalInitialized = false;
  private globalReady = false;
  private readyCallbacks: (() => void)[] = [];
  private readyListeners: Set<() => void> = new Set();
  
  // Conversation-specific channels (for messages)
  private conversationChannels = new Map<string, ConversationChannelEntry>();

  // Health check
  public lastEventTime = Date.now();
  private healthCheckInterval: number | null = null;

  get isInitialized(): boolean {
    return this.globalInitialized;
  }

  // ==================== GLOBAL CHANNEL (notifications, requests, offers) ====================

  init() {
    if (this.globalInitialized && this.globalChannel) {
      return;
    }
    
    this.globalInitialized = true;
    this.globalReady = false;

    this.globalChannel = supabase
      .channel('global-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          this.lastEventTime = Date.now();
          this.emitGlobal('requests', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          this.lastEventTime = Date.now();
          this.emitGlobal('notifications', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        (payload) => {
          this.lastEventTime = Date.now();
          this.emitGlobal('offers', payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          this.lastEventTime = Date.now();
          this.emitGlobal('messages', payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.globalReady = true;
          this.lastEventTime = Date.now();
          
          // Execute one-shot callbacks
          this.readyCallbacks.forEach(cb => {
            try { cb(); } catch (e) { console.error('[RealtimeManager] Ready callback error:', e); }
          });
          this.readyCallbacks = [];
          
          // Execute persistent listeners
          this.readyListeners.forEach(cb => {
            try { cb(); } catch (e) { console.error('[RealtimeManager] Ready listener error:', e); }
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.globalReady = false;
          this.forceReconnectGlobal();
        }
      });

    this.startHealthCheck();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) return;
    this.healthCheckInterval = window.setInterval(() => {
      if (Date.now() - this.lastEventTime > 60000) {
        this.forceReconnectGlobal();
      }
    }, 15000);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (Date.now() - this.lastEventTime > 30000) {
        this.forceReconnectGlobal();
      }
    }
  };

  private forceReconnectGlobal() {
    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
    }
    this.globalChannel = null;
    this.globalInitialized = false;
    this.globalReady = false;
    setTimeout(() => this.init(), 300);
  }

  private emitGlobal(table: GlobalTableName, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    this.lastEventTime = Date.now();
    const eventType = payload.eventType as EventType;
    
    this.globalSubscriptions.forEach((sub) => {
      if (sub.table === table && (sub.event === '*' || sub.event === eventType)) {
        try {
          sub.callback(payload);
        } catch (error) {
          console.error('[RealtimeManager] Error in global callback:', error);
        }
      }
    });
  }

  /**
   * Subscribe to global table events (notifications, requests, offers)
   */
  subscribe(table: GlobalTableName, event: EventType, callback: GlobalCallback): () => void {
    if (!this.globalInitialized) {
      this.init();
    }

    const subscription: GlobalSubscription = { table, event, callback };
    this.globalSubscriptions.add(subscription);

    return () => {
      this.globalSubscriptions.delete(subscription);
    };
  }

  waitForReady(): Promise<void> {
    if (this.globalReady) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.readyCallbacks.push(resolve);
    });
  }

  onReady(callback: () => void): () => void {
    if (this.globalReady) {
      callback();
    }
    this.readyListeners.add(callback);
    return () => {
      this.readyListeners.delete(callback);
    };
  }

  getReadyState(): boolean {
    return this.globalReady;
  }

  // ==================== CONVERSATION CHANNELS (messages) ====================

  private getConversationKey(conversationId: string): string {
    return `conversation:${conversationId}`;
  }

  /**
   * Subscribe to a conversation's realtime events (messages only)
   * - INSERT events for new messages
   * - UPDATE events for read receipts/status changes
   * - Broadcast events for typing indicators
   */
  subscribeConversation(
    conversationId: string,
    handlers: ConversationHandlers
  ): void {
    const key = this.getConversationKey(conversationId);

    // If already subscribed, increment ref count and update handlers
    if (this.conversationChannels.has(key)) {
      const entry = this.conversationChannels.get(key)!;
      entry.refCount++;
      entry.handlers = { ...entry.handlers, ...handlers };
      return;
    }

    const channel = supabase.channel(key);

    // New messages (INSERT) - filtered at server level
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        this.lastEventTime = Date.now();
        const entry = this.conversationChannels.get(key);
        entry?.handlers.onMessage?.(payload.new);
      }
    );

    // Read receipts / status updates (UPDATE)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        this.lastEventTime = Date.now();
        const entry = this.conversationChannels.get(key);
        entry?.handlers.onReceipt?.(payload.new);
      }
    );

    // Typing indicator (broadcast - NO database writes)
    channel.on(
      'broadcast',
      { event: 'typing' },
      (payload) => {
        const entry = this.conversationChannels.get(key);
        entry?.handlers.onTyping?.(payload.payload as { userId: string; name: string; typing: boolean });
      }
    );

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[RealtimeManager] Conversation channel ${key} error:`, status);
        this.reconnectConversation(conversationId, handlers);
      }
    });

    this.conversationChannels.set(key, { channel, refCount: 1, handlers });
  }

  /**
   * Unsubscribe from a conversation (ref-counted)
   */
  async unsubscribeConversation(conversationId: string): Promise<void> {
    const key = this.getConversationKey(conversationId);
    const entry = this.conversationChannels.get(key);
    
    if (!entry) return;

    entry.refCount--;
    if (entry.refCount > 0) return;

    try {
      await entry.channel.unsubscribe();
      supabase.removeChannel(entry.channel);
    } catch (error) {
      console.error(`[RealtimeManager] Error unsubscribing from ${key}:`, error);
    }
    
    this.conversationChannels.delete(key);
  }

  private async reconnectConversation(conversationId: string, handlers: ConversationHandlers): Promise<void> {
    const key = this.getConversationKey(conversationId);
    const entry = this.conversationChannels.get(key);
    
    if (entry) {
      try {
        await entry.channel.unsubscribe();
        supabase.removeChannel(entry.channel);
      } catch (e) { /* ignore */ }
      this.conversationChannels.delete(key);
    }

    setTimeout(() => {
      this.subscribeConversation(conversationId, handlers);
    }, 300);
  }

  /**
   * Send typing indicator via broadcast (no database write)
   */
  sendTyping(conversationId: string, userId: string, name: string, typing: boolean): void {
    const key = this.getConversationKey(conversationId);
    const entry = this.conversationChannels.get(key);
    
    if (!entry) return;

    entry.channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, name, typing },
    });
  }

  isSubscribedToConversation(conversationId: string): boolean {
    return this.conversationChannels.has(this.getConversationKey(conversationId));
  }

  // ==================== CLEANUP ====================

  cleanup() {
    if (this.globalSubscriptions.size > 0) return;
    
    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
      this.globalChannel = null;
      this.globalInitialized = false;
      this.globalReady = false;
    }
  }

  forceCleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Cleanup global channel
    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
      this.globalChannel = null;
      this.globalInitialized = false;
      this.globalReady = false;
      this.globalSubscriptions.clear();
      this.readyCallbacks = [];
      this.readyListeners.clear();
    }

    // Cleanup all conversation channels
    for (const [, entry] of this.conversationChannels) {
      try {
        entry.channel.unsubscribe();
        supabase.removeChannel(entry.channel);
      } catch (e) { /* ignore */ }
    }
    this.conversationChannels.clear();
  }

  getSubscriptionCount(): number {
    return this.globalSubscriptions.size;
  }

  getConversationChannelCount(): number {
    return this.conversationChannels.size;
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
