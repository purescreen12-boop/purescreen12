// services/subscriptionService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:8081'; // Backend server runs on port 8081

export const subscriptionService = {
  // Update user's subscription after payment
  updateSubscription: async (email: string, plan: string) => {
    const res = await axios.post(`${API_BASE}/api/subscription/update-subscription`, { email, plan });
    return res.data;
  },

  // Fetch with polling - useful after payment when webhook is processing
  fetchSubscriptionWithPolling: async (email: string, maxAttempts = 30, intervalMs = 2000) => {
    console.log(`🔄 Starting subscription polling for ${email} (${maxAttempts} attempts, ${intervalMs}ms intervals)`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const sub = await subscriptionService.fetchSubscription(email);
        if (sub && sub.subscription_start) {
          console.log(`✅ Subscription found on attempt ${attempt + 1}/${maxAttempts}`);
          return sub;
        }
        console.log(`⏳ Attempt ${attempt + 1}/${maxAttempts}: No subscription yet...`);
      } catch (err) {
        console.log(`⚠️ Polling attempt ${attempt + 1} returned error - continuing...`);
      }
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    console.log(`❌ No subscription found after ${maxAttempts} polling attempts (${(maxAttempts * intervalMs) / 1000}s)`);
    return null;
  },

  // Fetch user's subscription info
  fetchSubscription: async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE}/api/subscription/fetch-subscription`, { params: { email } });
      // Backend returns null if no subscription found
      if (!res.data) {
        return null;
      }
      // Also check for old error message format for backward compatibility
      if (res.data.message && res.data.message.includes('No subscription')) {
        return null;
      }
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  // Check subscription state (active or pending)
  hasActiveSubscription: async (email: string) => {
    const sub = await subscriptionService.fetchSubscription(email);
    if (!sub || !sub.subscription_start) return false;

    // Treat pending and active subscriptions as valid so users can watch immediately.
    // Also normalize blank status values from older records.
    const status = (sub.status || 'pending').toString().trim().toLowerCase();
    if (status !== 'active' && status !== 'pending') {
      return false;
    }

    const now = new Date();
    const endDate = new Date(sub.subscription_end);
    return endDate >= now;
  },

  // Create a pending subscription entry in DB (used immediately after payment succeeds)
  createPendingSubscription: async (email: string, plan: string, reference: string) => {
    const res = await axios.post(`${API_BASE}/api/subscription/create-pending`, { email, plan, reference });
    return res.data;
  },

  // Cancel subscription
  cancelSubscription: async (email: string) => {
    const res = await axios.post(`${API_BASE}/api/subscription/cancel-subscription`, { email });
    return res.data;
  },

  // Get all subscription plans
  getSubscriptionPlans: async () => {
    const res = await axios.get(`${API_BASE}/api/subscription/plans`);
    return res.data;
  },
};
