import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../src/integrations/supabase/client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
  verified: boolean;
  joinedDate: string;
  completedTasks: number;
  rating: number | null;
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, avatar, verified, joined_date, completed_tasks, rating')
    .order('joined_date', { ascending: false });

  if (profilesError) throw profilesError;

  // Fetch all user roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Fetch user emails from auth (we'll use a workaround since we can't directly query auth.users)
  // For now, we'll show profile data without email - email would need an edge function or RPC
  
  // Map roles to users
  const roleMap = new Map<string, string[]>();
  roles?.forEach(r => {
    const existing = roleMap.get(r.user_id) || [];
    existing.push(r.role);
    roleMap.set(r.user_id, existing);
  });

  return (profiles || []).map(profile => ({
    id: profile.id,
    name: profile.name || 'Unknown',
    email: '', // Would need edge function to get from auth.users
    avatar: profile.avatar || '',
    roles: roleMap.get(profile.id) || ['guest'],
    verified: profile.verified || false,
    joinedDate: profile.joined_date || '',
    completedTasks: profile.completed_tasks || 0,
    rating: profile.rating,
  }));
}

type AppRole = 'admin' | 'finder' | 'requester' | 'guest';

async function updateUserRole(userId: string, newRole: AppRole, action: 'add' | 'remove'): Promise<void> {
  if (action === 'add') {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: newRole });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', newRole);
    if (error) throw error;
  }
}

async function deleteUser(userId: string): Promise<void> {
  // Delete user's roles first
  const { error: rolesError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
  
  if (rolesError) throw rolesError;

  // Delete user's profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;
  
  // Note: This doesn't delete from auth.users - would need edge function with service role
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role, action }: { userId: string; role: AppRole; action: 'add' | 'remove' }) =>
      updateUserRole(userId, role, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
