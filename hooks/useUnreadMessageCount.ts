import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { realtimeManager } from '../lib/realtimeManager';

export function useUnreadMessageCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        // Get all conversations where user is a participant
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`requester_id.eq.${userId},finder_id.eq.${userId}`);

        if (!isMounted) return;

        if (!conversations || conversations.length === 0) {
          setCount(0);
          return;
        }

        const conversationIds = conversations.map(c => c.id);

        // Count unread messages (not sent by user, read_at is null)
        const { count: unreadCount, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', userId)
          .is('read_at', null);

        if (!isMounted) return;

        if (error) throw error;
        setCount(unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up subscriptions (don't wait for ready, subscribe immediately)
    // The realtime manager will handle queuing if not ready yet
    const unsubInsert = realtimeManager.subscribe('messages', 'INSERT', (payload) => {
      // If the message is not from the current user, increment count
      if (payload.new && (payload.new as { sender_id: string }).sender_id !== userId) {
        setCount(prev => prev + 1);
      }
    });

    const unsubUpdate = realtimeManager.subscribe('messages', 'UPDATE', () => {
      // Refetch count on any message update (handles read_at being set)
      if (isMounted) {
        fetchUnreadCount();
      }
    });

    // Refetch when channel becomes ready (after reconnect) - persistent listener
    const unsubReady = realtimeManager.onReady(() => {
      if (isMounted) {
        fetchUnreadCount();
      }
    });

    return () => {
      isMounted = false;
      unsubInsert();
      unsubUpdate();
      unsubReady();
    };
  }, [userId]);

  return count;
}