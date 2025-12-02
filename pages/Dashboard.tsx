import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Request } from '../types';
import { Package, Star, Settings, FileText, ExternalLink, MessageSquare, Loader2, Camera, X, Plus, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useReviews, ReviewData } from '../hooks/useReviews';
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

interface DashboardProps {
  user: User;
  requests: Request[];
  onUserUpdate: (user: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, requests, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'settings' | 'reviews'>(
    user.role === 'finder' ? 'offers' : 'requests'
  );
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showFinderOnboarding, setShowFinderOnboarding] = useState(false);
  
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
      setActiveTab(newRole === 'finder' ? 'offers' : 'requests');
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
          setActiveTab('offers');
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
                            placeholder="Tell others who you are and what you’re great at finding..."
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
            <div className="flex flex-col items-center mb-8">
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
            
            <nav className="space-y-1">
              {user.role === 'requester' && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'requests' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FileText className="mr-3 h-5 w-5" /> My Requests
                </button>
              )}
              {user.role === 'finder' && (
                <>
                   <button
                    onClick={() => setActiveTab('offers')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'offers' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Package className="mr-3 h-5 w-5" /> My Offers
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Star className="mr-3 h-5 w-5" /> Reviews
                  </button>
                </>
              )}
               <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-deepBlue text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings className="mr-3 h-5 w-5" /> Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Requests Tab */}
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
                  </div>
                )}
              </div>
            )}

             {/* Offers Tab (Finder) */}
             {activeTab === 'offers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-deepBlue">My Offers</h2>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-center py-4">
                      Your offers will appear here. Browse requests and make offers to get started!
                    </p>
                    <div className="text-center mt-2">
                      <Link to="/search" className="text-softTeal hover:underline text-sm font-medium">
                        Browse Requests
                      </Link>
                    </div>
                  </div>
              </div>
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
