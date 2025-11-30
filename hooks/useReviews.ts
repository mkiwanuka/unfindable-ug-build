import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../src/integrations/supabase/client';

export interface ReviewData {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  request_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    id: string;
    name: string;
    avatar: string;
  };
  request?: {
    id: string;
    title: string;
  };
}

export const useReviews = (userId?: string) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey (
            id,
            name,
            avatar
          ),
          requests!reviews_request_id_fkey (
            id,
            title
          )
        `)
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReviews = (data || []).map((review: any) => ({
        id: review.id,
        reviewer_id: review.reviewer_id,
        reviewed_id: review.reviewed_id,
        request_id: review.request_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        reviewer: review.profiles ? {
          id: review.profiles.id,
          name: review.profiles.name,
          avatar: review.profiles.avatar,
        } : undefined,
        request: review.requests ? {
          id: review.requests.id,
          title: review.requests.title,
        } : undefined,
      }));

      setReviews(mappedReviews);
      
      // Calculate average
      if (mappedReviews.length > 0) {
        const avg = mappedReviews.reduce((sum, r) => sum + r.rating, 0) / mappedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = async (data: {
    reviewerId: string;
    reviewedId: string;
    requestId: string;
    rating: number;
    comment: string;
  }) => {
    const { error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: data.reviewerId,
        reviewed_id: data.reviewedId,
        request_id: data.requestId,
        rating: data.rating,
        comment: data.comment || null,
      });

    if (error) throw error;
    
    // Refresh reviews after creating
    await fetchReviews();
  };

  const checkCanReview = async (reviewerId: string, requestId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', reviewerId)
      .eq('request_id', requestId)
      .maybeSingle();

    if (error) {
      console.error('Error checking review:', error);
      return false;
    }

    return data === null; // Can review if no existing review
  };

  return {
    reviews,
    loading,
    averageRating,
    createReview,
    checkCanReview,
    refetch: fetchReviews,
  };
};
