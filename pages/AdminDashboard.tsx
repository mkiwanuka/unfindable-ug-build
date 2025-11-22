import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, DollarSign, FileText, Activity, LayoutDashboard, Settings, Search, Filter, MoreVertical, Trash2, Edit } from 'lucide-react';

const data = [
  { name: 'Mon', requests: 40, revenue: 2400 },
  { name: 'Tue', requests: 30, revenue: 1398 },
  { name: 'Wed', requests: 20, revenue: 9800 },
  { name: 'Thu', requests: 27, revenue: 3908 },
  { name: 'Fri', requests: 18, revenue: 4800 },
  { name: 'Sat', requests: 23, revenue: 3800 },
  { name: 'Sun', requests: 34, revenue: 4300 },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'requests' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-deepBlue text-white hidden md:block flex-shrink-0">
        <div className="p-6 font-bold text-xl tracking-tight flex items-center border-b border-gray-800">
           <span className="text-softTeal mr-1">Un</span>findable Admin
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-softTeal text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" /> Overview
          </button>
          <button 
             onClick={() => setActiveTab('users')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-softTeal text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="h-5 w-5 mr-3" /> Users
          </button>
          <button 
             onClick={() => setActiveTab('requests')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-softTeal text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <FileText className="h-5 w-5 mr-3" /> Requests
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-softTeal text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings className="h-5 w-5 mr-3" /> Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen">
         <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
                <div className="flex items-center space-x-4">
                   <button className="bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-deepBlue">
                      <Search className="h-5 w-5" />
                   </button>
                   <div className="h-8 w-8 bg-softTeal rounded-full flex items-center justify-center text-white font-bold">A</div>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
                      <div className="p-3 bg-blue-100 rounded-full mr-4">
                          <Users className="h-6 w-6 text-deepBlue" />
                      </div>
                      <div>
                          <p className="text-gray-500 text-sm">Total Users</p>
                          <p className="text-2xl font-bold">12,403</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
                      <div className="p-3 bg-green-100 rounded-full mr-4">
                          <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                          <p className="text-gray-500 text-sm">Total Revenue</p>
                          <p className="text-2xl font-bold">$45,290</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
                      <div className="p-3 bg-yellow-100 rounded-full mr-4">
                          <FileText className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                          <p className="text-gray-500 text-sm">Active Requests</p>
                          <p className="text-2xl font-bold">842</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
                      <div className="p-3 bg-purple-100 rounded-full mr-4">
                          <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                          <p className="text-gray-500 text-sm">Completion Rate</p>
                          <p className="text-2xl font-bold">76%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-700 mb-6">Revenue Trends</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Line type="monotone" dataKey="revenue" stroke="#3A7CA5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-700 mb-6">New Requests</h3>
                          <div className="h-80">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                  <Bar dataKey="requests" fill="#0D1B2A" radius={[4, 4, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">User Management</h3>
                     <button className="text-sm text-softTeal font-medium flex items-center"><Filter className="h-4 w-4 mr-1" /> Filter</button>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[1,2,3,4,5].map((i) => (
                         <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">U{i}</div>
                                  <div className="ml-4">
                                     <div className="text-sm font-medium text-gray-900">User {i}</div>
                                     <div className="text-sm text-gray-500">user{i}@example.com</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i % 2 === 0 ? 'Finder' : 'Requester'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                 {i % 2 === 0 ? 'Verified' : 'Active'}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                               <button className="text-gray-400 hover:text-deepBlue mx-1"><Edit className="h-4 w-4" /></button>
                               <button className="text-gray-400 hover:text-red-600 mx-1"><Trash2 className="h-4 w-4" /></button>
                            </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-700">All Requests</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {[
                                {title: "Vintage Gameboy", cat: "Electronics", budget: "$80-120", offers: 3},
                                {title: "Lost Cat Poster", cat: "Services", budget: "$50", offers: 12},
                                {title: "Rare Vinyl Record", cat: "Collectibles", budget: "$200-300", offers: 0},
                                {title: "Plumber needed ASAP", cat: "Services", budget: "$150", offers: 5},
                             ].map((req, i) => (
                                 <tr key={i} className="hover:bg-gray-50">
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.title}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.cat}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.budget}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.offers}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-softTeal hover:underline">View</button>
                                     </td>
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center"><FileText className="h-5 w-5 mr-2" /> SEO Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title Template</label>
                                <input type="text" defaultValue="Unfindable | %s" className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-softTeal focus:border-softTeal" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Default Meta Description</label>
                                <textarea className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-softTeal focus:border-softTeal" rows={3} defaultValue="The world's leading reverse marketplace where you define the demand."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keywords (comma separated)</label>
                                <input type="text" defaultValue="marketplace, finder, reverse commerce, rare items" className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-softTeal focus:border-softTeal" />
                            </div>
                            <button className="w-full bg-deepBlue text-white py-2 rounded text-sm font-medium hover:bg-opacity-90">Save SEO Settings</button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center"><Settings className="h-5 w-5 mr-2" /> Site Customization</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Primary Color</label>
                                <div className="flex items-center">
                                   <div className="w-8 h-8 rounded bg-deepBlue mr-2 border border-gray-300 cursor-pointer"></div>
                                   <input type="text" defaultValue="#0D1B2A" className="flex-1 border border-gray-200 rounded p-2 text-sm" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Secondary Color</label>
                                <div className="flex items-center">
                                   <div className="w-8 h-8 rounded bg-softTeal mr-2 border border-gray-300 cursor-pointer"></div>
                                   <input type="text" defaultValue="#3A7CA5" className="flex-1 border border-gray-200 rounded p-2 text-sm" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Typography</label>
                                <select className="w-full border border-gray-200 rounded p-2 text-sm">
                                    <option>Inter (Default)</option>
                                    <option>Poppins</option>
                                    <option>Roboto</option>
                                </select>
                             </div>
                             <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50">Preview Changes</button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};