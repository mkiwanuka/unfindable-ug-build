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

async function fetchConversationsForUser(userId: string): Promise<ConversationWithDetails[]> {
  const { data: convos, error } = await supabase
    .from('conversations')
    .select(`
      id,
      request_id,
      requester_id,
      finder_id,
      updated_at,
      requests(title),
      requester:profiles!conversations_requester_id_fkey(id, name, avatar),
      finder:profiles!conversations_finder_id_fkey(id, name, avatar),
      messages(id, content, created_at)
    `)
    .or(`requester_id.eq.${userId},finder_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (convos || []).map((convo: any) => {
    const partner = convo.requester_id === userId 
      ? convo.finder 
      : convo.requester;
    
    const lastMsg = Array.isArray(convo.messages) && convo.messages.length > 0
      ? convo.messages.reduce((a: any, b: any) => 
          new Date(a.created_at) > new Date(b.created_at) ? a : b
        )
      : null;

    return {
      id: convo.id,
      request_id: convo.request_id,
      partner: partner || { id: 'unknown', name: 'Unknown', avatar: '' },
      requestTitle: convo.requests?.title || 'General Inquiry',
      lastMessage: lastMsg?.content || 'No messages yet',
      updated_at: convo.updated_at
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
