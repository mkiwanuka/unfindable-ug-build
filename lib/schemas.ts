import { z } from 'zod';

// Login/Signup validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
});

export const signupSchema = loginSchema.extend({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  role: z.enum(['requester', 'finder']),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatar: z.string().max(100000, 'Avatar data too large').optional(),
  bio: z.string().max(2000, 'Bio must be less than 2000 characters').optional(),
  location: z.string().max(255, 'Location too long').optional(),
  skills: z.array(z.string().min(1).max(100)).max(20, 'Too many skills').optional(),
  responseTime: z.string().max(100, 'Response time too long').optional(),
});

// Request creation validation
export const requestCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  budgetMin: z.number().min(0, 'Budget must be positive'),
  budgetMax: z.number().min(0, 'Budget must be positive'),
  deadline: z.string().min(1, 'Deadline is required'),
  location: z.string().min(1, 'Location is required').max(255, 'Location too long'),
  imageUrl: z.string().max(100000, 'Image data too large').optional().nullable(),
});

// Offer validation
export const offerSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  price: z.number().positive('Price must be positive'),
  deliveryDays: z.number().int('Delivery days must be a whole number').positive('Delivery days must be positive'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
});

// Message validation
export const messageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

// Report validation
export const reportSchema = z.object({
  reportedType: z.enum(['request', 'user', 'offer']),
  reportedId: z.string().uuid('Invalid ID'),
  reason: z.string().min(1, 'Reason is required').max(100, 'Reason too long'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
});

// Type exports for use in components
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type RequestCreateInput = z.infer<typeof requestCreateSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
