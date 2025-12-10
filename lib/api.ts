import { supabase } from '../src/integrations/supabase/client';
import { User, Request, UserRole, Offer } from '../types';

// Helper to map RPC result to User type (single query, no N+1)
function mapRpcResultToUser(data: any, email?: string): User {
  return {
    id: data.id,
    name: data.name,
    email: email || '',
    role: (data.role || 'guest') as UserRole,
    avatar: data.avatar,
    bio: data.bio,
    location: data.location,
    joinedDate: data.joined_date,
    verified: data.verified,
    balance: parseFloat(data.balance) || 0,
    skills: data.skills || [],
    rating: parseFloat(data.rating) || undefined,
    completedTasks: data.completed_tasks || 0,
    responseTime: data.response_time,
  };
}

// Helper to map joined profile+role data to User (for inline joins)
function mapJoinedProfileToUser(profile: any, email?: string): User {
  const role = profile?.user_roles?.[0]?.role || 'guest';
  return {
    id: profile.id,
    name: profile.name,
    email: email || '',
    role: role as UserRole,
    avatar: profile.avatar,
    bio: profile.bio,
    location: profile.location,
    joinedDate: profile.joined_date,
    verified: profile.verified,
    balance: parseFloat(profile.balance) || 0,
    skills: profile.skills || [],
    rating: parseFloat(profile.rating) || undefined,
    completedTasks: profile.completed_tasks || 0,
    responseTime: profile.response_time,
  };
}

// Helper to create unknown user placeholder
function createUnknownUser(userId: string): User {
  return {
    id: userId,
    name: 'Unknown User',
    email: '',
    role: 'guest' as UserRole,
    avatar: '',
  };
}

export const api = {
  auth: {
    // OPTIMIZED: Uses single RPC call instead of profile + role queries
    async login(email: string, password: string): Promise<User> {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      // Single RPC call gets profile + role together
      const { data: userData, error: rpcError } = await supabase
        .rpc('get_user_with_role', { p_user_id: data.user.id });

      if (rpcError) throw rpcError;
      if (!userData || userData.length === 0) throw new Error('Profile not found');

      return mapRpcResultToUser(userData[0], data.user.email);
    },

    async signup(userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }): Promise<User> {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      // Single RPC call gets profile + role together
      const { data: profile, error: rpcError } = await supabase
        .rpc('get_user_with_role', { p_user_id: data.user.id });

      if (rpcError) throw rpcError;
      if (!profile || profile.length === 0) throw new Error('Profile not found');

      return mapRpcResultToUser(profile[0], data.user.email);
    },

    async logout(): Promise<void> {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    // OPTIMIZED: Uses single RPC call
    async getCurrentSession(): Promise<User | null> {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .rpc('get_user_with_role', { p_user_id: session.user.id });

      if (error || !data || data.length === 0) return null;

      return mapRpcResultToUser(data[0], session.user.email);
    },

    // OPTIMIZED: Uses single RPC call (public version, no balance)
    async getUser(userId: string): Promise<User | null> {
      const { data, error } = await supabase
        .rpc('get_public_user_with_role', { p_user_id: userId });

      if (error || !data || data.length === 0) return null;

      return mapRpcResultToUser(data[0]);
    },

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
      // Use the secure RPC function instead of direct update
      const { error } = await supabase.rpc('update_user_profile_secure', {
        _name: updates.name ?? null,
        _avatar: updates.avatar ?? null,
        _bio: updates.bio ?? null,
        _location: updates.location ?? null,
        _skills: updates.skills ?? null,
        _response_time: updates.responseTime ?? null,
      });

      if (error) throw error;

      // Fetch and return the updated profile
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) throw new Error('Failed to fetch updated profile');
      return updatedUser;
    },

    async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
      // Delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      // Return updated user
      return this.getUser(userId) as Promise<User>;
    },
  },

  requests: {
    // OPTIMIZED: Single query with JOIN, no N+1
    async getAll(options: { 
      page?: number; 
      limit?: number; 
      status?: 'Open' | 'In Progress' | 'Completed' | null;
    } = {}): Promise<{ data: Request[]; count: number }> {
      const { page = 1, limit = 50, status = null } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_posted_by_id_fkey (
            *,
            user_roles (role)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const requests = (data || []).map(dbRequest => {
        const profile = (dbRequest as any).profiles;
        const postedBy = profile 
          ? mapJoinedProfileToUser(profile)
          : createUnknownUser(dbRequest.posted_by_id);

        return {
          id: dbRequest.id,
          title: dbRequest.title,
          category: dbRequest.category,
          description: dbRequest.description,
          budgetMin: Number(dbRequest.budget_min),
          budgetMax: Number(dbRequest.budget_max),
          deadline: dbRequest.deadline,
          location: dbRequest.location,
          status: dbRequest.status as 'Open' | 'In Progress' | 'Completed',
          offerCount: dbRequest.offer_count,
          imageUrl: dbRequest.image_url,
          postedBy,
          createdAt: dbRequest.created_at,
        };
      });

      return { data: requests, count: count || 0 };
    },

    // Legacy method for backward compatibility
    async getAllSimple(): Promise<Request[]> {
      const result = await this.getAll({ limit: 100 });
      return result.data;
    },

    async create(requestData: Partial<Request>, user: User): Promise<Request> {
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          title: requestData.title,
          category: requestData.category,
          description: requestData.description,
          budget_min: requestData.budgetMin,
          budget_max: requestData.budgetMax,
          deadline: requestData.deadline,
          location: requestData.location,
          image_url: requestData.imageUrl,
          posted_by_id: user.id,
        }])
        .select(`
          *,
          profiles!requests_posted_by_id_fkey (
            *,
            user_roles (role)
          )
        `)
        .single();

      if (error) throw error;

      const profile = (data as any).profiles;
      const postedBy = profile 
        ? mapJoinedProfileToUser(profile, user.email)
        : user;

      return {
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description,
        budgetMin: Number(data.budget_min),
        budgetMax: Number(data.budget_max),
        deadline: data.deadline,
        location: data.location,
        status: data.status as 'Open' | 'In Progress' | 'Completed',
        offerCount: data.offer_count,
        imageUrl: data.image_url,
        postedBy,
        createdAt: data.created_at,
      };
    },

    async updateStatus(requestId: string, status: 'Open' | 'In Progress' | 'Completed'): Promise<void> {
      const { error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
    },
  },

  offers: {
    // OPTIMIZED: Single query with JOIN, no N+1
    async getByRequest(requestId: string): Promise<Offer[]> {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          profiles!offers_finder_id_fkey (
            *,
            user_roles (role)
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(offer => {
        const profile = (offer as any).profiles;
        const finder = profile 
          ? mapJoinedProfileToUser(profile)
          : createUnknownUser(offer.finder_id);

        return {
          id: offer.id,
          requestId: offer.request_id,
          finder,
          price: Number(offer.price),
          deliveryDays: offer.delivery_days,
          message: offer.message,
          status: offer.status as 'Pending' | 'Accepted' | 'Rejected',
        };
      });
    },

    async create(offerData: {
      requestId: string;
      finderId: string;
      price: number;
      deliveryDays: number;
      message: string;
    }): Promise<Offer> {
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          request_id: offerData.requestId,
          finder_id: offerData.finderId,
          price: offerData.price,
          delivery_days: offerData.deliveryDays,
          message: offerData.message,
        }])
        .select(`
          *,
          profiles!offers_finder_id_fkey (
            *,
            user_roles (role)
          )
        `)
        .single();

      if (error) throw error;

      const profile = (data as any).profiles;
      const finder = profile 
        ? mapJoinedProfileToUser(profile)
        : createUnknownUser(offerData.finderId);

      return {
        id: data.id,
        requestId: data.request_id,
        finder,
        price: Number(data.price),
        deliveryDays: data.delivery_days,
        message: data.message,
        status: data.status as 'Pending' | 'Accepted' | 'Rejected',
      };
    },

    async update(offerId: string, updates: {
      price?: number;
      deliveryDays?: number;
      message?: string;
      status?: 'Pending' | 'Accepted' | 'Rejected';
    }): Promise<void> {
      const updateData: any = {};
      
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.deliveryDays !== undefined) updateData.delivery_days = updates.deliveryDays;
      if (updates.message !== undefined) updateData.message = updates.message;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', offerId);

      if (error) throw error;
    },
  },
};
