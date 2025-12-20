
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, Lock, ArrowRight } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Account Settings</h1>
          <p className="text-xl text-gray-600">Manage your profile, preferences, and security.</p>
        </div>

        <div className="space-y-8">
            {/* Section 1: Profile Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <User className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Profile Management</h2>
                        <p className="text-gray-600 mb-4">
                            Keep your personal information up to date to build trust with the community.
                        </p>
                        <ul className="space-y-3 text-gray-600 mb-6">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Avatar & Bio:</strong> A clear photo and detailed bio help users get to know you.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Location:</strong> Updating your location helps with relevant search results and delivery estimates.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Skills:</strong> If you are a Finder, list your specialties to attract relevant requests.</li>
                        </ul>
                        <Link to="/dashboard" className="text-softTeal font-medium hover:underline flex items-center">Go to Profile Settings <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </div>
                </div>
            </div>

             {/* Section 2: Notifications */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Bell className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Notifications</h2>
                        <p className="text-gray-600 mb-4">
                            Control how and when we contact you.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Email Alerts:</strong> Get notified about new offers, messages, or relevant requests.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Push Notifications:</strong> Receive instant updates on your mobile device (coming soon).</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Marketing:</strong> Opt-in or out of our newsletter and promotional emails.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3: Password & Security */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                        <Lock className="h-6 w-6 text-softTeal" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-deepBlue mb-4">Password & Security</h2>
                        <p className="text-gray-600 mb-4">
                            Protect your account with strong security practices.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Change Password:</strong> Update your password regularly to keep your account secure.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Two-Factor Auth:</strong> (Coming Soon) Add an extra layer of security.</li>
                            <li className="flex items-start"><span className="mr-2 text-softTeal">•</span> <strong>Active Sessions:</strong> Monitor where your account is currently logged in.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
