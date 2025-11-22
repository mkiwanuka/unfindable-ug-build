
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ShieldCheck, ArrowRight } from 'lucide-react';

export const BuyingAndRequests: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Buying & Requests</h1>
          <p className="text-xl text-gray-600">A complete guide to posting requests and buying items on Unfindable.</p>
        </div>

        <div className="space-y-8">
            {/* Section 1: Posting */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Package className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Posting a Request</h2>
                        <p className="text-gray-600 mb-4">
                            The first step to finding what you need is creating a detailed request.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Be Specific:</strong> Include model numbers, years, colors, and condition requirements.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Add Photos:</strong> Reference images help Finders know exactly what to look for.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Set a Budget:</strong> Provide a realistic price range you are willing to pay.</li>
                        </ul>
                        <Link to="/post-request" className="text-softTeal font-medium hover:underline flex items-center">Create a Request Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </div>
                </div>
            </div>

             {/* Section 2: Evaluating Offers */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Search className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Evaluating Offers</h2>
                        <p className="text-gray-600 mb-4">
                            Once your request is live, Finders will submit offers. Here is how to choose the best one.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Check Ratings:</strong> Look at the Finder's profile for reviews and past completed tasks.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Communicate:</strong> Use the built-in chat to ask questions about the item's condition or provenance.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Compare:</strong> Don't just look at price; consider delivery time and Finder reputation.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3: Payment & Safety */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <ShieldCheck className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Payment & Safety</h2>
                        <p className="text-gray-600 mb-4">
                            Your safety is our priority. Learn how transactions are protected.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Escrow Service:</strong> When you accept an offer, your payment is held securely in escrow. It is not released to the Finder until you confirm receipt.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Disputes:</strong> If the item arrives damaged or not as described, our support team can help mediate a refund.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center bg-blue-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-deepBlue mb-2">Ready to find something?</h3>
            <p className="text-gray-600 mb-6">Join thousands of people finding the unfindable.</p>
            <Link to="/post-request" className="bg-deepBlue text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                Post a Request
            </Link>
        </div>
      </div>
    </div>
  );
};
