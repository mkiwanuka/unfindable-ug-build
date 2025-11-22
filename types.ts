
export type UserRole = 'guest' | 'requester' | 'finder' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  location?: string;
  joinedDate?: string;
  verified?: boolean;
  balance?: number;
  skills?: string[];
  rating?: number;
  completedTasks?: number;
  responseTime?: string;
}

export interface Request {
  id: string;
  title: string;
  category: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Completed';
  offerCount: number;
  imageUrl: string;
  postedBy: User;
  createdAt: string;
}

export interface Offer {
  id: string;
  requestId: string;
  finder: User;
  price: number;
  deliveryDays: number;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Chat {
  id: string;
  partner: User;
  requestId: string;
  requestTitle: string;
  lastMessage: string;
  unread: number;
  messages: Message[];
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
}
