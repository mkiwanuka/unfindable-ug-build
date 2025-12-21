import { useQuery } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';
import { Request } from '../types';

interface OfferRow {
  finder_id: string;
}

interface RequestRow {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  location: string;
  status: string;
  offer_count: number;
  image_url: string;
  posted_by_id: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar: string;
  };
  offers: OfferRow[];
}

async function fetchAvailableRequests(userId: string, limit: number = 20): Promise<Request[]> {
  // Get open requests with offer information
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      title,
      category,
      description,
      budget_min,
      budget_max,
      deadline,
      location,
      status,
      offer_count,
      image_url,
      posted_by_id,
      created_at,
      profiles!requests_posted_by_id_fkey (
        id,
        name,
        avatar
      ),
      offers!offers_request_id_fkey (
        finder_id
      )
    `)
    .eq('status', 'Open')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching available requests:', error);
    throw error;
  }

  // Filter out requests where user already made an offer
  const availableRequests = ((data as RequestRow[]) || []).filter(req => {
    const userAlreadyOffered = req.offers.some(offer => offer.finder_id === userId);
    return !userAlreadyOffered;
  });

  // Map to Request interface
  return availableRequests.map((req) => ({
    id: req.id,
    title: req.title,
    category: req.category,
    description: req.description,
    budgetMin: req.budget_min,
    budgetMax: req.budget_max,
    deadline: req.deadline,
    location: req.location,
    status: req.status as 'Open' | 'In Progress' | 'Completed',
    offerCount: req.offer_count,
    imageUrl: req.image_url,
    postedBy: {
      id: req.profiles.id,
      name: req.profiles.name,
      email: '',
      avatar: req.profiles.avatar,
      role: 'requester',
      rating: null,
      bio: '',
      location: '',
      skills: [],
      createdAt: ''
    },
    createdAt: req.created_at
  }));
}

export function useAvailableRequests(userId: string | null, limit: number = 20) {
  return useQuery({
    queryKey: ['available-requests', userId, limit],
    queryFn: () => fetchAvailableRequests(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    retry: false
  });
}
