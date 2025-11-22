import React from 'react';
import { Search, Globe, ShieldCheck } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-deepBlue text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">About Unfindable</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We are building the world's first demand-led marketplace, connecting people who need things with people who can find them.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
           <div className="p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="h-8 w-8 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold text-deepBlue mb-2">Reverse Marketplace</h3>
              <p className="text-gray-600">Most marketplaces start with supply. We start with demand. You ask, the world answers.</p>
           </div>
           <div className="p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Globe className="h-8 w-8 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold text-deepBlue mb-2">Global Network</h3>
              <p className="text-gray-600">Our community of Finders spans 50+ countries, giving you access to local inventory anywhere.</p>
           </div>
           <div className="p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShieldCheck className="h-8 w-8 text-softTeal" />
              </div>
              <h3 className="text-xl font-bold text-deepBlue mb-2">Secure & Trusted</h3>
              <p className="text-gray-600">Payments are held in escrow until you confirm receipt and satisfaction with your find.</p>
           </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-offWhite py-16">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-deepBlue mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
               <p className="mb-4">
                  Unfindable was born from a simple frustration: looking for a specific vintage replacement part that wasn't listed on any major marketplace. We realized that just because something isn't listed for sale doesn't mean it's not available.
               </p>
               <p className="mb-4">
                  Millions of items sit in attics, local shops, and private collections, invisible to the internet. Traditional e-commerce relies on sellers listing items. We realized we needed a platform where buyers could list their needs.
               </p>
               <p>
                  Founded in 2023, Unfindable has grown into a thriving community of collectors, personal shoppers, and professional finders who love the thrill of the hunt.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};