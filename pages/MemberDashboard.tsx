import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import Navbar from '../components/Navbar';
import { Check, Calendar, Clock, AlertCircle, Loader, RefreshCw, CheckCircle } from 'lucide-react';
import MobileNavBar from '../components/MobileNavBar';

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userName = user?.name || 'Member';
  const [plan, setPlan] = useState<string>('');
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [justConfirmed, setJustConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const fetchSub = async () => {
      if (!user?.email) {
        setError('No user email found. Please log in again.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log('Fetching subscription for email:', user.email);
      
      try {
        // First, try to fetch subscription directly
        let sub = await subscriptionService.fetchSubscription(user.email);
        
        // If no subscription found, try polling for webhook processing (max 30 attempts, 2-second intervals)
        if (!sub && !error) {
          console.log('No subscription found on first attempt, polling for webhook...');
          sub = await subscriptionService.fetchSubscriptionWithPolling(user.email);
        }
        
        console.log('Subscription response:', sub);
        
        if (sub && sub.subscription_start) {
          // Get plan name from API response (now includes plan_name from plans table)
          setPlan(sub.plan_name || 'N/A');
          setStartDate(sub.subscription_start);
          setEndDate(sub.subscription_end);
          setStatus(sub.status || 'active');
          setCancelled(sub.status === 'cancelled');
          
          // Calculate days left
          const now = new Date();
          const end = new Date(sub.subscription_end);
          const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysLeft(diff);
          setError('');
          setJustConfirmed(true);
          console.log('✓ Subscription confirmed and loaded');
          
          // Hide confirmation message after 5 seconds
          setTimeout(() => setJustConfirmed(false), 5000);
        } else {
          console.log('No subscription found in response:', sub);
          setError('No active subscription found. Subscribe on the Membership page to get started.');
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        setError('Failed to load subscription information: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, [user?.email]);

  const handleRefreshSubscription = async () => {
    if (!user?.email) return;
    
    setRefreshing(true);
    try {
      const sub = await subscriptionService.fetchSubscription(user.email);
      
      if (sub && sub.subscription_start) {
        setPlan(sub.plan_name || 'N/A');
        setStartDate(sub.subscription_start);
        setEndDate(sub.subscription_end);
        setStatus(sub.status || 'active');
        setCancelled(sub.status === 'cancelled');
        
        const now = new Date();
        const end = new Date(sub.subscription_end);
        const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setDaysLeft(diff);
        setError('');
        setJustConfirmed(true);
        
        setTimeout(() => setJustConfirmed(false), 5000);
      } else {
        setError('No active subscription found. Subscribe on the Membership page to get started.');
      }
    } catch (err) {
      console.error('Failed to refresh subscription:', err);
      setError('Failed to refresh subscription: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.email) return;
    
    if (window.confirm('Are you sure you want to cancel your subscription? You will keep full access until it expires.')) {
      setCancelling(true);
      try {
        await subscriptionService.cancelSubscription(user.email);
        setCancelled(true);
        setStatus('cancelled');
        setError('');
      } catch (err) {
        console.error('Failed to cancel subscription:', err);
        setError('Failed to cancel subscription. Please try again.');
      } finally {
        setCancelling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden text-white">
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
          style={{ backgroundImage: `url('extreme-closeup-beautiful-blown-dandelion.jpg')`, backgroundPosition: '40% 50%' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t  via-transparent to-transparent" />
        </div>
        <div className="max-w-6xl w-full z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="animate-spin text-[#d4af37]" />
            <p className="text-gray-300">Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden text-white">
      {/* Cinematic background image */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('//extreme-closeup-beautiful-blown-dandelion.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t  via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      
      <div className="max-w-6xl w-full z-20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Membership Dashboard</h1>
            <p className="text-gray-300 mb-2">Welcome, {userName}! Here's your membership information:</p>
            <p className="text-gray-500 text-sm mb-6"> {user?.email}</p>
          </div>
          <button
            onClick={handleRefreshSubscription}
            disabled={refreshing}
            className="ml-4 p-2 text-gray-400 hover:text-[#d4af37] transition disabled:opacity-50"
            title="Refresh subscription status"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Success confirmation notification */}
        {justConfirmed && plan && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-300">✓ Subscription confirmed! Your {plan} plan is now active.</p>
          </div>
        )}

        {/* Error/No Subscription message */}
        {error && !cancelled && (
          <div className="mb-6 bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-blue-400" />
              <p className="text-blue-300">{error}</p>
            </div>
            {error.includes('No active subscription') && (
              <button
                onClick={() => navigate('/membership')}
                className="bg-[#d4af37] text-black font-bold py-2 px-6 rounded-lg hover:bg-[#e5c158] transition"
              >
                Subscribe Now
              </button>
            )}
          </div>
        )}

        {/* Cancellation notice */}
        {cancelled && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400" />
            <p className="text-yellow-300">Your subscription has been cancelled. You will keep full access until it expires on {endDate ? new Date(endDate).toLocaleDateString() : '-'}.</p>
          </div>
        )}

        <div className="bg-[#121212] rounded-2xl shadow-md overflow-hidden border border-white/10">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${status === 'active' && !cancelled ? 'bg-[#d4af37]' : 'bg-gray-600'} text-black rounded-full p-3`}>
                    <Check size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Membership Status</div>
                    <div className={`text-sm ${status === 'active' && !cancelled ? 'text-green-400' : 'text-yellow-400'} flex items-center gap-2`}>
                      <Check size={14} /> {cancelled ? 'Cancelled' : 'Active'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2"><Calendar size={16} /> {endDate ? new Date(endDate).toLocaleDateString() : '-'}</div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-2 bg-[#0f1720] p-4 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-400">Subscription Plan</div>
                  <div className="text-lg font-semibold text-white">{plan || '-'}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-[#121212] p-3 rounded-md text-sm border border-white/10">
                      <div className="text-xs text-gray-400">Start Date</div>
                      <div className="font-medium text-white">{startDate ? new Date(startDate).toLocaleDateString() : '-'}</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded-md text-sm border border-white/10">
                      <div className="text-xs text-gray-400">Expiration Date</div>
                      <div className="font-medium text-white">{endDate ? new Date(endDate).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1720] p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400">Days Left</div>
                  <div className="mt-2">
                    <div className="w-20 h-20 rounded-full border-4 border-[#d4af37] flex items-center justify-center text-2xl font-bold text-[#d4af37]">{daysLeft}</div>
                    <div className="text-sm text-gray-400 mt-2">{daysLeft === 1 ? 'Day' : 'Days'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 bg-[#121212] p-6 border-l border-white/10 flex flex-col justify-center">
              
              <div className="mt-6">
                <button 
                  className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all ${
                    cancelled 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-[#d4af37] text-black hover:bg-[#e5c158] cursor-pointer'
                  }`}
                  onClick={handleCancelSubscription}
                  disabled={cancelled || cancelling}
                >
                  {cancelling ? 'Cancelling...' : cancelled ? 'Subscription Cancelled' : 'Cancel Subscription'}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-400">* Note: Cancel anytime to stop auto-renewal. You will keep full access until your membership expires.</div>
            </div>
          </div>
        </div>

       
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default MemberDashboard;
