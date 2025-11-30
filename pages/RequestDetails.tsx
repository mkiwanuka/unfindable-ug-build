import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Request, Offer, User, UserRole } from '../types';
import { MapPin, Clock, DollarSign, Share2, Flag, User as UserIcon, Star, Send, Package, CheckCircle, XCircle, Edit, X, Loader2, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../src/integrations/supabase/client';
import { ReportModal } from '../components/ReportModal';
import { ReviewModal } from '../components/ReviewModal';
import { useReviews } from '../hooks/useReviews';

interface RequestDetailsProps {
  requests: Request[];
  currentUser: User | null;
  onOfferChange?: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ requests, currentUser, onOfferChange }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = requests.find(r => r.id === id);
  
  const [offerPrice, setOfferPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [contactingUser, setContactingUser] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOffer, setReviewingOffer] = useState<Offer | null>(null);
  const [reviewedOfferIds, setReviewedOfferIds] = useState<Set<string>>(new Set());
  
  const { createReview, checkCanReview } = useReviews();

  // Local state for request status to allow updates without backend
  const [localStatus, setLocalStatus] = useState(request?.status || 'Open');

  // Real offers from database
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Fetch offers when request changes
  useEffect(() => {
    if (request) {
      setLocalStatus(request.status);
      fetchOffers();
    }
  }, [request?.id, request?.status]);

  // Check which offers have already been reviewed
  useEffect(() => {
    const checkReviews = async () => {
      if (!currentUser || !request || offers.length === 0) return;
      
      const reviewedIds = new Set<string>();
      for (const offer of offers) {
        if (offer.status === 'Accepted') {
          const canReview = await checkCanReview(currentUser.id, request.id);
          if (!canReview) {
            reviewedIds.add(offer.id);
          }
        }
      }
      setReviewedOfferIds(reviewedIds);
    };
    
    checkReviews();
  }, [currentUser, request, offers, checkCanReview]);

  const handleOpenReviewModal = (offer: Offer) => {
    setReviewingOffer(offer);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentUser || !request || !reviewingOffer) return;
    
    await createReview({
      reviewerId: currentUser.id,
      reviewedId: reviewingOffer.finder.id,
      requestId: request.id,
      rating,
      comment,
    });
    
    // Mark this offer as reviewed
    setReviewedOfferIds(prev => new Set([...prev, reviewingOffer.id]));
    setShowReviewModal(false);
    setReviewingOffer(null);
  };

  const fetchOffers = async () => {
    if (!request) return;
    
    setLoadingOffers(true);
    try {
      const fetchedOffers = await api.offers.getByRequest(request.id);
      setOffers(fetchedOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  if (!request) {
    return (
        <div className="min-h-screen bg-offWhite flex flex-col items-center justify-center p-4">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Request Not Found</h2>
            <Link to="/" className="text-softTeal mt-4 hover:underline">Return Home</Link>
        </div>
    );
  }

  const isRequester = currentUser?.id === request.postedBy.id;

  const startEditing = (offer: Offer) => {
    // Strict check: Only pending offers can be edited
    if (offer.status !== 'Pending') return;

    setOfferPrice(offer.price.toString());
    setDeliveryTime(offer.deliveryDays.toString());
    setMessage(offer.message);
    setEditingOfferId(offer.id);
    setOfferSent(false);
    
    // Scroll to form
    const formElement = document.getElementById('offer-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingOfferId(null);
    setOfferPrice('');
    setDeliveryTime('');
    setMessage('');
    setOfferSent(false);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      
      try {
        if (editingOfferId) {
          // Update existing offer
          await api.offers.update(editingOfferId, {
            price: Number(offerPrice),
            deliveryDays: Number(deliveryTime),
            message: message
          });
          setEditingOfferId(null);
        } else {
          // Create new offer
          await api.offers.create({
            requestId: request.id,
            finderId: currentUser.id,
            price: Number(offerPrice),
            deliveryDays: Number(deliveryTime),
            message: message
          });
        }
        
        // Refresh offers list and trigger parent refresh for offer count
        await fetchOffers();
        onOfferChange?.();
        
        setOfferSent(true);
        setOfferPrice('');
        setDeliveryTime('');
        setMessage('');
      } catch (error) {
        console.error('Error submitting offer:', error);
        alert('Failed to submit offer. Please try again.');
      }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!request) return;
    try {
      // Update the specific offer to accepted
      await api.offers.update(offerId, { status: 'Accepted' });
      
      // Update request status in database
      await api.requests.updateStatus(request.id, 'In Progress');
      
      // Refresh offers list and trigger parent refresh
      await fetchOffers();
      onOfferChange?.();
      
      // Update request status to In Progress
      setLocalStatus('In Progress');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    }
  };

  const handleMarkCompleted = async (offerId: string) => {
    if (!request) return;
    try {
      // Ensure the specific offer is accepted
      await api.offers.update(offerId, { status: 'Accepted' });
      
      // Update request status in database
      await api.requests.updateStatus(request.id, 'Completed');
      
      // Refresh offers list and trigger parent refresh
      await fetchOffers();
      onOfferChange?.();
      
      // Update request status to Completed
      setLocalStatus('Completed');
    } catch (error) {
      console.error('Error marking completed:', error);
      alert('Failed to mark as completed. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: request.title,
          text: `Check out this request on Unfindable: ${request.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const handleMessageFinder = async (finderId: string, finderName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to message this user');
      navigate('/login');
      return;
    }
    
    navigate('/messages', { 
      state: { 
        startChatWithUserId: finderId,
        requestId: request.id
      } 
    });
  };

  return (
    <div className="bg-offWhite min-h-screen pb-12">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 shadow-sm">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-deepBlue text-white text-xs font-bold px-2 py-1 rounded uppercase">{request.category}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                localStatus === 'Open' ? 'bg-green-100 text-green-800' : 
                                localStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                localStatus === 'Completed' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {localStatus}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center ml-2"><Clock className="h-3 w-3 mr-1" /> Posted {request.createdAt}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleShare}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium hover:text-deepBlue transition-colors"
                        >
                            <Share2 className="h-4 w-4 mr-2" /> Share
                        </button>
                        <button 
                            onClick={async () => {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) {
                                alert('Please log in to report this request');
                                navigate('/login');
                                return;
                              }
                              setShowReportModal(true);
                            }}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium hover:text-red-600 transition-colors"
                        >
                            <Flag className="h-4 w-4 mr-2" /> Report
                        </button>
                    </div>
                </div>
           </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8">
                {/* Image */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <img src={request.imageUrl} alt={request.title} className="w-full h-96 object-cover" />
                </div>

                {/* Description & Specs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-deepBlue mb-4">Details</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-8">
                        {request.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
                        <div className="flex items-start">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <DollarSign className="h-5 w-5 text-softTeal" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="font-bold text-gray-900">${request.budgetMin} - ${request.budgetMax}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <Clock className="h-5 w-5 text-softTeal" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Deadline</p>
                                <p className="font-bold text-gray-900">{request.deadline}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <MapPin className="h-5 w-5 text-softTeal" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-bold text-gray-900">{request.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Offers List */}
                <div>
                    <h3 className="text-xl font-bold text-deepBlue mb-4">Current Offers ({offers.length})</h3>
                    <div className="space-y-4">
                        {offers.map((offer) => (
                            <div key={offer.id} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 transition-all ${editingOfferId === offer.id ? 'border-softTeal ring-1 ring-softTeal bg-blue-50/30' : 'border-gray-200'}`}>
                                <div className="flex-shrink-0">
                                    <img src={offer.finder.avatar} alt={offer.finder.name} className="h-12 w-12 rounded-full border border-gray-200" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{offer.finder.name}</h4>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" /> 
                                                {offer.finder.rating ? `${offer.finder.rating} (${offer.finder.completedTasks || 0} tasks)` : 'New finder'}
                                            </div>
                                        </div>
                                        <span className={`flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${
                                            offer.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                                            offer.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {offer.status === 'Accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {offer.status === 'Rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                            {offer.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                                            {offer.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-3 rounded-lg italic">"{offer.message}"</p>
                                    
                                    {/* Requester Actions */}
                                    {isRequester && localStatus !== 'Completed' && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {/* Accept Button: Only if Pending and not In Progress yet */}
                                            {offer.status === 'Pending' && localStatus !== 'In Progress' && (
                                                <button 
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    className="bg-deepBlue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-softTeal transition-colors flex items-center"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Accept Offer
                                                </button>
                                            )}
                                            
                                            {/* Mark Completed: If Pending (Short Circuit) OR if Accepted & In Progress */}
                                            {((offer.status === 'Pending' && localStatus !== 'In Progress') || 
                                              (offer.status === 'Accepted' && localStatus === 'In Progress')) && (
                                                 <button 
                                                    onClick={() => handleMarkCompleted(offer.id)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
                                                </button>
                                            )}

                                            {/* Message Finder Button */}
                                            <button 
                                                onClick={() => handleMessageFinder(offer.finder.id, offer.finder.name)}
                                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" /> Message {offer.finder.name.split(' ')[0]}
                                            </button>
                                        </div>
                                    )}

                                    {/* Leave Review Button - For completed requests with accepted offers */}
                                    {isRequester && localStatus === 'Completed' && offer.status === 'Accepted' && !reviewedOfferIds.has(offer.id) && (
                                        <div className="mt-3">
                                            <button 
                                                onClick={() => handleOpenReviewModal(offer)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center"
                                            >
                                                <Star className="h-4 w-4 mr-2" /> Leave Review
                                            </button>
                                        </div>
                                    )}

                                    {/* Show reviewed badge */}
                                    {isRequester && localStatus === 'Completed' && offer.status === 'Accepted' && reviewedOfferIds.has(offer.id) && (
                                        <div className="mt-3">
                                            <span className="inline-flex items-center text-green-600 text-sm">
                                                <CheckCircle className="h-4 w-4 mr-1" /> Review submitted
                                            </span>
                                        </div>
                                    )}

                                    {/* Edit Button for Finder: Only Visible if Status is Pending */}
                                    {currentUser?.role === 'finder' && currentUser.id === offer.finder.id && offer.status === 'Pending' && (
                                        <button 
                                            onClick={() => startEditing(offer)}
                                            className="mt-3 inline-flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <Edit className="h-4 w-4 mr-2" /> Edit Offer
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col items-end min-w-[100px] gap-2">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-deepBlue">${offer.price}</p>
                                        <p className="text-xs text-gray-500">{offer.deliveryDays} Day Delivery</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {offers.length === 0 && (
                            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No offers yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Action Box */}
            <div className="space-y-6">
                {/* Posted By Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Posted By</h3>
                    <div className="flex items-center mb-4">
                        <img src={request.postedBy.avatar} alt={request.postedBy.name} className="h-12 w-12 rounded-full mr-3" />
                        <div>
                            <Link to={`/profile/${request.postedBy.id}`} className="font-bold text-gray-900 hover:underline">{request.postedBy.name}</Link>
                            <p className="text-sm text-gray-500">Joined 2021</p>
                        </div>
                    </div>
                    <button 
                      onClick={async () => {
                        // Check if user is logged in
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          alert('Please log in to contact the user');
                          navigate('/login');
                          return;
                        }
                        
                        setContactingUser(true);
                        // Navigate to messages with the request owner's ID
                        navigate('/messages', { 
                          state: { 
                            startChatWithUserId: request.postedBy.id,
                            requestId: request.id
                          } 
                        });
                      }}
                      disabled={contactingUser}
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                    >
                      {contactingUser ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Contact User
                    </button>
                </div>

                {/* Make an Offer Form */}
                <div id="offer-form" className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 sticky top-24">
                     {currentUser?.role === 'finder' ? (
                         !offerSent || editingOfferId ? (
                             <form onSubmit={handleOfferSubmit}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-deepBlue flex items-center">
                                        {editingOfferId ? <Edit className="h-5 w-5 mr-2 text-softTeal" /> : <Send className="h-5 w-5 mr-2 text-softTeal" />}
                                        {editingOfferId ? 'Edit Your Offer' : 'Submit an Offer'}
                                    </h3>
                                    {editingOfferId && (
                                        <button type="button" onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Price ($)</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            className="w-full border-gray-300 border rounded-lg px-3 py-2 focus:ring-softTeal focus:border-softTeal" 
                                            placeholder="e.g. 100" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (Days)</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={deliveryTime}
                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                            className="w-full border-gray-300 border rounded-lg px-3 py-2 focus:ring-softTeal focus:border-softTeal" 
                                            placeholder="e.g. 3" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea 
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3} 
                                            className="w-full border-gray-300 border rounded-lg px-3 py-2 focus:ring-softTeal focus:border-softTeal" 
                                            placeholder="Why should they pick you?"
                                        ></textarea>
                                    </div>
                                    
                                    {editingOfferId ? (
                                        <div className="flex space-x-3">
                                            <button type="submit" className="flex-1 bg-softTeal text-white py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-md">
                                                Update Offer
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={cancelEditing}
                                                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="submit" className="w-full bg-softTeal text-white py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-md">
                                            Send Offer
                                        </button>
                                    )}
                                </div>
                             </form>
                         ) : (
                            <div className="text-center py-6">
                                <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Offer Submitted!</h3>
                                <p className="text-gray-500 text-sm mb-4">The requester will be notified. Good luck!</p>
                                <button onClick={() => setOfferSent(false)} className="text-softTeal text-sm font-medium hover:underline">Send another offer</button>
                            </div>
                         )
                     ) : currentUser ? (
                         <div className="text-center py-6">
                             <p className="text-gray-600 mb-4">You must be a <strong>Finder</strong> to make an offer.</p>
                             <Link to="/dashboard" className="block w-full bg-deepBlue text-white py-2 rounded-lg text-sm font-medium">Switch Role in Settings</Link>
                         </div>
                     ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">Log in to submit an offer for this item.</p>
                            <Link to="/login" className="block w-full bg-softTeal text-white py-2 rounded-lg text-sm font-medium">Login / Signup</Link>
                        </div>
                     )}
                </div>
            </div>
       </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedType="request"
        reportedId={request.id}
      />

      {/* Review Modal */}
      {reviewingOffer && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewingOffer(null);
          }}
          onSubmit={handleSubmitReview}
          finderName={reviewingOffer.finder.name}
          requestTitle={request.title}
        />
      )}
    </div>
  );
};
