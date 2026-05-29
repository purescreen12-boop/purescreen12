import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Video, Check, X } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { PaystackButton } from 'react-paystack';
import MobileNavBar from '../components/MobileNavBar';

const ChoosePath: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showPaystack, setShowPaystack] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'member' | 'creator'>('member');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Location detection for creator pricing
  const [locationInfo, setLocationInfo] = React.useState<{ country?: string; countryCode?: string; currency?: string; ip?: string }>({
    country: 'Nigeria',
    countryCode: 'NG',
    currency: 'NGN',
  });
  
  // Exchange rates for dynamic pricing
  const [exchangeRates, setExchangeRates] = React.useState<{ [key: string]: number }>({
    NGN: 1600, // Fallback rate
  });

  // Parse phone number to detect creator's country - comprehensive for all countries
  const parsePhoneCountry = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/[^\d]/g, '');
    // Comprehensive country mapping
    const countryMap: Record<string, { countryCode: string; country: string; currency: string }> = {
      '234': { countryCode: 'NG', country: 'Nigeria', currency: 'NGN' },
      '1': { countryCode: 'US', country: 'United States', currency: 'USD' },
      '44': { countryCode: 'GB', country: 'United Kingdom', currency: 'GBP' },
      '61': { countryCode: 'AU', country: 'Australia', currency: 'AUD' },
      '49': { countryCode: 'DE', country: 'Germany', currency: 'EUR' },
      '33': { countryCode: 'FR', country: 'France', currency: 'EUR' },
      '81': { countryCode: 'JP', country: 'Japan', currency: 'JPY' },
      '91': { countryCode: 'IN', country: 'India', currency: 'INR' },
      '55': { countryCode: 'BR', country: 'Brazil', currency: 'BRL' },
      '27': { countryCode: 'ZA', country: 'South Africa', currency: 'ZAR' },
      '20': { countryCode: 'EG', country: 'Egypt', currency: 'EGP' },
      '254': { countryCode: 'KE', country: 'Kenya', currency: 'KES' },
      '233': { countryCode: 'GH', country: 'Ghana', currency: 'GHS' },
      '255': { countryCode: 'TZ', country: 'Tanzania', currency: 'TZS' },
      '256': { countryCode: 'UG', country: 'Uganda', currency: 'UGX' },
      '39': { countryCode: 'IT', country: 'Italy', currency: 'EUR' },
      '34': { countryCode: 'ES', country: 'Spain', currency: 'EUR' },
      '31': { countryCode: 'NL', country: 'Netherlands', currency: 'EUR' },
      '32': { countryCode: 'BE', country: 'Belgium', currency: 'EUR' },
      '41': { countryCode: 'CH', country: 'Switzerland', currency: 'CHF' },
      '46': { countryCode: 'SE', country: 'Sweden', currency: 'SEK' },
      '47': { countryCode: 'NO', country: 'Norway', currency: 'NOK' },
      '45': { countryCode: 'DK', country: 'Denmark', currency: 'DKK' },
      '358': { countryCode: 'FI', country: 'Finland', currency: 'EUR' },
      '48': { countryCode: 'PL', country: 'Poland', currency: 'PLN' },
      '420': { countryCode: 'CZ', country: 'Czech Republic', currency: 'CZK' },
      '36': { countryCode: 'HU', country: 'Hungary', currency: 'HUF' },
      '40': { countryCode: 'RO', country: 'Romania', currency: 'RON' },
      '30': { countryCode: 'GR', country: 'Greece', currency: 'EUR' },
      '90': { countryCode: 'TR', country: 'Turkey', currency: 'TRY' },
      '82': { countryCode: 'KR', country: 'South Korea', currency: 'KRW' },
      '86': { countryCode: 'CN', country: 'China', currency: 'CNY' },
      '66': { countryCode: 'TH', country: 'Thailand', currency: 'THB' },
      '60': { countryCode: 'MY', country: 'Malaysia', currency: 'MYR' },
      '65': { countryCode: 'SG', country: 'Singapore', currency: 'SGD' },
      '63': { countryCode: 'PH', country: 'Philippines', currency: 'PHP' },
      '62': { countryCode: 'ID', country: 'Indonesia', currency: 'IDR' },
      '84': { countryCode: 'VN', country: 'Vietnam', currency: 'VND' },
      '880': { countryCode: 'BD', country: 'Bangladesh', currency: 'BDT' },
      '92': { countryCode: 'PK', country: 'Pakistan', currency: 'PKR' },
      '94': { countryCode: 'LK', country: 'Sri Lanka', currency: 'LKR' },
      '64': { countryCode: 'NZ', country: 'New Zealand', currency: 'NZD' },
      '971': { countryCode: 'AE', country: 'United Arab Emirates', currency: 'AED' },
      '966': { countryCode: 'SA', country: 'Saudi Arabia', currency: 'SAR' },
      '52': { countryCode: 'MX', country: 'Mexico', currency: 'MXN' },
      '54': { countryCode: 'AR', country: 'Argentina', currency: 'ARS' },
      '56': { countryCode: 'CL', country: 'Chile', currency: 'CLP' },
      '57': { countryCode: 'CO', country: 'Colombia', currency: 'COP' },
      '7': { countryCode: 'RU', country: 'Russia', currency: 'RUB' },
    };

    // Try to match the longest prefix first
    const prefixes = Object.keys(countryMap).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
      if (digits.startsWith(prefix)) {
        return countryMap[prefix];
      }
    }
    
    return { countryCode: 'NG', country: 'Nigeria', currency: 'NGN' };
  };

  // Fetch exchange rates
  React.useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates);
        }
      } catch (err) {
        console.warn('Failed to fetch exchange rates:', err);
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect creator's location on mount - only use phone number
  React.useEffect(() => {
    const current = authService.getCurrentUser();
    if (current?.phone) {
      const phoneLocation = parsePhoneCountry(current.phone);
      setLocationInfo({
        country: phoneLocation.country,
        countryCode: phoneLocation.countryCode,
        currency: phoneLocation.currency,
      });
    } else {
      // Default to Nigeria if no phone number (fallback)
      setLocationInfo({
        country: 'Nigeria',
        countryCode: 'NG',
        currency: 'NGN',
      });
    }
  }, [user]);

  useEffect(() => {
    // Try to get the current user from memory or DB
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
    } else if (authService.loadUserFromDB) {
      (authService.loadUserFromDB as any)().then(setUser);
    }
  }, []);

  // Creator pricing is free: 0.00 kobo
  const getCreatorPricingConfig = () => {
    return {
      displayPrice: '₦100000.00',
      amount: 100000,
      currencyCode: 'NGN',
    };
  };

  const creatorPricing = getCreatorPricingConfig();

  const paystackConfig = {
    email: user?.email || 'purescreen12@gmail.com',
    amount: creatorPricing.amount,
    publicKey: 'pk_live_36cc4f4821b17be780f3ca58a06d3e0ad4652c6f',
    text: 'Proceed',
    metadata: {
      plan: 'creator',
      originalCurrency: 'NGN',
      originalAmount: 0.00,
      userId: user?.id || null,
      custom_fields: [
        {
          display_name: 'Creator',
          variable_name: 'creator_type',
          value: 'Content Creator',
        },
      ],
    },
    onSuccess: () => {
      setShowTermsModal(false);

      // Flag this user as having paid creator access
      if (user?.email) {
        localStorage.setItem('gospelscreen_creator_paid', user.email);
      }

      // Record creator payment in backend for auditing/reporting
      if (user?.email) {
        fetch('http://localhost:8081/api/creator-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.email,
            amount: creatorPricing.amount / 100,
            paymentReference: `paystack_${Date.now()}`,
            status: 'completed'
          })
        })
          .then(res => res.json())
          .catch((err) => console.error('Creator payment recording failed:', err))
          .finally(() => {
            // Redirect immediately without showing any alert
            navigate('/creator-dashboard');
          });
      } else {
        // Fallback - redirect directly
        navigate('/creator-dashboard');
      }
    },
    onClose: () => {
      setShowTermsModal(false);
      setTermsAccepted(false);
    },
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Cinematic background image, same as Profile */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/extreme-closeup-beautiful-blown-dandelion.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t  via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* Removed X/back button for a cleaner, centralized layout */}
      <div className="w-full flex flex-col items-center justify-center z-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose Your Path</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Select an option below to get started.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-white/10 rounded-full flex p-1 w-fit">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${selectedPath === 'member' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setSelectedPath('member')}
            >
              Member
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedPath === 'creator' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setSelectedPath('creator')}
            >
              Creator
            </button>
          </div>
        </div>
      
        <div className="flex justify-center items-center w-full max-w-sm">
          {selectedPath === 'member' && (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between w-full">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Users size={32} className="text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold">PureScreen Member</h3>
                <p className="text-base text-gray-300 mb-4">Watch & Support</p>
              </div>
              <hr className="my-4 border-white/10" />
              <ul className="space-y-3 mb-6 text-base text-gray-200">
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Unlimited Access to Movies</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Exclusive Member Content</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Support Filmmakers</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch GFN live</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch on Any Device</li>
              </ul>
              <button onClick={() => navigate('/membership')} className="w-full bg-[#d4af37] text-black py-3 rounded-lg text-base font-bold">Activate Your Membership</button>
            </div>
          )}
          {selectedPath === 'creator' && (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between w-full">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Video size={32} className="text-[#f97316]" />
                </div>
                <h3 className="text-xl font-bold">Content Creator</h3>
                <p className="text-base text-gray-300 mb-2">Share & Earn</p>
               
              </div>
              <hr className="my-4 border-white/10" />
              <ul className="space-y-3 mb-6 text-base text-gray-200">
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Upload Your Films</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Earn Money Per Views</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Access Creator Dashboard</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Get your movie sponsored</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Reach a Faith-Based Audience</li>
              </ul>
              <button
                onClick={() => setShowTermsModal(true)}
                className="w-full bg-[#d4af37] text-black py-3 rounded-lg text-base font-bold"
              >
                Apply as a Creator
              </button>

             
              {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
                    <h3 className="text-lg font-bold text-black mb-4">Creator Terms & Conditions</h3>
                    <div className="text-sm text-gray-700 mb-4 max-h-40 overflow-y-auto">
                      <p className="mb-2">By becoming a creator on PureScreen, you agree to:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Upload only faith-based, family-friendly content</li>
                        <li>Respect copyright and intellectual property rights</li>
                        <li>Comply with our community guidelines</li>
                        <li>Allow PureScreen to distribute your content</li>
                        <li>Receive payments based on views and engagement</li>
                      </ul>
                    </div>
                    <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mr-3 w-4 h-4 text-[#d4af37] bg-gray-100 border-gray-300 rounded focus:ring-[#d4af37] focus:ring-2"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 font-medium">
                        I accept the Creator Terms & Conditions
                      </label>
                    </div>
                    
                    {termsAccepted && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Creator Access Fee: {locationInfo.countryCode === 'NG' ? '₦1,000' : '$1'}
                        </p>
                        <PaystackButton {...paystackConfig} className="w-full bg-[#d4af37] text-black py-3 rounded-lg text-base font-bold hover:bg-[#c49f27] transition-colors" />
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setShowTermsModal(false);
                        setTermsAccepted(false);
                      }} 
                      className="mt-4 text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default ChoosePath;
