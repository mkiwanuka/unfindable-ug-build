import React from 'react';
import { Bell, Package, MessageSquare, DollarSign, Info, Filter } from 'lucide-react';

export const Notifications: React.FC = () => {
  // Mock data
  const notifications = [
      { id: 1, type: 'offer', title: 'New Offer Received', text: 'Sarah Finder offered $95 for "Vintage Gameboy"', time: '2 mins ago', read: false },
      { id: 2, type: 'message', title: 'New Message', text: 'Mike Hunter sent you a message regarding "Rare Book"', time: '1 hour ago', read: false },
      { id: 3, type: 'system', title: 'Request Expiring', text: 'Your request "Vintage Lamp" expires in 24 hours.', time: '1 day ago', read: true },
      { id: 4, type: 'payment', title: 'Payment Released', text: 'Funds for "Lost Keys" have been released to Finder.', time: '2 days ago', read: true },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'offer': return <Package className="h-5 w-5 text-blue-500" />;
          case 'message': return <MessageSquare className="h-5 w-5 text-purple-500" />;
          case 'payment': return <DollarSign className="h-5 w-5 text-green-500" />;
          default: return <Info className="h-5 w-5 text-gray-500" />;
      }
  };

  return (
    <div className="min-h-screen bg-offWhite py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-deepBlue flex items-center">
                    <Bell className="mr-3 h-6 w-6" /> Notifications
                </h1>
                <button className="text-sm text-softTeal hover:underline">Mark all as read</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center space-x-4 text-sm">
                    <button className="font-bold text-deepBlue border-b-2 border-deepBlue pb-3 -mb-3.5">All</button>
                    <button className="font-medium text-gray-500 hover:text-deepBlue pb-3">Unread</button>
                    <button className="font-medium text-gray-500 hover:text-deepBlue pb-3">Offers</button>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className={`p-6 hover:bg-gray-50 transition-colors flex items-start ${notif.read ? '' : 'bg-blue-50 bg-opacity-40'}`}>
                                <div className={`p-2 rounded-full mr-4 flex-shrink-0 ${notif.read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                                        <span className="text-xs text-gray-400">{notif.time}</span>
                                    </div>
                                    <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-800'}`}>{notif.text}</p>
                                </div>
                                {!notif.read && (
                                    <div className="ml-4">
                                        <span className="block h-2 w-2 bg-red-500 rounded-full"></span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p>No notifications yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};