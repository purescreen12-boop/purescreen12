import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from '../types';
import { subscriptionService } from '../services/subscriptionService';
import { X, Home, Compass, Edit, LogOut, UserCheck, UserCog, Film, BarChart3 } from 'lucide-react';
import MobileNavBar from '../components/MobileNavBar';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { email } = useParams<{ email?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [membershipActive, setMembershipActive] = useState<boolean>(false);
  const [creatorActive, setCreatorActive] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    const fetchUser = async () => {
      if (email) {
        // Fetch other user's profile
        try {
          const response = await fetch(`http://localhost:8081/api/user/${encodeURIComponent(email)}`);
          const data = await response.json();
          if (data.error) {
            navigate('/'); // User not found, redirect to home
            return;
          }
          setUser(data);
          setIsOwnProfile(false);
          
          // Fetch avatar
          if (data.avatar && (!data.avatar.startsWith('data:') || !data.avatar.startsWith('http'))) {
            fetch(`http://localhost:8081/api/upload-avatar/${data.email}`)
              .then(response => response.ok ? response.json() : null)
              .then(avatarData => {
                setAvatarUrl(avatarData?.avatar || data.avatar || null);
              })
              .catch(() => {
                setAvatarUrl(data.avatar || null);
              });
          } else {
            setAvatarUrl(data.avatar || null);
          }
        } catch (error) {
          navigate('/');
        }
      } else {
        // Current user's profile
        const u = authService.getCurrentUser();
        if (!u) {
          navigate('/auth');
          return;
        }
        setUser(u);
        setIsOwnProfile(true);
        
        // Check if user is admin (from database)
        if ((u as any).role === 'admin') {
          setIsAdmin(true);
        }
        // Fetch avatar from server if not already a data URL
        if (u.email && (!u.avatar || !u.avatar.startsWith('data:') || !u.avatar.startsWith('http'))) {
          fetch(`http://localhost:8081/api/upload-avatar/${u.email}`)
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error(`Avatar fetch failed with status ${response.status}`);
            })
            .then(data => {
              setAvatarUrl(data.avatar);
            })
            .catch((error) => {
              setAvatarUrl(u.avatar || null);
            });
        } else {
          setAvatarUrl(u.avatar || null);
        }
        // Fetch membership and creator status
        if (u.email) {
          subscriptionService.fetchSubscription(u.email).then(sub => {
            // Check if user has active subscription (including pending)
            const hasActiveSub = sub && sub.subscription_start && (sub.status === 'active' || sub.status === 'pending');
            const planName = sub?.plan_name || '';
            setMembershipActive(!!(hasActiveSub && !planName.toLowerCase().includes('creator')));
            setCreatorActive(!!(hasActiveSub && planName.toLowerCase().includes('creator')));
          }).catch(() => {
            setMembershipActive(false);
            setCreatorActive(false);
          });

          // Enable Creator access if the user has a recorded creator payment in the database
          fetch(`http://localhost:8081/api/creator-payments/${encodeURIComponent(u.email)}`)
            .then(res => res.ok ? res.json() : [])
            .then((payments: any[]) => {
              const hasCompleted = Array.isArray(payments) && payments.some(p => ['completed', 'success'].includes((p.status || '').toLowerCase()));
              if (hasCompleted) {
                setCreatorActive(true);
                // Also set localStorage for consistency
                localStorage.setItem('gospelscreen_creator_paid', u.email);
              }
            })
            .catch(() => {
              // If backend is down, check localStorage as fallback
              const storedCreatorPaidEmail = localStorage.getItem('gospelscreen_creator_paid');
              if (storedCreatorPaidEmail === u.email) {
                setCreatorActive(true);
              }
            });
        }
      }
    };

    fetchUser();
  }, [navigate, email]);

  useEffect(() => {
    // No scroll logic needed since MobileNavBar is always visible on profile
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-10 px-2 sm:pt-32 sm:pb-20 sm:px-6 flex flex-col items-center relative overflow-hidden">
      {/* Cinematic background image, same as Auth (Edit Profile) */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/wet-monstera-deliciosa-plant-leaves-garden.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r  to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 z-20">
        {/* Avatar and About (stacked on mobile) */}
        <div className="flex flex-col items-center gap-3 sm:gap-6 bg-[#181818]/60 rounded-2xl p-4 sm:p-8 border border-white/10 shadow-md">
          <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-white/5 overflow-hidden border border-white/10 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">About</span>
          <span className="text-xs sm:text-sm text-white opacity-80 text-justify px-1 sm:px-0 w-full" style={{textAlign: 'justify'}}>{user.description || 'No description provided.'}</span>
        </div>
        {/* Details and Actions */}
        <div className="flex flex-col gap-4 bg-[#181818]/60 rounded-2xl p-4 sm:p-8 border border-white/10 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-base sm:text-2xl font-bold text-white font-serif text-left">{user.name}</span>
            <span className="text-m sm:text-x text-gray-300 text-left">{user.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-12">
            <div>
              <span className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest block">Phone</span>
              <span className="text-xs sm:text-lg text-gray-200">{user.phone || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest block">Profession</span>
              <span className="text-xs sm:text-lg text-gray-200">{user.profession || '—'}</span>
            </div>
          </div>
          {/* Actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
            {isOwnProfile && (
              <button onClick={() => navigate('/choose-path')} className="flex flex-row items-center gap-2 px-4 py-2 bg-transparent border border-gray-400 rounded-lg text-gray-400 font-semibold text-sm sm:text-base transition-colors duration-200 hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]">
                <Compass size={20} />
                Choose Your Path
              </button>
            )}
            <button
              onClick={() => navigate('/member-dashboard')}
              className={`flex flex-row items-center gap-2 px-4 py-2 bg-transparent border rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 ${
                membershipActive && isOwnProfile
                  ? 'border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]'
                  : 'border-gray-400 text-gray-400 disabled:text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              disabled={!membershipActive || !isOwnProfile}
              title={membershipActive ? "You have an active membership" : "Subscribe to unlock membership"}
            >
              <UserCheck size={20} />
              Member
            </button>
            <button
              onClick={() => navigate('/creator-dashboard')}
              className={`flex flex-row items-center gap-2 px-4 py-2 bg-transparent border rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 ${
                creatorActive && isOwnProfile
                  ? 'border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]'
                  : 'border-gray-400 text-gray-400 disabled:text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              disabled={!creatorActive || !isOwnProfile}
              title={creatorActive ? "You have creator access" : "Creator access required"}
            >
              <UserCog size={20} />
              Creator
            </button>
            {isAdmin && isOwnProfile && (
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex flex-row items-center gap-2 px-4 py-2 bg-transparent border border-red-500 rounded-lg text-red-500 font-semibold text-sm sm:text-base transition-colors duration-200 hover:bg-red-500 hover:text-white"
              >
                <BarChart3 size={20} />
                Admin Dashboard
              </button>
            )}
           
            <button onClick={() => navigate('/')} className="flex flex-row items-center gap-2 px-4 py-2 bg-transparent border border-gray-400 rounded-lg text-gray-400 font-semibold text-sm sm:text-base transition-colors duration-200 hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]">
              <Home size={20} />
              Back to Home
            </button>
            {isOwnProfile && (
              <button onClick={() => navigate('/auth?edit=true')} className="flex flex-row items-center gap-2 px-4 py-2 bg-transparent border border-gray-400 rounded-lg text-gray-400 font-semibold text-sm sm:text-base transition-colors duration-200 hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]">
                <Edit size={20} />
                Edit Profile
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {
                  // Show loading overlay
                  const loadingOverlay = document.createElement('div');
                  loadingOverlay.className = 'fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50';
                  loadingOverlay.innerHTML = `<div class="loader"></div>`;
                  document.body.appendChild(loadingOverlay);
                  
                  import('../services/authService').then(({ authService }) => {
                    authService.logout();
                    // Redirect to who-is-watching after logout
                    setTimeout(() => {
                      window.location.href = '/who-is-watching';
                    }, 1000);
                  });
                }}
                className="col-span-1 sm:col-span-3 flex flex-row items-center justify-center gap-2 px-4 py-2 bg-transparent border border-gray-400 rounded-lg text-gray-400 font-semibold text-sm sm:text-base transition-colors duration-200 hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#23272b]"
              >
                <LogOut size={20} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
      <MobileNavBar showNav={showNav} isAlwaysVisible={true} />
    </div>
  );
};

export default Profile;
