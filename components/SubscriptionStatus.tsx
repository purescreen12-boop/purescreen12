import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const user = authService.getCurrentUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const sub = await subscriptionService.fetchSubscription(user.email);
        if (sub && sub.subscription_end) {
          const endDate = new Date(sub.subscription_end);
          const now = new Date();
          if (endDate > now && sub.status === 'active') {
            setSubscription(sub);
            const diff = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            setDaysLeft(diff);
          }
        }
      } catch (err) {
        console.log('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user?.email]);

  if (loading || !subscription) {
    return null;
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Zap size={12} />
          <span>{subscription.plan_name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-green-900/30 to-green-900/10 border border-green-500/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
          <CheckCircle2 size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">Active Subscription</h3>
          <p className="text-green-300 text-sm mb-2">
            <strong>{subscription.plan_name}</strong> plan
            {daysLeft > 0 && (
              <> • <strong>{daysLeft}</strong> day{daysLeft !== 1 ? 's' : ''} remaining</>
            )}
          </p>
          <p className="text-green-200/70 text-xs">
            Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
