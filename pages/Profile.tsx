import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { MapPin, Calendar, Star, CheckCircle, Shield, MessageSquare, Loader2, Edit } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../src/integrations/supabase/client';
import { useReviews, ReviewData } from '../hooks/useReviews';

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// ProfileReviews Component
const ProfileReviews: React.FC<{ userId: string }> = ({ userId }) => {
  const { reviews, loading, averageRating } = useReviews(userId);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-deepBlue">Reviews</h2>
        {averageRating !== null && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
            <span className="font-bold text-lg">{averageRating}</span>
            <span className="text-gray-500 ml-1">({reviews.length} reviews)</span>
          </div>
        )}
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-gray-500 italic py-8 text-center">No reviews yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="py-4">
              <div className="flex items-start gap-4">
                {review.reviewer && (
                  <img
                    src={review.reviewer.avatar}
                    alt={review.reviewer.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">
                      {review.reviewer?.name || 'Anonymous'}
                    </h4>
                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {review.request && (
                    <p className="text-xs text-gray-500 mb-1">
                      For: {review.request.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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

  const isOwnProfile = currentUserId && profileUser && currentUserId === profileUser.id;

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
                            {isOwnProfile ? (
                              <button 
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2 bg-softTeal text-white rounded-lg font-medium hover:bg-opacity-90 flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                              </button>
                            ) : (
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
                            )}
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

            {/* Reviews Section */}
            <ProfileReviews userId={profileUser.id} />
        </div>
    </div>
  );
};
