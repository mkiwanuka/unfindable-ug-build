import { useState, useCallback } from 'react';
import { supabase } from '../src/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

const PAGE_SIZE = 50;

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial messages (latest PAGE_SIZE)
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      // Reverse to show oldest first in UI
      const sortedMessages = (data || []).reverse();
      setMessages(sortedMessages);
      
      // Check if there are more messages to load
      setHasMore((count || 0) > PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load older messages (cursor-based pagination)
  const loadMore = useCallback(async () => {
    if (!conversationId || messages.length === 0 || loadingMore) return;

    setLoadingMore(true);
    try {
      // Use the oldest message's created_at as cursor
      const oldestMessage = messages[0];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      if (data && data.length > 0) {
        // Prepend older messages (reversed to maintain chronological order)
        const olderMessages = data.reverse();
        setMessages(prev => [...olderMessages, ...prev]);
        
        // If we got less than PAGE_SIZE, no more messages
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, messages, loadingMore]);

  // Add a new message (for optimistic updates)
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Update a message (e.g., replace temp with real, or update read_at)
  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg)
    );
  }, []);

  // Replace temp message with real one
  const replaceMessage = useCallback((tempId: string, realMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => msg.id === tempId ? realMessage : msg)
    );
  }, []);

  // Remove a message (for failed sends)
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    setMessages,
    hasMore,
    loadingMore,
    isLoading,
    fetchMessages,
    loadMore,
    addMessage,
    updateMessage,
    replaceMessage,
    removeMessage,
  };
}
