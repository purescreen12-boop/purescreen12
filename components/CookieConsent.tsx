 import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show cookie banner only on first visit
      setShowCookie(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookie(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowCookie(false);
  };

  if (!showCookie) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-[#d4af37]/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">Cookie Consent</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use cookies to enhance your experience on our website. By continuing to browse, you agree to our use of cookies. 
              <Link to="/privacy" className="text-[#d4af37] hover:underline ml-1">Learn more</Link>
            </p>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <button
              onClick={handleDecline}
              className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all text-sm font-medium"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 rounded-lg bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-bold transition-all text-sm"
            >
              Accept
            </button>
          </div>

          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
