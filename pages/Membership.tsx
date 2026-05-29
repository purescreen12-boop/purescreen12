import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import MobileNavBar from '../components/MobileNavBar';

const Membership: React.FC = () => {
  const navigate = useNavigate();
  const publicKey = 'pk_live_36cc4f4821b17be780f3ca58a06d3e0ad4652c6f';
  const user = authService.getCurrentUser();
  const email = user?.email || '';



  // Location detection state
  const [locationInfo, setLocationInfo] = React.useState<{ country?: string; currency?: string; ip?: string }>({
    country: user?.country || 'United States',
    currency: user?.currency || 'USD',
  });
  const [locationLoading, setLocationLoading] = React.useState(true);

  const parsePhoneCountry = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/[^\d\+]/g, '');
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
    
    return { countryCode: 'US', country: 'United States', currency: 'USD' };
  };

  // Exchange rate state for dynamic pricing
  const [exchangeRates, setExchangeRates] = React.useState<{ [key: string]: number }>({
    NGN: 1600, // Fallback: 1600 NGN per USD
  });

  const saveLocationToServer = async (location: { country?: string; currency?: string; ip?: string }) => {
    if (!email) return;
    try {
      await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          country: location.country,
          currency: location.currency,
          ip_address: location.ip || '',
        }),
      });
    } catch (err) {
      console.warn('Failed to save location to server:', err);
    }
  };

  // Fetch real-time exchange rates on mount
  React.useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Using Open Exchange Rates API (free tier)
        // Alternative: https://api.exchangerate-api.com/v4/latest/USD
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates);
        }
      } catch (err) {
        console.warn('Failed to fetch real-time exchange rates:', err);
        // Keep fallback rates
      }
    };

    fetchExchangeRates();
    // Refresh rates every 6 hours
    const interval = setInterval(fetchExchangeRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Comprehensive pricing for all countries based on currency
  const getPricingConfig = () => {
    const currency = locationInfo.currency || 'USD';

    // Pricing for Nigeria only; all other countries use the same USD plan values
    const nigeriaPricing = {
      monthly: { display: '₦2,000', amount: 200000 },
     yearly: { display: '₦20,000', amount: 2000000 },
      code: 'NGN',
    };

    const globalPricing = {
      monthly: { display: '$5.89', amount: 589 },
      yearly: { display: '$50.89', amount: 5089 },
      code: 'USD',
    };

    const pricing = locationInfo.country === 'Nigeria' && currency === 'NGN' ? nigeriaPricing : globalPricing;

    // For Paystack (which requires NGN), convert non-NGN pricing to NGN if needed
    let monthlyAmountPaystack = pricing.monthly.amount;
    let yearlyAmountPaystack = pricing.yearly.amount;
    let currencyCode = pricing.code;

    if (currency !== 'NGN' && exchangeRates.NGN) {
      const usdToNgn = exchangeRates.NGN;
      const monthlyUsd = pricing.monthly.amount / 100;
      const yearlyUsd = pricing.yearly.amount / 100;
      monthlyAmountPaystack = Math.round(monthlyUsd * usdToNgn * 100);
      yearlyAmountPaystack = Math.round(yearlyUsd * usdToNgn * 100);
      currencyCode = 'NGN';
    }

    return {
      monthlyPrice: pricing.monthly.display,
      yearlyPrice: pricing.yearly.display,
      monthlyAmount: monthlyAmountPaystack,
      yearlyAmount: yearlyAmountPaystack,
      currencyCode: currencyCode,
    };
  };

  const pricing = getPricingConfig();

  // Determine location based on signup/user metadata; no auto-detect or localStorage usage on page load.
  React.useEffect(() => {
    const userLocation = user?.country && user?.currency ? { country: user.country, currency: user.currency } : null;
    const phoneLocation = user?.phone ? parsePhoneCountry(user.phone) : null;
    const initialLocation = userLocation || (phoneLocation ? { country: phoneLocation.country, currency: phoneLocation.currency } : { country: 'United States', currency: 'USD' });

    setLocationInfo(initialLocation);
    setLocationLoading(false);

    saveLocationToServer(initialLocation).catch(err => console.warn('Failed to save location to server:', err));
  }, [user]);

  // Subscription state
  const [currentSubscription, setCurrentSubscription] = React.useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);

  // If not logged in, show message and redirect
  if (!email) {
    React.useEffect(() => {
      alert('Please log in to purchase a membership');
      navigate('/auth');
    }, [navigate]);
    return null;
  }

  // Fetch current subscription on mount
  React.useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await subscriptionService.fetchSubscription(email);
        if (sub && sub.subscription_end) {
          const endDate = new Date(sub.subscription_end);
          const now = new Date();
          if (endDate > now && sub.status === 'active') {
            setCurrentSubscription(sub);
          }
        }
      } catch (err) {
        console.log('No active subscription found or error:', err);
      } finally {
        setSubscriptionLoading(false);
      }
    };
    fetchSubscription();
  }, [email]);

  // Toggle state for Monthly/Yearly
  const [planType, setPlanType] = React.useState<'monthly' | 'yearly'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<'month' | 'year' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const paystackMonthRef = useRef(null);
  const paystackYearRef = useRef(null);

  // Handle payment success - create pending subscription and verify via webhook
  const handlePaymentSuccess = async (planName: string, reference: string) => {
    setProcessing(true);
    if (!email) {
      alert('Email not found. Please log in again.');
      navigate('/auth');
      setProcessing(false);
      return;
    }
    try {
      console.log('Payment successful! Reference:', reference);
      console.log('Plan:', planName);
      await subscriptionService.createPendingSubscription(email, planName, reference);
      setShowSuccessModal(true);
      setCountdown(10);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/member-dashboard');
      }, 5000);
    } catch (error) {
      console.error('Error processing payment:', error);
      await subscriptionService.createPendingSubscription(email, planName, reference);
      setShowSuccessModal(true);
      setCountdown(5);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/member-dashboard');
      }, 5000);
    } finally {
      setProcessing(false);
    }
  };
  const fwConfigMonth = {
    email,
    amount: pricing.monthlyAmount,
    currency: pricing.currencyCode,
    publicKey,
    text: 'Choose Plan',
    metadata: {
      plan: 'monthly',
      originalCurrency: locationInfo.currency || 'USD',
      originalAmount: locationInfo.currency === 'NGN' ? 1500 : 6,
      userId: user?.id || null,
      custom_fields: [
        {
          display_name: 'Membership',
          variable_name: 'membership_type',
          value: '1 Month',
        },
      ],
    },
    onSuccess: (reference: any) => {
      console.log('Payment success response:', reference);
      handlePaymentSuccess('Monthly', reference.reference || reference);
    },
    onClose: () => handleCancel('month'),
  };

  const handleCancel = (type: 'month' | 'year') => {
    setPendingCancel(type);
    setShowCancelModal(true);
  };

  const fwConfigYear = {
    email,
    amount: pricing.yearlyAmount,
    currency: pricing.currencyCode,
    publicKey,
    text: 'Choose Plan',
    metadata: {
      plan: 'yearly',
      originalCurrency: locationInfo.currency || 'USD',
      originalAmount: locationInfo.currency === 'NGN' ? 15000 : 60,
      userId: user?.id || null,
      custom_fields: [
        {
          display_name: 'Membership',
          variable_name: 'membership_type',
          value: '1 Year',
        },
      ],
    },
    onSuccess: (reference: any) => {
      console.log('Payment success response:', reference);
      handlePaymentSuccess('Yearly', reference.reference || reference);
    },
    onClose: () => handleCancel('year'),
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden text-white">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#181818] rounded-xl shadow-lg p-8 max-w-xs w-full text-center border border-white/10">
            <div className="mb-6 text-lg text-white font-semibold">Are you sure you want to cancel the payment?</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-[#d4af37] text-black font-bold shadow hover:bg-[#c9a32b] transition"
                onClick={() => {
                  setShowCancelModal(false);
                  setPendingCancel(null);
                }}
              >
                Yes
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-700 text-white font-bold shadow hover:bg-gray-600 transition"
                onClick={() => {
                  setShowCancelModal(false);
                  // Reopen Paystack modal for the pending plan
                  setTimeout(() => {
                    if (pendingCancel === 'month' && paystackMonthRef.current) {
                      paystackMonthRef.current.querySelector('button')?.click();
                    } else if (pendingCancel === 'year' && paystackYearRef.current) {
                      paystackYearRef.current.querySelector('button')?.click();
                    }
                    setPendingCancel(null);
                  }, 200);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md mx-4">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl blur-2xl" />
            
            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black rounded-2xl border border-[#d4af37]/50 shadow-2xl overflow-hidden p-8">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              
              {/* Animated checkmark icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d4af37]/30 rounded-full blur-lg animate-pulse" />
                  <div className="relative bg-[#d4af37] rounded-full p-3 animate-in zoom-in duration-500">
                    <CheckCircle size={48} className="text-black" />
                  </div>
                </div>
              </div>

              {/* Success Text */}
              <h2 className="text-center text-2xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                Payment Successful! <span className="text-[#d4af37]">✨</span>
              </h2>
              
              <p className="text-center text-gray-300 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                Your subscription is being activated. Welcome to GospelScreen TV!
              </p>

              {/* Features highlight */}
              <div className="bg-black/50 rounded-lg p-4 mb-6 border border-[#d4af37]/20">
                <div className="flex items-center gap-2 text-[#d4af37] mb-3">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">You now have access to:</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                    Unlimited streaming of all films
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                    Premium member-exclusive content
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                    Watch anytime on any device
                  </li>
                </ul>
              </div>

              {/* Webhook Processing Info */}
              <div className="bg-[#d4af37]/10 rounded-lg p-3 mb-4 border border-[#d4af37]/30">
                <p className="text-center text-[#d4af37] text-sm font-semibold mb-2">
                  Processing your subscription...
                </p>
                <p className="text-center text-gray-300 text-xs">
                  Payment is pending on our server. Please hold for <span className="font-bold text-[#d4af37]">{countdown}s</span> while we confirm your subscription.
                </p>
              </div>
              
              
              
              <p className="text-center text-gray-500 text-xs animate-pulse">
                Hold tight — we’ll redirect you to your dashboard once the payment is confirmed.
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            </div>
          </div>
        </div>
      )}
      {/* Cinematic background image, same as Edit Profile */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/extreme-closeup-beautiful-blown-dandelion.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="max-w-5xl w-full mx-auto px-4 z-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Activate Your Membership</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Subscribe and support filmmakers worldwide. </p>
        </div>

        {/* Current Subscription Status */}
        {!subscriptionLoading && currentSubscription && (
          <div className="mb-8 bg-gradient-to-r from-green-900/30 to-green-900/10 border border-green-500/50 rounded-lg p-5 flex items-start gap-4">
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">Active Subscription</h3>
              <p className="text-green-300 text-sm">
                You have an active <strong>{currentSubscription.plan_name}</strong> membership
                {currentSubscription.subscription_end && (
                  <> valid until <strong>{new Date(currentSubscription.subscription_end).toLocaleDateString()}</strong></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* No Subscription Message */}
        {!subscriptionLoading && !currentSubscription && (
          <div className="mb-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-sm">You don't have an active subscription yet. Choose a plan below to get started.</p>
          </div>
        )}
        {/* Toggle for Monthly/Yearly */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/10 rounded-full flex p-1 w-fit">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${planType === 'monthly' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setPlanType('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${planType === 'yearly' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setPlanType('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>
        {/* Cards arrangement */}
         {planType === 'monthly' && (
           <div className="flex justify-center items-center w-full">
             <div className="bg-[#0f1720] rounded-lg border border-white/10 shadow-sm overflow-hidden flex flex-col justify-between h-full max-w-sm w-full">
               <div className="bg-transparent text-white text-center py-3 font-semibold">1 Month</div>
               <div className="p-6 flex-1 flex flex-col justify-between">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-white">
                     {locationLoading ? (
                       <div className="flex items-center justify-center gap-2">
                         <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm">Detecting...</span>
                       </div>
                     ) : (
                       <>{pricing.monthlyPrice} <span className="text-gray-400 text-base font-medium"></span></>
                     )}
                   </div>
                 </div>
                 <hr className="my-4 border-white/10" />
                 <ul className="space-y-3 mb-6 text-gray-200">
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Unlimited Streaming</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Member-Only Movies</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch on Any Device</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch GFN live</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Support Filmmakers</li>
                 </ul>
                 <div ref={paystackMonthRef} className="hidden">
                   <PaystackButton {...fwConfigMonth} />
                 </div>
                 <button
                   disabled={processing || locationLoading}
                   onClick={() => {
                     const paystackButton = paystackMonthRef.current?.querySelector('button');
                     if (paystackButton) paystackButton.click();
                   }}
                   className="w-full bg-[#d4af37] font-bold text-black py-3 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#e5c158] transition"
                 >
                   {locationLoading ? 'Detecting Location...' : processing ? 'Processing...' : 'Subscribe Now'}
                 </button>
               </div>
             </div>
           </div>
         )}
         {planType === 'yearly' && (
           <div className="flex justify-center items-center w-full">
             <div className="bg-[#0f1720] rounded-lg border-4 border-[#0f1720] shadow-lg overflow-hidden scale-105 flex flex-col justify-between h-full max-w-sm w-full">
               <div className="bg-transparent text-white text-center py-3 font-semibold">1 Year</div>
               <div className="p-6 flex-1 flex flex-col justify-between">
               <div className="text-center">
                 <div className="text-3xl font-bold text-white">
                   {locationLoading ? (
                     <div className="flex items-center justify-center gap-2">
                       <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm">Detecting...</span>
                     </div>
                   ) : (
                     <>{pricing.yearlyPrice} <span className="text-gray-200 text-base font-medium"></span></>
                   )}
                 </div>
               </div>
                 <hr className="my-4 border-white/10" />
                 <ul className="space-y-3 mb-6 text-white">
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Unlimited Streaming</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Member-Only Movies</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Watch GFN live</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Watch on Any Device</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Support Filmmakers</li>
                 </ul>
                 <div ref={paystackYearRef} className="hidden">
                   <PaystackButton {...fwConfigYear} />
                 </div>
                 <button
                   disabled={processing || locationLoading}
                   onClick={() => {
                     const paystackButton = paystackYearRef.current?.querySelector('button');
                     if (paystackButton) paystackButton.click();
                   }}
                   className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#e5c158] transition"
                 >
                   {locationLoading ? 'Detecting Location...' : processing ? 'Processing...' : 'Subscribe Now'}
                 </button>
               </div>
             </div>
           </div>
         )}
        <p className="text-center text-xs text-gray-400 mt-6">
          {locationLoading ? (
            '* Detecting your location to determine payment currency...'
          ) : (
            `* Payment will be processed in your local currency (${pricing.currencyCode}). All prices include local taxes and fees.`
          )}
        </p>
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
}

export default Membership;
