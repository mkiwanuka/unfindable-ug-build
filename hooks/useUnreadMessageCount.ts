import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';

export function useUnreadMessageCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // Get all conversations where user is a participant
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`requester_id.eq.${userId},finder_id.eq.${userId}`);

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

        if (error) throw error;
        setCount(unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // If the message is not from the current user, increment count
          if (payload.new && (payload.new as any).sender_id !== userId) {
            setCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // If read_at was just set, refetch count
          if (payload.new && (payload.new as any).read_at && !(payload.old as any)?.read_at) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
