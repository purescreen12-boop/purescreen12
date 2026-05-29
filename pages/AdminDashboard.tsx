import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Film,
  TrendingUp,
  Settings,
  LogOut,
  FileText,
  DollarSign,
  Eye,
  MessageSquare,
  MoreVertical,
  ChevronRight,
  Menu,
  X as CloseIcon,
  ArrowUp,
  Activity,
  Award,
  Lock,
  Shield
} from 'lucide-react';
import { authService } from '../services/authService';

interface Creator {
  uploader: string;
  totalMovies: number;
  totalViews: number;
  earnings?: number;
  monetized?: boolean;
  lastUploadDate: string;
 
}

interface Users {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  profession?: string;
  country?: string;
  currency?: string;
  role?: string;
  isActive?: boolean;
  avatar?: string;
  description?: string;
  subscription?: {
    status?: string;
    subscription_end?: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'views' | 'user';
  message: string;
  user: string;
  timestamp: string;
  icon?: 'upload' | 'eye' | 'user';
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [movies, setMovies] = useState([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [revenue, setRevenue] = useState({ total: 0, subscriptionRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openUserDropdown, setOpenUserDropdown] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Check admin authorization on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      setIsAuthorized(false);
    }
  }, []);

  // Show authorization error
  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Shield size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white">Admin Only</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              You do not have permission to access the admin dashboard. Contact support if you believe this is an error.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-[#c49f27] transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetch("http://localhost:8081/api/admin-dashboard")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(data => {
        setStats({
          totalUsers: data.totalUsers,
          totalMovies: data.totalMovies,
          totalViews: data.totalViews,
          
        });

        setCreators(data.creators || []);
        setUsers(data.users || []);
        setRecentActivity(data.recentActivity || []);
        // Calculate revenue based on views: 100 naira per view
        setRevenue(prev => ({ ...prev, total: (data.totalViews || 0) * 100 }));
        
        // Fetch subscription revenue
        return fetch("http://localhost:8081/api/admin-subscription-revenue");
      })
      .then(res => {
        if (!res.ok) {
          console.error('Subscription revenue response not ok:', res.status);
          throw new Error('Failed to fetch subscription revenue');
        }
        return res.json();
      })
      .then(data => {
        console.log('Subscription revenue data:', data);
        setRevenue(prev => ({
          ...prev,
          subscriptionRevenue: data.totalRevenue || 0
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching subscription revenue:', err.message);
        // Set default value and continue loading
        setRevenue(prev => ({ ...prev, subscriptionRevenue: 0 }));
        setLoading(false);
      });
  }, []);

  // Fetch movies when movies tab is selected
  useEffect(() => {
    if (activeSidebarItem === 'movies') {
      setLoading(true);
      setError(null);
      fetch("http://localhost:8081/api/admin-movies")
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch movies');
          return res.json();
        })
        .then(data => {
          setMovies(data.movies || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching movies:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [activeSidebarItem]);

  const handleUsersAccountToggle = (userEmail: string, action: 'enable' | 'disable') => {
    fetch(`http://localhost:8081/api/admin-user-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, action })
    })
      .then(res => res.json())
      .then(data => {
        // Update the user's isActive status in state
        setUsers(users.map(u => 
          u.email === userEmail ? { ...u, isActive: action === 'enable' } : u
        ));
        setOpenUserDropdown(null);
      })
      .catch(err => console.error('Error updating user account:', err));
  };

  const StatCard = ({ label, value, growth }: { label: string; value: string | number; growth: number }) => (
    
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-lg hover:border-white/20 transition-all">
    
      <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
          <ArrowUp size={16} />
          <span>{growth}%</span>
        </div>
      </div>
    </div>
  );

  const RevenueCard = ({ label, amount, percentage }: { label: string; amount: number; percentage: number }) => (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-lg">
      <p className="text-gray-400 text-sm font-medium mb-4">{label}</p>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-bold text-white">₦{amount.toLocaleString()}</p>
          <p className="text-[#d4af37] text-xs font-medium mt-1">({percentage}%)</p>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-[#d4af37] h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, id }: { icon: React.ReactNode; label: string; id: string }) => (
    <button
      onClick={() => {
        setActiveSidebarItem(id);
        if (id === 'logout') {
          navigate('/profile');
        }
      }}
      className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg transition-all mb-2 ${
        activeSidebarItem === id
          ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37]'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }`}
    >
      {Icon}
      {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
    </button>
  );

  return (

    
    <div className="flex min-h-screen bg-[#0f0f0f] pt-24 sm:pt-32">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-56' : 'w-20'
        } bg-[#1a1a1a] border-r border-white/10 transition-all duration-300 flex flex-col fixed left-0 top-24 sm:top-32 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-[#d4af37] font-bold text-lg">GOSPEL</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition-all"
          >
            {sidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<BarChart3 size={20} />} label="Dashboard" id="dashboard" />
          <SidebarItem icon={<Award size={20} />} label="Creators" id="creators" />
          <SidebarItem icon={<Film size={20} />} label="Movies" id="movies" />
          <SidebarItem icon={<Users size={20} />} label="Users" id="users" />
          <SidebarItem icon={<DollarSign size={20} />} label="Monetization" id="monetization" />
          <SidebarItem icon={<FileText size={20} />} label="Reports" id="reports" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" id="settings" />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <SidebarItem icon={<LogOut size={20} />} label="Logout" id="logout" />
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-56' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-[#1a1a1a] border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin - GospelScreen</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Subscription Revenue</p>
              <p className="text-2xl font-bold text-[#d4af37]">₦{revenue.subscriptionRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-full flex items-center justify-center">
              <span className="text-[#d4af37] font-bold">AD</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d4af37]/20 mb-4">
                    <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-400">Loading dashboard data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6">
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-red-300 text-sm mt-2">{error}</p>
              </div>
            )}

            {/* Content */}
            {!loading && !error && stats && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Total Users" value={stats.totalUsers} growth={3.9} />
                  <StatCard label="Total Movies Uploaded" value={stats.totalMovies} growth={5.0} />
                  <StatCard label="Total Platform Views" value={stats.totalViews} growth={5.0} />
                </div>

                {/* Revenue & Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Cards */}
                  <RevenueCard label="Subscription Revenue" amount={revenue.subscriptionRevenue} percentage={100} />
                  <RevenueCard label="Creator Payouts (40%)" amount={Math.round(revenue.subscriptionRevenue * 0.4)} percentage={40} />
                  <RevenueCard label="Platform Share (60%)" amount={Math.round(revenue.subscriptionRevenue * 0.6)} percentage={60} />
                </div>

                {/* Recent Activity & Creators Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
          


              {/* Users Overview Table */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-6">Users Overview</h3>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      {/* Table Header */}
                      <thead>
                        <tr className="border-b border-white/10 bg-black/30">
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Id</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Profession</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</th>
                        </tr>
                      </thead>
                      {/* Table Body */}
                      <tbody className="divide-y divide-white/5">
                        {users && users.length > 0 ? (
                          users.map((user, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-all">
                              <td className="px-4 py-3">
                                <p className="text-gray-400 text-xs">{user.id || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-white">{user.name || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-gray-400 text-xs">{user.email || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-gray-400 text-xs">{user.phone || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-gray-400 text-xs">{user.profession || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-gray-400 text-xs">{user.country || 'N/A'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-500/20 text-purple-400' 
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {user.role || 'user'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={() => handleUsersAccountToggle(user.email, user.isActive ? 'disable' : 'enable')}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 cursor-pointer ${
                                    user.isActive 
                                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  }`}
                                >
                                  {user.isActive ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center">
                              <p className="text-gray-400">No users found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>





              {/* Creators Overview Table */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-6">Creators Overview</h3>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* Table Header */}
                      <thead>
                        <tr className="border-b border-white/10 bg-black/30">
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Creator
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Total Movies
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Total Views
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Earnings
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Monetized
                          </th>
                        </tr>
                      </thead>
                      {/* Table Body */}
                      <tbody className="divide-y divide-white/5">
                        {creators && creators.length > 0 ? (
                          creators.map((creator, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-all">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-white">{creator.uploader}</p>
                              </td>
                            
                              <td className="px-6 py-4">
                                <p className="text-white font-medium">{creator.totalMovies}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-white font-medium">{creator.totalViews?.toLocaleString() || '0'}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-[#d4af37] font-semibold">₦{(creator.totalViews * 100).toLocaleString()}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${creator.monetized ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  {creator.monetized ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center">
                              <p className="text-gray-400">No creators found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>





            </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
