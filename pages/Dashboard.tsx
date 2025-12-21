import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Request } from '../types';
<<<<<<< HEAD
import { Package, Star, Settings, FileText, ExternalLink, Loader2, Camera, X, Plus, Check, Search, ChevronDown, Wallet, Clock } from 'lucide-react';
=======
import { Package, Star, Settings, FileText, ExternalLink, Loader2, Camera, X, Plus, Check, Search, ChevronDown, Wallet, Clock, MessageSquare, CheckCircle } from 'lucide-react';
>>>>>>> master-local/master
import { api } from '../lib/api';
import { useReviews, ReviewData } from '../hooks/useReviews';
import { useFinderStats } from '../hooks/useFinderStats';
import { useFinderOffers, OfferWithRequest } from '../hooks/useFinderOffers';
<<<<<<< HEAD
=======
import { useRequestsWithConversations, RequestWithConversation } from '../hooks/useRequestsWithConversations';
import { useAvailableRequests } from '../hooks/useAvailableRequests';
import { useViewedRequests, ViewedRequest } from '../hooks/useViewedRequests';
>>>>>>> master-local/master
import { formatActivityDate, formatRelativeDate } from '../lib/dateUtils';
import { profileUpdateSchema } from '../lib/schemas';

// ReviewsTab Component
const ReviewsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { reviews, loading, averageRating } = useReviews(userId);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue">My Reviews</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue">My Reviews</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-gray-100 p-4 rounded-full mr-4">
            <Star className="h-8 w-8 text-yellow-400 fill-current" />
          </div>
          <div>
            <p className="text-3xl font-bold text-deepBlue">
              {averageRating !== null ? averageRating : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Average Rating ({reviews.length} reviews)
            </p>
          </div>
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-gray-500 italic py-8 text-center">
            No reviews yet. Complete tasks to receive reviews from requesters.
          </div>
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
                      <span className="text-xs text-gray-500">{formatActivityDate(review.created_at)}</span>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`}
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
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Accepted': { bg: 'bg-green-100', text: 'text-green-800' },
    'Rejected': { bg: 'bg-red-100', text: 'text-red-800' },
    'Completed': { bg: 'bg-blue-100', text: 'text-blue-800' },
  };
  
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  return (
    <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs rounded-md font-semibold`}>
      {status}
    </span>
  );
};

<<<<<<< HEAD
// Offers Tab Component
=======
// Browse and Track Tab Component (New - combines offers, chats, available requests, and viewed)
const BrowseAndTrackTab: React.FC<{ userId: string; rating?: number | null }> = ({ userId, rating }) => {
  const { data: myOffers = [], isLoading: offersLoading, error: offersError } = useFinderOffers(userId);
  const { data: activeChats = [], isLoading: chatsLoading, error: chatsError } = useRequestsWithConversations(userId);
  const { data: availableRequests = [], isLoading: availableLoading, error: availableError } = useAvailableRequests(userId, 20);
  const { data: viewedRequests = [], isLoading: viewedLoading, error: viewedError } = useViewedRequests(userId, 20);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const ErrorState: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 bg-red-50 text-center">
      <div className="text-red-400 mb-3">⚠️</div>
      <p className="text-red-800 font-medium">{title}</p>
      <p className="text-sm text-red-600 mt-1">Please try refreshing the page</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-deepBlue">Browse & Track</h2>

      {/* Finder Stats Card */}
      <FinderStatsCard userId={userId} rating={rating} />

      {/* Section 1: My Offers */}
      {offersLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      ) : myOffers.length > 0 ? (
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Offers ({myOffers.length})</h3>
          <div className="space-y-4">
            {myOffers.map((offer) => (
              <div key={offer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/request/${offer.request_id}`}
                      className="font-bold text-lg text-gray-800 hover:text-softTeal transition-colors"
                    >
                      {offer.request?.title || 'Request'}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="font-semibold text-deepBlue">
                        UGX {offer.price.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {offer.delivery_days} day{offer.delivery_days !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeDate(offer.created_at)}</span>
                    </div>
                    {offer.message && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{offer.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={offer.status} />
                    <Link
                      to={`/request/${offer.request_id}`}
                      className="text-sm text-softTeal hover:underline"
                    >
                      View Request
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Section 2: Active Conversations */}
      {chatsError ? (
        <ErrorState title="Failed to load conversations" />
      ) : chatsLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      ) : (
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-softTeal" />
            Active Conversations ({activeChats.length})
          </h3>
          {activeChats.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start chatting about requests below</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChats.map((chat) => (
                <div key={chat.conversationId} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-softTeal transition-colors">
                  <Link
                    to={`/request/${chat.id}`}
                    className="font-semibold text-gray-800 hover:text-softTeal transition-colors block mb-2"
                  >
                    {chat.title}
                  </Link>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{chat.partnerName}</span>
                    <Link
                      to="/messages"
                      className="text-softTeal hover:underline font-medium"
                    >
                      Continue Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 3: Available Requests */}
      {availableError ? (
        <ErrorState title="Failed to load available requests" />
      ) : availableLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Search className="h-5 w-5 mr-2 text-softTeal" />
              Available Requests ({availableRequests.length})
            </h3>
            <Link to="/search" className="text-sm text-softTeal hover:underline font-medium">
              Browse All
            </Link>
          </div>
          {availableRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No new available requests right now</p>
              <p className="text-sm text-gray-400 mt-1">Check back later or browse all requests</p>
              <Link
                to="/search"
                className="inline-flex items-center bg-softTeal text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all mt-4"
              >
                <Search className="mr-2 h-4 w-4" /> Browse All Requests
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRequests.map((req) => (
                <Link
                  key={req.id}
                  to={`/request/${req.id}`}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-softTeal hover:shadow-md transition-all group"
                >
                  {req.imageUrl && (
                    <img
                      src={req.imageUrl}
                      alt={req.title}
                      className="w-full h-32 object-cover rounded mb-3 group-hover:opacity-80 transition-opacity"
                    />
                  )}
                  <h4 className="font-semibold text-gray-800 group-hover:text-softTeal transition-colors mb-1 line-clamp-2">
                    {req.title}
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-deepBlue">
                      UGX {req.budgetMin.toLocaleString()} - {req.budgetMax.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{req.offerCount} offers</span>
                  </div>
                  <p className="text-xs text-gray-500">{req.location}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 4: Recently Viewed */}
      {viewedError ? (
        <ErrorState title="Failed to load recently viewed requests" />
      ) : viewedLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      ) : (
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-softTeal" />
            Recently Viewed ({viewedRequests.length})
          </h3>
          {viewedRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No viewed requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Start browsing requests to see your history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {viewedRequests.map((viewed) => (
                <Link
                  key={viewed.requestId}
                  to={`/request/${viewed.requestId}`}
                  className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-softTeal hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-softTeal transition-colors">
                        {viewed.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {viewed.category} • UGX {viewed.budgetMin.toLocaleString()} - {viewed.budgetMax.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      Viewed {formatTimeAgo(viewed.viewedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// Offers Tab Component (kept for backwards compatibility, but no longer used)
>>>>>>> master-local/master
const OffersTab: React.FC<{ userId: string; rating?: number | null }> = ({ userId, rating }) => {
  const { offers, loading, error } = useFinderOffers(userId);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-deepBlue">My Offers</h2>
        <FinderStatsCard userId={userId} rating={rating} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <Loader2 className="h-6 w-6 text-softTeal animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-deepBlue">My Offers</h2>
      
      {/* Finder Stats Card */}
      <FinderStatsCard userId={userId} rating={rating} />
      
      {offers.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-medium">You haven't made any offers yet.</p>
          <p className="text-gray-500 text-sm mb-6">
            Help people find what they need — and get paid for it.
          </p>
          <Link 
            to="/search" 
            className="inline-flex items-center bg-softTeal text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all"
          >
            <Search className="mr-2 h-5 w-5" /> Browse Open Requests
          </Link>
        </div>
      ) : (
        /* Offers List */
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <Link 
                    to={`/request/${offer.request_id}`}
                    className="font-bold text-lg text-gray-800 hover:text-softTeal transition-colors"
                  >
                    {offer.request?.title || 'Request'}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="font-semibold text-deepBlue">
                      UGX {offer.price.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {offer.delivery_days} day{offer.delivery_days !== 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeDate(offer.created_at)}</span>
                  </div>
                  {offer.message && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{offer.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={offer.status} />
                  <Link 
                    to={`/request/${offer.request_id}`}
                    className="text-sm text-softTeal hover:underline"
                  >
                    View Request
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Finder Stats Card Component
const FinderStatsCard: React.FC<{ userId: string; rating?: number | null }> = ({ userId, rating }) => {
  const { totalOffersMade, acceptedOffers, moneyEarned, loading } = useFinderStats(userId);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-deepBlue to-blue-700 rounded-xl p-6 text-white">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-deepBlue to-blue-700 rounded-xl p-6 text-white">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <Wallet className="h-5 w-5 mr-2" />
        Finder Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-blue-200 text-sm">Offers Made</p>
          <p className="text-2xl font-bold">{totalOffersMade}</p>
        </div>
        <div>
          <p className="text-blue-200 text-sm">Offers Accepted</p>
          <p className="text-2xl font-bold">{acceptedOffers}</p>
        </div>
        <div>
          <p className="text-blue-200 text-sm">Money Earned</p>
          <p className="text-2xl font-bold">UGX {moneyEarned.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-200 text-sm">Rating</p>
          <p className="text-2xl font-bold flex items-center">
            {rating ? (
              <>
                {rating} <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
              </>
            ) : (
              <span className="text-sm text-blue-200">No reviews yet</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  user: User;
  requests: Request[];
  onUserUpdate: (user: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, requests, onUserUpdate }) => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'settings' | 'reviews'>(
    user.role === 'finder' ? 'offers' : 'requests'
=======
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'browse' | 'settings' | 'reviews'>(
    user.role === 'finder' ? 'browse' : 'active'
>>>>>>> master-local/master
  );
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showFinderOnboarding, setShowFinderOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    location: user.location || '',
    skills: user.skills || [],
    newSkill: ''
  });

  // Onboarding Form State
  const [onboardingForm, setOnboardingForm] = useState({
    location: user.location || '',
    bio: user.bio || '',
    skills: user.skills || [],
    newSkill: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onboardingFileRef = useRef<HTMLInputElement>(null);

  const SUGGESTED_SKILLS = [
    'Business & Office',
    'Vehicles & Transport',
    'Fashion & Accessories',
    'Electronics & Gadgets',
    'Tools & Hardware',
    'Home & Living',
    'Health & Medicine',
    'Professional Services'
  ];

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'requester' | 'finder';
    if (newRole === user.role) return;

    // Check if onboarding is needed
    if (newRole === 'finder' && (!user.location || !user.bio || !user.skills || user.skills.length === 0)) {
        setShowFinderOnboarding(true);
        return;
    }

    setIsUpdatingRole(true);
    try {
      const updatedUser = await api.auth.updateUserRole(user.id, newRole);
      onUserUpdate(updatedUser);
<<<<<<< HEAD
      setActiveTab(newRole === 'finder' ? 'offers' : 'requests');
=======
      setActiveTab(newRole === 'finder' ? 'browse' : 'active');
>>>>>>> master-local/master
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to switch role. Please try again.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatarUrl = reader.result as string;
         try {
            const updatedUser = await api.auth.updateUser(user.id, { avatar: newAvatarUrl });
            onUserUpdate(updatedUser);
        } catch (error) {
            console.error("Failed to update avatar", error);
            alert("Failed to update profile picture.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Settings Page Handlers
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettingsForm({ ...settingsForm, [e.target.name]: e.target.value });
  };

  const addSettingsSkill = () => {
    if (settingsForm.newSkill && !settingsForm.skills.includes(settingsForm.newSkill)) {
      setSettingsForm({
        ...settingsForm,
        skills: [...settingsForm.skills, settingsForm.newSkill],
        newSkill: ''
      });
    }
  };

  const removeSettingsSkill = (skillToRemove: string) => {
    setSettingsForm({
      ...settingsForm,
      skills: settingsForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const saveSettings = async () => {
      // Validate using zod schema
      const validation = profileUpdateSchema.safeParse({
        name: settingsForm.name,
        bio: settingsForm.bio,
        location: settingsForm.location,
        skills: settingsForm.skills,
      });

      if (!validation.success) {
        alert(validation.error.issues[0]?.message || 'Invalid input');
        return;
      }

      try {
          const updatedUser = await api.auth.updateUser(user.id, {
              name: settingsForm.name,
              bio: settingsForm.bio,
              location: settingsForm.location,
              skills: settingsForm.skills
          });
          onUserUpdate(updatedUser);
          alert("Profile updated successfully!");
      } catch (e) {
          console.error(e);
          alert("Failed to update settings.");
      }
  };

  // Onboarding Handlers
  const handleOnboardingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOnboardingForm({ ...onboardingForm, [e.target.name]: e.target.value });
  };

  const addOnboardingSkill = (skill: string) => {
    if (skill && !onboardingForm.skills.includes(skill)) {
      setOnboardingForm({
        ...onboardingForm,
        skills: [...onboardingForm.skills, skill],
        newSkill: ''
      });
    }
  };

  const removeOnboardingSkill = (skillToRemove: string) => {
    setOnboardingForm({
      ...onboardingForm,
      skills: onboardingForm.skills.filter(s => s !== skillToRemove)
    });
  };
  
  const handleOnboardingAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatarUrl = reader.result as string;
        // Update immediately for the UI, or store in state? 
        // Storing in User directly for visual feedback on the modal
        const updatedUser = await api.auth.updateUser(user.id, { avatar: newAvatarUrl });
        onUserUpdate(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const completeOnboarding = async () => {
      // Validate using zod schema
      const validation = profileUpdateSchema.safeParse({
        location: onboardingForm.location,
        bio: onboardingForm.bio,
        skills: onboardingForm.skills,
      });

      if (!validation.success) {
        alert(validation.error.issues[0]?.message || 'Invalid input');
        return;
      }

      if (!onboardingForm.location || !onboardingForm.bio || onboardingForm.skills.length === 0) {
          alert("Please complete all fields.");
          return;
      }
      
      try {
          // Update profile first
          await api.auth.updateUser(user.id, {
              location: onboardingForm.location,
              bio: onboardingForm.bio,
              skills: onboardingForm.skills
          });
          
          // Then update role
          const updatedUser = await api.auth.updateUserRole(user.id, 'finder');
          onUserUpdate(updatedUser);
          setShowFinderOnboarding(false);
<<<<<<< HEAD
          setActiveTab('offers');
=======
          setActiveTab('browse');
>>>>>>> master-local/master
      } catch (e) {
          console.error(e);
          alert("Failed to complete onboarding.");
      }
  };

  return (
    <div className="min-h-screen bg-offWhite py-8 relative">
      {/* Finder Onboarding Modal */}
      {showFinderOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-deepBlue px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Become a Finder</h2>
                        <p className="text-blue-200 text-sm">Complete your profile to start finding items.</p>
                    </div>
                    <button onClick={() => setShowFinderOnboarding(false)} className="text-white hover:text-gray-300">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                     {/* 1. Profile Photo */}
                     <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => onboardingFileRef.current?.click()}>
                             <img src={user.avatar} alt="Profile" className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover" />
                             <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white" />
                             </div>
                             <input 
                                type="file" 
                                ref={onboardingFileRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleOnboardingAvatarChange}
                             />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Upload a clear profile picture</p>
                     </div>

                     {/* 2. Location */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Location (City, Country)</label>
                        <input 
                            type="text" 
                            name="location"
                            value={onboardingForm.location}
                            onChange={handleOnboardingChange}
                            placeholder="e.g. Kampala, Uganda"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]"
                        />
                     </div>

                     {/* 3. Bio */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">About Me / Bio</label>
                        <textarea 
                            name="bio"
                            value={onboardingForm.bio}
                            onChange={handleOnboardingChange}
                            rows={3}
                            placeholder="Tell others who you are and what you're great at finding..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]"
                        ></textarea>
                     </div>

                     {/* 4. Skills (Categories) */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {SUGGESTED_SKILLS.map(skill => (
                                <button 
                                    key={skill}
                                    type="button"
                                    onClick={() => onboardingForm.skills.includes(skill) ? removeOnboardingSkill(skill) : addOnboardingSkill(skill)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        onboardingForm.skills.includes(skill) 
                                        ? 'bg-softTeal text-white border-softTeal' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-softTeal'
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text"
                                name="newSkill"
                                value={onboardingForm.newSkill}
                                onChange={handleOnboardingChange}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOnboardingSkill(onboardingForm.newSkill))}
                                placeholder="Add custom category..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-softTeal focus:outline-none bg-[#F3F4F6]"
                            />
                            <button 
                                type="button" 
                                onClick={() => addOnboardingSkill(onboardingForm.newSkill)}
                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2 p-4 bg-[#F3F4F6] rounded-lg border border-gray-100 min-h-[60px]">
                            {onboardingForm.skills.length === 0 && <span className="text-gray-400 text-sm italic">No categories selected yet.</span>}
                            {onboardingForm.skills.map(skill => (
                                <span key={skill} className="bg-white border border-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                                    {skill}
                                    <button onClick={() => removeOnboardingSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                     </div>

                     <button 
                        onClick={completeOnboarding}
                        className="w-full bg-deepBlue text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        Complete Profile & Become Finder
                     </button>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-xl shadow-sm p-6 h-fit">
            {/* Collapsible Profile Section on Mobile */}
            <div className="flex flex-col items-center mb-4 md:mb-8">
              <div className="relative group cursor-pointer mb-3" onClick={handleAvatarClick}>
                  <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full border-4 border-gray-50 object-cover" />
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
              </div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <span className="text-xs uppercase tracking-wider font-semibold text-softTeal bg-blue-50 px-2 py-1 rounded mt-1">{user.role}</span>
              <Link to={`/profile/${user.id}`} className="text-xs text-gray-400 mt-2 hover:text-deepBlue flex items-center">View Public Profile <ExternalLink className="h-3 w-3 ml-1" /></Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mb-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="font-medium text-gray-700">Menu</span>
              <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <nav className={`space-y-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              
              {user.role === 'requester' && (
<<<<<<< HEAD
                <button
                  onClick={() => { setActiveTab('requests'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'requests' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FileText className="mr-3 h-5 w-5" /> My Requests
                </button>
=======
                <>
                  <button
                    onClick={() => { setActiveTab('active'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'active' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FileText className="mr-3 h-5 w-5" /> Active Requests
                  </button>
                  <button
                    onClick={() => { setActiveTab('completed'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <CheckCircle className="mr-3 h-5 w-5" /> Completed
                  </button>
                </>
>>>>>>> master-local/master
              )}
              {user.role === 'finder' && (
                <>
                   <button
<<<<<<< HEAD
                    onClick={() => { setActiveTab('offers'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'offers' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Package className="mr-3 h-5 w-5" /> My Offers
=======
                    onClick={() => { setActiveTab('browse'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'browse' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Search className="mr-3 h-5 w-5" /> Browse & Track
>>>>>>> master-local/master
                  </button>
                  <button
                    onClick={() => { setActiveTab('reviews'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Star className="mr-3 h-5 w-5" /> Reviews
                  </button>
                </>
              )}
               <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings className="mr-3 h-5 w-5" /> Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Requests Tab */}
<<<<<<< HEAD
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-deepBlue">My Active Requests</h2>
                {requests.length > 0 ? (
                  requests.filter(r => r.postedBy.id === user.id).map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{req.title}</h3>
                        <p className="text-sm text-gray-500">Posted {formatRelativeDate(req.createdAt)}</p>
                        <div className="mt-2 flex space-x-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-semibold">{req.status}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-semibold">{req.offerCount} Offers Received</span>
                        </div>
                      </div>
                      <Link to={`/request/${req.id}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-center">
                         Manage Offers
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No requests posted yet.</p>
                    <Link to="/post-request" className="bg-softTeal text-white px-4 py-2 rounded-lg text-sm font-medium">Post Your First Request</Link>
=======
            {/* Active Requests Tab - Requester Only */}
            {activeTab === 'active' && user.role === 'requester' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-deepBlue">My Active Requests</h2>
                {requests.length > 0 ? (
                  requests
                    .filter(r => r.postedBy.id === user.id && (r.status === 'Open' || r.status === 'In Progress') && !r.archived)
                    .map(req => (
                      <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{req.title}</h3>
                          <p className="text-sm text-gray-500">Posted {formatRelativeDate(req.createdAt)}</p>
                          <div className="mt-2 flex space-x-3">
                            <span className={`px-2 py-1 text-xs rounded-md font-semibold ${req.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {req.status}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-semibold">{req.offerCount} Offers Received</span>
                          </div>
                        </div>
                        <Link to={`/request/${req.id}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-center">
                           Manage Offers
                        </Link>
                      </div>
                    ))
                ) : (
                  <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No active requests. Great work finishing them!</p>
                    <Link to="/post-request" className="bg-softTeal text-white px-4 py-2 rounded-lg text-sm font-medium">Post a New Request</Link>
>>>>>>> master-local/master
                  </div>
                )}
              </div>
            )}

<<<<<<< HEAD
             {/* Offers Tab (Finder) */}
             {activeTab === 'offers' && (
              <OffersTab userId={user.id} rating={user.rating} />
=======
            {/* Completed Requests Tab - Requester Only */}
            {activeTab === 'completed' && user.role === 'requester' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-deepBlue">Completed Requests</h2>
                <p className="text-gray-600">Your completed requests and their history</p>
                {requests.length > 0 ? (
                  requests
                    .filter(r => r.postedBy.id === user.id && r.status === 'Completed' && !r.archived)
                    .map(req => (
                      <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{req.title}</h3>
                          <p className="text-sm text-gray-500">Posted {formatRelativeDate(req.createdAt)}</p>
                          {req.completedAt && (
                            <p className="text-sm text-green-600 font-medium">Completed {formatRelativeDate(req.completedAt)}</p>
                          )}
                          <div className="mt-2 flex space-x-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-semibold">Completed</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md font-semibold">{req.offerCount} Offer(s)</span>
                          </div>
                        </div>
                        <Link to={`/request/${req.id}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-center">
                           View Details
                        </Link>
                      </div>
                    ))
                ) : (
                  <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No completed requests yet. Start by posting a request!</p>
                  </div>
                )}
              </div>
            )}

             {/* Browse & Track Tab (Finder) */}
             {activeTab === 'browse' && (
              <BrowseAndTrackTab userId={user.id} rating={user.rating} />
>>>>>>> master-local/master
             )}

             {/* Reviews Tab (Finder Only) */}
            {activeTab === 'reviews' && (
              <ReviewsTab userId={user.id} />
            )}

            {/* Settings Tab */}
             {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                 <h2 className="text-2xl font-bold text-deepBlue mb-6">Profile Settings</h2>
                 <form className="space-y-6">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            name="name"
                            value={settingsForm.name}
                            onChange={handleSettingsChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all" 
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            name="email"
                            value={settingsForm.email}
                            onChange={handleSettingsChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all" 
                          />
                       </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label>
                        <input 
                            type="text" 
                            name="location"
                            value={settingsForm.location}
                            onChange={handleSettingsChange}
                            placeholder="e.g. Kampala, Uganda"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all" 
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea 
                            name="bio"
                            value={settingsForm.bio}
                            onChange={handleSettingsChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none transition-all" 
                            rows={3} 
                        ></textarea>
                    </div>
                    
                    {/* Skills (Only if Finder) */}
                    {user.role === 'finder' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {settingsForm.skills.map(skill => (
                                    <span key={skill} className="bg-blue-50 text-deepBlue border border-blue-100 px-3 py-1 rounded-full text-sm flex items-center">
                                        {skill}
                                        <button type="button" onClick={() => removeSettingsSkill(skill)} className="ml-2 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    name="newSkill"
                                    value={settingsForm.newSkill}
                                    onChange={handleSettingsChange}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSettingsSkill())}
                                    placeholder="Add a category" 
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none"
                                />
                                <button type="button" onClick={addSettingsSkill} className="bg-gray-100 hover:bg-gray-200 px-4 rounded-md">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Role Switcher */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                        <div className="relative">
                          <select 
                            value={user.role} 
                            onChange={handleRoleChange}
                            disabled={isUpdatingRole}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-softTeal focus:outline-none cursor-pointer"
                          >
                              <option value="requester">Requester</option>
                              <option value="finder">Finder</option>
                          </select>
                          {isUpdatingRole && (
                             <div className="absolute right-3 top-2.5">
                               <Loader2 className="h-5 w-5 animate-spin text-softTeal" />
                             </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Switching roles will update your available features.</p>
                    </div>
                    
                    <button type="button" onClick={saveSettings} className="bg-deepBlue text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-opacity">Save Changes</button>
                 </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
