import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Request } from '../types';

interface UseRequestsOptions {
  page?: number;
  limit?: number;
  status?: 'Open' | 'In Progress' | 'Completed' | null;
}

export function useRequests(options: UseRequestsOptions = {}) {
  const { page = 1, limit = 20, status = null } = options;
  
  return useQuery({
    queryKey: ['requests', { page, limit, status }],
    queryFn: () => api.requests.getAll({ page, limit, status }),
  });
}

export function useOpenRequests(limit = 50) {
  return useQuery({
    queryKey: ['requests', 'open', limit],
<<<<<<< HEAD
    queryFn: () => api.requests.getAll({ limit, status: 'Open' }),
=======
    queryFn: () => api.requests.getAll({ limit, status: null }),
>>>>>>> master-local/master
    staleTime: 1000 * 60, // 1 minute for homepage
  });
}

export function useInvalidateRequests() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
  };
}

// Helper to update a single request in cache (for real-time updates)
export function useUpdateRequestInCache() {
  const queryClient = useQueryClient();
  
  return (requestId: string, updates: Partial<Request>) => {
    queryClient.setQueriesData<{ data: Request[]; count: number }>(
      { queryKey: ['requests'] },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(r => 
            r.id === requestId ? { ...r, ...updates } : r
          )
        };
      }
    );
  };
}
