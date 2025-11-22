
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, CheckCircle, ArrowRight } from 'lucide-react';

export const GettingStarted: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Getting Started with Unfindable</h1>
          <p className="text-xl text-gray-600">Everything you need to know to start requesting and finding items.</p>
        </div>

        {/* For Requesters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-deepBlue p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Package className="mr-3 h-6 w-6 text-softTeal" /> For Requesters
            </h2>
            <p className="text-blue-200 mt-1">How to find what you're looking for.</p>
          </div>
          <div className="p-8">
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-deepBlue font-bold text-lg mr-4">1</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Post a Request</h3>
                  <p className="text-gray-600 mb-3">Describe the item or service you need. Be specific about details like condition, model numbers, and your budget.</p>
                  <Link to="/post-request" className="text-softTeal font-medium hover:underline flex items-center">Post a Request <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-deepBlue font-bold text-lg mr-4">2</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Receive Offers</h3>
                  <p className="text-gray-600">Finders from our network will review your request and submit offers with pricing and delivery timelines.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-deepBlue font-bold text-lg mr-4">3</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Accept & Receive</h3>
                  <p className="text-gray-600">Choose the best offer. Your payment is held securely until you receive the item and confirm it matches the description.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Finders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-softTeal p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Search className="mr-3 h-6 w-6 text-deepBlue" /> For Finders
            </h2>
            <p className="text-blue-50 mt-1">How to earn money finding items.</p>
          </div>
          <div className="p-8">
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-softTeal font-bold text-lg mr-4">1</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Browse Requests</h3>
                  <p className="text-gray-600 mb-3">Look through open requests to find items you can source or already have.</p>
                  <Link to="/search" className="text-softTeal font-medium hover:underline flex items-center">Browse Requests <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-softTeal font-bold text-lg mr-4">2</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Make an Offer</h3>
                  <p className="text-gray-600">Submit an offer with your price and estimated delivery time. You can negotiate with the requester via chat.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-softTeal font-bold text-lg mr-4">3</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Fulfill & Get Paid</h3>
                  <p className="text-gray-600">Once accepted, ship the item or provide the service. Payment is released to your account upon completion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link to="/contact" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
