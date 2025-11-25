import { supabase } from '../src/integrations/supabase/client';
import { User, Request, UserRole, Offer } from '../types';

// Helper to map database profile + role to User type
async function mapProfileToUser(profile: any, email?: string): Promise<User> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', profile.id);
  
  const role = roles?.[0]?.role || 'guest';
  
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

// Helper to map database request to Request type
async function mapRequestToRequest(dbRequest: any): Promise<Request> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', dbRequest.posted_by_id)
    .single();
  
  const postedBy = profile ? await mapProfileToUser(profile) : {
    id: dbRequest.posted_by_id,
    name: 'Unknown User',
    email: '',
    role: 'guest' as UserRole,
    avatar: '',
  };

  return {
    id: dbRequest.id,
    title: dbRequest.title,
    category: dbRequest.category,
    description: dbRequest.description,
    budgetMin: parseFloat(dbRequest.budget_min),
    budgetMax: parseFloat(dbRequest.budget_max),
    deadline: dbRequest.deadline,
    location: dbRequest.location,
    status: dbRequest.status,
    offerCount: dbRequest.offer_count,
    imageUrl: dbRequest.image_url,
    postedBy,
    createdAt: dbRequest.created_at,
  };
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<User> {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return mapProfileToUser(profile, data.user.email);
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

      // Profile is created automatically via trigger
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return mapProfileToUser(profile, data.user.email);
    },

    async logout(): Promise<void> {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async getCurrentSession(): Promise<User | null> {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) return null;

      return mapProfileToUser(profile, session.user.email);
    },

    async getUser(userId: string): Promise<User | null> {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return null;

      return mapProfileToUser(profile);
    },

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.skills !== undefined) updateData.skills = updates.skills;
      if (updates.responseTime !== undefined) updateData.response_time = updates.responseTime;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return mapProfileToUser(profile);
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
    async getAll(): Promise<Request[]> {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_posted_by_id_fkey (
            *,
            user_roles (role)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the joined data to Request objects
      return data.map(dbRequest => {
        const profile = (dbRequest as any).profiles;
        const role = profile?.user_roles?.[0]?.role || 'guest';

        const postedBy: User = profile ? {
          id: profile.id,
          name: profile.name,
          email: '',
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
        } : {
          id: dbRequest.posted_by_id,
          name: 'Unknown User',
          email: '',
          role: 'guest' as UserRole,
          avatar: '',
        };

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
      const role = profile?.user_roles?.[0]?.role || 'guest';

      const postedBy: User = profile ? {
        id: profile.id,
        name: profile.name,
        email: user.email,
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
      } : user;

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
  },

  offers: {
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
        const role = profile?.user_roles?.[0]?.role || 'guest';

        const finder: User = {
          id: profile.id,
          name: profile.name,
          email: '',
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
      const role = profile?.user_roles?.[0]?.role || 'guest';

      const finder: User = {
        id: profile.id,
        name: profile.name,
        email: '',
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
