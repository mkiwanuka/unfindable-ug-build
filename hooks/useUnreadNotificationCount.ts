import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { realtimeManager } from '../lib/realtimeManager';

export function useUnreadNotificationCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const { count: unreadCount, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);

        if (!isMounted) return;

        if (!error && unreadCount !== null) {
          setCount(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up subscriptions (don't wait for ready, subscribe immediately)
    // The realtime manager will handle queuing if not ready yet
    const unsubInsert = realtimeManager.subscribe('notifications', 'INSERT', (payload) => {
      if ((payload.new as { user_id: string }).user_id === userId) {
        if (isMounted) {
          fetchUnreadCount();
        }
      }
    });

    const unsubUpdate = realtimeManager.subscribe('notifications', 'UPDATE', (payload) => {
      if ((payload.new as { user_id: string }).user_id === userId) {
        if (isMounted) {
          fetchUnreadCount();
        }
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