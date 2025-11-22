
import React from 'react';
import { Briefcase, Heart, Zap, Coffee, MapPin, ArrowRight } from 'lucide-react';

export const Careers: React.FC = () => {
  const benefits = [
    { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health coverage for you and your family.' },
    { icon: Zap, title: 'Flexible Work', desc: 'Remote-first culture with flexible hours to suit your life.' },
    { icon: Coffee, title: 'Perks & Stipends', desc: 'Home office setup allowance and monthly learning budget.' },
  ];

  const openings = [
    { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Remote (US/EU)', type: 'Full-time' },
    { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
    { title: 'Community Manager', team: 'Marketing', location: 'New York, NY', type: 'Full-time' },
    { title: 'Customer Success Specialist', team: 'Support', location: 'Remote', type: 'Full-time' },
  ];

  return (
    <div className="min-h-screen bg-offWhite py-12">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-deepBlue mb-6">Join Our Team</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're on a mission to revolutionize commerce by putting demand first. Help us build the future of finding.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-white py-16 border-y border-gray-200 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-deepBlue mb-12">Why Unfindable?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-softTeal" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Roles */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-deepBlue mb-8">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-softTeal hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-softTeal transition-colors">{job.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">{job.team}</span>
                  <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {job.location}</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <button className="flex items-center text-deepBlue font-medium group-hover:translate-x-1 transition-transform">
                Apply Now <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
