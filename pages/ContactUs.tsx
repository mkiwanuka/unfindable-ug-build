
import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-deepBlue mb-4">Get in Touch</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Have a question or need assistance? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start">
               <div className="bg-blue-50 p-3 rounded-full mr-4">
                 <Mail className="h-6 w-6 text-softTeal" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Email</h3>
                 <p className="text-gray-600 text-sm mb-2">Our friendly team is here to help.</p>
                 <a href="mailto:support@unfindable.com" className="text-softTeal font-medium hover:underline">support@unfindable.com</a>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start">
               <div className="bg-blue-50 p-3 rounded-full mr-4">
                 <MapPin className="h-6 w-6 text-softTeal" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Office</h3>
                 <p className="text-gray-600 text-sm mb-2">Come say hello at our office HQ.</p>
                 <p className="text-gray-900 font-medium">Plot 45, Kampala Road<br/>Kampala, Uganda</p>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start">
               <div className="bg-blue-50 p-3 rounded-full mr-4">
                 <Phone className="h-6 w-6 text-softTeal" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Phone</h3>
                 <p className="text-gray-600 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                 <p className="text-gray-900 font-medium">+256 700 123 456</p>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="Last name" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="you@company.com" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-softTeal focus:outline-none bg-[#F3F4F6]" placeholder="Leave us a message..."></textarea>
              </div>

              <button type="submit" className="w-full bg-deepBlue text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex justify-center items-center">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
