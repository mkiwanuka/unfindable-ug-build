import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, DollarSign, FileText, Activity, LayoutDashboard, Settings, Search, Filter, Trash2, Edit, Loader2, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useAdminStats, useAdminChartData } from '../hooks/useAdminStats';
import { useAdminUsers, useDeleteUser, useUpdateUserRole } from '../hooks/useAdminUsers';
import { useAdminRequests, useDeleteRequest, useUpdateRequestStatus } from '../hooks/useAdminRequests';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'requests' | 'settings'>('overview');
  const [userFilter, setUserFilter] = useState<string>('');
  const [requestFilter, setRequestFilter] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Data hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: chartData, isLoading: chartLoading } = useAdminChartData();
  const { data: users, isLoading: usersLoading, error: usersError } = useAdminUsers();
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useAdminRequests();

  // Mutation hooks
  const deleteUser = useDeleteUser();
  const updateUserRole = useUpdateUserRole();
  const deleteRequest = useDeleteRequest();
  const updateRequestStatus = useUpdateRequestStatus();

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser.mutateAsync(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. They may have associated data.');
      }
    }
  };

  const handleToggleRole = async (userId: string, role: 'admin' | 'finder' | 'requester' | 'guest', hasRole: boolean) => {
    try {
      await updateUserRole.mutateAsync({ 
        userId, 
        role, 
        action: hasRole ? 'remove' : 'add' 
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request? This will also delete all associated offers.')) {
      try {
        await deleteRequest.mutateAsync(requestId);
      } catch (error) {
        console.error('Failed to delete request:', error);
        alert('Failed to delete request.');
      }
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'Open' | 'In Progress' | 'Completed') => {
    try {
      await updateRequestStatus.mutateAsync({ requestId, status });
      setEditingRequestId(null);
    } catch (error) {
      console.error('Failed to update request status:', error);
      alert('Failed to update request status.');
    }
  };

  // Filter users
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.roles.some(r => r.toLowerCase().includes(userFilter.toLowerCase()))
  ) || [];

  // Filter requests
  const filteredRequests = requests?.filter(req =>
    req.title.toLowerCase().includes(requestFilter.toLowerCase()) ||
    req.category.toLowerCase().includes(requestFilter.toLowerCase()) ||
    req.status.toLowerCase().includes(requestFilter.toLowerCase())
  ) || [];

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-UG')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'finder': return 'bg-purple-100 text-purple-800';
      case 'requester': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-primary text-primary-foreground hidden md:block flex-shrink-0">
        <div className="p-6 font-bold text-xl tracking-tight flex items-center border-b border-primary-foreground/20">
           <span className="text-accent mr-1">Un</span>findable Admin
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" /> Overview
          </button>
          <button 
             onClick={() => setActiveTab('users')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          >
            <Users className="h-5 w-5 mr-3" /> Users
          </button>
          <button 
             onClick={() => setActiveTab('requests')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          >
            <FileText className="h-5 w-5 mr-3" /> Requests
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          >
            <Settings className="h-5 w-5 mr-3" /> Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen">
         <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground capitalize">{activeTab}</h1>
                <div className="flex items-center space-x-4">
                   <button 
                     onClick={() => navigate('/')}
                     className="text-sm text-muted-foreground hover:text-foreground"
                   >
                     ← Back to Site
                   </button>
                   <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">A</div>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                  {/* Stats Cards */}
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : statsError ? (
                    <div className="flex items-center justify-center py-12 text-destructive">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Failed to load statistics
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-card p-6 rounded-xl shadow-sm flex items-center border border-border">
                        <div className="p-3 bg-blue-100 rounded-full mr-4">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Total Users</p>
                            <p className="text-2xl font-bold text-card-foreground">{stats?.totalUsers.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-card p-6 rounded-xl shadow-sm flex items-center border border-border">
                        <div className="p-3 bg-green-100 rounded-full mr-4">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Est. Revenue</p>
                            <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats?.totalRevenue || 0)}</p>
                        </div>
                      </div>
                      <div className="bg-card p-6 rounded-xl shadow-sm flex items-center border border-border">
                        <div className="p-3 bg-yellow-100 rounded-full mr-4">
                            <FileText className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Active Requests</p>
                            <p className="text-2xl font-bold text-card-foreground">{stats?.activeRequests.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-card p-6 rounded-xl shadow-sm flex items-center border border-border">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                            <Activity className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Completion Rate</p>
                            <p className="text-2xl font-bold text-card-foreground">{stats?.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                          <h3 className="font-bold text-card-foreground mb-6">Revenue Trends (Last 7 Days)</h3>
                          <div className="h-80">
                            {chartLoading ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData || []}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(value) => `UGX ${value.toLocaleString()}`} />
                                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: 'hsl(var(--card))'}} />
                                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                      </div>
                      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                          <h3 className="font-bold text-card-foreground mb-6">New Requests (Last 7 Days)</h3>
                          <div className="h-80">
                            {chartLoading ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={chartData || []}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                   <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                   <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: 'hsl(var(--card))'}} />
                                   <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                 </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
               <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                     <h3 className="font-bold text-card-foreground">User Management ({filteredUsers.length})</h3>
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                         <input
                           type="text"
                           placeholder="Search users..."
                           value={userFilter}
                           onChange={(e) => setUserFilter(e.target.value)}
                           className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                         />
                       </div>
                     </div>
                  </div>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : usersError ? (
                    <div className="flex items-center justify-center py-12 text-destructive">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Failed to load users
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {filteredUsers.map((user) => (
                             <tr key={user.id} className="hover:bg-muted/30">
                                <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="flex items-center">
                                      <img 
                                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full bg-muted"
                                      />
                                      <div className="ml-4">
                                         <div className="text-sm font-medium text-card-foreground">{user.name}</div>
                                         <div className="text-xs text-muted-foreground">{formatDate(user.joinedDate)}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {editingUserId === user.id ? (
                                    <div className="flex flex-wrap gap-1">
                                      {(['requester', 'finder', 'admin'] as const).map(role => (
                                        <button
                                          key={role}
                                          onClick={() => handleToggleRole(user.id, role, user.roles.includes(role))}
                                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                            user.roles.includes(role) 
                                              ? getRoleColor(role) + ' border-transparent'
                                              : 'bg-transparent border-border text-muted-foreground hover:border-accent'
                                          }`}
                                        >
                                          {role}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {user.roles.map(role => (
                                        <span key={role} className={`px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}>
                                          {role}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                     {user.verified ? 'Verified' : 'Unverified'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  <div className="flex items-center gap-3">
                                    <span title="Completed tasks">{user.completedTasks} tasks</span>
                                    {user.rating && <span title="Rating">★ {user.rating}</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                   {editingUserId === user.id ? (
                                     <button 
                                       onClick={() => setEditingUserId(null)}
                                       className="text-accent hover:text-accent/80 mx-1"
                                     >
                                       <CheckCircle className="h-4 w-4" />
                                     </button>
                                   ) : (
                                     <button 
                                       onClick={() => setEditingUserId(user.id)}
                                       className="text-muted-foreground hover:text-primary mx-1"
                                     >
                                       <Edit className="h-4 w-4" />
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => handleDeleteUser(user.id)}
                                     className="text-muted-foreground hover:text-destructive mx-1"
                                     disabled={deleteUser.isPending}
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
               </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-card-foreground">All Requests ({filteredRequests.length})</h3>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search requests..."
                            value={requestFilter}
                            onChange={(e) => setRequestFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                    </div>
                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      </div>
                    ) : requestsError ? (
                      <div className="flex items-center justify-center py-12 text-destructive">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Failed to load requests
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Request</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Offers</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                 {filteredRequests.map((req) => (
                                     <tr key={req.id} className="hover:bg-muted/30">
                                         <td className="px-6 py-4">
                                           <div>
                                             <div className="text-sm font-medium text-card-foreground">{req.title}</div>
                                             <div className="text-xs text-muted-foreground">by {req.postedBy.name} • {formatDate(req.createdAt)}</div>
                                           </div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{req.category}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                           {formatCurrency(req.budgetMin)} - {formatCurrency(req.budgetMax)}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                           {editingRequestId === req.id ? (
                                             <div className="flex gap-1">
                                               {(['Open', 'In Progress', 'Completed'] as const).map(status => (
                                                 <button
                                                   key={status}
                                                   onClick={() => handleUpdateRequestStatus(req.id, status)}
                                                   className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                                     req.status === status 
                                                       ? getStatusColor(status)
                                                       : 'bg-transparent border border-border text-muted-foreground hover:border-accent'
                                                   }`}
                                                 >
                                                   {status}
                                                 </button>
                                               ))}
                                             </div>
                                           ) : (
                                             <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>
                                               {req.status}
                                             </span>
                                           )}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{req.offerCount}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                              onClick={() => navigate(`/request/${req.id}`)}
                                              className="text-accent hover:underline mr-3"
                                            >
                                              View
                                            </button>
                                            {editingRequestId === req.id ? (
                                              <button 
                                                onClick={() => setEditingRequestId(null)}
                                                className="text-muted-foreground hover:text-primary mx-1"
                                              >
                                                <X className="h-4 w-4 inline" />
                                              </button>
                                            ) : (
                                              <button 
                                                onClick={() => setEditingRequestId(req.id)}
                                                className="text-muted-foreground hover:text-primary mx-1"
                                              >
                                                <Edit className="h-4 w-4 inline" />
                                              </button>
                                            )}
                                            <button 
                                              onClick={() => handleDeleteRequest(req.id)}
                                              className="text-muted-foreground hover:text-destructive mx-1"
                                              disabled={deleteRequest.isPending}
                                            >
                                              <Trash2 className="h-4 w-4 inline" />
                                            </button>
                                         </td>
                                     </tr>
                                 ))}
                            </tbody>
                        </table>
                      </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <h3 className="font-bold text-card-foreground mb-4 flex items-center"><FileText className="h-5 w-5 mr-2" /> SEO Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Meta Title Template</label>
                                <input type="text" defaultValue="Unfindable | %s" className="w-full border border-border rounded p-2 text-sm bg-background focus:ring-accent focus:border-accent" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Default Meta Description</label>
                                <textarea className="w-full border border-border rounded p-2 text-sm bg-background focus:ring-accent focus:border-accent" rows={3} defaultValue="The world's leading reverse marketplace where you define the demand."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Keywords (comma separated)</label>
                                <input type="text" defaultValue="marketplace, finder, reverse commerce, rare items" className="w-full border border-border rounded p-2 text-sm bg-background focus:ring-accent focus:border-accent" />
                            </div>
                            <button className="w-full bg-primary text-primary-foreground py-2 rounded text-sm font-medium hover:bg-primary/90">Save SEO Settings</button>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <h3 className="font-bold text-card-foreground mb-4 flex items-center"><Settings className="h-5 w-5 mr-2" /> Site Customization</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Brand Primary Color</label>
                                <div className="flex items-center">
                                   <div className="w-8 h-8 rounded bg-primary mr-2 border border-border cursor-pointer"></div>
                                   <input type="text" defaultValue="hsl(var(--primary))" className="flex-1 border border-border rounded p-2 text-sm bg-background" readOnly />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Brand Accent Color</label>
                                <div className="flex items-center">
                                   <div className="w-8 h-8 rounded bg-accent mr-2 border border-border cursor-pointer"></div>
                                   <input type="text" defaultValue="hsl(var(--accent))" className="flex-1 border border-border rounded p-2 text-sm bg-background" readOnly />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Typography</label>
                                <select className="w-full border border-border rounded p-2 text-sm bg-background">
                                    <option>System Default</option>
                                    <option>Inter</option>
                                    <option>Poppins</option>
                                </select>
                             </div>
                             <button className="w-full bg-secondary text-secondary-foreground border border-border py-2 rounded text-sm font-medium hover:bg-secondary/80">Preview Changes</button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
