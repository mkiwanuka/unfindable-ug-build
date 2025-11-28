
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { MapPin, Calendar, Star, CheckCircle, Shield, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../src/integrations/supabase/client';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const user = await api.auth.getUser(id);
          setProfileUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [id]);

  const handleMessageClick = async () => {
    if (!profileUser) return;
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to send a message');
      navigate('/login');
      return;
    }
    
    // Navigate with the user ID to start a conversation
    setMessagingLoading(true);
    navigate('/messages', { 
      state: { 
        startChatWithUserId: profileUser.id 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offWhite flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-softTeal animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-offWhite flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deepBlue">User not found</h2>
          <p className="text-gray-600">The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhite py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-deepBlue to-softTeal"></div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end -mt-12 mb-6">
                        <img src={profileUser.avatar} alt={profileUser.name} className="h-32 w-32 rounded-full border-4 border-white shadow-md object-cover" />
                        <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                            <div className="flex items-center">
                                <h1 className="text-3xl font-bold text-deepBlue mr-3">{profileUser.name}</h1>
                                {profileUser.verified && <Shield className="h-5 w-5 text-softTeal fill-current" />}
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                {profileUser.location && (
                                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {profileUser.location}</span>
                                )}
                                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Joined {profileUser.joinedDate || 'Recently'}</span>
                                <span className="flex items-center uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{profileUser.role}</span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button 
                              onClick={handleMessageClick}
                              disabled={messagingLoading}
                              className="px-6 py-2 bg-deepBlue text-white rounded-lg font-medium hover:bg-opacity-90 flex items-center disabled:opacity-50"
                            >
                              {messagingLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              Message
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="md:col-span-2">
                             <h3 className="font-bold text-gray-800 mb-2">About</h3>
                             <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                               {profileUser.bio || "No bio available."}
                             </p>

                             {profileUser.skills && profileUser.skills.length > 0 && (
                                 <div className="mt-6">
                                     <h3 className="font-bold text-gray-800 mb-3">Skills & Specialties</h3>
                                     <div className="flex flex-wrap gap-2">
                                         {profileUser.skills.map((skill, i) => (
                                             <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
                                         ))}
                                     </div>
                                 </div>
                             )}
                         </div>
                         <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                             <div className="flex justify-between items-center mb-4">
                                 <span className="text-gray-600">Rating</span>
                                 <span className="flex items-center font-bold text-xl text-deepBlue">
                                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" /> 
                                    {profileUser.rating !== undefined && profileUser.rating > 0 ? profileUser.rating : 'N/A'}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center mb-4">
                                 <span className="text-gray-600">Completed Tasks</span>
                                 <span className="font-bold text-xl text-deepBlue flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-1" /> 
                                    {profileUser.completedTasks !== undefined ? profileUser.completedTasks : 0}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-gray-600">Response Time</span>
                                 <span className="font-bold text-xl text-deepBlue">
                                    {profileUser.responseTime || 'N/A'}
                                 </span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section - Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-deepBlue mb-6">Reviews</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="text-gray-500 italic">No reviews available.</div>
                </div>
            </div>
        </div>
    </div>
  );
};
