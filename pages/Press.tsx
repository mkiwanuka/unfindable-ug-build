
import React from 'react';
import { Newspaper, Download, ExternalLink } from 'lucide-react';

export const Press: React.FC = () => {
  // Mock press data
  const pressReleases = [
    {
      date: 'October 24, 2023',
      title: 'Unfindable Raises Series A to Expand Global Finder Network',
      source: 'TechCrunch',
      link: '#'
    },
    {
      date: 'September 15, 2023',
      title: 'The Rise of Reverse Marketplaces: Why Searching is Dead',
      source: 'Forbes',
      link: '#'
    },
    {
      date: 'August 01, 2023',
      title: 'How One App Helped a Museum Find a Missing 18th Century Vase',
      source: 'Wired',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-offWhite py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-deepBlue mb-4">Newsroom</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Latest news, updates, and stories from the Unfindable team.
          </p>
        </div>

        {/* Featured Mentions */}
        <div className="grid gap-8 mb-16">
          {pressReleases.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center text-sm text-softTeal font-semibold mb-2">
                    <Newspaper className="h-4 w-4 mr-2" />
                    {item.source} • {item.date}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-deepBlue">
                    <a href={item.link} className="hover:underline">{item.title}</a>
                  </h3>
                  <p className="text-gray-600">
                    Read the full story on how Unfindable is changing the landscape of e-commerce...
                  </p>
                </div>
                <a href={item.link} className="flex items-center text-deepBlue font-medium hover:text-softTeal whitespace-nowrap">
                  Read Article <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Media Kit Section */}
        <div className="bg-deepBlue rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Media Resources</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Download our official logos, brand guidelines, and executive headshots for media use.
          </p>
          <button className="bg-softTeal hover:bg-white hover:text-deepBlue text-white px-8 py-3 rounded-lg font-bold transition-colors inline-flex items-center">
            <Download className="h-5 w-5 mr-2" /> Download Media Kit
          </button>
        </div>

        {/* Press Contact */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Press Inquiries</h3>
          <p className="text-gray-600">
            For interview requests or additional information, please contact<br/>
            <a href="mailto:press@unfindable.com" className="text-softTeal font-medium hover:underline">press@unfindable.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
