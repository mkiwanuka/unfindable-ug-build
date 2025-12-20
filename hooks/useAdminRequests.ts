import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

export interface AdminRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  status: 'Open' | 'In Progress' | 'Completed';
  offerCount: number;
  createdAt: string;
  postedBy: {
    id: string;
    name: string;
    avatar: string;
  };
}

async function fetchAdminRequests(): Promise<AdminRequest[]> {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      title,
      category,
      description,
      budget_min,
      budget_max,
      status,
      offer_count,
      created_at,
      posted_by_id,
      profiles!requests_posted_by_id_fkey(id, name, avatar)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((req: any) => ({
    id: req.id,
    title: req.title,
    category: req.category,
    description: req.description,
    budgetMin: Number(req.budget_min),
    budgetMax: Number(req.budget_max),
    status: req.status as 'Open' | 'In Progress' | 'Completed',
    offerCount: req.offer_count || 0,
    createdAt: req.created_at,
    postedBy: {
      id: req.profiles?.id || req.posted_by_id,
      name: req.profiles?.name || 'Unknown',
      avatar: req.profiles?.avatar || '',
    },
  }));
}

async function updateRequestStatus(requestId: string, status: 'Open' | 'In Progress' | 'Completed'): Promise<void> {
  const { error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', requestId);

  if (error) throw error;
}

async function deleteRequest(requestId: string): Promise<void> {
  // Delete associated offers first
  const { error: offersError } = await supabase
    .from('offers')
    .delete()
    .eq('request_id', requestId);

  if (offersError) throw offersError;

  // Delete the request
  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

export function useAdminRequests() {
  return useQuery({
    queryKey: ['admin', 'requests'],
    queryFn: fetchAdminRequests,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'Open' | 'In Progress' | 'Completed' }) =>
      updateRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
