
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Request } from '../types';
import { Search, Filter, MapPin, Clock } from 'lucide-react';

interface SearchPageProps {
  requests: Request[];
}

const SUBCATEGORIES: Record<string, string[]> = {
  'Business & Office': [
    'Office Supplies', 
    'Stationery', 
    'Computers & IT Equipment', 
    'Printers & Accessories', 
    'Business Services',
    'Marketing Materials',
    'Work Tools',
    'Documents & Forms'
  ],
  'Vehicles & Transport': [
    'Cars', 
    'Motorcycles', 
    'Bicycles', 
    'Commercial Vehicles', 
    'Trucks', 
    'Spare Parts & Accessories', 
    'Tires', 
    'Car Electronics', 
    'Transport Services', 
    'Boats & Watercraft'
  ],
  'Fashion & Accessories': [
    "Men's Clothing", 
    "Women's Clothing", 
    "Kids' Clothing", 
    "Shoes", 
    "Bags & Accessories",
    "Jewelry",
    "Watches",
    "Eyewear",
    "Beauty & Hygiene",
    "Streetwear"
  ],
  'Electronics & Gadgets': [
    'Smartphones',
    'Laptops & Computers',
    'Tablets',
    'Cameras & Photography',
    'Audio & Headphones',
    'Gaming & Consoles',
    'Wearables',
    'Smart Home',
    'Drones',
    'Accessories'
  ],
  'Tools & Hardware': [
    'Construction Tools', 
    'Power Tools', 
    'Hand Tools', 
    'Electrical Supplies', 
    'Plumbing Materials', 
    'Repair Equipment', 
    'Outdoor Tools', 
    'Safety Gear', 
    'Industrial Equipment'
  ],
  'Home & Living': [
    'Furniture', 
    'Home Decor', 
    'Kitchenware', 
    'Appliances', 
    'Bedding', 
    'Cleaning Supplies', 
    'Lighting', 
    'Garden & Outdoor'
  ],
  'Health & Medicine': [
    'Medication', 
    'Medical Devices', 
    'Supplements', 
    'First Aid', 
    'Personal Care', 
    'Mobility Aids', 
    'Diagnostics (BP machines, thermometers)'
  ],
  'Professional Services': [
    'Repairs & Maintenance', 
    'Deliveries', 
    'Research & Sourcing', 
    'Writing & Design', 
    'Events & Photography', 
    'Tech Support', 
    'Cleaning Services', 
    'Legal & Admin'
  ]
};

export const SearchPage: React.FC<SearchPageProps> = ({ requests }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');
  
  const [searchTerm, setSearchTerm] = useState(queryParam || '');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  
  // Update local state when URL changes
  useEffect(() => {
    setSearchTerm(queryParam || '');
  }, [queryParam]);

  // Reset subcategories when category changes
  useEffect(() => {
    setSelectedSubcategories([]);
  }, [categoryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
        params.set('q', searchTerm);
    } else {
        params.delete('q');
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (cat: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (cat) {
          params.set('category', cat);
      } else {
          params.delete('category');
      }
      setSearchParams(params);
  }

  const toggleSubcategory = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
    }
  };

  const filteredRequests = requests.filter(req => {
    const isOpen = req.status === 'Open';
    const matchesCategory = categoryParam ? req.category === categoryParam : true;
    const matchesQuery = queryParam 
        ? (req.title.toLowerCase().includes(queryParam.toLowerCase()) || 
           req.description.toLowerCase().includes(queryParam.toLowerCase()))
        : true;
    
    // Subcategory filter (simulated check in title/desc since we don't have a strictly typed subcategory field yet)
    const matchesSubcategory = selectedSubcategories.length > 0
        ? selectedSubcategories.some(sub => 
            req.title.toLowerCase().includes(sub.toLowerCase()) || 
            req.description.toLowerCase().includes(sub.toLowerCase())
          )
        : true;

    return isOpen && matchesCategory && matchesQuery && matchesSubcategory;
  });
  
  const categories = [
      'Business & Office',
      'Vehicles & Transport',
      'Fashion & Accessories',
      'Electronics & Gadgets',
      'Tools & Hardware',
      'Home & Living',
      'Health & Medicine',
      'Professional Services'
  ];

  return (
    <div className="min-h-screen bg-offWhite">
        {/* Search Header */}
        <div className="bg-deepBlue py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
                    <div className="flex shadow-lg rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search requests..."
                            className="flex-grow px-4 py-3 text-gray-800 focus:outline-none"
                        />
                        <button type="submit" className="bg-softTeal text-white px-6 py-3 font-semibold flex items-center hover:bg-opacity-90">
                            <Search className="mr-2 h-5 w-5" /> Search
                        </button>
                    </div>
                 </form>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                        <div className="flex items-center mb-4">
                            <Filter className="h-5 w-5 text-softTeal mr-2" />
                            <h2 className="font-bold text-gray-900">Filters</h2>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Category</h3>
                            <div className="space-y-2">
                                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        checked={!categoryParam}
                                        onChange={() => handleCategoryClick(null)}
                                        className="text-softTeal focus:ring-softTeal h-4 w-4 accent-softTeal"
                                    />
                                    <span className={`ml-2 text-sm ${!categoryParam ? 'font-medium text-deepBlue' : 'text-gray-600'}`}>All Categories</span>
                                </label>
                                {categories.map(cat => (
                                    <div key={cat}>
                                        <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input 
                                                type="radio" 
                                                name="category" 
                                                checked={categoryParam === cat}
                                                onChange={() => handleCategoryClick(cat)}
                                                className="text-softTeal focus:ring-softTeal h-4 w-4 accent-softTeal"
                                            />
                                            <span className={`ml-2 text-sm ${categoryParam === cat ? 'font-medium text-deepBlue' : 'text-gray-600'}`}>{cat}</span>
                                        </label>

                                        {/* Subcategories */}
                                        {categoryParam === cat && SUBCATEGORIES[cat] && (
                                            <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-2 transition-all">
                                                {SUBCATEGORIES[cat].map(sub => (
                                                    <label key={sub} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedSubcategories.includes(sub)}
                                                            onChange={() => toggleSubcategory(sub)}
                                                            className="rounded text-softTeal focus:ring-softTeal h-3 w-3 accent-softTeal"
                                                        />
                                                        <span className="ml-2 text-xs text-gray-600">{sub}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => {setSearchParams({}); setSearchTerm(''); setSelectedSubcategories([]);}} 
                            className="w-full text-sm text-gray-500 hover:text-deepBlue border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-deepBlue">
                                {queryParam ? `Results for "${queryParam}"` : 'All Requests'}
                                {categoryParam && <span className="font-normal text-gray-500"> in {categoryParam}</span>}
                            </h1>
                            {selectedSubcategories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedSubcategories.map(sub => (
                                        <span key={sub} className="bg-blue-50 text-softTeal text-xs px-2 py-1 rounded-full font-medium">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{filteredRequests.length} results found</p>
                    </div>

                    {filteredRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {filteredRequests.map((req) => (
                                <div key={req.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                                  <div className="h-48 bg-gray-200 relative">
                                    <img src={req.imageUrl} alt={req.title} className="w-full h-full object-cover" />
                                    <span className="absolute top-3 right-3 bg-deepBlue text-white text-xs font-bold px-2 py-1 rounded">
                                      {req.category}
                                    </span>
                                  </div>
                                  <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-2">
                                      <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{req.title}</h3>
                                      <p className="text-softTeal font-bold mt-1">UGX {req.budgetMin.toLocaleString()} - {req.budgetMax.toLocaleString()}</p>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{req.description}</p>
                                    
                                    <div className="flex items-center text-gray-400 text-xs mb-4 space-x-4">
                                       <div className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {req.location}</div>
                                       <div className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {req.deadline}</div>
                                    </div>

                                    <Link to={`/request/${req.id}`} className="block mt-auto text-center bg-deepBlue text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-dashed border-gray-300 text-center">
                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search terms or filters.</p>
                            <button 
                                onClick={() => {setSearchParams({}); setSearchTerm(''); setSelectedSubcategories([]);}} 
                                className="bg-softTeal text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
