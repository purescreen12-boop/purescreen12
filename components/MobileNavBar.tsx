import React, { useState } from 'react';
import { Home, Video, Tv, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavBarProps {
  showNav: boolean;
  isAlwaysVisible?: boolean;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ showNav, isAlwaysVisible = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLiveAlert, setShowLiveAlert] = useState(false);

  const navItems = [
    { label: 'Home', icon: <Home size={26} />, path: '/' },
    { label: 'Collections', icon: <Video size={26} />, path: '/browse' },
    { label: 'Live', icon: <Tv size={26} />, path: '/live' },
    { label: 'You', icon: <UserIcon size={26} />, path: '/profile' },
  ];

  // Determine active nav item based on current path
  const getIsActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Floating Mobile Nav Bar */}
      <nav
        className={`fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-[#181818] border-t border-[#222]/60 py-2 md:hidden transition-all duration-300
        ${isAlwaysVisible || showNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.18)' }}
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          let isActive = getIsActive(item.path);
          if (item.label === 'You') {
            // Highlight "You" on profile-related pages (include auth, forgot/reset flows)
            const profilePaths = ['/profile', '/choose-path', '/membership', '/auth', '/member-dashboard', '/creator-dashboard', '/forgot-password', '/reset-password'];
            isActive = profilePaths.some(p => location.pathname.startsWith(p));
          }
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === 'Live') {
                  setShowLiveAlert(true);
                  setTimeout(() => setShowLiveAlert(false), 4000);
                } else {
                  navigate(item.path);
                }
              }}
              className={`flex flex-col items-center justify-center px-2 focus:outline-none group transition-all ${
                isActive ? 'text-[#d4af37]' : 'text-white'
              }`}
              style={{ background: 'none', border: 'none' }}
              aria-label={item.label}
            >
              <span className={`mb-0.5 transition-colors ${isActive ? 'text-[#d4af37]' : 'group-hover:text-[#d4af37]'}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium tracking-wide transition-colors ${isActive ? 'text-[#d4af37]' : 'group-hover:text-[#d4af37] text-white'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Live Session Alert Modal */}
      {showLiveAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLiveAlert(false)} />
          <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#d4af37]/50 rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-[#d4af37]/20 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4cf67] flex items-center justify-center animate-pulse">
                <Tv size={32} className="text-black" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Coming Soon!</h2>
                <p className="text-gray-300 text-sm">stay tuned...</p>
              </div>
              <button
                onClick={() => setShowLiveAlert(false)}
                className="px-8 py-2 bg-[#d4af37] text-black font-bold rounded-full hover:bg-[#c49f27] transition-all w-full"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavBar;
