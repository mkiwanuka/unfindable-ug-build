
import React from 'react';
import { Search, Package, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => (
  <div className="bg-offWhite min-h-screen py-12">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-deepBlue mb-4">How Unfindable Works</h1>
        <p className="text-xl text-gray-600">The reverse marketplace that puts demand first.</p>
      </div>

      <div className="space-y-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-softTeal">1</span>
            </div>
            <h2 className="text-2xl font-bold text-deepBlue mb-4">Post Your Request</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Can't find what you're looking for on standard marketplaces? Create a post describing the item or service. Include photos, set your budget range, and define a deadline. The more detail, the better.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
             <Search className="h-32 w-32 text-softTeal opacity-80" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
             <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-softTeal">2</span>
            </div>
            <h2 className="text-2xl font-bold text-deepBlue mb-4">Finders Get to Work</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our global network of professional finders, collectors, and experts get notified of your request. They scour local shops, private collections, and offline sources to find your item.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-center">
             <Package className="h-32 w-32 text-softTeal opacity-80" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
             <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-softTeal">3</span>
            </div>
            <h2 className="text-2xl font-bold text-deepBlue mb-4">Accept & Receive</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Review offers from finders including price, condition, and delivery time. Accept the best one. Your payment is held securely in escrow until the item arrives and you verify it matches the description.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-center">
             <CheckCircle className="h-32 w-32 text-green-500 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
