import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';

export interface OfferWithRequest {
  id: string;
  request_id: string;
  price: number;
  delivery_days: number;
  message: string;
  status: string;
  created_at: string;
  request: {
    id: string;
    title: string;
    status: string;
  } | null;
}

interface UseFinderOffersResult {
  offers: OfferWithRequest[];
  loading: boolean;
  error: string | null;
}

export function useFinderOffers(userId: string | undefined): UseFinderOffersResult {
  const [offers, setOffers] = useState<OfferWithRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('offers')
          .select(`
            id,
            request_id,
            price,
            delivery_days,
            message,
            status,
            created_at,
            requests:request_id (
              id,
              title,
              status
            )
          `)
          .eq('finder_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const transformedOffers: OfferWithRequest[] = (data || []).map(offer => ({
          id: offer.id,
          request_id: offer.request_id,
          price: offer.price,
          delivery_days: offer.delivery_days,
          message: offer.message,
          status: offer.status || 'Pending',
          created_at: offer.created_at || '',
          request: offer.requests as OfferWithRequest['request']
        }));

        setOffers(transformedOffers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userId]);

  return { offers, loading, error };
}
