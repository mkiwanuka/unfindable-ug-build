
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, DollarSign, MessageSquare, ArrowRight } from 'lucide-react';

export const SellingAndFinding: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-deepBlue mb-4">Selling & Finding</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Your guide to becoming a successful Finder on Unfindable.</p>
        </div>

        <div className="space-y-8">
            {/* Section 1: Finding Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Search className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue mb-4">Finding Requests</h2>
                        <p className="text-gray-600 mb-4">
                            Browse thousands of active requests to find items you can source.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Search Filters:</strong> Use categories and keywords to find requests that match your expertise.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Saved Searches:</strong> (Coming Soon) Get notified when new requests match your criteria.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Clarify Details:</strong> If a request is vague, use the public Q&A to ask for more details before offering.</li>
                        </ul>
                        <Link to="/search" className="text-softTeal font-medium hover:underline flex items-center">Browse Open Requests <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </div>
                </div>
            </div>

             {/* Section 2: Making Winning Offers */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <MessageSquare className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue mb-4">Making Winning Offers</h2>
                        <p className="text-gray-600 mb-4">
                            Stand out from other Finders with professional and competitive offers.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Fair Pricing:</strong> Consider the item cost, your time, and shipping when setting your price.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Clear Timeline:</strong> Be realistic about when you can deliver the item.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Proof:</strong> Mention if you have the item in hand or have a verified source.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3: Getting Paid */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <DollarSign className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-deepBlue mb-4">Getting Paid</h2>
                        <p className="text-gray-600 mb-4">
                            Understand how and when you get paid for your finds.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Escrow Protection:</strong> The buyer funds the request upfront. Money is held in escrow.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Payout Release:</strong> Funds are released to your account wallet 24 hours after the buyer confirms delivery.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Withdrawal:</strong> You can withdraw funds to your bank account or PayPal at any time.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center bg-blue-50 rounded-xl p-8">
            <h3 className="text-lg sm:text-xl font-bold text-deepBlue mb-2">Ready to start earning?</h3>
            <p className="text-gray-600 mb-6">Switch your profile to 'Finder' and start browsing.</p>
            <Link to="/dashboard" className="bg-deepBlue text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                Go to Dashboard
            </Link>
        </div>
      </div>
    </div>
  );
};
