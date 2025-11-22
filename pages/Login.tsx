
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { Mail, Smartphone, Globe, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

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
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (isSignup && (!formData.firstName || !formData.lastName)) {
       setError("Please provide your full name.");
       setIsLoading(false);
       return;
    }

    try {
      let user;
      if (isSignup) {
        user = await api.auth.signup(formData);
      } else {
        user = await api.auth.login(formData.email, formData.password);
      }
      
      onLogin(user);
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    setFormData({ firstName: '', lastName: '', email: '', password: '' });
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

           {isSignup && (
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
           )}
           <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com" 
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
            <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
               <Globe className="h-4 w-4 mr-2 text-red-500" /> Google
            </button>
            <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
               <Smartphone className="h-4 w-4 mr-2 text-gray-500" /> Phone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
