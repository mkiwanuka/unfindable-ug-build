
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Car, Shirt, Hammer, Home as HomeIcon, Heart, Clock, CheckCircle, ArrowRight, MapPin, Package, Smartphone } from 'lucide-react';
import { Request } from '../types';

interface HomeProps {
  featuredRequests: Request[];
}

export const Home: React.FC<HomeProps> = ({ featuredRequests }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-deepBlue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find the <span className="text-softTeal">Unfindable</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Stop searching endlessly. Just post it. We'll find it for you.
          </p>
          <div className="max-w-3xl mx-auto relative">
            <div className="flex shadow-xl rounded-lg overflow-hidden bg-[#F3F4F6]">
              <button 
                onClick={handleSearch}
                className="bg-softTeal text-white px-6 py-4 hover:bg-opacity-90 font-semibold flex items-center order-first md:order-last"
              >
                <Search className="mr-2 h-5 w-5" /> Search
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you looking for? (e.g., Vintage Gameboy, Plumber, Rare Vinyl)"
                className="flex-grow px-4 py-4 text-gray-800 focus:outline-none bg-[#F3F4F6]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-deepBlue">Browse Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {[
              { name: 'Business & Office', icon: Briefcase, color: '#2563EB' },
              { name: 'Vehicles & Transport', icon: Car, color: '#EA580C' },
              { name: 'Fashion & Accessories', icon: Shirt, color: '#DB2777' },
              { name: 'Electronics & Gadgets', icon: Smartphone, color: '#06B6D4' },
              { name: 'Tools & Hardware', icon: Hammer, color: '#6B7280' },
              { name: 'Home & Living', icon: HomeIcon, color: '#16A34A' },
              { name: 'Health & Medicine', icon: Heart, color: '#DC2626' },
              { name: 'Professional Services', icon: CheckCircle, color: '#7C3AED' },
            ].map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all border group bg-offWhite border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; }}
              >
                <cat.icon 
                    className="h-8 w-8 mb-3 transition-transform group-hover:scale-110" 
                    style={{ color: cat.color }} 
                />
                <span className="font-medium transition-colors text-center text-gray-700 group-hover:text-deepBlue">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Requests */}
      <section className="py-16 bg-offWhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-deepBlue">Featured Requests</h2>
            <Link to="/search" className="text-softTeal font-semibold flex items-center hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {featuredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRequests.filter(req => req.status === 'Open').slice(0, 6).map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                  <div className="h-48 bg-gray-200 relative">
                    <img src={req.imageUrl} alt={req.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-deepBlue text-white text-xs font-bold px-2 py-1 rounded">
                      {req.category}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{req.title}</h3>
                      <p className="text-softTeal font-bold mt-1">UGX {req.budgetMin.toLocaleString()} - {req.budgetMax.toLocaleString()}</p>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{req.description}</p>
                    
                    <div className="flex items-center text-gray-400 text-xs mb-4 space-x-4">
                       <div className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {req.location}</div>
                       <div className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {req.deadline}</div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <img src={req.postedBy.avatar} alt="User" className="h-6 w-6 rounded-full mr-2" />
                        <span className="text-sm text-gray-600">{req.postedBy.name}</span>
                      </div>
                      <div className="text-sm font-medium text-deepBlue bg-blue-50 px-2 py-1 rounded">
                        {req.offerCount} Offers
                      </div>
                    </div>
                    <Link to={`/request/${req.id}`} className="block mt-4 text-center bg-deepBlue text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
               <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                 <Search className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
               <p className="text-gray-500 mb-6 max-w-md mx-auto">
                 There are currently no active requests. Be the first to post one!
               </p>
               <Link 
                 to="/post-request"
                 className="bg-softTeal text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors inline-block"
               >
                 Post a Request
               </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-deepBlue mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Search className="h-10 w-10 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Post a Request</h3>
              <p className="text-gray-500">Describe exactly what you need, set your budget, and add photos.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Package className="h-10 w-10 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Receive Offers</h3>
              <p className="text-gray-500">Finders from around the world submit offers with prices and delivery times.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <CheckCircle className="h-10 w-10 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Choose & Relax</h3>
              <p className="text-gray-500">Accept the best offer, pay securely, and wait for your item to arrive.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
