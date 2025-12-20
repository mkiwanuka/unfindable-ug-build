
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Clock, CheckCircle, ArrowRight, MapPin, Search,
  ShieldCheck, Zap, Truck, BadgeDollarSign, SearchX,
  UserCheck, CreditCard, Shield, MessageSquareLock,
  Quote, Star, Users, Package, ChevronLeft, ChevronRight,
  ShoppingBag, Wrench, Smartphone, Pizza, Shirt
} from 'lucide-react';
import { Request } from '../types';

interface HomeProps {
  featuredRequests: Request[];
}

// Testimonial data
const testimonials = [
  {
    quote: "I posted a request and got 4 offers in 10 minutes!",
    author: "Sarah K.",
    location: "Kampala"
  },
  {
    quote: "Saved me hours of searching. Highly recommended.",
    author: "David M.",
    location: "Jinja"
  },
  {
    quote: "The Finder delivered in less than 30 minutes!",
    author: "Grace N.",
    location: "Entebbe"
  }
];

// Popular request examples
const popularRequests = [
  { icon: Shirt, title: "Sneakers", example: "Find me specific brand sneakers size 42" },
  { icon: ShoppingBag, title: "Groceries", example: "Pick up groceries from a local supermarket" },
  { icon: Wrench, title: "Repairs", example: "Looking for a good plumber for a small fix" },
  { icon: Smartphone, title: "Electronics", example: "Anyone selling a used iPhone under UGX 800K?" },
  { icon: Pizza, title: "Food Pickup", example: "Deliver food from a place not on apps" },
  { icon: Package, title: "Second-hand", example: "Find a vintage Gameboy in working condition" }
];

// Value propositions
const valueProps = [
  { icon: SearchX, title: "No Searching Required", desc: "Skip the stress of endless browsing" },
  { icon: ShieldCheck, title: "Verified Finders", desc: "Trusted people handling your request" },
  { icon: BadgeDollarSign, title: "Best Price Offers", desc: "Finders compete to give you the best deal" },
  { icon: Zap, title: "Fast Responses", desc: "Many requests get replies within minutes" },
  { icon: Truck, title: "Convenient Delivery", desc: "You choose the time and place" }
];

// Trust indicators
const trustIndicators = [
  { icon: UserCheck, text: "ID-verified Finders" },
  { icon: MessageSquareLock, text: "Secure in-app chat" },
  { icon: CreditCard, text: "Pay only when you accept" },
  { icon: Shield, text: "Dispute protection" }
];

export const Home: React.FC<HomeProps> = ({ featuredRequests }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      return () => carousel.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 280;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: Hero */}
      <section className="bg-deepBlue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 relative z-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Stop Searching. Just Post It —<br className="hidden sm:block" />
            <span className="text-softTeal">We'll Find It For You.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Describe anything you want, set your budget, and let Finders compete to deliver it.
            <br className="hidden sm:block" />
            <span className="text-gray-400">Fast responses. No endless browsing.</span>
          </p>
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/post-request"
              className="inline-flex items-center bg-softTeal text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Post a Request
            </Link>
            <p className="text-gray-400 mt-5 sm:mt-6 text-sm">
              Get paid to find things — <Link to="/search" className="text-softTeal hover:underline font-medium">Browse open requests →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: How It Works */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepBlue mb-8 sm:mb-12 text-center">
            📌 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="bg-offWhite rounded-2xl p-6 sm:p-8 text-center border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-softTeal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-softTeal">1</span>
              </div>
              <h3 className="text-lg font-bold text-deepBlue mb-3">Post What You're Looking For</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Describe the item/service and set your budget.<br />
                <span className="text-gray-400">No hunting. No comparing shops. No hassle.</span>
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-offWhite rounded-2xl p-6 sm:p-8 text-center border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-softTeal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-softTeal">2</span>
              </div>
              <h3 className="text-lg font-bold text-deepBlue mb-3">Finders Offer to Get It</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Verified Finders compete to fulfill your request.<br />
                <span className="text-gray-400">Choose the best offer.</span>
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-offWhite rounded-2xl p-6 sm:p-8 text-center border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-softTeal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-softTeal">3</span>
              </div>
              <h3 className="text-lg font-bold text-deepBlue mb-3">Get It Delivered</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sit back and relax.<br />
                <span className="text-gray-400">They find it, buy it (if needed), and deliver it to you safely.</span>
              </p>
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-10">
            <Link 
              to="/post-request"
              className="inline-flex items-center bg-deepBlue text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" /> Post a Request
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: Live Open Requests */}
      {featuredRequests.length > 0 && (
        <section className="py-12 sm:py-16 bg-offWhite">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepBlue mb-2 text-center">
              🔍 Latest Open Requests
            </h2>
            <p className="text-gray-500 text-center mb-8 text-sm">Real requests from people near you</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredRequests
                .filter(r => r.status === 'Open' && !r.archived)
                .slice(0, 6)
                .map((request) => (
                <Link
                  key={request.id}
                  to={`/request/${request.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  {request.imageUrl && (
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      <img src={request.imageUrl} alt={request.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-softTeal/10 text-softTeal text-xs font-medium px-2.5 py-1 rounded-full">
                        {request.category}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(request.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-deepBlue mb-2 line-clamp-2">{request.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{request.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-deepBlue font-medium">
                        UGX {request.budgetMin?.toLocaleString()} - {request.budgetMax?.toLocaleString()}
                      </span>
                      <span className="text-gray-400 flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/search"
                className="inline-flex items-center text-softTeal font-medium hover:underline"
              >
                View All Open Requests <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: Why Seekers Love Us */}
      <section className="py-12 sm:py-16 bg-offWhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepBlue mb-8 sm:mb-10 text-center">
            ⭐ Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-softTeal/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <prop.icon className="h-6 w-6 text-softTeal" />
                </div>
                <h3 className="font-semibold text-deepBlue mb-1 text-sm">{prop.title}</h3>
                <p className="text-gray-500 text-xs">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Popular Requests (Carousel) */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepBlue mb-2 text-center">
            🔥 Popular Requests From Other Seekers
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">If you can think it, you can request it.</p>
          
          {/* Carousel Container */}
          <div className="relative">
            {/* Left Arrow */}
            <button 
              onClick={() => scroll('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''}`}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5 text-deepBlue" />
            </button>
            
            {/* Scrollable Container */}
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory md:snap-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {popularRequests.map((req, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-64 sm:w-72 bg-offWhite rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow snap-start"
                >
                  <div className="bg-softTeal/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <req.icon className="h-5 w-5 text-softTeal" />
                  </div>
                  <h3 className="font-semibold text-deepBlue mb-2">{req.title}</h3>
                  <p className="text-gray-500 text-sm italic">"{req.example}"</p>
                </div>
              ))}
            </div>
            
            {/* Right Arrow */}
            <button 
              onClick={() => scroll('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : ''}`}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5 text-deepBlue" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: Social Proof - Testimonials & Stats */}
      <section className="py-12 sm:py-16 bg-deepBlue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-8 sm:mb-10 text-center">
            💬 What Seekers Say
          </h2>
          
          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <Quote className="h-6 w-6 text-softTeal mb-3 opacity-60" />
                <p className="text-white text-base mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="bg-softTeal w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium text-sm">{testimonial.author}</p>
                    <p className="text-gray-400 text-xs">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-softTeal">5,000+</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">Requests Fulfilled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-softTeal">800+</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">Active Finders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-softTeal">97%</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Safety & Trust */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepBlue mb-3">
            🔒 Your Safety is Our Priority
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto text-sm">
            We take security seriously so you can focus on getting what you need.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustIndicators.map((indicator, idx) => (
              <div key={idx} className="bg-offWhite rounded-xl p-4 sm:p-6 border border-gray-100">
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <indicator.icon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-deepBlue font-medium text-xs sm:text-sm">{indicator.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-softTeal to-deepBlue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
            Start Your First Request Now
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Stop searching. Let Finders work for you.
          </p>
          <Link 
            to="/post-request"
            className="inline-flex items-center bg-white text-deepBlue px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
          >
            <Plus className="mr-2 h-6 w-6" /> Post a Request
          </Link>
        </div>
      </section>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-50 md:hidden shadow-lg">
        <span className="text-sm text-gray-600 font-medium">Ready to request?</span>
        <Link 
          to="/post-request"
          className="inline-flex items-center bg-softTeal text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-colors"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Post a Request
        </Link>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};
