import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Globe, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';
import { User } from '../types';
import { api } from '../lib/api';
import { loginSchema, signupSchema } from '../lib/schemas';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'requester' as 'requester' | 'finder'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // User is already logged in, fetch full user data with role
        const user = await api.auth.getUser(session.user.id);
        if (user) {
          onLogin(user);
          navigate('/dashboard');
        }
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer the API call to avoid deadlock
          setTimeout(async () => {
            const user = await api.auth.getUser(session.user.id);
            if (user) {
              onLogin(user);
              navigate('/dashboard');
            }
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, onLogin]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Validate using zod schemas
    try {
      if (isSignup) {
        const result = signupSchema.safeParse({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        if (!result.success) {
          setError(result.error.issues[0]?.message || 'Invalid input');
          setIsLoading(false);
          return;
        }
      } else {
        const result = loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });
        if (!result.success) {
          setError(result.error.issues[0]?.message || 'Invalid input');
          setIsLoading(false);
          return;
        }
      }
    } catch {
      setError('Validation failed');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignup) {
        // Sign up with email redirect
        const redirectUrl = `${window.location.origin}/`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              selectedRole: formData.role
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(signUpError.message);
          }
        } else if (data.user) {
          setSuccessMessage('Account created! Please check your email to confirm your account.');
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before signing in.');
          } else {
            setError(signInError.message);
          }
        }
        // Navigation will be handled by onAuthStateChange
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    setSuccessMessage(null);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'requester' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-deepBlue">
            {isSignup ? 'Create your account' : 'Sign in to Unfindable'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or <button onClick={toggleMode} className="font-medium text-softTeal hover:text-blue-500 transition-colors underline focus:outline-none">
              {isSignup ? 'sign in to existing account' : 'create a new account'}
            </button>
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
             </div>
           )}

           {successMessage && (
             <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {successMessage}
             </div>
           )}

           {isSignup && (
             <>
               <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      id="firstName" 
                      type="text" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Alex" 
                      className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-softTeal focus:border-softTeal sm:text-sm bg-[#F3F4F6]" 
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      id="lastName" 
                      type="text" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Doe" 
                      className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-softTeal focus:border-softTeal sm:text-sm bg-[#F3F4F6]" 
                    />
                  </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-3">I want to...</label>
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, role: 'requester' }))}
                     className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-all ${
                       formData.role === 'requester'
                         ? 'border-deepBlue bg-deepBlue text-white shadow-md'
                         : 'border-gray-300 bg-white text-gray-700 hover:border-deepBlue'
                     }`}
                   >
                     Post Requests
                   </button>
                   <button
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, role: 'finder' }))}
                     className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-all ${
                       formData.role === 'finder'
                         ? 'border-deepBlue bg-deepBlue text-white shadow-md'
                         : 'border-gray-300 bg-white text-gray-700 hover:border-deepBlue'
                     }`}
                   >
                     Find Items
                   </button>
                 </div>
                 <p className="mt-2 text-xs text-gray-500">You can change your role anytime from your account settings</p>
               </div>
             </>
           )}
           <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com" 
                autoComplete="email"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-softTeal focus:border-softTeal sm:text-sm bg-[#F3F4F6]" 
              />
           </div>
           <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••" 
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-softTeal focus:border-softTeal sm:text-sm bg-[#F3F4F6]" 
              />
           </div>
           
           <button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-deepBlue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deepBlue transition-all shadow-md mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isLoading ? (
               <>
                 <Loader2 className="animate-spin h-5 w-5 mr-2" />
                 {isSignup ? 'Creating Account...' : 'Signing In...'}
               </>
             ) : (
               isSignup ? 'Sign Up with Email' : 'Sign In'
             )}
           </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" disabled>
               <Globe className="h-4 w-4 mr-2 text-red-500" /> Google
            </button>
            <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" disabled>
               <Smartphone className="h-4 w-4 mr-2 text-gray-500" /> Phone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
