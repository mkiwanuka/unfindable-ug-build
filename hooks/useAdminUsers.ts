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
  // Use secure RPC function that enforces admin check server-side
  const { data, error } = await supabase.rpc('admin_get_all_users');

  if (error) throw error;

  return (data || []).map((user: {
    id: string;
    name: string | null;
    avatar: string | null;
    verified: boolean | null;
    joined_date: string | null;
    completed_tasks: number | null;
    rating: number | null;
    roles: string[];
  }) => ({
    id: user.id,
    name: user.name || 'Unknown',
    email: '', // Email not exposed for privacy
    avatar: user.avatar || '',
    roles: user.roles || ['guest'],
    verified: user.verified || false,
    joinedDate: user.joined_date || '',
    completedTasks: user.completed_tasks || 0,
    rating: user.rating,
  }));
}

type AppRole = 'admin' | 'finder' | 'requester' | 'guest';

async function updateUserRole(userId: string, newRole: AppRole, action: 'add' | 'remove'): Promise<void> {
  // Use secure RPC function with audit logging
  const { error } = await supabase.rpc('manage_user_role', {
    _target_user_id: userId,
    _role: newRole,
    _action: action
  });
  if (error) throw error;
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
