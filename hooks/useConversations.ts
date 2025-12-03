import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

export interface ConversationWithDetails {
  id: string;
  request_id: string | null;
  partner: {
    id: string;
    name: string;
    avatar: string;
  };
  requestTitle: string;
  lastMessage: string;
  updated_at: string;
}

interface ConversationRow {
  id: string;
  request_id: string | null;
  requester_id: string;
  finder_id: string;
  updated_at: string;
  request_title: string | null;
  requester_name: string | null;
  requester_avatar: string | null;
  finder_name: string | null;
  finder_avatar: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
}

async function fetchConversationsForUser(userId: string): Promise<ConversationWithDetails[]> {
  // Use the optimized RPC function that fetches only the latest message per conversation
  const { data, error } = await supabase.rpc('get_conversations_with_last_message', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return ((data as ConversationRow[]) || []).map((convo) => {
    // Determine partner based on current user
    const isRequester = convo.requester_id === userId;
    const partner = isRequester
      ? {
          id: convo.finder_id,
          name: convo.finder_name || 'Unknown',
          avatar: convo.finder_avatar || '',
        }
      : {
          id: convo.requester_id,
          name: convo.requester_name || 'Unknown',
          avatar: convo.requester_avatar || '',
        };

    return {
      id: convo.id,
      request_id: convo.request_id,
      partner,
      requestTitle: convo.request_title || 'General Inquiry',
      lastMessage: convo.last_message_content || 'No messages yet',
      updated_at: convo.updated_at,
    };
  });
}

export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => fetchConversationsForUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useInvalidateConversations() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };
}
