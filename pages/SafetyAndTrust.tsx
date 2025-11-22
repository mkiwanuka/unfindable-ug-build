
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export const SafetyAndTrust: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Safety & Trust</h1>
          <p className="text-xl text-gray-600">Our commitment to keeping the Unfindable community secure.</p>
        </div>

        <div className="space-y-8">
            {/* Section 1: Verified Community */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <UserCheck className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Verified Community</h2>
                        <p className="text-gray-600 mb-4">
                            Trust starts with knowing who you are dealing with.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Identity Verification:</strong> We use third-party services to verify the identity of our Finders.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Profile Reviews:</strong> Check user ratings and reviews from past transactions before engaging.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Social Connections:</strong> Users can link social accounts to provide further proof of identity.</li>
                        </ul>
                    </div>
                </div>
            </div>

             {/* Section 2: Secure Payments */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Lock className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Secure Payments</h2>
                        <p className="text-gray-600 mb-4">
                            We protect your money until the job is done.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Escrow Protection:</strong> Payments are held in a secure escrow account and are only released when you are satisfied.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Encrypted Transactions:</strong> All financial data is encrypted using bank-level security standards.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>No Hidden Fees:</strong> Our fee structure is transparent so you know exactly where your money goes.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3: Reporting & Support */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <AlertTriangle className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Reporting & Support</h2>
                        <p className="text-gray-600 mb-4">
                            We are here to help if things don't go as planned.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>24/7 Support:</strong> Our support team is available to assist with disputes or concerns.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Report Suspicious Activity:</strong> Use the report button on profiles or requests to flag inappropriate behavior.</li>
                        </ul>
                         <Link to="/contact" className="text-softTeal font-medium hover:underline flex items-center">Contact Support <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
