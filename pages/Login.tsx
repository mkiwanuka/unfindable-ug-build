import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
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
        const user = await api.auth.getUser(session.user.id);
        if (user) {
          onLogin(user);
          navigate('/dashboard');
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

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
        const { error: signInError } = await supabase.auth.signInWithPassword({
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

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deepBlue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-softTeal tracking-tight">Unfindable</h1>
          <p className="mt-2 text-gray-400 text-sm">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              {/* Name Fields */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm text-gray-400 mb-2">First Name</label>
                  <input 
                    id="firstName" 
                    type="text" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Alex" 
                    className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-500 py-2 focus:outline-none focus:border-softTeal transition-colors" 
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm text-gray-400 mb-2">Last Name</label>
                  <input 
                    id="lastName" 
                    type="text" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe" 
                    className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-500 py-2 focus:outline-none focus:border-softTeal transition-colors" 
                  />
                </div>
              </div>
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'requester' }))}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.role === 'requester'
                        ? 'bg-softTeal text-white'
                        : 'border border-gray-600 text-gray-400 hover:border-softTeal hover:text-softTeal'
                    }`}
                  >
                    Post Requests
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'finder' }))}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.role === 'finder'
                        ? 'bg-softTeal text-white'
                        : 'border border-gray-600 text-gray-400 hover:border-softTeal hover:text-softTeal'
                    }`}
                  >
                    Find Items
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">You can change your role anytime</p>
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-2">Email</label>
            <input 
              id="email" 
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com" 
              autoComplete="email"
              className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-500 py-2 focus:outline-none focus:border-softTeal transition-colors" 
            />
          </div>

          {/* Password Field */}
          <div>
<<<<<<< HEAD
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-sm text-gray-400">Password</label>
              {!isSignup && (
                <button 
                  type="button" 
                  className="text-sm text-softTeal hover:text-softTeal/80 transition-colors"
                  onClick={() => {/* TODO: Implement forgot password */}}
                >
                  Forgot?
                </button>
              )}
            </div>
            <input 
              id="password" 
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••" 
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-500 py-2 focus:outline-none focus:border-softTeal transition-colors" 
            />
=======
            <label htmlFor="password" className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="w-full bg-transparent border-b border-gray-600 text-white placeholder-gray-500 py-2 focus:outline-none focus:border-softTeal transition-colors"
            />
            {!isSignup && (
              <button
                type="button"
                className="text-sm text-softTeal hover:text-softTeal/80 transition-colors mt-2"
                onClick={async () => {
                  if (!formData.email) {
                    setError('Please enter your email address first');
                    return;
                  }
                  setError(null);
                  setIsLoading(true);
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) {
                      setError(error.message);
                    } else {
                      setSuccessMessage('Password reset email sent! Check your inbox.');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to send reset email');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Forgot password
              </button>
            )}
>>>>>>> master-local/master
          </div>
           
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 bg-softTeal text-white font-semibold rounded-full uppercase tracking-wider text-sm hover:bg-softTeal/90 focus:outline-none focus:ring-2 focus:ring-softTeal focus:ring-offset-2 focus:ring-offset-deepBlue transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {isSignup ? 'Creating...' : 'Signing In...'}
              </span>
            ) : (
              isSignup ? 'Sign Up' : 'Log In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-deepBlue text-gray-500 text-sm">or</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button 
          type="button" 
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-600 rounded-full text-white text-sm font-medium hover:border-gray-500 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle Sign Up / Sign In */}
        <p className="text-center text-gray-500 text-sm">
          {isSignup ? "Already have an account? " : "Don't have an account yet? "}
          <button 
            onClick={toggleMode} 
            className="text-softTeal font-semibold hover:text-softTeal/80 transition-colors uppercase tracking-wide"
          >
            {isSignup ? 'Sign In' : 'Create One Now'}
          </button>
        </p>
      </div>
    </div>
  );
};
