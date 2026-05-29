import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authService } from '../services/authService';
import MobileNavBar from '../components/MobileNavBar';

const CreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const userName = user?.name || 'Creator';
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [monetized, setMonetized] = useState(false);
  const [creatorPayments, setCreatorPayments] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [hasCreatorAccess, setHasCreatorAccess] = useState(false);
  const [accessChecking, setAccessChecking] = useState(true);

  useEffect(() => {
    const checkCreatorAccess = async () => {
      setAccessChecking(true);
      
      // Check 1: Role-based access
      if (user && (user.role === 'creator' || user.role === 'admin')) {
        setHasCreatorAccess(true);
        setAccessChecking(false);
        return;
      }

      // Check 2: Creator payment in database
      if (user?.email) {
        try {
          const res = await fetch(`http://localhost:8081/api/creator-payments/${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const payments = await res.json();
            const hasCompletedPayment = Array.isArray(payments) && 
              payments.some(p => ['completed', 'success'].includes((p.status || '').toLowerCase()));
            
            if (hasCompletedPayment) {
              setHasCreatorAccess(true);
              // Update localStorage to indicate creator access
              localStorage.setItem('gospelscreen_creator_paid', user.email);
              setAccessChecking(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Error checking creator payments:', err);
        }
      }

      // Check 3: localStorage flag (for recent payments before database sync)
      if (user?.email && localStorage.getItem('gospelscreen_creator_paid') === user.email) {
        setHasCreatorAccess(true);
      }

      setAccessChecking(false);
    };

    checkCreatorAccess();
  }, [user?.email, user?.role]);

  useEffect(() => {
    const fetchUser = async () => {
      const dbUser = await authService.loadUserFromDB();
      if (dbUser) {
        setUser(dbUser);
        // Check if avatar is a valid URL or data string
        if (dbUser.avatar && (dbUser.avatar.startsWith('data:') || dbUser.avatar.startsWith('http'))) {
          setAvatarUrl(dbUser.avatar);
        } else if (dbUser.email) {
          // Fetch avatar from server if not valid
          try {
            const response = await fetch(`http://localhost:8081/api/upload-avatar/${dbUser.email}`);
            if (response.ok) {
              const data = await response.json();
              setAvatarUrl(data.avatar);
            } else {
              setAvatarUrl(dbUser.avatar || null);
            }
          } catch {
            setAvatarUrl(dbUser.avatar || null);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    };
    const fetchViews = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`http://localhost:8081/api/user-movie-views?email=${encodeURIComponent(user.email)}`);
          if (response.ok) {
            const data = await response.json();
            setTotalViews(data.totalViews || 0);
          } else {
            setTotalViews(0);
          }
        } catch {
          setTotalViews(0);
        }
      } else {
        setTotalViews(0);
      }
    };

    const fetchCreatorPayments = async () => {
      if (!user?.email) return;
      setPaymentLoading(true);
      try {
        const res = await fetch(`http://localhost:8081/api/payouts/${encodeURIComponent(user.email)}`);
        if (!res.ok) throw new Error('Failed to load payouts');
        const data = await res.json();
        setCreatorPayments(data);
      } catch (err) {
        console.error('Error fetching payouts:', err);
        setCreatorPayments([]);
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchUser();
    fetchViews();
    fetchCreatorPayments();
  }, [user?.email]);

  // Auto-refresh views every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.email) {
        refreshViews();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.email]);

  // Function to refresh views data
  const refreshViews = async () => {
    await fetchViews();
  };

  // Simulate payment completion
  const handlePaymentComplete = () => {
    // After payment, navigate to dashboard
    navigate('/creator-dashboard');
  };

  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const NAIRA_PER_VIEW = 100; // ₦100 per view
  const earnings = totalViews * NAIRA_PER_VIEW;
  const progressPercent = Math.min((totalViews / 1000) * 100, 100);

  // Check if user is creator or admin
  if (accessChecking) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto"></div>
          <p className="text-gray-400 mt-4">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasCreatorAccess) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Shield size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white">Creator Access Only</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Only creators and admins have access to the creator dashboard. Please contact support to request creator access.
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

  return (

    <div className="min-h-screen relative overflow-hidden text-white flex items-center justify-center pt-10 pb-10">
      {/* Cinematic background image, same as Edit Profile */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/extreme-closeup-beautiful-blown-dandelion.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t  via-transparent to-transparent" />
      </div>
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <main className="w-full max-w-4xl p-6 z-20">
         <br/><br/><br/>
        <div className="bg-[#121212] rounded-2xl w-full p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Creator Dashboard</h2>
              <p className="text-gray-400">Welcome, {userName}!</p>
            </div>
            <div className="text-gray-400 font-medium">{today}</div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover border border-white" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-xl text-gray-700 font-bold">
                  {userName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg text-white">{userName}</span>
            </div>
            <button
              className={`ml-4 px-4 py-2 bg-yellow-600 text-white rounded font-semibold shadow hover:bg-yellow-700 transition flex items-center justify-center ${loading ? 'opacity-70 cursor-wait' : ''}`}
              onClick={async () => {
                setLoading(true);
                await new Promise(res => setTimeout(res, 1200));
                setLoading(false);
                navigate('/upload');
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Upload New Movie'}
            </button>
          </div>
          <p className="text-gray-400 mb-6">Upload full-length films securely. Refresh the page to see Updates</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 font-medium">Total Views</div>
                <button
                  onClick={refreshViews}
                  className="text-[#d4af37] hover:text-[#c9a32b] transition-colors p-1"
                  title="Refresh view count"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="text-3xl font-bold text-white">{totalViews}</div>
            </div>
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="text-gray-400 font-medium mb-2">Total Earnings</div>
              <div className="text-3xl font-bold text-green-400">₦{earnings.toLocaleString()}</div>
              
              <div className="text-xs text-gray-500">₦100 per view</div>
            </div>
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="text-gray-400 font-medium mb-2">Payout Balance</div>
              <div className="text-3xl font-bold text-gray-400">₦{(totalViews >= 1000 ? earnings : 0).toLocaleString()}</div>
              <div className="text-xs text-gray-500">Available for payout ({totalViews >= 1000 ? 'Eligible' : 'Reach 1000 views'})</div>
            </div>
          </div>
          <div className="bg-[#181818] rounded-lg p-6 shadow mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-white">Monetization</span>
              <button
                disabled={totalViews < 1000}
                className={`px-4 py-2 rounded font-semibold transition-colors ${totalViews >= 1000 ? 'bg-[#d4af37] text-black hover:bg-[#c9a32b] cursor-pointer' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
                onClick={() => {
                  if (totalViews >= 1000) {
                    window.location.href =
                      'mailto:gospelscreentv@gmail.com?subject=Monetization Request&body=I have reached 1000 total views and would like to request payout for my earnings of ₦' + earnings.toLocaleString() + '.';
                    setMonetized(true);
                  }
                }}
              >
                {monetized ? "Payout Requested" : totalViews >= 1000 ? "Request Payout" : "Reach 1000 Views"}
              </button>
            </div>
            <div className="text-gray-400 mb-2">Enable payouts once you reach 1,000 total views</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-gray-400 text-sm font-medium">{totalViews} views</span>
            </div>
            <div className="text-gray-400 text-sm">Total Views: {totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">1,000 Views Required for Payout, Creator should only click upload after a period of 30 days.</div>
          </div>
         
          <div className="flex flex-col sm:flex-row sm:justify-end mt-6">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-[#d4af37] text-black rounded-lg font-semibold shadow hover:bg-[#c9a32b] transition-colors text-sm sm:text-base"
              onClick={() => navigate('/profile')}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default CreatorDashboard;
