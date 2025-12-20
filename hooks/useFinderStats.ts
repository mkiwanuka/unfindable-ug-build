import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';

interface FinderStats {
  totalOffersMade: number;
  acceptedOffers: number;
  moneyEarned: number;
  loading: boolean;
}

export function useFinderStats(userId: string): FinderStats {
  const [stats, setStats] = useState<FinderStats>({
    totalOffersMade: 0,
    acceptedOffers: 0,
    moneyEarned: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Fetch all offers by this finder
        const { data: offers, error } = await supabase
          .from('offers')
          .select('id, price, status')
          .eq('finder_id', userId);

        if (error) {
          console.error('Error fetching finder stats:', error);
          setStats(prev => ({ ...prev, loading: false }));
          return;
        }

        const totalOffersMade = offers?.length || 0;
        const acceptedOffers = offers?.filter(o => o.status === 'Accepted').length || 0;
        const moneyEarned = offers
          ?.filter(o => o.status === 'Accepted')
          .reduce((sum, o) => sum + Number(o.price), 0) || 0;

        setStats({
          totalOffersMade,
          acceptedOffers,
          moneyEarned,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching finder stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [userId]);

  return stats;
}
