import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  oderId: string;
  name: string;
}

export function useTypingIndicator(
  conversationId: string | null,
  currentUserId: string | null,
  currentUserName: string | null
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Set up presence channel for the conversation
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { presence: { key: currentUserId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.entries(state).forEach(([oderId, presences]) => {
          if (oderId !== currentUserId && Array.isArray(presences)) {
            const presence = presences[0] as { typing?: boolean; name?: string };
            if (presence?.typing) {
              typing.push({
                oderId,
                name: presence.name || 'Someone'
              });
            }
          }
        });
        
        setTypingUsers(typing);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId]);

  // Broadcast typing status
  const setTyping = useCallback((typing: boolean) => {
    if (!channelRef.current || !currentUserId || isTypingRef.current === typing) return;
    
    isTypingRef.current = typing;
    
    channelRef.current.track({
      typing,
      name: currentUserName || 'User',
      online_at: new Date().toISOString()
    });
  }, [currentUserId, currentUserName]);

  // Handle input change - start typing
  const handleTypingStart = useCallback(() => {
    setTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  }, [setTyping]);

  // Stop typing immediately (e.g., when message sent)
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
  }, [setTyping]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    handleTypingStart,
    stopTyping
  };
}
