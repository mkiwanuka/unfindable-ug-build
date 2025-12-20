import { useQuery } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

export interface ViewedRequest {
  requestId: string;
  title: string;
  category: string;
  imageUrl: string;
  budgetMin: number;
  budgetMax: number;
  status: string;
  viewedAt: string;
}

interface ViewRow {
  request_id: string;
  viewed_at: string;
  requests: {
    id: string;
    title: string;
    category: string;
    image_url: string;
    budget_min: number;
    budget_max: number;
    status: string;
  };
}

async function fetchViewedRequests(userId: string, limit: number = 20): Promise<ViewedRequest[]> {
  // Get viewed requests ordered by most recent
  const { data, error } = await supabase
    .from('request_views')
    .select(`
      request_id,
      viewed_at,
      requests (
        id,
        title,
        category,
        image_url,
        budget_min,
        budget_max,
        status
      )
    `)
    .eq('viewer_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching viewed requests:', error);
    throw error;
  }

  // Map to ViewedRequest format
  return ((data as ViewRow[]) || []).map((view) => ({
    requestId: view.request_id,
    title: view.requests.title,
    category: view.requests.category,
    imageUrl: view.requests.image_url,
    budgetMin: view.requests.budget_min,
    budgetMax: view.requests.budget_max,
    status: view.requests.status,
    viewedAt: view.viewed_at
  }));
}

export function useViewedRequests(userId: string | null, limit: number = 20) {
  return useQuery({
    queryKey: ['viewed-requests', userId, limit],
    queryFn: () => fetchViewedRequests(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });
}
