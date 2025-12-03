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

    const fetchUnreadCount = async () => {
      const { count: unreadCount, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (!error && unreadCount !== null) {
        setCount(unreadCount);
      }
    };

    fetchUnreadCount();

    // Use consolidated realtime manager
    const unsubInsert = realtimeManager.subscribe('notifications', 'INSERT', (payload) => {
      if ((payload.new as { user_id: string }).user_id === userId) {
        fetchUnreadCount();
      }
    });

    const unsubUpdate = realtimeManager.subscribe('notifications', 'UPDATE', (payload) => {
      if ((payload.new as { user_id: string }).user_id === userId) {
        fetchUnreadCount();
      }
    });

    // Refetch when channel becomes ready (after reconnect) - persistent listener
    const unsubReady = realtimeManager.onReady(() => {
      console.log('[Badge] Notification channel ready → refetching unread count');
      fetchUnreadCount();
    });

    return () => {
      unsubInsert();
      unsubUpdate();
      unsubReady();
    };
  }, [userId]);

  return count;
}
