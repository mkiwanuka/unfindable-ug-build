import { useQuery } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';
import { Request } from '../types';

export interface RequestWithConversation extends Request {
  partnerName: string;
  partnerId: string;
  lastMessage: string | null;
  updatedAt: string;
  conversationId: string;
}

interface ConversationRow {
  id: string;
  request_id: string;
  requester_id: string;
  finder_id: string;
  updated_at: string;
  request_title: string;
  requester_name: string;
  requester_avatar: string;
  finder_name: string;
  finder_avatar: string;
  last_message_content: string | null;
  last_message_at: string | null;
}

async function fetchRequestsWithConversations(userId: string): Promise<RequestWithConversation[]> {
  // Use the optimized RPC function to get conversations with last message
  const { data, error } = await supabase.rpc('get_conversations_with_last_message', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  // Filter to only conversations that:
  // 1. Have a request_id (not null)
  // 2. Have messages (last_message_content is not null)
  const conversationsWithRequests = ((data as ConversationRow[]) || []).filter(
    conv => conv.request_id !== null && conv.last_message_content !== null
  );

  // Map to RequestWithConversation format
  return conversationsWithRequests.map((conv) => {
    // Determine if current user is requester or finder
    const isRequester = conv.requester_id === userId;
    const partnerName = isRequester ? conv.finder_name : conv.requester_name;
    const partnerId = isRequester ? conv.finder_id : conv.requester_id;

    return {
      id: conv.request_id,
      title: conv.request_title || 'Request',
      category: '', // Not available from this query
      description: '',
      budgetMin: 0,
      budgetMax: 0,
      deadline: '',
      location: '',
      status: 'Open',
      offerCount: 0,
      imageUrl: '',
      postedBy: {
        id: isRequester ? conv.requester_id : conv.finder_id,
        name: isRequester ? conv.requester_name : conv.finder_name,
        email: '',
        avatar: isRequester ? conv.requester_avatar : conv.finder_avatar,
        role: isRequester ? 'requester' : 'finder',
        rating: null,
        bio: '',
        location: '',
        skills: [],
        createdAt: ''
      },
      createdAt: '',
      partnerName,
      partnerId,
      lastMessage: conv.last_message_content || 'No messages',
      updatedAt: conv.updated_at,
      conversationId: conv.id
    } as unknown as RequestWithConversation;
  });
}

export function useRequestsWithConversations(userId: string | null) {
  return useQuery({
    queryKey: ['requests-with-conversations', userId],
    queryFn: () => fetchRequestsWithConversations(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    retry: false
  });
}
