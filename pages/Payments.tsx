
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, DollarSign, ArrowRight, Smartphone } from 'lucide-react';

export const Payments: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Payments</h1>
          <p className="text-xl text-gray-600">Everything you need to know about transactions on Unfindable.</p>
        </div>

        <div className="space-y-8">
            {/* Section 1: Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Smartphone className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Payment Methods</h2>
                        <p className="text-gray-600 mb-4">
                            We support a variety of secure payment options popular in Uganda for your convenience.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Mobile Money:</strong> Pay easily using MTN Mobile Money, Airtel Money, or other mobile money services.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Credit/Debit Cards:</strong> We accept Visa and Mastercard for card payments.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Bank Transfers:</strong> For larger transactions, transfer directly from your Ugandan bank account (Stanbic, DFCU, Centenary, Equity, etc.).</li>
                        </ul>
                    </div>
                </div>
            </div>

             {/* Section 2: Escrow Service */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <ShieldCheck className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Escrow Protection</h2>
                        <p className="text-gray-600 mb-4">
                            To ensure safety for both buyers and sellers, we use an escrow system.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Secure Holding:</strong> When a request is accepted, the buyer's payment is held securely by Unfindable.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Release on Delivery:</strong> Funds are only released to the Finder after the buyer confirms receipt and satisfaction.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Dispute Resolution:</strong> If there is an issue, funds are held while our team mediates.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3: Payouts & Withdrawals */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <DollarSign className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Payouts & Withdrawals</h2>
                        <p className="text-gray-600 mb-4">
                            For Finders, accessing your earnings is simple and fast.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Wallet Balance:</strong> Earnings are deposited into your Unfindable wallet upon completion (in UGX).</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Withdrawal Options:</strong> Transfer funds to your Mobile Money account (MTN, Airtel) or bank account.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Processing Time:</strong> Mobile Money withdrawals are instant. Bank transfers are processed within 1-2 business days.</li>
                        </ul>
                        <Link to="/dashboard" className="text-softTeal font-medium hover:underline flex items-center">View Earnings <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
