import { useQuery } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeRequests: number;
  completedRequests: number;
  completionRate: number;
  totalOffers: number;
}

export interface ChartDataPoint {
  name: string;
  requests: number;
  revenue: number;
}

async function fetchAdminStats(): Promise<AdminStats> {
  // Fetch total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw usersError;

  // Fetch requests by status
  const { data: requests, error: requestsError } = await supabase
    .from('requests')
    .select('status, budget_min, budget_max');

  if (requestsError) throw requestsError;

  const activeRequests = requests?.filter(r => r.status === 'Open' || r.status === 'In Progress').length || 0;
  const completedRequests = requests?.filter(r => r.status === 'Completed').length || 0;
  const totalRequests = requests?.length || 0;
  const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  // Calculate estimated revenue from completed requests (average of budget range)
  const totalRevenue = requests
    ?.filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + ((Number(r.budget_min) + Number(r.budget_max)) / 2), 0) || 0;

  // Fetch total offers count
  const { count: totalOffers, error: offersError } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true });

  if (offersError) throw offersError;

  return {
    totalUsers: totalUsers || 0,
    totalRevenue: Math.round(totalRevenue),
    activeRequests,
    completedRequests,
    completionRate,
    totalOffers: totalOffers || 0,
  };
}

async function fetchChartData(): Promise<ChartDataPoint[]> {
  // Get requests from the last 7 days grouped by day
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: requests, error } = await supabase
    .from('requests')
    .select('created_at, budget_min, budget_max, status')
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error) throw error;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData: ChartDataPoint[] = [];

  // Initialize all 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    chartData.push({ name: dayName, requests: 0, revenue: 0 });
  }

  // Populate with actual data
  requests?.forEach(req => {
    const reqDate = new Date(req.created_at);
    const dayName = days[reqDate.getDay()];
    const dayData = chartData.find(d => d.name === dayName);
    if (dayData) {
      dayData.requests += 1;
      if (req.status === 'Completed') {
        dayData.revenue += (Number(req.budget_min) + Number(req.budget_max)) / 2;
      }
    }
  });

  return chartData;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAdminChartData() {
  return useQuery({
    queryKey: ['admin', 'chartData'],
    queryFn: fetchChartData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
