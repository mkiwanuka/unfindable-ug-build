import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider } from './components/ToastProvider';
import { Home } from './pages/Home';
import { PostRequest } from './pages/PostRequest';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { RequestDetails } from './pages/RequestDetails';
import { Profile } from './pages/Profile';
import { SearchPage } from './pages/SearchPage';
import { Login } from './pages/Login';
import { AboutUs } from './pages/AboutUs';
import { HelpCenter } from './pages/HelpCenter';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ContactUs } from './pages/ContactUs';
import { Press } from './pages/Press';
import { Careers } from './pages/Careers';
import { HowItWorks } from './pages/HowItWorks';
import { GettingStarted } from './pages/GettingStarted';
import { BuyingAndRequests } from './pages/BuyingAndRequests';
import { SellingAndFinding } from './pages/SellingAndFinding';
import { SafetyAndTrust } from './pages/SafetyAndTrust';
import { AccountSettings } from './pages/AccountSettings';
import { Payments } from './pages/Payments';
import { User } from './types';
import { api } from './lib/api';
import { useUnreadMessageCount } from './hooks/useUnreadMessageCount';
import { useUnreadNotificationCount } from './hooks/useUnreadNotificationCount';
import { useOpenRequests, useUpdateRequestInCache, useInvalidateRequests } from './hooks/useRequests';
import { realtimeManager } from './lib/realtimeManager';
import { initNotificationManager } from './lib/notificationManager';
import { requestBrowserNotificationPermission } from './lib/browserNotifications';
import { useMessageNotifications } from './hooks/useMessageNotifications';
import { registerServiceWorker } from './lib/pushNotifications';

// Create QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes cache retention
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Inner app component that uses React Query hooks
const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unreadMessageCount = useUnreadMessageCount(user?.id ?? null);
  const unreadNotificationCount = useUnreadNotificationCount(user?.id ?? null);
  
  // Use React Query for requests
  const { data: requestsData, isLoading: requestsLoading } = useOpenRequests(50);
  const updateRequestInCache = useUpdateRequestInCache();
  const invalidateRequests = useInvalidateRequests();
  
  const requests = requestsData?.data ?? [];

  // Initialize notification systems
  useEffect(() => {
    initNotificationManager();
    registerServiceWorker();
  }, []);

  // Request browser notification permission after user logs in
  useEffect(() => {
    if (user) {
      // Delay slightly to not be intrusive on login
      const timer = setTimeout(() => {
        requestBrowserNotificationPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Listen for global message notifications
  useMessageNotifications(user?.id ?? null);

  // Initialize realtime manager once on mount (singleton persists for app lifetime)
  useEffect(() => {
    realtimeManager.init();
    // Don't cleanup on unmount - singleton should persist and cleanup is protected
  }, []);

  // Initial Load: Check Session
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await api.auth.getCurrentSession();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Real-time subscription for request updates using consolidated manager
  useEffect(() => {
    const unsub = realtimeManager.subscribe('requests', 'UPDATE', (payload) => {
      // Update React Query cache directly
      const newData = payload.new as { id: string; offer_count?: number; status?: string };
      updateRequestInCache(newData.id, {
        offerCount: newData.offer_count,
        status: newData.status as 'Open' | 'In Progress' | 'Completed'
      });
    });
      
    return () => {
      unsub();
    };
  }, [updateRequestInCache]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading || requestsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-offWhite">Loading Unfindable...</div>;
  }

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-offWhite font-sans text-gray-900">
        <Navbar user={user} onLogout={handleLogout} unreadMessageCount={unreadMessageCount} unreadNotificationCount={unreadNotificationCount} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home featuredRequests={requests} />} />
            <Route path="/search" element={<SearchPage requests={requests} />} />
            
            <Route path="/about" element={<AboutUs />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/press" element={<Press />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/buying-requests" element={<BuyingAndRequests />} />
            <Route path="/selling-finding" element={<SellingAndFinding />} />
            <Route path="/safety-trust" element={<SafetyAndTrust />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/payments" element={<Payments />} />

            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />

            <Route path="/post-request" element={
              user ? <PostRequest onPostSuccess={invalidateRequests} currentUser={user} /> : <Navigate to="/login" replace />
            } />

            <Route path="/dashboard" element={
              user ? <Dashboard user={user} requests={requests} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" replace />
            } />

            <Route path="/messages" element={
              user ? <Messages /> : <Navigate to="/login" replace />
            } />

            <Route path="/notifications" element={
              user ? <Notifications /> : <Navigate to="/login" replace />
            } />
            
            <Route path="/profile/:id" element={<Profile />} />

            <Route path="/request/:id" element={
              <RequestDetails requests={requests} currentUser={user} onOfferChange={invalidateRequests} />
            } />

            <Route path="/admin" element={
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
