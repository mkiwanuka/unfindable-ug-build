
import { User, Request, UserRole } from '../types';

// --- Storage Keys ---
const KEYS = {
  USERS: 'unfindable_users',
  REQUESTS: 'unfindable_requests',
  CURRENT_USER_ID: 'unfindable_session_id',
};

// --- Seed Data (Initial Data if empty) ---
const SEED_USERS: User[] = [
  {
    id: '1',
    name: 'Alex Requester',
    email: 'alex@example.com',
    role: 'requester',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Requester&background=0D1B2A&color=fff',
    bio: 'I love collecting vintage electronics.',
    location: 'Seattle, WA',
    joinedDate: 'Oct 2023',
    verified: true,
    password: 'password123', // In a real app, never store plain text!
    skills: [],
    rating: 4.5,
    completedTasks: 12,
    responseTime: '~4 hrs'
  },
  {
    id: '2',
    name: 'Sam Finder',
    email: 'sam@example.com',
    role: 'finder',
    avatar: 'https://ui-avatars.com/api/?name=Sam+Finder&background=3A7CA5&color=fff',
    bio: 'Professional antique hunter.',
    location: 'Austin, TX',
    joinedDate: 'Nov 2023',
    verified: true,
    password: 'password123',
    skills: ['Antiques', 'Negotiation', 'Fast Shipping'],
    rating: 4.9,
    completedTasks: 85,
    responseTime: '~1 hr'
  }
] as any[]; // Casting to allow password property internally

const SEED_REQUESTS: Request[] = [
  {
    id: '101',
    title: 'Vintage Nintendo Gameboy Color (Lime Green)',
    category: 'Electronics',
    description: 'Looking for a working lime green Gameboy Color. Must have battery cover and sound working.',
    budgetMin: 80,
    budgetMax: 120,
    deadline: '2023-11-15',
    location: 'Seattle, WA',
    status: 'Open',
    offerCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-10-20'
  },
  {
    id: '102',
    title: 'First Edition "Harry Potter & Sorcerer\'s Stone"',
    category: 'Collectibles',
    description: 'US Edition hardcover in good condition. No tears on the dust jacket preferred.',
    budgetMin: 300,
    budgetMax: 500,
    deadline: '2023-12-01',
    location: 'New York, NY',
    status: 'Open',
    offerCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-10-22'
  },
  {
    id: '103',
    title: 'Specific Replacement Tile (Pink Ceramic)',
    category: 'Home & Garden',
    description: 'Pink ceramic tile, 4x4 inch, exact pattern match needed (see photo). Can accept slightly chipped.',
    budgetMin: 20,
    budgetMax: 50,
    deadline: '2023-11-01',
    location: 'Austin, TX',
    status: 'Open',
    offerCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-10-15'
  },
  {
    id: '104',
    title: 'Discontinued IKEA "Värde" Part',
    category: 'Home & Garden',
    description: 'Need the specific silver leg height adjuster for Värde kitchen island series.',
    budgetMin: 15,
    budgetMax: 30,
    deadline: '2023-11-10',
    location: 'Portland, OR',
    status: 'Open',
    offerCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-10-18'
  },
  {
    id: '105',
    title: 'Vintage Levi\'s 501 (1980s, Size 32)',
    category: 'Fashion',
    description: 'Looking for authentic 80s Levis, made in USA. Specific light wash preferred.',
    budgetMin: 100,
    budgetMax: 200,
    deadline: '2023-12-25',
    location: 'Los Angeles, CA',
    status: 'In Progress',
    offerCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-09-30'
  },
  {
    id: '106',
    title: 'Passenger Side Mirror - 1965 Mustang',
    category: 'Collectibles',
    description: 'Original chrome mirror for 1965 Ford Mustang. Must be free of pitting.',
    budgetMin: 150,
    budgetMax: 250,
    deadline: '2024-01-01',
    location: 'Detroit, MI',
    status: 'Open',
    offerCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1533309907656-7b1c2ee56ddf?auto=format&fit=crop&w=800&q=80',
    postedBy: SEED_USERS[0],
    createdAt: '2023-10-05'
  }
];

// --- Helpers ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API Methods ---
export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800); // Simulate network
      const users = getStorage<any[]>(KEYS.USERS, SEED_USERS);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) throw new Error('User not found');
      if (user.password !== password) throw new Error('Invalid password');
      
      const { password: _, ...safeUser } = user; // Remove password from return
      localStorage.setItem(KEYS.CURRENT_USER_ID, safeUser.id);
      return safeUser;
    },

    signup: async (data: any): Promise<User> => {
      await delay(1000);
      const users = getStorage<any[]>(KEYS.USERS, SEED_USERS);
      
      if (users.find(u => u.email === data.email)) {
        throw new Error('Email already in use');
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
        joinedDate: new Date().toLocaleDateString(),
        verified: false,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: 'requester' as UserRole, // Default role
        bio: 'New member ready to find the unfindable.',
        skills: [],
        rating: 0,
        completedTasks: 0,
        responseTime: 'N/A'
      };

      users.push(newUser);
      setStorage(KEYS.USERS, users);
      
      const { password: _, ...safeUser } = newUser;
      localStorage.setItem(KEYS.CURRENT_USER_ID, safeUser.id);
      return safeUser;
    },

    logout: async () => {
      localStorage.removeItem(KEYS.CURRENT_USER_ID);
    },

    getCurrentSession: async (): Promise<User | null> => {
      const id = localStorage.getItem(KEYS.CURRENT_USER_ID);
      if (!id) return null;
      const users = getStorage<any[]>(KEYS.USERS, SEED_USERS);
      const user = users.find(u => u.id === id);
      if (user) {
        const { password: _, ...safeUser } = user;
        return safeUser;
      }
      return null;
    },

    getUser: async (userId: string): Promise<User | null> => {
      await delay(300);
      const users = getStorage<any[]>(KEYS.USERS, SEED_USERS);
      const user = users.find(u => u.id === userId);
      
      if (user) {
        const { password: _, ...safeUser } = user;
        return safeUser;
      }
      return null;
    },

    updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
      await delay(500);
      const users = getStorage<any[]>(KEYS.USERS, SEED_USERS);
      const index = users.findIndex(u => u.id === userId);
      
      if (index === -1) throw new Error('User not found');
      
      const updatedUser = { ...users[index], ...updates };
      users[index] = updatedUser;
      setStorage(KEYS.USERS, users);
      
      const { password: _, ...safeUser } = updatedUser;
      return safeUser;
    }
  },

  requests: {
    getAll: async (): Promise<Request[]> => {
      await delay(500);
      return getStorage<Request[]>(KEYS.REQUESTS, SEED_REQUESTS);
    },

    create: async (data: Partial<Request>, user: User): Promise<Request> => {
      await delay(800);
      const requests = getStorage<Request[]>(KEYS.REQUESTS, SEED_REQUESTS);
      
      const newRequest: Request = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title || 'Untitled',
        category: data.category || 'Other',
        description: data.description || '',
        budgetMin: data.budgetMin || 0,
        budgetMax: data.budgetMax || 0,
        deadline: data.deadline || '',
        location: data.location || 'Remote',
        status: 'Open',
        offerCount: 0,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=800&q=80', // Placeholder if no image
        postedBy: user,
        createdAt: new Date().toLocaleDateString()
      };

      requests.unshift(newRequest); // Add to top
      setStorage(KEYS.REQUESTS, requests);
      return newRequest;
    }
  }
};
