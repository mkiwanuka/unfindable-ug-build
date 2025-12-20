import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

interface TrackViewParams {
  requestId: string;
  userId: string;
}

async function trackRequestView({ requestId, userId }: TrackViewParams): Promise<void> {
  // Upsert - insert or update if exists (UNIQUE constraint handles this)
  const { error } = await supabase
    .from('request_views')
    .upsert({
      request_id: requestId,
      viewer_id: userId,
      viewed_at: new Date().toISOString()
    }, {
      onConflict: 'request_id,viewer_id'
    });

  if (error) {
    console.error('Error tracking request view:', error);
    throw error;
  }
}

export function useTrackRequestView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trackRequestView,
    onSuccess: (_, variables) => {
      // Invalidate the viewed-requests query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['viewed-requests', variables.userId]
      });
    },
    onError: (error) => {
      // Log error but don't show to user - this is background tracking
      console.error('Failed to track request view:', error);
    }
  });
}
