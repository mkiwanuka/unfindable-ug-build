import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, MessageSquare, DollarSign, Info, CheckCheck } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';
import { realtimeManager } from '../lib/realtimeManager';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  reference_id: string | null;
  reference_type: string | null;
  read: boolean;
  created_at: string;
}

type FilterType = 'all' | 'unread' | 'offers';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (filter === 'unread') {
      query = query.eq('read', false);
    } else if (filter === 'offers') {
      query = query.eq('type', 'offer');
    }

    const { data, error } = await query;

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }, [currentUserId, filter]);

  useEffect(() => {
    if (!currentUserId) return;
    
    fetchNotifications();

    // Use consolidated realtime manager
    const unsub = realtimeManager.subscribe('notifications', '*', (payload) => {
      const userId = (payload.new as { user_id?: string })?.user_id || 
                     (payload.old as { user_id?: string })?.user_id;
      if (userId === currentUserId) {
        fetchNotifications();
      }
    });

    return () => {
      unsub();
    };
  }, [currentUserId, filter, fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
    }

    // Navigate based on type and reference
    if (notification.reference_id) {
      switch (notification.reference_type) {
        case 'request':
          navigate(`/request/${notification.reference_id}`);
          break;
        case 'conversation':
          navigate('/messages', { state: { conversationId: notification.reference_id } });
          break;
        case 'offer':
          navigate(`/request/${notification.reference_id}`);
          break;
        default:
          break;
      }
    } else if (notification.type === 'payment') {
      navigate('/dashboard');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', currentUserId)
      .eq('read', false);

    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-offWhite py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-deepBlue flex items-center">
            <Bell className="mr-3 h-6 w-6" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-2.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </h1>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm text-softTeal hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center space-x-4 text-sm">
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 -mb-3.5 ${filter === 'all' ? 'font-bold text-deepBlue border-b-2 border-deepBlue' : 'font-medium text-gray-500 hover:text-deepBlue'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-3 ${filter === 'unread' ? 'font-bold text-deepBlue border-b-2 border-deepBlue -mb-3.5' : 'font-medium text-gray-500 hover:text-deepBlue'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('offers')}
              className={`pb-3 ${filter === 'offers' ? 'font-bold text-deepBlue border-b-2 border-deepBlue -mb-3.5' : 'font-medium text-gray-500 hover:text-deepBlue'}`}
            >
              Offers
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepBlue mx-auto mb-4"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 hover:bg-gray-50 transition-colors flex items-start cursor-pointer ${
                    notif.read ? '' : 'bg-blue-50 bg-opacity-40'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full mr-4 flex-shrink-0 ${
                      notif.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className={`text-sm font-bold truncate ${
                          notif.read ? 'text-gray-700' : 'text-gray-900'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        notif.read ? 'text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {notif.content}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="ml-4 flex-shrink-0">
                      <span className="block h-2 w-2 bg-red-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No notifications yet.</p>
                <p className="text-sm mt-2">
                  {filter !== 'all'
                    ? 'Try changing the filter to see more.'
                    : "You'll be notified when something happens."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
