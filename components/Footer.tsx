import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { SiDiscord, SiX } from "react-icons/si";

const Footer: React.FC = () => {
  return (
    <footer className="mt-16">
      <div className="px-8 md:px-16 max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-7 mb-8">
          {/* Logo Section */}
          <div className="flex items-start justify-center md:justify-start">
            <div className="text-3xl font-bold">
               <span className="bg-gradient-to-r from-[#d4af37] to-[#f4cf67] 
               bg-clip-text text-transparent">
                <img src='gstv.png' alt='Logo' className="h-10 w-auto h-15 w-20" /> </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link to="/profile" className="text-[#d4af37] hover:text-white transition-colors">Account</Link>
            <span className="text-gray-600">•</span>
            <Link to="/help-center" className="text-[#d4af37] hover:text-white transition-colors">Help Center</Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms-of-use" className="text-[#d4af37] hover:text-white transition-colors">Terms and Conditions</Link>
            <span className="text-gray-600">•</span>
            <Link to="/privacy" className="text-[#d4af37] hover:text-white transition-colors">Privacy Policy</Link>
           <span className="text-gray-600">•</span>
            <a href="https://paystack.shop/pay/l1xk-9tgya" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:text-white transition-colors">Donations</a>
           
           {/* Contact Info */}
        <div className="border-t border-white/10 pt-6 mb-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center md:justify-start text-xs md:text-sm text-gray-400">
            
              <span className="text-white font-normal text-gray-500">This page is protected to make sure you are not a bot.
                </span>

          </div>
        </div>

       
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <a href="https://discord.gg/QqbVGmSG8" className="text-white hover:text-[#d4af37] transition-colors">
              <SiDiscord size={20} />
            </a>
            <a href="https://facebook.com/purescreen1" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-[#d4af37] transition-colors">
              <Facebook size={20} />
            </a>
           {/* <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white hover:text-[#d4af37] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a> */}
            <a href="https://www.instagram.com/purescreen_official/" className="text-white hover:text-[#d4af37] transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; 2026 PureScreen. All Rights Reserved. Xtrm Technologies NG</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
