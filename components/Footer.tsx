
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-deepBlue text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4 text-white hover:opacity-80 transition-opacity w-fit">
              <Search className="h-6 w-6 text-softTeal mr-2" />
              <span className="font-bold text-xl">Unfindable</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              The reverse marketplace where you define the demand, and the world supplies the solution.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-softTeal cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-softTeal cursor-pointer" />
              <Instagram className="h-5 w-5 hover:text-softTeal cursor-pointer" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-white transition-colors">Press</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest finds.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 rounded-l-md w-full bg-gray-800 border-none focus:ring-1 focus:ring-softTeal text-white text-sm"
              />
              <button className="bg-softTeal hover:bg-opacity-90 px-4 py-2 rounded-r-md text-white">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Elstran Apps. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
