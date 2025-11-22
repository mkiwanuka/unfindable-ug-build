
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Request, Offer, User, UserRole } from '../types';
import { MapPin, Clock, DollarSign, Share2, Flag, User as UserIcon, Star, Send, Package, CheckCircle, XCircle, Edit, X } from 'lucide-react';

interface RequestDetailsProps {
  requests: Request[];
  currentUser: User | null;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ requests, currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const request = requests.find(r => r.id === id);
  
  const [offerPrice, setOfferPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Local state for request status to allow updates without backend
  const [localStatus, setLocalStatus] = useState(request?.status || 'Open');

  // Mock Offers converted to state
  const [offers, setOffers] = useState<Offer[]>([]);

  // Initialize/Reset state when request changes
  useEffect(() => {
    if (request) {
      setLocalStatus(request.status);
      // Reset mock offers for the new request ID
      setOffers([
        {
            id: '1',
            requestId: request.id,
            finder: { id: '2', name: 'Sarah Finder', email: 's@s.com', role: 'finder', avatar: 'https://ui-avatars.com/api/?name=Sarah+Finder&background=3A7CA5&color=fff', location: 'Austin, TX', verified: true } as User,
            price: 95,
            deliveryDays: 3,
            message: 'I have this exact model in my collection. It is in mint condition and I can ship it tomorrow morning.',
            status: 'Pending'
        },
        {
            id: '2',
            requestId: request.id,
            finder: { id: '3', name: 'Mike Hunter', email: 'm@m.com', role: 'finder', avatar: 'https://ui-avatars.com/api/?name=Mike+Hunter&background=random', location: 'New York, NY' } as User,
            price: 110,
            deliveryDays: 2,
            message: 'I can find this for you. I have a connection at a vintage shop.',
            status: 'Pending'
        }
      ]);
    }
  }, [request?.id, request?.status]);

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

  const handleOfferSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingOfferId) {
          // Update existing offer
          setOffers(offers.map(o => o.id === editingOfferId ? {
              ...o,
              price: Number(offerPrice),
              deliveryDays: Number(deliveryTime),
              message: message
          } : o));
          setEditingOfferId(null);
      } else {
          // Create new offer
          const newOffer: Offer = {
              id: Math.random().toString(36).substr(2, 9),
              requestId: request.id,
              finder: currentUser!,
              price: Number(offerPrice),
              deliveryDays: Number(deliveryTime),
              message: message,
              status: 'Pending'
          };
          setOffers([...offers, newOffer]);
      }
      
      setOfferSent(true);
      setOfferPrice('');
      setDeliveryTime('');
      setMessage('');
  };

  const handleAcceptOffer = (offerId: string) => {
    // Update the specific offer to accepted
    const updatedOffers = offers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'Accepted' as const } : offer
    );
    setOffers(updatedOffers);
    
    // Update request status to In Progress
    setLocalStatus('In Progress');
  };

  const handleMarkCompleted = (offerId: string) => {
    // Ensure the specific offer is accepted (if it wasn't already)
    const updatedOffers = offers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'Accepted' as const } : offer
    );
    setOffers(updatedOffers);
    
    // Update request status to Completed
    setLocalStatus('Completed');
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
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium hover:text-red-600 transition-colors">
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
                                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" /> 4.9 (24 reviews)
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
                    <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Contact User</button>
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
    </div>
  );
};
