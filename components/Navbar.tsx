
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User as UserIcon, LogOut, PlusCircle } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  unreadMessageCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, unreadMessageCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-deepBlue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Search className="h-8 w-8 text-softTeal mr-2" />
            <span className="font-bold text-xl tracking-tight">Unfindable</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user && (
                <>
                  <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link to="/messages" className="relative hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Messages
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/post-request" className="bg-softTeal hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center shadow-lg transform hover:scale-105 transition-all">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Request
            </Link>

            {user ? (
              <>
                <Link to="/notifications" className="p-1 rounded-full hover:bg-gray-700 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-deepBlue bg-red-500"></span>
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
                  >
                    <img src={user.avatar} alt="User" className="h-8 w-8 rounded-full border-2 border-softTeal" />
                  </button>
                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 z-50">
                      <div className="w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 border border-gray-200">
                        <Link 
                          to={`/profile/${user.id}`} 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Public Profile
                        </Link>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                        <button 
                          onClick={() => { onLogout(); setIsDropdownOpen(false); }} 
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Login / Signup
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-deepBlue pb-3 px-2 pt-2 sm:px-3 space-y-1">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Home</Link>
          <Link to="/post-request" className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-softTeal text-white hover:bg-opacity-90 mt-1 mb-1">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post Request
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Dashboard</Link>
              <Link to="/messages" className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                Messages
                {unreadMessageCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </Link>
              <Link to="/notifications" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Notifications</Link>
              <Link to={`/profile/${user.id}`} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">My Profile</Link>
              <button onClick={onLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-red-400">Sign out</button>
            </>
          )}
          {!user && (
             <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 mt-4 text-center border-t border-gray-700 pt-4">Login / Signup</Link>
          )}
        </div>
      )}
    </nav>
  );
};
