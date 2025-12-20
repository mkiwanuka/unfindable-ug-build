import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { realtimeManager } from '../lib/realtimeManager';

interface ReactionData {
  emoji: string;
  user_id: string;
}

interface MessageReactions {
  [messageId: string]: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
}

export function useMessageReactions(conversationId: string | null, currentUserId: string | null) {
  const [reactions, setReactions] = useState<MessageReactions>({});

  const fetchReactions = useCallback(async () => {
    if (!conversationId) return;

    try {
      // Get all message IDs for this conversation
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);

      if (!messages || messages.length === 0) {
        setReactions({});
        return;
      }

      const messageIds = messages.map(m => m.id);

      // Fetch all reactions for these messages
      const { data: reactionData, error } = await supabase
        .from('message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (error) throw error;

      // Group reactions by message
      const grouped: MessageReactions = {};
      
      (reactionData || []).forEach((r: { message_id: string; emoji: string; user_id: string }) => {
        if (!grouped[r.message_id]) {
          grouped[r.message_id] = [];
        }
        
        const existing = grouped[r.message_id].find(e => e.emoji === r.emoji);
        if (existing) {
          existing.count++;
          if (r.user_id === currentUserId) {
            existing.userReacted = true;
          }
        } else {
          grouped[r.message_id].push({
            emoji: r.emoji,
            count: 1,
            userReacted: r.user_id === currentUserId
          });
        }
      });

      setReactions(grouped);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, [conversationId, currentUserId]);

  // Initial fetch
  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Real-time updates - listen to message_reactions table changes
  useEffect(() => {
    if (!conversationId) return;

    // Create a dedicated channel for reactions
    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          // Refetch all reactions when any change occurs
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchReactions]);

  return {
    reactions,
    refetchReactions: fetchReactions
  };
}
